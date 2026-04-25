// Mock Data for WeCare Clinic

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  bio: string;
  rating: number;
  reviewCount: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId: string;
  date: string; // ISO date string
  time: string; // HH:mm format
  status: 'scheduled' | 'completed' | 'cancelled';
  reason?: string;
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  medicalHistory?: string[];
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'admin';
  name: string;
  createdAt: string;
}

// Mock Doctors
export const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    specialty: 'General Practitioner',
    avatar: '👩‍⚕️',
    bio: 'Experienced GP with 8 years of clinical practice. Specializes in preventive care.',
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: '2',
    name: 'Dr. Michael Roberts',
    specialty: 'Cardiologist',
    avatar: '👨‍⚕️',
    bio: 'Specialist in cardiac care with focus on preventive cardiology.',
    rating: 4.9,
    reviewCount: 89,
  },
  {
    id: '3',
    name: 'Dr. Emily Wong',
    specialty: 'Orthopedic Surgeon',
    avatar: '👩‍⚕️',
    bio: 'Specialized in orthopedic surgery and sports medicine.',
    rating: 4.7,
    reviewCount: 76,
  },
  {
    id: '4',
    name: 'Dr. James Miller',
    specialty: 'Dermatologist',
    avatar: '👨‍⚕️',
    bio: 'Expert in dermatology with extensive experience in skin conditions.',
    rating: 4.6,
    reviewCount: 102,
  },
  {
    id: '5',
    name: 'Dr. Lisa Park',
    specialty: 'Pediatrician',
    avatar: '👩‍⚕️',
    bio: 'Dedicated pediatrician focused on child health and development.',
    rating: 4.9,
    reviewCount: 156,
  },
];

// Mock Services
export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Consultation',
    description: 'Initial consultation with a healthcare professional',
    duration: 30,
    price: 50,
  },
  {
    id: '2',
    name: 'Follow-up Visit',
    description: 'Follow-up appointment for ongoing treatment',
    duration: 20,
    price: 35,
  },
  {
    id: '3',
    name: 'Specialized Treatment',
    description: 'Specialized treatment or procedure',
    duration: 60,
    price: 150,
  },
  {
    id: '4',
    name: 'Check-up',
    description: 'Routine health check-up and screening',
    duration: 30,
    price: 45,
  },
  {
    id: '5',
    name: 'Vaccination',
    description: 'Immunization and vaccination services',
    duration: 15,
    price: 30,
  },
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: 'patient1',
    doctorId: '1',
    serviceId: '1',
    date: new Date(new Date().getTime() + 86400000).toISOString().split('T')[0], // tomorrow
    time: '09:00',
    status: 'scheduled',
    reason: 'Regular check-up',
  },
  {
    id: '2',
    patientId: 'patient1',
    doctorId: '2',
    serviceId: '2',
    date: new Date(new Date().getTime() + 172800000).toISOString().split('T')[0], // in 2 days
    time: '14:00',
    status: 'scheduled',
    reason: 'Cardiac follow-up',
  },
];

// Mock Users (for authentication)
export const mockUsers: User[] = [
  {
    id: 'patient1',
    email: 'patient@example.com',
    password: 'password123', // In real app, this would be hashed
    role: 'patient',
    name: 'John Doe',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'admin1',
    email: 'admin@example.com',
    password: 'admin123', // In real app, this would be hashed
    role: 'admin',
    name: 'Admin User',
    createdAt: new Date().toISOString(),
  },
];

// Mock Patient Records
export const mockPatients: Patient[] = [
  {
    id: 'patient1',
    name: 'John Doe',
    email: 'patient@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
    allergies: ['Penicillin', 'Shellfish'],
    emergencyContact: {
      name: 'Jane Doe',
      phone: '+1 (555) 987-6543',
      relationship: 'Spouse',
    },
  },
  {
    id: 'patient2',
    name: 'Alice Smith',
    email: 'alice@example.com',
    phone: '+1 (555) 234-5678',
    dateOfBirth: '1985-03-22',
    gender: 'female',
    medicalHistory: ['Asthma'],
    allergies: ['Aspirin'],
    emergencyContact: {
      name: 'Bob Smith',
      phone: '+1 (555) 345-6789',
      relationship: 'Brother',
    },
  },
];

// Utility functions
export const getDoctorById = (id: string): Doctor | undefined => {
  return mockDoctors.find(doc => doc.id === id);
};

export const getServiceById = (id: string): Service | undefined => {
  return mockServices.find(svc => svc.id === id);
};

export const getPatientById = (id: string): Patient | undefined => {
  return mockPatients.find(patient => patient.id === id);
};

export const getAppointmentsByPatient = (patientId: string): Appointment[] => {
  return mockAppointments.filter(apt => apt.patientId === patientId);
};

export const getAppointmentsByDoctor = (doctorId: string): Appointment[] => {
  return mockAppointments.filter(apt => apt.doctorId === doctorId);
};

export const getAvailableSlots = (
  doctorId: string,
  date: string,
  slotDuration: number = 30
): string[] => {
  // Generate available time slots from 9 AM to 5 PM
  const slots: string[] = [];
  const [hour, minute] = ['09', '00'];
  let currentHour = parseInt(hour);
  let currentMinute = parseInt(minute);

  while (currentHour < 17) {
    const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    
    // Check if this slot is not already booked
    const isBooked = mockAppointments.some(
      apt => apt.doctorId === doctorId && apt.date === date && apt.time === timeString
    );

    if (!isBooked) {
      slots.push(timeString);
    }

    currentMinute += slotDuration;
    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute -= 60;
    }
  }

  return slots;
};

export const createAppointment = (appointment: Omit<Appointment, 'id'>): Appointment => {
  const newAppointment: Appointment = {
    ...appointment,
    id: Date.now().toString(),
  };
  mockAppointments.push(newAppointment);
  return newAppointment;
};

export const getUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(user => user.email === email);
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};
