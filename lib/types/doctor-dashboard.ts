import { appointments, doctors, users, medical_records, invoices, audit_logs, notification_logs, services, locations, time_slots } from "@/lib/generated/prisma";

export interface DoctorScheduleData {
  todayAppointments: DoctorAppointmentView[];
  upcomingAppointments: DoctorAppointmentView[];
  timeSlots: time_slots[];
}

export interface DoctorAppointmentView extends appointments {
  users: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
  };
  services: services;
  locations: locations;
}

export interface DoctorPatientEMR {
  patient: users & {
    _count: { appointments: number };
  };
  history: (medical_records & {
    doctors: {
      users: {
        first_name: string;
        last_name: string;
      };
    } | null;
    appointments: {
      appointment_date: Date;
      services: {
        name: string;
      };
    } | null;
  })[];
  vitals: any; // Using existing vitals pattern
}

export interface DoctorInvoiceSummary extends invoices {
  patient: {
    first_name: string;
    last_name: string;
  };
}

export interface DailyVolumeStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  trend: { date: string; count: number }[];
}

export interface DoctorDashboardData {
  doctor: doctors & { users: users | null };
  stats: {
    todayPatients: number;
    pendingAppointments: number;
    unreadMessages: number;
  };
  recentAppointments: DoctorAppointmentView[];
}
