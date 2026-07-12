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
  category_id: z.string().uuid().nullable().optional(),
  new_category_name: z.string().max(100).optional(),
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
        service_categories: true,
      },
      orderBy: [{ name: "asc" }],
    });

    const data: AdminService[] = services.map((svc) => ({
      id: svc.id,
      name: svc.name,
      description: svc.description ?? null,
      category: svc.service_categories
        ? { id: svc.service_categories.id, name: svc.service_categories.name }
        : null,
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
 * Fetches all service categories.
 */
export async function getServiceCategories(): Promise<{
  success: boolean;
  data?: { id: string; name: string }[];
  error?: string;
}> {
  try {
    const categories = await prisma.service_categories.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error("[GET_CATEGORIES]", error);
    return { success: false, error: "Failed to fetch categories" };
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
    const [total, active, categoriesCount, avgResult] = await Promise.all([
      prisma.services.count(),
      prisma.services.count({ where: { is_active: true } }),
      prisma.service_categories.count(),
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
        activeCategories: categoriesCount,
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

export async function createServiceCategory(name: string): Promise<{ success: boolean; data?: { id: string; name: string }; error?: string }> {
  try {
    const trimmedName = name.trim();
    if (!trimmedName) return { success: false, error: "Category name is required" };
    
    // Check if exists
    const existing = await prisma.service_categories.findUnique({
      where: { name: trimmedName }
    });
    
    if (existing) {
      return { success: true, data: existing };
    }

    const created = await prisma.service_categories.create({
      data: { name: trimmedName }
    });
    
    revalidatePath("/admin/services");
    return { success: true, data: created };
  } catch (error) {
    console.error("[CREATE_CATEGORY]", error);
    return { success: false, error: "Failed to create category" };
  }
}

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

    let finalCategoryId = parsed.data.category_id;
    if (parsed.data.new_category_name && parsed.data.new_category_name.trim() !== "") {
      const created = await createServiceCategory(parsed.data.new_category_name);
      if (created.success && created.data) {
        finalCategoryId = created.data.id;
      }
    }

    await prisma.services.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        category_id: finalCategoryId ?? null,
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

    let finalCategoryId = parsed.data.category_id;
    if (parsed.data.new_category_name && parsed.data.new_category_name.trim() !== "") {
      const created = await createServiceCategory(parsed.data.new_category_name);
      if (created.success && created.data) {
        finalCategoryId = created.data.id;
      }
    }

    await prisma.services.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        category_id: finalCategoryId ?? null,
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

/**
 * Imports multiple services from a CSV upload.
 * It now handles looking up or automatically creating categories based on the string name.
 */
export async function importServices(
  inputs: (Omit<ServiceInput, 'category_id'> & { category_name?: string })[]
): Promise<{ success: boolean; error?: string; count?: number; skipped?: number }> {
  try {
    // Load existing categories and services
    const existingCats = await prisma.service_categories.findMany();
    const categoryMap = new Map(existingCats.map(c => [c.name.toLowerCase().trim(), c.id]));
    
    const existingServices = await prisma.services.findMany({ select: { name: true }});
    const existingServiceNames = new Set(existingServices.map(s => s.name.toLowerCase().trim()));

    const validData = [];
    let skippedCount = 0;

    for (const [index, input] of inputs.entries()) {
      const normalizedName = input.name.toLowerCase().trim();
      if (existingServiceNames.has(normalizedName)) {
        skippedCount++;
        continue;
      }

      // Handle Category Lookups / Auto-creation
      let category_id = null;
      if (input.category_name) {
        const catNorm = input.category_name.toLowerCase().trim();
        if (categoryMap.has(catNorm)) {
          category_id = categoryMap.get(catNorm);
        } else {
          // Auto create missing category
          const newCat = await prisma.service_categories.create({
            data: { name: input.category_name.trim() }
          });
          categoryMap.set(catNorm, newCat.id);
          category_id = newCat.id;
        }
      }

      const parsed = serviceSchema.safeParse({ ...input, category_id });
      if (parsed.success) {
        validData.push({
          name: parsed.data.name,
          description: parsed.data.description ?? null,
          category_id: parsed.data.category_id ?? null,
          duration_minutes: parsed.data.duration_minutes,
          price: parsed.data.price,
          is_active: parsed.data.is_active,
        });
        existingServiceNames.add(normalizedName);
      } else {
        const errorMsg = parsed.error.errors.map((e) => e.message).join(", ");
        return {
          success: false,
          error: `Row ${index + 1} ("${input.name || 'Unknown'}") failed validation: ${errorMsg}`,
        };
      }
    }

    if (validData.length === 0) {
      return { success: true, count: 0, skipped: skippedCount };
    }

    const result = await prisma.services.createMany({
      data: validData,
      skipDuplicates: true,
    });

    revalidatePath("/admin/services");
    return { success: true, count: result.count, skipped: skippedCount };
  } catch (error) {
    console.error("[IMPORT_SERVICES]", error);
    return { success: false, error: "Failed to import services. An unexpected error occurred." };
  }
}
