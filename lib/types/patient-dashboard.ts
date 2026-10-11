export type PatientAppointmentStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "no_show";

export interface PatientDashboardAppointment {
  id: string;
  appointment_number: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: PatientAppointmentStatus;
  notes: string | null;
  service_name: string;
  service_price: number;
  duration_minutes?: number | null;
  dentist_first_name: string;
  dentist_last_name: string;
  dentist_avatar_url?: string | null;
  specialization?: string | null;
  location_name: string;
  location_address?: string | null;
  city?: string | null;
}
