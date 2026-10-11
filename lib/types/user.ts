import type { Prisma } from "@/lib/generated/prisma";

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
  is_guest?: boolean;
  email_verified: boolean;
  created_at?: Date | string;
}

export interface DoctorUserRelation {
  id: string;
  user_id: string | null;
  location_id: string | null;
  specialization: string | null;
  license_number: string | null;
  bio: string | null;
  years_of_experience: number | null;
  consultation_fee: Prisma.Decimal | number | string | null;
  is_available: boolean | null;
  is_on_shift: boolean | null;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
  locations?: {
    id: string;
    name: string;
    address: string;
    city: string;
  } | null;
  doctor_services?: {
    service_id: string;
    services: {
      id: string;
      name: string;
      price: Prisma.Decimal | number | string;
      category?: string | null;
    };
  }[];
  appointments?: {
    id: string;
    appointment_number?: string | null;
    appointment_date: string | Date;
    start_time: string | Date;
    status: string | null;
    users?: {
      first_name: string;
      last_name: string;
      email: string;
    } | null;
    services?: {
      name: string;
    } | null;
  }[];
}

export interface UserWithDoctorDetails {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: string | null;
  is_active: boolean | null;
  avatar_url?: string | null;
  gender?: string | null;
  date_of_birth?: string | Date | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  user_roles?: {
    roles: {
      id: string;
      name: string;
    };
  }[];
  doctors?: DoctorUserRelation | null;
}
