"use server";

import { prisma } from "@/lib/prisma-db";
import { revalidatePath } from "next/cache";

export async function getDoctors() {
  try {
    const doctors = await prisma.doctors.findMany({
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            avatar_url: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return { success: true, data: doctors };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return { success: false, error: "Failed to fetch doctors" };
  }
}

export async function getDoctorStats() {
  try {
    const [total, available, specializations] = await Promise.all([
      prisma.doctors.count(),
      prisma.doctors.count({ where: { is_available: true } }),
      prisma.doctors.groupBy({
        by: ["specialization"],
        _count: {
          id: true,
        },
      }),
    ]);

    // Get the most common specialization
    const topSpecialization = specializations.sort((a, b) => 
      (b._count.id || 0) - (a._count.id || 0)
    )[0]?.specialization || "N/A";

    return {
      success: true,
      data: {
        total,
        available,
        topSpecialization,
        specializationsCount: specializations.length,
      },
    };
  } catch (error) {
    console.error("Error fetching doctor stats:", error);
    return { success: false, error: "Failed to fetch doctor stats" };
  }
}
