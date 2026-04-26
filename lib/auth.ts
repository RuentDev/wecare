import { cookies } from "next/headers";
import { query } from "./db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextRequest } from "next/server";

// Types
export type UserRole = "admin" | "staff" | "patient";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  date_of_birth: string | null;
  address: string | null;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
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

  await query(
    `INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      userId,
      token,
      expiresAt.toISOString(),
      ipAddress || null,
      userAgent || null,
    ],
  );

  // Update last login
  await query(
    `UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [userId],
  );

  return token;
}

// Get session from token
export async function getSession(
  token: string,
): Promise<(Session & { user: User }) | null> {
  const result = await query<Session & User>(
    `SELECT s.*, u.id as user_id, u.email, u.first_name, u.last_name, 
            u.phone, u.role, u.avatar_url, u.date_of_birth, u.address,
            u.is_active, u.email_verified, u.created_at
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.token = $1 AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = true`,
    [token],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    token: row.token,
    expires_at: row.expires_at,
    ip_address: row.ip_address,
    user_agent: row.user_agent,
    user: {
      id: row.user_id,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      phone: row.phone,
      role: row.role,
      avatar_url: row.avatar_url,
      date_of_birth: row.date_of_birth,
      address: row.address,
      is_active: row.is_active,
      email_verified: row.email_verified,
      created_at: row.created_at,
    },
  };
}

// Delete session
export async function deleteSession(token: string): Promise<void> {
  await query(`DELETE FROM sessions WHERE token = $1`, [token]);
}

// Delete all sessions for a user
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  await query(`DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP`);
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

  const result = await query<User>(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, first_name, last_name, phone, role, avatar_url, 
               date_of_birth, address, is_active, email_verified, created_at`,
    [
      data.email.toLowerCase(),
      passwordHash,
      data.first_name,
      data.last_name,
      data.phone || null,
      data.role || "patient",
    ],
  );

  return result.rows[0];
}

// Find user by email
export async function findUserByEmail(
  email: string,
): Promise<(User & { password_hash: string }) | null> {
  const result = await query<User & { password_hash: string }>(
    `SELECT id, email, password_hash, first_name, last_name, phone, role, 
            avatar_url, date_of_birth, address, is_active, email_verified, created_at
     FROM users WHERE email = $1`,
    [email.toLowerCase()],
  );

  return result.rows[0] || null;
}

// Generate password reset token
export async function generatePasswordResetToken(
  userId: string,
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt.toISOString()],
  );

  return token;
}

// Verify password reset token
export async function verifyPasswordResetToken(
  token: string,
): Promise<string | null> {
  const result = await query<{ user_id: string }>(
    `SELECT user_id FROM password_reset_tokens 
     WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP AND used_at IS NULL`,
    [token],
  );

  return result.rows[0]?.user_id || null;
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

  await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [
    passwordHash,
    userId,
  ]);
  await query(
    `UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = $1`,
    [token],
  );
  await deleteAllUserSessions(userId);

  return true;
}
