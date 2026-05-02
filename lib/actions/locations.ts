"use server";

import { prisma } from "@/lib/prisma-db";
import { serializePrisma } from "@/lib/utils";

/**
 * Fetches all active clinic locations.
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
