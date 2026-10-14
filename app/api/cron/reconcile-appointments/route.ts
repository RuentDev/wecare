import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { autoFlagStaleAppointments } from "@/lib/actions/appointments";

export async function GET(request: NextRequest) {
  return handleReconciliation(request);
}

export async function POST(request: NextRequest) {
  return handleReconciliation(request);
}

async function handleReconciliation(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");

    // Allow execution if CRON_SECRET matches or if user is an admin
    let isAuthorized = false;

    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      isAuthorized = true;
    } else {
      const user = await getCurrentUser();
      if (user && user.role === "admin") {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await autoFlagStaleAppointments();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to reconcile appointments" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Reconciled ${result.reconciledCount} overdue appointments and completed ${result.completedCount} attended appointments.`,
      reconciledCount: result.reconciledCount,
      completedCount: result.completedCount,
    });
  } catch (error) {
    console.error("[CRON_RECONCILE_APPOINTMENTS]", error);
    return NextResponse.json(
      { error: "Internal server error during reconciliation" },
      { status: 500 }
    );
  }
}
