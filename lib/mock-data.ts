export interface MockDoctor {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  rating?: number;
}

export interface MockService {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export const mockDoctors: MockDoctor[] = [
  { id: "1", name: "Dr. Sarah Jenkins", specialty: "Cardiology" },
  { id: "2", name: "Dr. Marcus Chen", specialty: "Pediatrics" },
];

export const mockServices: MockService[] = [
  { id: "1", name: "General Checkup", duration: 30, price: 500 },
  { id: "2", name: "Consultation", duration: 45, price: 800 },
];

export function getAvailableSlots(
  _doctorId: string,
  _date: Date | string,
  _duration?: number,
): string[] {
  return ["09:00 AM", "10:30 AM", "02:00 PM", "03:30 PM"];
}

export function getDoctorById(id: string): MockDoctor | undefined {
  return mockDoctors.find((d) => d.id === id);
}

export function getServiceById(id: string): MockService | undefined {
  return mockServices.find((s) => s.id === id);
}

export function createAppointment(_data: Record<string, unknown>): { id: string } {
  return { id: "mock-apt-1" };
}
