export type ConversationType = "encounter_bound" | "direct_provider" | "care_team" | "internal_staff";
export type MessageType = "text" | "image" | "document" | "clinical_pad_snippet" | "system_notice";
export type DeliveryStatus = "sending" | "sent" | "delivered" | "read";

export interface ChatParticipant {
  readonly id: string;
  readonly conversationId: string;
  readonly userId: string;
  readonly userName: string;
  readonly userRole: "admin" | "doctor" | "nurse" | "staff" | "patient";
  readonly avatarUrl: string | null;
  readonly isAdmin: boolean;
  readonly isMuted: boolean;
  readonly addedById: string | null;
  readonly joinedAt: string; // ISO string for client serialization
  readonly lastReadMessageId: string | null;
  readonly lastReadAt: string | null;
  readonly isOnline?: boolean;
}

export interface StaffCandidate {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: "nurse" | "staff";
  readonly isAlreadyParticipant: boolean;
}

export interface ChatAttachment {
  readonly id: string;
  readonly fileName: string;
  readonly fileSizeBytes: number;
  readonly mimeType: string;
  readonly downloadUrl: string;
  readonly checksumSha256: string;
}

export interface DecryptedChatMessage {
  readonly id: string;
  readonly conversationId: string;
  readonly senderId: string | null;
  readonly senderName: string;
  readonly senderRole: "admin" | "doctor" | "nurse" | "staff" | "patient" | "system";
  readonly messageType: MessageType;
  readonly content: string;
  readonly status: DeliveryStatus;
  readonly attachments?: readonly ChatAttachment[];
  readonly isDeleted: boolean;
  readonly createdAt: string; // ISO string for client serialization
  readonly updatedAt: string;
}

export interface ConversationSummary {
  readonly id: string;
  readonly type: ConversationType;
  readonly title: string | null;
  readonly appointmentId: string | null;
  readonly appointmentNumber?: string | null;
  readonly participants: readonly ChatParticipant[];
  readonly lastMessage: DecryptedChatMessage | null;
  readonly unreadCount: number;
  readonly updatedAt: string;
}

export interface PaginatedMessages {
  readonly messages: readonly DecryptedChatMessage[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}

// Discriminated union for incoming client frames
export type WebSocketClientEvent =
  | { readonly type: "SUBSCRIBE_CONVERSATION"; readonly conversationId: string }
  | { readonly type: "UNSUBSCRIBE_CONVERSATION"; readonly conversationId: string }
  | { readonly type: "SEND_MESSAGE"; readonly conversationId: string; readonly content: string; readonly clientMsgId: string }
  | { readonly type: "TYPING_START"; readonly conversationId: string; readonly userId?: string }
  | { readonly type: "TYPING_STOP"; readonly conversationId: string; readonly userId?: string }
  | { readonly type: "MARK_READ"; readonly conversationId: string; readonly messageId: string }
  | { readonly type: "HEARTBEAT_PING" };

// Discriminated union for outgoing server frames
export type WebSocketServerEvent =
  | { readonly type: "MESSAGE_RECEIVED"; readonly message: DecryptedChatMessage; readonly clientMsgId?: string }
  | { readonly type: "PARTICIPANT_ADDED"; readonly conversationId: string; readonly participant: ChatParticipant }
  | { readonly type: "PARTICIPANT_REMOVED"; readonly conversationId: string; readonly participantId?: string; readonly userId: string; readonly removedByName?: string }
  | { readonly type: "TYPING_BROADCAST"; readonly conversationId: string; readonly userId: string; readonly isTyping: boolean }
  | { readonly type: "READ_RECEIPT_BROADCAST"; readonly conversationId: string; readonly userId: string; readonly messageId: string }
  | { readonly type: "PRESENCE_CHANGED"; readonly userId: string; readonly status: "online" | "offline" | "idle" }
  | { readonly type: "CONNECTION_ACK"; readonly connectionId: string; readonly serverTime: string }
  | { readonly type: "ERROR_ALERT"; readonly code: string; readonly message: string };
