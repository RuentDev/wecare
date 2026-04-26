"use server";

import { cookies } from "next/headers";
import {
  createUser,
  findUserByEmail,
  createSession,
  verifyPassword,
  getCurrentUser,
  deleteSession,
} from "@/lib/auth";
import {
  signupSchema,
  loginSchema,
  adminSignupSchema,
  type SignupState,
  type LoginState,
} from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma-db";

export async function signup(
  prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const fields = Object.fromEntries(formData.entries()) as Record<
    string,
    string
  >;

  const validatedFields = signupSchema.safeParse(fields);

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
      fields,
    };
  }

  const {
    first_name,
    last_name,
    email,
    phone,
    password,
    gender,
    date_of_birth,
    street,
    city,
    state,
    postal_code,
  } = validatedFields.data;

  try {
    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return {
        error: "User with this email already exists",
        fields,
      };
    }

    // Create user
    await createUser({
      first_name,
      last_name,
      email,
      phone,
      password,
      role: "patient",
      gender,
      date_of_birth,
      street,
      city,
      state,
      postal_code,
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      error: "Something went wrong. Please try again.",
      fields,
    };
  }
}

export async function adminSignup(
  prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const fields = Object.fromEntries(formData.entries()) as Record<
    string,
    string
  >;

  const validatedFields = adminSignupSchema.safeParse(fields);

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
      fields,
    };
  }

  const { email, username, password } = validatedFields.data;

  try {
    // SECURITY CHECK: Only allow if no users exist
    const userCount = await prisma.users.count();
    if (userCount > 0) {
      return {
        error: "System already initialized. Please use standard login.",
        fields,
      };
    }

    // Check if user already exists (should be 0, but safety first)
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return {
        error: "User with this email already exists",
        fields,
      };
    }

    // Create user with admin role
    // Map username to first_name, and use 'Admin' as last_name
    await createUser({
      first_name: username,
      last_name: "Admin",
      email,
      password,
      role: "admin",
    });

    return { success: true };
  } catch (error) {
    console.error("Admin signup error:", error);
    return {
      error: "Something went wrong. Please try again.",
      fields,
    };
  }
}

export async function login(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = loginSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
    };
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return {
        error: "Invalid email or password",
      };
    }

    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return {
        error: "Invalid email or password",
      };
    }

    if (!user.is_active) {
      return {
        error: "Your account is inactive. Please contact support.",
      };
    }

    // Create session
    const token = await createSession(user.id);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return { success: true, user };
  } catch (error) {
    console.error("Login error:", error);
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function getMe() {
  return await getCurrentUser();
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (token) {
    await deleteSession(token);
  }

  cookieStore.delete("session_token");
}
