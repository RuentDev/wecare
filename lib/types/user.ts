export type UserRole = "admin" | "doctor" | "nurse" | "staff" | "patient";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  date_of_birth?: Date | string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  address?: string | null;
  is_active: boolean;
  email_verified: boolean;
  created_at?: Date | string;
}
