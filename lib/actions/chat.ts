"use server";

import prisma from "@/lib/prisma-db";
import { revalidatePath } from "next/cache";
import {
  requireChatUser,
  canPatientMessageDoctor,
  canAddCareTeamStaff,
  canRemoveCareTeamStaff,
  verifyConversationAccess,
} from "@/lib/services/chat-authorization";
import { encryptPayload, decryptPayload } from "@/lib/crypto/hipaa-cipher";
import { recordChatAudit } from "@/lib/services/chat-audit";
import { publishChatEvent } from "@/lib/realtime-pubsub";
import {
  ConversationSummary,
  DecryptedChatMessage,
  PaginatedMessages,
  StaffCandidate,
  ChatParticipant,
} from "@/types/chat";

/**
 * Automatically provisions conversation channels for any active/booked/confirmed
 * appointments belonging to the user that do not yet have an associated chat room.
 */
async function syncUserAppointmentConversations(userId: string, role: string): Promise<void> {
  try {
    // 1. Fetch all appointment IDs that already have an established chat conversation
    const existingConversations = await prisma.chat_conversations.findMany({
      where: {
        appointment_id: { not: null },
      },
      select: { appointment_id: true },
    });

    const linkedAppointmentIds = new Set(
      existingConversations
        .map((c) => c.appointment_id)
        .filter((id): id is string => Boolean(id))
    );

    const exclusionList = Array.from(linkedAppointmentIds);

    if (role === "patient") {
      const appointmentsWithoutChat = await prisma.appointments.findMany({
        where: {
          patient_id: userId,
          ...(exclusionList.length > 0 ? { id: { notIn: exclusionList } } : {}),
        },
        select: {
          id: true,
          patient_id: true,
          doctor_id: true,
        },
      });

      for (const apt of appointmentsWithoutChat) {
        await provisionAppointmentConversation(apt.id, apt.patient_id, apt.doctor_id);
      }
    } else if (role === "doctor") {
      const doctor = await prisma.doctors.findUnique({
        where: { user_id: userId },
        select: { id: true },
      });

      if (doctor) {
        const appointmentsWithoutChat = await prisma.appointments.findMany({
          where: {
            doctor_id: doctor.id,
            ...(exclusionList.length > 0 ? { id: { notIn: exclusionList } } : {}),
          },
          select: {
            id: true,
            patient_id: true,
            doctor_id: true,
          },
        });

        for (const apt of appointmentsWithoutChat) {
          await provisionAppointmentConversation(apt.id, apt.patient_id, apt.doctor_id);
        }
      }
    }
  } catch (error) {
    console.error("[SYNC_APPOINTMENT_CONVERSATIONS_ERROR]", error);
  }
}

/**
 * Retrieves all conversation threads for the authenticated user with unread counts
 * and decrypted last-message snippets.
 */
