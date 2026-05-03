"use server";

import prisma from "@/lib/prisma-db";
import type { SchedulingDoctor, SchedulingService, SchedulingLocation } from "@/lib/types/scheduling";

/**
 * Fetches all available doctors for the public booking flow.
 * Joins with the users table to get name and avatar.
 */
export async function getPublicDoctors(): Promise<{
  success: boolean;
  data?: SchedulingDoctor[];
  error?: string;
}> {
  try {
    const doctors = await prisma.doctors.findMany({
      where: { is_available: true },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            avatar_url: true,
          },
        },
      },
      orderBy: { created_at: "asc" },
    });

    const data: SchedulingDoctor[] = doctors.map((doc) => ({
      id: doc.id,
      name: doc.users
        ? `Dr. ${doc.users.first_name} ${doc.users.last_name}`.trim()
        : "Unknown Doctor",
      specialization: doc.specialization ?? null,
      bio: doc.bio ?? null,
      avatarUrl: doc.users?.avatar_url ?? null,
      yearsOfExperience: doc.years_of_experience ?? null,
      consultationFee: doc.consultation_fee
        ? Number(doc.consultation_fee)
        : null,
      isAvailable: doc.is_available ?? false,
    }));

    return { success: true, data };
  } catch (error) {
    console.error("[GET_PUBLIC_DOCTORS]", error);
    return { success: false, error: "Failed to load doctors" };
  }
}

/**
 * Fetches all active services for the public booking flow.
 */
export async function getPublicServices(): Promise<{
  success: boolean;
  data?: SchedulingService[];
  error?: string;
}> {
  try {
    const services = await prisma.services.findMany({
      where: { is_active: true },
      orderBy: { name: "asc" },
    });

    const data: SchedulingService[] = services.map((svc) => ({
      id: svc.id,
      name: svc.name,
      description: svc.description ?? null,
      durationMinutes: svc.duration_minutes ?? 30,
      price: Number(svc.price),
      category: svc.category ?? null,
    }));

    return { success: true, data };
  } catch (error) {
    console.error("[GET_PUBLIC_SERVICES]", error);
    return { success: false, error: "Failed to load services" };
  }
}

/**
 * Fetches available time slots for a doctor on a given date.
 * Strategy:
 *   1. Look up `time_slots` for the doctor on that day_of_week.
 *   2. Query existing `appointments` for that doctor on that date.
 *   3. Return slots not already booked (HH:mm strings).
 *
 * Returns an empty array if the doctor has no configured time_slots.
 */
export async function getAvailableTimeSlots(
  doctorId: string,
  date: Date
): Promise<{ success: boolean; data?: string[]; error?: string }> {
  try {
    // 0 = Sunday … 6 = Saturday (JS Date convention)
    const dayOfWeek = date.getDay();
    const dateOnly = date.toISOString().split("T")[0];

    // 1. Doctor's configured slots for that day of week
    const timeSlots = await prisma.time_slots.findMany({
      where: {
        doctor_id: doctorId,
        day_of_week: dayOfWeek,
        is_available: true,
      },
      orderBy: { start_time: "asc" },
    });

    if (timeSlots.length === 0) {
      return { success: true, data: [] };
    }

    // 2. Already booked appointments for that doctor on that date
    const bookedAppointments = await prisma.appointments.findMany({
      where: {
        doctor_id: doctorId,
        appointment_date: new Date(dateOnly),
        status: { notIn: ["cancelled"] },
      },
      select: { start_time: true },
    });

    // Extract booked HH:mm strings
    const bookedTimes = new Set(
      bookedAppointments.map((apt) => {
        const t = apt.start_time;
        return `${String(t.getUTCHours()).padStart(2, "0")}:${String(t.getUTCMinutes()).padStart(2, "0")}`;
      })
    );

    // 3. Build available slot list
    const available: string[] = timeSlots
      .map((slot) => {
        const t = slot.start_time;
        return `${String(t.getUTCHours()).padStart(2, "0")}:${String(t.getUTCMinutes()).padStart(2, "0")}`;
      })
      .filter((time) => !bookedTimes.has(time));

    return { success: true, data: available };
  } catch (error) {
    console.error("[GET_AVAILABLE_TIME_SLOTS]", error);
    return { success: false, error: "Failed to load time slots" };
  }
}

/**
 * Returns the ID of the first active clinic location.
 * Used as the default locationId for the guest booking flow.
 */
export async function getDefaultLocationId(): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  try {
    const location = await prisma.locations.findFirst({
      where: { is_active: true },
      orderBy: { created_at: "asc" },
      select: { id: true },
    });

    if (!location) {
      return { success: false, error: "No active location found" };
    }

    return { success: true, data: location.id };
  } catch (error) {
    console.error("[GET_DEFAULT_LOCATION_ID]", error);
    return { success: false, error: "Failed to fetch location" };
  }
}

/**
 * Fetches all active clinic locations for the public booking flow.
 */
export async function getPublicLocations(): Promise<{
  success: boolean;
  data?: SchedulingLocation[];
  error?: string;
}> {
  try {
    const locations = await prisma.locations.findMany({
      where: { is_active: true },
      orderBy: { name: "asc" },
    });

    const data: SchedulingLocation[] = locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      address: loc.address,
      city: loc.city,
      phone: loc.phone ?? undefined,
      email: loc.email ?? undefined,
    }));

    return { success: true, data };
  } catch (error) {
    console.error("[GET_PUBLIC_LOCATIONS]", error);
    return { success: false, error: "Failed to load locations" };
  }
}
