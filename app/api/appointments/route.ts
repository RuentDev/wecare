import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPatientDashboardAppointments } from "@/lib/actions/appointments";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointments = await getPatientDashboardAppointments(user.id);
    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("[API_APPOINTMENTS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