export async function getConversations(): Promise<{
  success: boolean;
  data?: ConversationSummary[];
  error?: string;
}> {
  try {
    const user = await requireChatUser();

    // Reconcile and auto-provision rooms for any existing appointments
    await syncUserAppointmentConversations(user.id, user.role);

    const participantRecords = await prisma.chat_participants.findMany({
      where: { user_id: user.id },
      include: {
        conversations: {
          include: {
            appointments: {
              select: {
                id: true,
                appointment_number: true,
                appointment_date: true,
                status: true,
              },
            },
            participants: {
              include: {
                users: {
                  select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    role: true,
                    avatar_url: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        conversations: {
          updated_at: "desc",
        },
      },
    });

    const summaries: ConversationSummary[] = await Promise.all(
      participantRecords.map(async (record) => {
        const conv = record.conversations;

        // Fetch latest non-deleted message
        const lastMsg = await prisma.chat_messages.findFirst({
          where: {
            conversation_id: conv.id,
            is_deleted: false,
            created_at: { gte: record.joined_at },
          },
          orderBy: { created_at: "desc" },
          include: {
            sender: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                role: true,
              },
            },
          },
        });

        let decryptedLastMessage: DecryptedChatMessage | null = null;
        if (lastMsg) {
          let plainContent = "[Encrypted Content]";
          try {
            plainContent = await decryptPayload({
              encryptedContent: lastMsg.encrypted_content,
              iv: lastMsg.encryption_iv,
              authTag: lastMsg.auth_tag,
              keyVersion: lastMsg.key_version,
            });
          } catch {
            plainContent = "[Unable to decrypt message]";
          }

          decryptedLastMessage = {
            id: lastMsg.id,
            conversationId: conv.id,
            senderId: lastMsg.sender_id,
            senderName: lastMsg.sender
              ? `${lastMsg.sender.first_name} ${lastMsg.sender.last_name}`
              : "System Notice",
            senderRole: (lastMsg.sender?.role || "system") as any,
            messageType: lastMsg.message_type as any,
            content: plainContent,
            status: "delivered",
            isDeleted: lastMsg.is_deleted,
            createdAt: lastMsg.created_at.toISOString(),
            updatedAt: lastMsg.updated_at.toISOString(),
          };
        }

        // Count unread messages
        const unreadCount = await prisma.chat_messages.count({
          where: {
            conversation_id: conv.id,
            is_deleted: false,
            sender_id: { not: user.id },
            created_at: {
              gte: record.joined_at,
              ...(record.last_read_at ? { gt: record.last_read_at } : {}),
            },
          },
        });

        const participants: ChatParticipant[] = conv.participants.map((p) => ({
          id: p.id,
          conversationId: p.conversation_id,
          userId: p.users.id,
          userName: `${p.users.first_name} ${p.users.last_name}`,
          userRole: (p.users.role || "patient") as any,
          avatarUrl: p.users.avatar_url,
          isAdmin: p.is_admin,
          isMuted: p.is_muted,
          addedById: p.added_by_id,
          joinedAt: p.joined_at.toISOString(),
          lastReadMessageId: p.last_read_message_id,
          lastReadAt: p.last_read_at?.toISOString() || null,
        }));

        return {
          id: conv.id,
          type: conv.type as any,
          title: conv.title,
          appointmentId: conv.appointment_id,
          appointmentNumber: conv.appointments?.appointment_number,
          participants,
          lastMessage: decryptedLastMessage,
          unreadCount,
          updatedAt: conv.updated_at.toISOString(),
        };
      })
    );

    return { success: true, data: summaries };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load conversations." };
  }
}

/**
 * Retrieves paginated messages for a conversation, enforcing the forward-only
 * privacy rule for newly added care team members (created_at >= joined_at).
 */
export async function getConversationMessages(
  conversationId: string,
  cursor?: string,
  limit = 50
): Promise<{ success: boolean; data?: PaginatedMessages; error?: string }> {
  try {
    const user = await requireChatUser();

    // Verify participant record to obtain joined_at cutoff
    const participant = await verifyConversationAccess(user.id, conversationId);
    if (!participant && user.role !== "admin") {
      return {
        success: false,
        error: "FORBIDDEN: You are not an enrolled participant in this conversation.",
      };
    }

    const joinedAtCutoff = participant ? participant.joined_at : new Date(0);

    const rawMessages = await prisma.chat_messages.findMany({
      where: {
        conversation_id: conversationId,
        is_deleted: false,
        created_at: { gte: joinedAtCutoff },
      },
      orderBy: { created_at: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        sender: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            role: true,
            avatar_url: true,
          },
        },
      },
    });

    const hasMore = rawMessages.length > limit;
    const items = hasMore ? rawMessages.slice(0, limit) : rawMessages;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Decrypt messages on-the-fly
    const decryptedMessages: DecryptedChatMessage[] = await Promise.all(
      items.map(async (msg) => {
        let content = "[Encrypted Content]";
        try {
          content = await decryptPayload({
            encryptedContent: msg.encrypted_content,
            iv: msg.encryption_iv,
            authTag: msg.auth_tag,
            keyVersion: msg.key_version,
          });
        } catch {
          content = "[Decryption Failure]";
        }

        return {
          id: msg.id,
          conversationId: msg.conversation_id,
          senderId: msg.sender_id,
          senderName: msg.sender
            ? `${msg.sender.first_name} ${msg.sender.last_name}`
            : "System Notice",
          senderRole: (msg.sender?.role || "system") as any,
          messageType: msg.message_type as any,
          content,
          status: "delivered",
          isDeleted: msg.is_deleted,
          createdAt: msg.created_at.toISOString(),
          updatedAt: msg.updated_at.toISOString(),
        };
      })
    );

    // Record audit log for read action
    await recordChatAudit({
      conversationId,
      actorId: user.id,
      action: "message_read",
    });

    return {
      success: true,
      data: {
        messages: decryptedMessages.reverse(),
        nextCursor,
        hasMore,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch messages." };
  }
}

/**
 * Encrypts and transmits a new message, broadcasting the event to the realtime engine.
 */
export async function sendMessage(
  conversationId: string,
  content: string,
  clientMsgId?: string
): Promise<{ success: boolean; data?: DecryptedChatMessage; error?: string }> {
  try {
    const user = await requireChatUser();

    if (!content || !content.trim()) {
      return { success: false, error: "Message content cannot be blank." };
    }

    // Verify participation
    const participant = await verifyConversationAccess(user.id, conversationId);
    if (!participant && user.role !== "admin") {
      return { success: false, error: "FORBIDDEN: You cannot send messages to this conversation." };
    }

    // Encrypt payload via AES-256-GCM
    const encrypted = await encryptPayload(content.trim());

    const message = await prisma.chat_messages.create({
      data: {
        conversation_id: conversationId,
        sender_id: user.id,
        message_type: "text",
        encrypted_content: encrypted.encryptedContent,
        encryption_iv: encrypted.iv,
        auth_tag: encrypted.authTag,
        key_version: encrypted.keyVersion,
      },
      include: {
        sender: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            role: true,
            avatar_url: true,
          },
        },
      },
    });

    // Touch conversation updated_at
    await prisma.chat_conversations.update({
      where: { id: conversationId },
      data: { updated_at: new Date() },
    });

    const decryptedMsg: DecryptedChatMessage = {
      id: message.id,
      conversationId,
      senderId: user.id,
      senderName: `${user.first_name} ${user.last_name}`,
      senderRole: (user.role || "patient") as any,
      messageType: "text",
      content: content.trim(),
      status: "sent",
      isDeleted: false,
      createdAt: message.created_at.toISOString(),
      updatedAt: message.updated_at.toISOString(),
    };

    // Broadcast to realtime WebSocket / PubSub backplane
    await publishChatEvent(conversationId, {
      type: "MESSAGE_RECEIVED",
      message: decryptedMsg,
      clientMsgId,
    });

    // Immutable HIPAA Audit Log
    await recordChatAudit({
      conversationId,
      actorId: user.id,
      action: "message_sent",
      metadata: { messageId: message.id },
    });

    return { success: true, data: decryptedMsg };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to send message." };
  }
}

/**
 * Updates a participant's read receipt watermark and broadcasts to other participants.
 */
export async function markConversationRead(
  conversationId: string,
  messageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireChatUser();

    await prisma.chat_participants.updateMany({
      where: {
        conversation_id: conversationId,
        user_id: user.id,
      },
      data: {
        last_read_message_id: messageId,
        last_read_at: new Date(),
      },
    });

    // Broadcast read receipt
    await publishChatEvent(conversationId, {
      type: "READ_RECEIPT_BROADCAST",
      conversationId,
      userId: user.id,
      messageId,
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update read status." };
  }
}

/**
 * Invites a Nurse, Medical Assistant, or Staff member into the active consultation.
 * Sets joined_at to now() so the new member only views messages from this point forward.
 */
export async function addStaffToConversation(
  conversationId: string,
  staffUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await requireChatUser();

    const authCheck = await canAddCareTeamStaff(actor.id, conversationId);
    if (!authCheck.allowed) {
      return { success: false, error: authCheck.reason || "Unauthorized to add staff." };
    }

    // Verify target staff account
    const targetStaff = await prisma.users.findUnique({
      where: { id: staffUserId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
      },
    });

    if (
      !targetStaff ||
      !targetStaff.is_active ||
      (targetStaff.role !== "nurse" && targetStaff.role !== "staff")
    ) {
      return {
        success: false,
        error: "Target user is not an active Nurse, Medical Assistant, or Staff member.",
      };
    }

    // Check if already participant
    const existing = await prisma.chat_participants.findUnique({
      where: {
        conversation_id_user_id: {
          conversation_id: conversationId,
          user_id: staffUserId,
        },
      },
    });

    if (existing) {
      return { success: false, error: "This staff member is already in the conversation." };
    }

    const now = new Date();

    // Create participant with forward-only cutoff (joined_at = now)
    const newParticipant = await prisma.chat_participants.create({
      data: {
        conversation_id: conversationId,
        user_id: staffUserId,
        is_admin: false,
        added_by_id: actor.id,
        joined_at: now,
      },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            role: true,
            avatar_url: true,
          },
        },
      },
    });

    // Insert System Notice into the timeline
    const noticeText = `${actor.role === "doctor" ? "Dr. " : ""}${actor.first_name} ${actor.last_name} added ${targetStaff.role === "nurse" ? "Nurse" : "Staff"} ${targetStaff.first_name} ${targetStaff.last_name} to the care team. (New members only see messages from this point forward).`;
    const encryptedNotice = await encryptPayload(noticeText);

    const systemNoticeMsg = await prisma.chat_messages.create({
      data: {
        conversation_id: conversationId,
        sender_id: null,
        message_type: "system_notice",
        encrypted_content: encryptedNotice.encryptedContent,
        encryption_iv: encryptedNotice.iv,
        auth_tag: encryptedNotice.authTag,
        key_version: encryptedNotice.keyVersion,
        created_at: now,
      },
    });

    // Touch conversation
    await prisma.chat_conversations.update({
      where: { id: conversationId },
      data: { updated_at: now },
    });

    // Immutable HIPAA Audit Log
    await recordChatAudit({
      conversationId,
      actorId: actor.id,
      action: "participant_added",
      metadata: {
        addedStaffId: staffUserId,
        staffRole: targetStaff.role,
        joinedAt: now.toISOString(),
      },
    });

    // Broadcast participant added event
    const participantData: ChatParticipant = {
      id: newParticipant.id,
      conversationId: newParticipant.conversation_id,
      userId: newParticipant.users.id,
      userName: `${newParticipant.users.first_name} ${newParticipant.users.last_name}`,
      userRole: (newParticipant.users.role || "staff") as any,
      avatarUrl: newParticipant.users.avatar_url,
      isAdmin: newParticipant.is_admin,
      isMuted: newParticipant.is_muted,
      addedById: newParticipant.added_by_id,
      joinedAt: newParticipant.joined_at.toISOString(),
      lastReadMessageId: null,
      lastReadAt: null,
    };

    await publishChatEvent(conversationId, {
      type: "PARTICIPANT_ADDED",
      conversationId,
      participant: participantData,
    });

    // Also broadcast the system notice
    await publishChatEvent(conversationId, {
      type: "MESSAGE_RECEIVED",
      message: {
        id: systemNoticeMsg.id,
        conversationId,
        senderId: null,
        senderName: "System Notice",
        senderRole: "system",
        messageType: "system_notice",
        content: noticeText,
        status: "delivered",
        isDeleted: false,
        createdAt: systemNoticeMsg.created_at.toISOString(),
        updatedAt: systemNoticeMsg.updated_at.toISOString(),
      },
    });

    revalidatePath("/dashboard/messages");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add staff member.";
    return { success: false, error: message };
  }
}

