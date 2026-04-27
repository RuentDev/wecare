import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma-db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextRequest } from "next/server";

import { type User, type UserRole } from "@/lib/types/user";

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
      gender: session.users.gender as any,
      date_of_birth: session.users.date_of_birth,
      street: session.users.street,
      city: session.users.city,
      state: session.users.state,
      postal_code: session.users.postal_code,
      address: session.users.address,
      is_active: session.users.is_active || false,
      is_guest: session.users.is_guest || false,
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
  gender?: string;
  date_of_birth?: string | Date;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
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
      gender: (data.gender as any) || null,
      date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
      street: data.street || null,
      city: data.city || null,
      state: data.state || null,
      postal_code: data.postal_code || null,
    },
  });

  // Sync with RBAC roles table if it exists
  const roleName = data.role || "patient";
  const roleRecord = await prisma.roles.findUnique({
    where: { name: roleName },
  });

  if (roleRecord) {
    await prisma.user_roles.create({
      data: {
        user_id: user.id,
        role_id: roleRecord.id,
      },
    });
  }

  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone,
    role: user.role as UserRole,
    avatar_url: user.avatar_url,
    gender: user.gender as any,
    date_of_birth: user.date_of_birth,
    street: user.street,
    city: user.city,
    state: user.state,
    postal_code: user.postal_code,
    address: user.address,
    is_active: user.is_active || false,
    is_guest: user.is_guest || false,
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
    gender: user.gender as any,
    date_of_birth: user.date_of_birth,
    street: user.street,
    city: user.city,
    state: user.state,
    postal_code: user.postal_code,
    address: user.address,
    is_active: user.is_active || false,
    is_guest: user.is_guest || false,
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

// Create guest user
export async function createGuestUser(data: {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
}): Promise<User> {
  // Use a non-matchable sentinel so bcrypt.compare always fails
  const GUEST_PASSWORD_SENTINEL = "GUEST_NO_PASSWORD";

  const user = await prisma.users.create({
    data: {
      email: data.email.toLowerCase(),
      password_hash: GUEST_PASSWORD_SENTINEL,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone || null,
      role: "patient",
      is_guest: true,
    },
  });

  // Sync with RBAC roles table if it exists
  const roleName = "patient";
  const roleRecord = await prisma.roles.findUnique({
    where: { name: roleName },
  });

  if (roleRecord) {
    await prisma.user_roles.create({
      data: {
        user_id: user.id,
        role_id: roleRecord.id,
      },
    });
  }

  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone,
    role: user.role as UserRole,
    avatar_url: user.avatar_url,
    gender: user.gender as any,
    date_of_birth: user.date_of_birth,
    street: user.street,
    city: user.city,
    state: user.state,
    postal_code: user.postal_code,
    address: user.address,
    is_active: user.is_active || false,
    is_guest: user.is_guest || false,
    email_verified: user.email_verified || false,
    created_at: user.created_at || new Date(),
  };
}

// Convert guest to registered user
export async function convertGuestToRegistered(
  userId: string,
  password: string,
  additionalData?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    gender?: string;
    date_of_birth?: string | Date;
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  },
): Promise<User> {
  const passwordHash = await hashPassword(password);

  const updateData: any = {
    password_hash: passwordHash,
    is_guest: false,
    ...additionalData,
  };

  if (additionalData?.date_of_birth) {
    updateData.date_of_birth = new Date(additionalData.date_of_birth);
  }

  const user = await prisma.users.update({
    where: { id: userId },
    data: updateData,
  });

  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone,
    role: user.role as UserRole,
    avatar_url: user.avatar_url,
    gender: user.gender as any,
    date_of_birth: user.date_of_birth,
    street: user.street,
    city: user.city,
    state: user.state,
    postal_code: user.postal_code,
    address: user.address,
    is_active: user.is_active || false,
    is_guest: user.is_guest || false,
    email_verified: user.email_verified || false,
    created_at: user.created_at || new Date(),
  };
}


export { User };
