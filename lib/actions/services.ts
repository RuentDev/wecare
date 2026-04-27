"use server";

import { prisma } from "@/lib/prisma-db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AdminService, ServiceStats } from "@/lib/types/services";

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required").max(255),
  description: z.string().max(1000).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  duration_minutes: z.coerce.number().int().min(5).max(480).default(30),
  price: z.coerce.number().min(0),
  is_active: z.boolean().default(true),
});

type ServiceInput = z.infer<typeof serviceSchema>;

// ---------------------------------------------------------------------------
// Read operations
// ---------------------------------------------------------------------------

/**
 * Fetches all services (active + inactive) for the admin panel.
 * Includes the count of doctors linked through doctor_services.
 */
export async function getServices(): Promise<{
  success: boolean;
  data?: AdminService[];
  error?: string;
}> {
  try {
    const services = await prisma.services.findMany({
      include: {
        _count: {
          select: { doctor_services: true },
        },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    const data: AdminService[] = services.map((svc) => ({
      id: svc.id,
      name: svc.name,
      description: svc.description ?? null,
      category: svc.category ?? null,
      durationMinutes: svc.duration_minutes ?? 30,
      price: Number(svc.price),
      isActive: svc.is_active ?? true,
      doctorCount: svc._count.doctor_services,
      createdAt: svc.created_at ?? null,
    }));

    return { success: true, data };
  } catch (error) {
    console.error("[GET_SERVICES]", error);
    return { success: false, error: "Failed to fetch services" };
  }
}

/**
 * Returns aggregate statistics for the services dashboard.
 */
export async function getServiceStats(): Promise<{
  success: boolean;
  data?: ServiceStats;
  error?: string;
}> {
  try {
    const [total, active, categories, avgResult] = await Promise.all([
      prisma.services.count(),
      prisma.services.count({ where: { is_active: true } }),
      prisma.services.groupBy({
        by: ["category"],
        where: { is_active: true },
      }),
      prisma.services.aggregate({
        _avg: { price: true },
        where: { is_active: true },
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        activeCategories: categories.length,
        averagePrice: avgResult._avg.price
          ? Number(avgResult._avg.price)
          : 0,
      },
    };
  } catch (error) {
    console.error("[GET_SERVICE_STATS]", error);
    return { success: false, error: "Failed to fetch service stats" };
  }
}

// ---------------------------------------------------------------------------
// Write operations
// ---------------------------------------------------------------------------

/**
 * Creates a new service.
 */
export async function createService(
  input: ServiceInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = serviceSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      };
    }

    await prisma.services.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        category: parsed.data.category ?? null,
        duration_minutes: parsed.data.duration_minutes,
        price: parsed.data.price,
        is_active: parsed.data.is_active,
      },
    });

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("[CREATE_SERVICE]", error);
    return { success: false, error: "Failed to create service" };
  }
}

/**
 * Updates an existing service by ID.
 */
export async function updateService(
  id: string,
  input: ServiceInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = serviceSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      };
    }

    await prisma.services.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        category: parsed.data.category ?? null,
        duration_minutes: parsed.data.duration_minutes,
        price: parsed.data.price,
        is_active: parsed.data.is_active,
      },
    });

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_SERVICE]", error);
    return { success: false, error: "Failed to update service" };
  }
}

/**
 * Deletes a service by ID.
 * Hard-deletes because we have is_active for soft "archiving".
 */
export async function deleteService(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.services.delete({
      where: { id },
    });

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("[DELETE_SERVICE]", error);
    return { success: false, error: "Failed to delete service" };
  }
}