/**
 * Removes an added Care Team staff member (Nurse or Staff) from the conversation.
 * Strictly enforces that patients and primary doctors cannot be removed.
 * Preserves past messages for medical record compliance and posts an encrypted system notice.
 */
export async function removeStaffFromConversation(
  conversationId: string,
  staffUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await requireChatUser();

    // Verify authorization and membership invariants
    const authCheck = await canRemoveCareTeamStaff(actor.id, conversationId, staffUserId);
    if (!authCheck.allowed) {
      return { success: false, error: authCheck.reason || "Unauthorized to remove staff member." };
    }

    // Fetch target user for system notice & audit logging
    const targetUser = await prisma.users.findUnique({
      where: { id: staffUserId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        role: true,
      },
    });

    if (!targetUser) {
      return { success: false, error: "Target staff user not found." };
    }

    // Fetch participant ID for realtime broadcast
    const targetParticipant = await prisma.chat_participants.findUnique({
      where: {
        conversation_id_user_id: {
          conversation_id: conversationId,
          user_id: staffUserId,
        },
      },
      select: { id: true },
    });

    if (!targetParticipant) {
      return { success: false, error: "Target is not a participant in this conversation." };
    }

    // Remove from chat_participants
    await prisma.chat_participants.delete({
      where: {
        conversation_id_user_id: {
          conversation_id: conversationId,
          user_id: staffUserId,
        },
      },
    });

    const now = new Date();

    // Insert System Notice into the chat timeline
    const targetRoleLabel = targetUser.role === "nurse" ? "Nurse" : "Staff";
    const actorPrefix = actor.role === "doctor" ? "Dr. " : "";
    const noticeText = `${actorPrefix}${actor.first_name} ${actor.last_name} removed ${targetRoleLabel} ${targetUser.first_name} ${targetUser.last_name} from the care team.`;
    const encryptedNotice = await encryptPayload(noticeText);

    const systemNoticeMsg = await prisma.chat_messages.create({
      data: {
        conversation_id: conversationId,
        sender_id: null,
        message_type: "system_notice",
        encrypted_content: encryptedNotice.encryptedContent,
        encryption_iv: encryptedNotice.iv,
        auth_tag: encryptedNotice.authTag,
        key_version: encryptedNotice.keyVersion,
        created_at: now,
      },
    });

    // Touch conversation updated_at
    await prisma.chat_conversations.update({
      where: { id: conversationId },
      data: { updated_at: now },
    });

    // Immutable HIPAA Audit Log
    await recordChatAudit({
      conversationId,
      actorId: actor.id,
      action: "participant_removed",
      metadata: {
        removedStaffId: staffUserId,
        staffRole: targetUser.role,
        removedAt: now.toISOString(),
      },
    });

    // Broadcast realtime PARTICIPANT_REMOVED event
    const actorName = `${actorPrefix}${actor.first_name} ${actor.last_name}`;
    await publishChatEvent(conversationId, {
      type: "PARTICIPANT_REMOVED",
      conversationId,
      participantId: targetParticipant.id,
      userId: staffUserId,
      removedByName: actorName,
    });

    // Also broadcast the system notice to the chat timeline
    await publishChatEvent(conversationId, {
      type: "MESSAGE_RECEIVED",
      message: {
        id: systemNoticeMsg.id,
        conversationId,
        senderId: null,
        senderName: "Clinical Security System",
        senderRole: "system",
        messageType: "system_notice",
        content: noticeText,
        status: "delivered",
        isDeleted: false,
        createdAt: systemNoticeMsg.created_at.toISOString(),
        updatedAt: systemNoticeMsg.updated_at.toISOString(),
      },
    });

    revalidatePath("/dashboard/messages");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to remove staff member.";
    return { success: false, error: message };
  }
}

