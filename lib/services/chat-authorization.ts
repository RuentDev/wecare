import prisma from "@/lib/prisma-db";
import { getCurrentUser, User } from "@/lib/auth";

export interface ChatAuthUser extends User {
  id: string;
  email: string;
  role: "admin" | "doctor" | "nurse" | "staff" | "patient";
  is_guest: boolean;
}

/**
 * Validates that the active session user is authenticated and is NOT a guest account.
 * Rejects unauthenticated requests and guests per HIPAA access control § 164.312(a)(1).
 */
export async function requireChatUser(): Promise<ChatAuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED: You must be signed in to access clinical messaging.");
  }

  if (user.is_guest) {
    throw new Error(
      "GUEST_RESTRICTED: Guest accounts cannot send or view clinical messages. Please sign in or register an account."
    );
  }

  return user as ChatAuthUser;
}

/**
 * Validates that a patient has an established clinical relationship with a doctor
 * via at least one appointment (past or future).
 */
export async function canPatientMessageDoctor(
  patientUserId: string,
  doctorUserId: string
): Promise<{ allowed: boolean; reason?: string; doctorId?: string }> {
  // 1. Resolve doctor profile ID
  const doctor = await prisma.doctors.findUnique({
    where: { user_id: doctorUserId },
    select: { id: true },
  });

  if (!doctor) {
    return {
      allowed: false,
      reason: "Practitioner profile not found.",
    };
  }

  // 2. Query appointment history
  const appointmentCount = await prisma.appointments.count({
    where: {
      patient_id: patientUserId,
      doctor_id: doctor.id,
    },
  });

  if (appointmentCount === 0) {
    return {
      allowed: false,
      reason: "Clinical policy requires at least one booked appointment with this doctor to open messaging.",
      doctorId: doctor.id,
    };
  }

  return {
    allowed: true,
    doctorId: doctor.id,
  };
}

/**
 * Validates that only the primary doctor or a clinic administrator can invite
 * care team staff (Nurse, Medical Assistant, Staff) to a conversation.
 */
export async function canAddCareTeamStaff(
  actorUserId: string,
  conversationId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const actor = await prisma.users.findUnique({
    where: { id: actorUserId },
    select: { id: true, role: true },
  });

  if (!actor) {
    return { allowed: false, reason: "Actor account not found." };
  }

  // Admins can always add participants
  if (actor.role === "admin") {
    return { allowed: true };
  }

  // Verify participant admin status or doctor role
  const participant = await prisma.chat_participants.findUnique({
    where: {
      conversation_id_user_id: {
        conversation_id: conversationId,
        user_id: actorUserId,
      },
    },
  });

  if (!participant) {
    return { allowed: false, reason: "You are not a participant in this conversation." };
  }

  if (actor.role !== "doctor" && !participant.is_admin) {
    return {
      allowed: false,
      reason: "Only the primary practitioner or clinic administrator can add care team staff.",
    };
  }

  return { allowed: true };
}

/**
 * Validates that only the primary doctor or a clinic administrator can remove
 * care team staff (Nurse, Staff) from a conversation, and strictly prevents
 * removing the patient or the primary practitioner.
 */
export async function canRemoveCareTeamStaff(
  actorUserId: string,
  conversationId: string,
  targetUserId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const actor = await prisma.users.findUnique({
    where: { id: actorUserId },
    select: { id: true, role: true },
  });

  if (!actor) {
    return { allowed: false, reason: "Actor account not found." };
  }

  // Verify actor's authority: must be an admin or a doctor with participation rights
  if (actor.role !== "admin") {
    const actorParticipant = await prisma.chat_participants.findUnique({
      where: {
        conversation_id_user_id: {
          conversation_id: conversationId,
          user_id: actorUserId,
        },
      },
    });

    if (!actorParticipant) {
      return { allowed: false, reason: "You are not a participant in this conversation." };
    }

    if (actor.role !== "doctor" && !actorParticipant.is_admin) {
      return {
        allowed: false,
        reason: "Only the primary practitioner or clinic administrator can remove care team staff.",
      };
    }
  }

  // Fetch target participant and user details
  const targetParticipant = await prisma.chat_participants.findUnique({
    where: {
      conversation_id_user_id: {
        conversation_id: conversationId,
        user_id: targetUserId,
      },
    },
    include: {
      users: {
        select: {
          id: true,
          role: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });

  if (!targetParticipant) {
    return {
      allowed: false,
      reason: "The specified member is not a participant in this conversation.",
    };
  }

  // INVARIANT 1: Patients CANNOT be removed
  if (targetParticipant.users.role === "patient") {
    return {
      allowed: false,
      reason: "Patients cannot be removed from consultation channels.",
    };
  }

  // INVARIANT 2: Lead Doctor cannot be removed
  if (targetParticipant.users.role === "doctor") {
    return {
      allowed: false,
      reason: "Primary doctors cannot be removed from consultation channels.",
    };
  }

  // INVARIANT 3: Only nurse or staff can be removed
  if (targetParticipant.users.role !== "nurse" && targetParticipant.users.role !== "staff") {
    return {
      allowed: false,
      reason: "Only Care Team staff or nurses can be removed.",
    };
  }

  return { allowed: true };
}

/**
 * Checks whether a user has permission to read or contribute to a conversation.
 */
export async function verifyConversationAccess(
  userId: string,
  conversationId: string
) {
  const participant = await prisma.chat_participants.findUnique({
    where: {
      conversation_id_user_id: {
        conversation_id: conversationId,
        user_id: userId,
      },
    },
    include: {
      conversations: true,
    },
  });

  return participant;
}
