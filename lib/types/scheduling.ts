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
};

export type SchedulingService = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  category: string | null;
};
