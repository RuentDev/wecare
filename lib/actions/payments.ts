"use server";

import prisma from "@/lib/prisma-db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { payment_status } from "@/lib/generated/prisma";

/**
 * Fetches all payments with related user and appointment data.
 * Requires admin privileges.
 */
export async function getPayments() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized access");
    }

    const payments = await prisma.payments.findMany({
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            avatar_url: true,
          },
        },
        appointments: {
          select: {
            id: true,
            appointment_date: true,
            start_time: true,
            service_id: true,
            services: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // We serialize Decimal to string/number so it can be passed to Client Components
    return payments.map((p) => ({
      ...p,
      amount: p.amount.toNumber(),
    }));
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    throw new Error(error.message || "Failed to fetch payments");
  }
}

/**
 * Fetches aggregated statistics for the payments dashboard.
 * Requires admin privileges.
 */
export async function getPaymentStats() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized access");
    }

    const stats = await prisma.payments.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
    });

    let totalRevenue = 0;
    let pendingCount = 0;
    let pendingAmount = 0;
    let paidCount = 0;
    let failedRefundedCount = 0;

    stats.forEach((stat) => {
      const count = stat._count.id;
      const sum = stat._sum.amount ? stat._sum.amount.toNumber() : 0;

      if (stat.status === "paid") {
        totalRevenue += sum;
        paidCount += count;
      } else if (stat.status === "pending") {
        pendingCount += count;
        pendingAmount += sum;
      } else if (stat.status === "failed" || stat.status === "refunded") {
        failedRefundedCount += count;
      }
    });

    const totalTransactions = paidCount + failedRefundedCount + pendingCount;
    const successRate =
      totalTransactions > 0
        ? Math.round((paidCount / (totalTransactions - pendingCount)) * 100) || 0
        : 0;

    return {
      totalRevenue,
      pendingCount,
      pendingAmount,
      paidCount,
      failedRefundedCount,
      successRate,
    };
  } catch (error: any) {
    console.error("Error fetching payment stats:", error);
    throw new Error("Failed to fetch payment statistics");
  }
}

/**
 * Updates the status of a specific payment.
 * Requires admin privileges.
 */
export async function updatePaymentStatus(
  paymentId: string,
  newStatus: payment_status
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized access");
    }

    const updateData: any = {
      status: newStatus,
      updated_at: new Date(),
    };

    if (newStatus === "paid") {
      updateData.paid_at = new Date();
    } else if (newStatus === "refunded") {
      updateData.refunded_at = new Date();
    }

    const updatedPayment = await prisma.payments.update({
      where: { id: paymentId },
      data: updateData,
    });

    revalidatePath("/admin/payments");
    return { success: true, payment: updatedPayment };
  } catch (error: any) {
    console.error("Error updating payment status:", error);
    return { success: false, error: error.message || "Failed to update status" };
  }
}
