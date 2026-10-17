import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

interface AppointmentSummary {
  id: string;
  appointment_number: string | null;
  appointment_date: Date;
  status: string | null;
  patient_name: string;
  doctor_name: string;
}

interface PreflightAudit {
  targetAppointments: AppointmentSummary[];
  linkedInvoicesCount: number;
  linkedMedicalRecordsCount: number;
  linkedPaymentsCount: number;
  linkedNotificationLogsCount: number;
  linkedChatConversationsCount: number;
  appointmentAuditLogsCount: number;
}

async function main(): Promise<void> {
  // Dynamically import prisma AFTER dotenv has initialized environment variables
  const { prisma } = await import("../lib/prisma-db");

  const args = process.argv.slice(2);
  const isConfirm = args.includes("--confirm");
  const isDryRun = args.includes("--dry-run") || !isConfirm;

  console.log("=================================================");
  console.log("   WeCare Historical Appointments Cleanup Tool   ");
  console.log("=================================================");
  console.log(`Mode: ${isConfirm ? "🚨 LIVE TRANSACTIONAL PURGE" : "🔍 DRY RUN (Preview only)"}\n`);

  // Fetch all appointments
  const allAppointments = await prisma.appointments.findMany({
    select: { id: true },
  });

  const targetIds = allAppointments.map((a) => a.id);

  if (targetIds.length === 0) {
    console.log("✅ Zero appointments found in database. Nothing to clean.");
    await prisma.$disconnect();
    return;
  }

  // Pre-flight audit
  const appointments = await prisma.appointments.findMany({
    where: { id: { in: targetIds } },
    select: {
      id: true,
      appointment_number: true,
      appointment_date: true,
      status: true,
      users: {
        select: {
          first_name: true,
          last_name: true,
        },
      },
      doctors: {
        select: {
          users: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      },
    },
    orderBy: { appointment_date: "asc" },
  });

  const targetAppointments: AppointmentSummary[] = appointments.map((apt) => ({
    id: apt.id,
    appointment_number: apt.appointment_number,
    appointment_date: apt.appointment_date,
    status: apt.status,
    patient_name: apt.users
      ? `${apt.users.first_name} ${apt.users.last_name}`.trim()
      : "Unknown Patient",
    doctor_name: apt.doctors?.users
      ? `${apt.doctors.users.first_name} ${apt.doctors.users.last_name}`.trim()
      : "Unknown Doctor",
  }));

  const linkedInvoicesCount = await prisma.invoices.count({
    where: { appointment_id: { in: targetIds } },
  });

  const linkedMedicalRecordsCount = await prisma.medical_records.count({
    where: { appointment_id: { in: targetIds } },
  });

  const linkedPaymentsCount = await prisma.payments.count({
    where: { appointment_id: { in: targetIds } },
  });

  const linkedNotificationLogsCount = await prisma.notification_logs.count({
    where: { appointment_id: { in: targetIds } },
  });

  const linkedChatConversationsCount = await prisma.chat_conversations.count({
    where: { appointment_id: { in: targetIds } },
  });

  const appointmentAuditLogsCount = await prisma.audit_logs.count({
    where: {
      OR: [
        { table_name: "appointments" },
        { record_id: { in: targetIds } },
      ],
    },
  });

  const audit: PreflightAudit = {
    targetAppointments,
    linkedInvoicesCount,
    linkedMedicalRecordsCount,
    linkedPaymentsCount,
    linkedNotificationLogsCount,
    linkedChatConversationsCount,
    appointmentAuditLogsCount,
  };

  console.log(`Found ${audit.targetAppointments.length} appointment(s) in the database:\n`);
  audit.targetAppointments.forEach((apt, idx) => {
    const formattedDate = apt.appointment_date.toISOString().slice(0, 10);
    console.log(
      `  [${idx + 1}] ${apt.appointment_number ?? apt.id.slice(0, 8)} | Date: ${formattedDate} | Status: ${apt.status} | Patient: ${apt.patient_name} | Doctor: ${apt.doctor_name}`
    );
  });

  console.log("\n--- Relational Impact Audit ---");
  console.log(`- Linked Invoices:             ${audit.linkedInvoicesCount}`);
  console.log(`- Linked Medical Records:      ${audit.linkedMedicalRecordsCount}`);
  console.log(`- Linked Payments:             ${audit.linkedPaymentsCount}`);
  console.log(`- Linked Notification Logs:    ${audit.linkedNotificationLogsCount}`);
  console.log(`- Linked Chat Conversations:   ${audit.linkedChatConversationsCount}`);
  console.log(`- Associated Audit Logs:       ${audit.appointmentAuditLogsCount}\n`);

  if (isDryRun) {
    console.log("-------------------------------------------------");
    console.log("ℹ️  DRY RUN COMPLETE. No data was modified.");
    console.log("To execute the atomic deletion, run:");
    console.log("  npx tsx scripts/clean-appointments.ts --confirm");
    console.log("-------------------------------------------------");
    await prisma.$disconnect();
    return;
  }

  // Live transactional execution
  console.log("⚡ Executing atomic transactional deletion...");

  const result = await prisma.$transaction(async (tx) => {
    // 1. Unlink child invoices if any
    const unlinkedInvoices = await tx.invoices.updateMany({
      where: { appointment_id: { in: targetIds } },
      data: { appointment_id: null },
    });

    // 2. Unlink child medical records if any
    const unlinkedMedicalRecords = await tx.medical_records.updateMany({
      where: { appointment_id: { in: targetIds } },
      data: { appointment_id: null },
    });

    // 3. Unlink child payments if any
    const unlinkedPayments = await tx.payments.updateMany({
      where: { appointment_id: { in: targetIds } },
      data: { appointment_id: null },
    });

    // 4. Delete notification logs linked to appointments
    const deletedNotificationLogs = await tx.notification_logs.deleteMany({
      where: { appointment_id: { in: targetIds } },
    });

    // 5. Unlink or clean chat conversations linked to appointments
    const unlinkedChatConversations = await tx.chat_conversations.updateMany({
      where: { appointment_id: { in: targetIds } },
      data: { appointment_id: null },
    });

    // 6. Delete associated audit logs
    const deletedAuditLogs = await tx.audit_logs.deleteMany({
      where: {
        OR: [
          { table_name: "appointments" },
          { record_id: { in: targetIds } },
        ],
      },
    });

    // 7. Delete all target appointments
    const deletedAppointments = await tx.appointments.deleteMany({
      where: { id: { in: targetIds } },
    });

    return {
      deletedAppointmentsCount: deletedAppointments.count,
      deletedAuditLogsCount: deletedAuditLogs.count,
      deletedNotificationLogsCount: deletedNotificationLogs.count,
      unlinkedInvoicesCount: unlinkedInvoices.count,
      unlinkedMedicalRecordsCount: unlinkedMedicalRecords.count,
      unlinkedPaymentsCount: unlinkedPayments.count,
      unlinkedChatConversationsCount: unlinkedChatConversations.count,
    };
  });

  console.log("✅ TRANSACTION SUCCESSFUL!");
  console.log(`- Deleted Appointments:         ${result.deletedAppointmentsCount}`);
  console.log(`- Deleted Audit Logs:           ${result.deletedAuditLogsCount}`);
  console.log(`- Deleted Notification Logs:    ${result.deletedNotificationLogsCount}`);
  console.log(`- Unlinked Invoices:            ${result.unlinkedInvoicesCount}`);
  console.log(`- Unlinked Medical Records:     ${result.unlinkedMedicalRecordsCount}`);
  console.log(`- Unlinked Payments:            ${result.unlinkedPaymentsCount}`);
  console.log(`- Unlinked Chat Conversations:  ${result.unlinkedChatConversationsCount}`);
  console.log("=================================================");

  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error("❌ Cleanup failed:", error);
  process.exit(1);
});
