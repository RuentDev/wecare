import prisma from "@/lib/prisma-db";

/**
 * Formats date and sequence index into standard appointment number:
 * Format: APT-YYYYMMDD-XXXX (e.g., APT-20261011-0001)
 */
export function formatAppointmentNumber(date: Date, sequence: number): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const seqStr = String(sequence).padStart(4, "0");

  return `APT-${year}${month}${day}-${seqStr}`;
}

/**
 * Generates the next unique appointment number for a given date.
 */
export async function generateUniqueAppointmentNumber(
  customDate?: Date
): Promise<string> {
  const targetDate = customDate || new Date();
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");
  const prefix = `APT-${year}${month}${day}-`;

  // Find latest appointment for this date prefix
  const latestAppointment = await prisma.appointments.findFirst({
    where: {
      appointment_number: {
        startsWith: prefix,
      },
    },
    orderBy: {
      appointment_number: "desc",
    },
    select: {
      appointment_number: true,
    },
  });

  let nextSequence = 1;
  if (latestAppointment?.appointment_number) {
    const parts = latestAppointment.appointment_number.split("-");
    const lastSeq = parseInt(parts[2], 10);
    if (!Number.isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }

  return formatAppointmentNumber(targetDate, nextSequence);
}
