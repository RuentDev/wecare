/**
 * Canonical types for the public scheduling/booking flow.
 * These map to the real DB shape returned by the scheduling server actions,
 * and replace the legacy types from lib/mock-data.ts.
 */

export type SchedulingDoctor = {
  id: string;
  name: string; // first_name + last_name from users join
  specialization: string | null; // doctor_specialization enum
  bio: string | null;
  avatarUrl: string | null; // users.avatar_url
  yearsOfExperience: number | null;
  consultationFee: number | null;
  isAvailable: boolean;
  serviceIds: string[];
};

export type SchedulingService = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  category: string | null;
};

export type SchedulingLocation = {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
};

export type TimeSlotStatus = "available" | "booked" | "past";

export type TimeSlotInfo = {
  time: string; // HH:mm
  status: TimeSlotStatus;
};

export interface DoctorTimeSlot {
  id: string;
  doctor_id: string | null;
  location_id: string | null;
  day_of_week: number | null; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time: Date | string;
  end_time: Date | string;
  is_available: boolean | null;
  created_at?: Date | string | null;
  locations?: {
    id: string;
    name: string;
    city: string;
  } | null;
}

export interface DoctorScheduleException {
  id: string;
  doctor_id: string;
  date: Date | string;
  start_time?: Date | string | null;
  end_time?: Date | string | null;
  is_full_day: boolean;
  reason?: string | null;
  created_at?: Date | string | null;
}

export interface SerializedAppointmentSlot {
  appointment_date: string;
  start_time: string;
  end_time: string;
}

export interface DoctorMonthlyStatsData {
  appointments: SerializedAppointmentSlot[];
  exceptions: DoctorScheduleException[];
  timeSlots: DoctorTimeSlot[];
}
