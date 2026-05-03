"use server";

import prisma from "@/lib/prisma-db";
import type { SchedulingDoctor, SchedulingService, SchedulingLocation, TimeSlotInfo } from "@/lib/types/scheduling";

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
        doctor_services: {
          select: {
            service_id: true,
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
      serviceIds: doc.doctor_services.map((ds) => ds.service_id),
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
  dateInput: Date | string,
  locationId: string,
  serviceId: string
): Promise<{ success: boolean; data?: TimeSlotInfo[]; error?: string }> {
  try {
    // Normalize to UTC midnight to avoid local timezone shifts
    const date = typeof dateInput === "string" 
      ? new Date(`${dateInput}T00:00:00Z`)
      : new Date(dateInput);

    const dayOfWeek = date.getUTCDay();
    const dateOnly = date.toISOString().split("T")[0];

    // 1. Fetch Service Duration
    const service = await prisma.services.findUnique({
      where: { id: serviceId },
      select: { duration_minutes: true },
    });
    const durationMinutes = service?.duration_minutes ?? 30;

    // 2. Doctor's configured availability blocks for this day & location
    const availabilityBlocks = await prisma.time_slots.findMany({
      where: {
        doctor_id: doctorId,
        location_id: locationId,
        day_of_week: dayOfWeek,
        is_available: true,
      },
      orderBy: { start_time: "asc" },
    });

    if (availabilityBlocks.length === 0) {
      return { success: true, data: [] };
    }

    // 3. Already booked appointments for that doctor on that date
    const bookedAppointments = await prisma.appointments.findMany({
      where: {
        doctor_id: doctorId,
        appointment_date: new Date(dateOnly),
        status: { notIn: ["cancelled"] },
      },
      select: { start_time: true, end_time: true },
    });

    // 4. Also check for Full Day Exceptions
    const exceptions = await prisma.schedule_exceptions.findMany({
      where: {
        doctor_id: doctorId,
        date: new Date(dateOnly),
      },
    });

    if (exceptions.some((e) => e.is_full_day)) {
      return { success: true, data: [] };
    }

    // Helper to format minutes as HH:mm
    const toHHmm = (h: number, m: number) =>
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    const slots: TimeSlotInfo[] = [];
    const now = new Date();
    const isToday = dateOnly === now.toISOString().split("T")[0];

    // 5. Generate discrete 30-minute intervals from blocks
    for (const block of availabilityBlocks) {
      const startH = block.start_time.getUTCHours();
      const startM = block.start_time.getUTCMinutes();
      const endH = block.end_time.getUTCHours();
      const endM = block.end_time.getUTCMinutes();

      let currentH = startH;
      let currentM = startM;

      while (true) {
        // Stop if current time + service duration exceeds block end
        const currentTotalMinutes = currentH * 60 + currentM;
        const endTotalMinutes = endH * 60 + endM;
        if (currentTotalMinutes + durationMinutes > endTotalMinutes) break;

        const timeStr = toHHmm(currentH, currentM);
        const slotStartTotal = currentTotalMinutes;
        const slotEndTotal = currentTotalMinutes + durationMinutes;

        // Check against booked appointments (OVERLAP logic)
        // Appointment: [A_start, A_end], Slot: [S_start, S_end]
        // Overlap if: S_start < A_end AND A_start < S_end
        const isBooked = bookedAppointments.some((apt) => {
          const aStart = apt.start_time.getUTCHours() * 60 + apt.start_time.getUTCMinutes();
          const aEnd = apt.end_time.getUTCHours() * 60 + apt.end_time.getUTCMinutes();
          return slotStartTotal < aEnd && aStart < slotEndTotal;
        });

        // Check against Partial Exceptions
        const isBlockedByException = exceptions.some((e) => {
          if (e.is_full_day || !e.start_time || !e.end_time) return false;
          const eStart = e.start_time.getUTCHours() * 60 + e.start_time.getUTCMinutes();
          const eEnd = e.end_time.getUTCHours() * 60 + e.end_time.getUTCMinutes();
          return slotStartTotal < eEnd && eStart < slotEndTotal;
        });

        // Check if in the past (if today)
        let isPast = false;
        if (isToday) {
          const nowH = now.getUTCHours();
          const nowM = now.getUTCMinutes();
          if (currentH < nowH || (currentH === nowH && currentM <= nowM)) {
            isPast = true;
          }
        }

        slots.push({
          time: timeStr,
          status: isBooked || isBlockedByException ? "booked" : isPast ? "past" : "available",
        });

        // Increment by 30 mins
        currentM += 30;
        if (currentM >= 60) {
          currentH += 1;
          currentM -= 60;
        }
      }
    }

    return { success: true, data: slots };
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