/**
 * Retrieves candidate clinical staff (Nurses, Medical Assistants, Staff) who can be added
 * by the doctor to the conversation.
 */
export async function getAvailableClinicStaff(
  conversationId: string
): Promise<{ success: boolean; data?: StaffCandidate[]; error?: string }> {
  try {
    const actor = await requireChatUser();

    const authCheck = await canAddCareTeamStaff(actor.id, conversationId);
    if (!authCheck.allowed) {
      return { success: false, error: authCheck.reason || "Unauthorized." };
    }

    // Get current participant user IDs
    const existingParticipants = await prisma.chat_participants.findMany({
      where: { conversation_id: conversationId },
      select: { user_id: true },
    });
    const participantIds = new Set(existingParticipants.map((p) => p.user_id));

    // Get all active nurses and staff
    const staffUsers = await prisma.users.findMany({
      where: {
        role: { in: ["nurse", "staff"] },
        is_active: true,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
      },
      orderBy: { first_name: "asc" },
    });

    const candidates: StaffCandidate[] = staffUsers.map((u) => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`,
      email: u.email,
      role: (u.role || "staff") as "nurse" | "staff",
      isAlreadyParticipant: participantIds.has(u.id),
    }));

    return { success: true, data: candidates };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load clinic staff." };
  }
}

/**
 * Automatically provisions an encounter-bound conversation thread when an appointment is booked.
 * Reuses existing conversation if already created.
 */
export async function provisionAppointmentConversation(
  appointmentId: string,
  patientUserId: string,
  doctorProfileId: string
): Promise<string | null> {
  try {
    const doctor = await prisma.doctors.findUnique({
      where: { id: doctorProfileId },
      select: { user_id: true },
    });

    if (!doctor?.user_id) {
      return null;
    }

    // Check if conversation already exists for this appointment
    const existing = await prisma.chat_conversations.findFirst({
      where: { appointment_id: appointmentId },
      select: { id: true },
    });

    if (existing) {
      return existing.id;
    }

    const conversation = await prisma.chat_conversations.create({
      data: {
        type: "encounter_bound",
        appointment_id: appointmentId,
        participants: {
          create: [
            { user_id: patientUserId, is_admin: false },
            { user_id: doctor.user_id, is_admin: true },
          ],
        },
      },
    });

    // Record audit log
    await recordChatAudit({
      conversationId: conversation.id,
      actorId: patientUserId,
      action: "channel_create",
      metadata: { appointmentId },
    });

    return conversation.id;
  } catch (error) {
    console.error("[Auto-Provision Chat Room Error]", error);
    return null;
  }
}

/**
 * Initiates or opens a direct conversation between a patient and a doctor,
 * verifying that the patient has an established appointment history.
 */
export async function startDoctorConversation(
  doctorUserId: string
): Promise<{ success: boolean; conversationId?: string; error?: string }> {
  try {
    const user = await requireChatUser();

    // Verify appointment relationship
    const authCheck = await canPatientMessageDoctor(user.id, doctorUserId);
    if (!authCheck.allowed) {
      return { success: false, error: authCheck.reason || "Unable to start conversation." };
    }

    // Check if an active direct or encounter conversation already exists
    const existing = await prisma.chat_conversations.findFirst({
      where: {
        is_active: true,
        participants: {
          every: {
            user_id: { in: [user.id, doctorUserId] },
          },
        },
      },
      select: { id: true },
    });

    if (existing) {
      return { success: true, conversationId: existing.id };
    }

    // Create direct conversation
    const newConv = await prisma.chat_conversations.create({
      data: {
        type: "direct_provider",
        participants: {
          create: [
            { user_id: user.id, is_admin: false },
            { user_id: doctorUserId, is_admin: true },
          ],
        },
      },
    });

    await recordChatAudit({
      conversationId: newConv.id,
      actorId: user.id,
      action: "channel_create",
    });

    return { success: true, conversationId: newConv.id };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to initiate conversation.";
    return { success: false, error: msg };
  }
}

/**
 * Ephemeral typing broadcast action. Dispatches typing status to peers
 * across the realtime pub/sub backplane (WebSocket & SSE streams).
 */
export async function broadcastTypingStatus(
  conversationId: string,
  isTyping: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireChatUser();

    await publishChatEvent(conversationId, {
      type: "TYPING_BROADCAST",
      conversationId,
      userId: user.id,
      isTyping,
    });

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to broadcast typing status.";
    return { success: false, error: msg };
  }
}
