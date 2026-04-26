import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma-db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextRequest } from "next/server";

// Types
export type UserRole = "admin" | "doctor" | "nurse" | "staff" | "patient";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  date_of_birth: Date | null;
  address: string | null;
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  ip_address: string | null;
  user_agent: string | null;
}

// Constants
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const SALT_ROUNDS = 12;

export const verifyAuth = async (req: NextRequest) => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await getSession(sessionToken);

  if (!session) {
    return null;
  }

  return session.user;
};

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate secure token
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Create session
export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await prisma.sessions.create({
    data: {
      user_id: userId,
      token,
      expires_at: expiresAt,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    },
  });

  // Update last login
  await prisma.users.update({
    where: { id: userId },
    data: { last_login_at: new Date() },
  });

  return token;
}

// Get session from token
export async function getSession(
  token: string,
): Promise<(Session & { user: User }) | null> {
  const session = await prisma.sessions.findUnique({
    where: { token },
    include: {
      users: true,
    },
  });

  if (!session || session.expires_at < new Date() || !session.users.is_active) {
    return null;
  }

  return {
    id: session.id,
    user_id: session.user_id,
    token: session.token,
    expires_at: session.expires_at,
    ip_address: session.ip_address,
    user_agent: session.user_agent,
    user: {
      id: session.users.id,
      email: session.users.email,
      first_name: session.users.first_name,
      last_name: session.users.last_name,
      phone: session.users.phone,
      role: session.users.role as UserRole,
      avatar_url: session.users.avatar_url,
      date_of_birth: session.users.date_of_birth,
      address: session.users.address,
      is_active: session.users.is_active || false,
      email_verified: session.users.email_verified || false,
      created_at: session.users.created_at || new Date(),
    },
  };
}

// Delete session
export async function deleteSession(token: string): Promise<void> {
  await prisma.sessions.delete({
    where: { token },
  });
}

// Delete all sessions for a user
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await prisma.sessions.deleteMany({
    where: { user_id: userId },
  });
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  await prisma.sessions.deleteMany({
    where: {
      expires_at: {
        lt: new Date(),
      },
    },
  });
}

// Get current user from cookies
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await getSession(sessionToken);
  return session?.user || null;
}

// Require authentication - throws if not authenticated
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

// Require specific role
export async function requireRole(allowedRoles: UserRole[]): Promise<User> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

// Create user
export async function createUser(data: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: UserRole;
}): Promise<User> {
  const passwordHash = await hashPassword(data.password);

  const user = await prisma.users.create({
    data: {
      email: data.email.toLowerCase(),
      password_hash: passwordHash,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone || null,
      role: data.role || "patient",
    },
  });

  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone,
    role: user.role as UserRole,
    avatar_url: user.avatar_url,
    date_of_birth: user.date_of_birth,
    address: user.address,
    is_active: user.is_active || false,
    email_verified: user.email_verified || false,
    created_at: user.created_at || new Date(),
  };
}

// Find user by email
export async function findUserByEmail(
  email: string,
): Promise<(User & { password_hash: string }) | null> {
  const user = await prisma.users.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    password_hash: user.password_hash,
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone,
    role: user.role as UserRole,
    avatar_url: user.avatar_url,
    date_of_birth: user.date_of_birth,
    address: user.address,
    is_active: user.is_active || false,
    email_verified: user.email_verified || false,
    created_at: user.created_at || new Date(),
  };
}

// Generate password reset token
export async function generatePasswordResetToken(
  userId: string,
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.password_reset_tokens.create({
    data: {
      user_id: userId,
      token,
      expires_at: expiresAt,
    },
  });

  return token;
}

// Verify password reset token
export async function verifyPasswordResetToken(
  token: string,
): Promise<string | null> {
  const resetToken = await prisma.password_reset_tokens.findUnique({
    where: {
      token,
      expires_at: {
        gt: new Date(),
      },
      used_at: null,
    },
  });

  return resetToken?.user_id || null;
}

// Use password reset token
export async function usePasswordResetToken(
  token: string,
  newPassword: string,
): Promise<boolean> {
  const userId = await verifyPasswordResetToken(token);
  if (!userId) {
    return false;
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.users.update({
    where: { id: userId },
    data: { password_hash: passwordHash },
  });

  await prisma.password_reset_tokens.update({
    where: { token },
    data: { used_at: new Date() },
  });

  await deleteAllUserSessions(userId);

  return true;
}
