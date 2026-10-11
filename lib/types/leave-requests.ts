export type LeaveRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface DoctorLeaveRequest {
  id: string;
  doctor_id: string;
  start_date: string;
  end_date: string;
  is_full_day: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string;
  status: LeaveRequestStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  doctors?: {
    id: string;
    specialization: string | null;
    users?: {
      first_name: string;
      last_name: string;
      email: string;
      avatar_url: string | null;
    } | null;
  } | null;
  reviewer?: {
    first_name: string;
    last_name: string;
  } | null;
  conflictingAppointmentsCount?: number;
}

export interface CreateLeaveRequestInput {
  doctorId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isFullDay: boolean;
  startTime?: string | null; // HH:mm
  endTime?: string | null; // HH:mm
  reason: string;
}

export interface ConflictingAppointment {
  id: string;
  appointment_number: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  patient_name: string;
  patient_email: string;
  service_name: string;
}
