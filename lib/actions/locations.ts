"use server";

import { prisma } from "@/lib/prisma-db";
import { serializePrisma } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AdminLocation, LocationStats } from "@/lib/types/locations";
import { format } from "date-fns";

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const locationSchema = z.object({
  name: z.string().min(1, "Location name is required").max(255),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().max(100).nullable().optional(),
  postal_code: z.string().max(20).nullable().optional(),
  country: z.string().max(100).nullable().optional().default("Philippines"),
  phone: z.string().max(50).nullable().optional(),
  email: z.string().max(255).email().nullable().optional().or(z.literal("")),
  opening_time: z.string().nullable().optional(), // Expected format "HH:mm"
  closing_time: z.string().nullable().optional(), // Expected format "HH:mm"
  is_active: z.boolean().default(true),
});

type LocationInput = z.infer<typeof locationSchema>;

function parseTimeStringToDate(timeStr: string | null | undefined): Date | undefined {
  if (!timeStr) return undefined;
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date(1970, 0, 1, hours, minutes, 0);
  return date;
}

function formatDateToTimeString(date: Date | null): string | null {
  if (!date) return null;
  // Use date-fns to format the date to "HH:mm"
  return format(date, "HH:mm");
}

/**
 * Fetches all active clinic locations. (Used by public facing / booking pages)
 */
export async function getLocations() {
  try {
    const locations = await prisma.locations.findMany({
      where: { is_active: true },
      orderBy: { name: "asc" },
    });

    return { success: true, data: serializePrisma(locations) };
  } catch (error) {
    console.error("Error fetching locations:", error);
    return { success: false, error: "Failed to fetch locations" };
  }
}

// ---------------------------------------------------------------------------
// Admin Read operations
// ---------------------------------------------------------------------------

export async function getAdminLocations(): Promise<{
  success: boolean;
  data?: AdminLocation[];
  error?: string;
}> {
  try {
    const locations = await prisma.locations.findMany({
      include: {
        _count: {
          select: { doctors: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const data: AdminLocation[] = locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      address: loc.address,
      city: loc.city,
      state: loc.state ?? null,
      postal_code: loc.postal_code ?? null,
      country: loc.country ?? null,
      phone: loc.phone ?? null,
      email: loc.email ?? null,
      image_url: loc.image_url ?? null,
      google_maps_url: loc.google_maps_url ?? null,
      latitude: loc.latitude ? Number(loc.latitude) : null,
      longitude: loc.longitude ? Number(loc.longitude) : null,
      opening_time: formatDateToTimeString(loc.opening_time),
      closing_time: formatDateToTimeString(loc.closing_time),
      is_active: loc.is_active ?? true,
      doctorCount: loc._count.doctors,
      createdAt: loc.created_at ?? null,
    }));

    return { success: true, data };
  } catch (error) {
    console.error("[GET_ADMIN_LOCATIONS]", error);
    return { success: false, error: "Failed to fetch locations" };
  }
}

export async function getLocationStats(): Promise<{
  success: boolean;
  data?: LocationStats;
  error?: string;
}> {
  try {
    const [total, active, citiesResult] = await Promise.all([
      prisma.locations.count(),
      prisma.locations.count({ where: { is_active: true } }),
      prisma.locations.groupBy({
        by: ["city"],
        where: { is_active: true },
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        cities: citiesResult.length,
      },
    };
  } catch (error) {
    console.error("[GET_LOCATION_STATS]", error);
    return { success: false, error: "Failed to fetch location stats" };
  }
}

// ---------------------------------------------------------------------------
// Admin Write operations
// ---------------------------------------------------------------------------

export async function createLocation(
  input: LocationInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = locationSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      };
    }

    await prisma.locations.create({
      data: {
        name: parsed.data.name,
        address: parsed.data.address,
        city: parsed.data.city,
        state: parsed.data.state,
        postal_code: parsed.data.postal_code,
        country: parsed.data.country,
        phone: parsed.data.phone,
        email: parsed.data.email,
        opening_time: parseTimeStringToDate(parsed.data.opening_time),
        closing_time: parseTimeStringToDate(parsed.data.closing_time),
        is_active: parsed.data.is_active,
      },
    });

    revalidatePath("/admin/locations");
    return { success: true };
  } catch (error) {
    console.error("[CREATE_LOCATION]", error);
    return { success: false, error: "Failed to create location" };
  }
}

export async function updateLocation(
  id: string,
  input: LocationInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = locationSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      };
    }

    await prisma.locations.update({
      where: { id },
      data: {
        name: parsed.data.name,
        address: parsed.data.address,
        city: parsed.data.city,
        state: parsed.data.state,
        postal_code: parsed.data.postal_code,
        country: parsed.data.country,
        phone: parsed.data.phone,
        email: parsed.data.email,
        opening_time: parseTimeStringToDate(parsed.data.opening_time),
        closing_time: parseTimeStringToDate(parsed.data.closing_time),
        is_active: parsed.data.is_active,
      },
    });

    revalidatePath("/admin/locations");
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_LOCATION]", error);
    return { success: false, error: "Failed to update location" };
  }
}

export async function deleteLocation(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.locations.delete({
      where: { id },
    });

    revalidatePath("/admin/locations");
    return { success: true };
  } catch (error) {
    console.error("[DELETE_LOCATION]", error);
    return { success: false, error: "Failed to delete location" };
  }
}
