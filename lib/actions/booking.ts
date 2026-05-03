"use server";

import prisma from "@/lib/prisma-db";
import { createGuestUser, findUserByEmail } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { guestBookingSchema } from "@/lib/validations/booking";

export async function createGuestBooking(data: {
  // Patient info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  reason: string;
  // Appointment info
  doctorId: string;
  serviceId: string;
  locationId: string;
  appointmentDate: string; // ISO date
  startTime: string;       // HH:mm
  endTime: string;         // HH:mm
}) {
  // 1. Validate input with Zod before touching the DB
  const parsed = guestBookingSchema.safeParse(data);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return {
      success: false,
      error: firstError?.message ?? "Invalid booking data. Please check your inputs.",
      validationErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    // 2. Check if email already exists
    const existingUser = await findUserByEmail(data.email);

    if (existingUser && !existingUser.is_guest) {
      return {
        success: false,
        error: "An account with this email exists. Please log in to book.",
        requiresLogin: true,
      };
    }

    // 3. Reuse existing guest record or create new one
    let patientId: string;
    if (existingUser?.is_guest) {
      patientId = existingUser.id;
      // Update name/phone if changed
      await prisma.users.update({
        where: { id: patientId },
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
        },
      });
    } else {
      const guest = await createGuestUser({
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
      });
      patientId = guest.id;
    }

    // 4. Create the appointment — convert time strings to full Date objects for DB
    const dateOnly = data.appointmentDate.split("T")[0];
    const startDateTime = new Date(`1970-01-01T${data.startTime}:00Z`);
    const endDateTime = new Date(`1970-01-01T${data.endTime}:00Z`);

    const appointment = await prisma.appointments.create({
      data: {
        patient_id: patientId,
        doctor_id: data.doctorId,
        service_id: data.serviceId,
        location_id: data.locationId,
        appointment_date: new Date(dateOnly),
        start_time: startDateTime,
        end_time: endDateTime,
        status: "pending",
        notes: data.reason,
      },
    });

    revalidatePath("/admin/appointments");

    return {
      success: true,
      appointmentId: appointment.id,
      patientId,
    };
  } catch (error) {
    console.error("[CREATE_GUEST_BOOKING]", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
