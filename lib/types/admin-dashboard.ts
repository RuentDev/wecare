export interface DashboardKPIStats {
  todayAppointments: number;
  pendingAppointments: number;
  totalPatients: number;
  monthlyRevenue: number;
}

export type QueueStage = "waiting" | "in_consultation" | "checked_out";

export interface QueuedPatient {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  serviceName: string;
  timeSlot: string;
  status: "checked_in" | "confirmed" | "completed" | "pending" | "cancelled" | "no_show";
  queueStage: QueueStage;
}

export interface PatientQueueSummary {
  waitingCount: number;
  inConsultationCount: number;
  checkedOutCount: number;
  totalTodayCount: number;
  queue: QueuedPatient[];
}

export type PhysicianDutyStatus = "ON_DUTY" | "ON_BREAK" | "FINISHED";

export interface PhysicianDoorStatus {
  id: string;
  name: string;
  specialization: string | null;
  avatarUrl: string | null;
  locationName: string | null;
  status: PhysicianDutyStatus;
  currentPatientName?: string | null;
  todayAppointmentsCount: number;
}

export type StaffRole = "admin" | "doctor" | "nurse" | "staff";

export interface ActiveStaffSession {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: StaffRole;
  avatarUrl: string | null;
  ipAddress: string | null;
  device: string;
  lastActiveAt: string;
}

export interface RoleDetail {
  id: string;
  name: string;
  usersCount: number;
  permsCount: number;
}

export interface RBACSummary {
  totalRoles: number;
  totalPermissions: number;
  roles: RoleDetail[];
}

export interface AdminDashboardData {
  stats: DashboardKPIStats;
  queue: PatientQueueSummary;
  physicians: PhysicianDoorStatus[];
  activeStaff: ActiveStaffSession[];
  rbac: RBACSummary;
}
