import { z } from "zod";

export const guestBookingSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(7, "Phone number is required"),
  reason: z.string().min(3, "Please describe your reason for visit"),
  doctorId: z.string().uuid("Invalid doctor selection"),
  serviceId: z.string().uuid("Invalid service selection"),
  locationId: z.string().uuid("Invalid location"),
  appointmentDate: z.string().min(1, "Date is required"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
});

export type GuestBookingValues = z.infer<typeof guestBookingSchema>;
