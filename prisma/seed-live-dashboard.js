const { Pool, neonConfig } = require("@neondatabase/serverless");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { PrismaClient } = require("../lib/generated/prisma");
const ws = require("ws");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting Live Clinic Dashboard Seeding...");

  // 1. Ensure Clinic Locations
  const loc1 = await prisma.locations.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: { name: "Main Clinic - Room 101" },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Main Clinic - Room 101",
      address: "123 Healthcare Ave",
      city: "Olongapo",
      state: "Zambales",
      postal_code: "2200",
      country: "Philippines",
      phone: "+63 912 345 6789",
    },
  });

  const loc2 = await prisma.locations.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: { name: "Pediatrics Wing - Room 204" },
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      name: "Pediatrics Wing - Room 204",
      address: "123 Healthcare Ave",
      city: "Olongapo",
      state: "Zambales",
      postal_code: "2200",
      country: "Philippines",
      phone: "+63 912 345 6789",
    },
  });

  // 2. Ensure Services
  const s1 = await prisma.services.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: { name: "General Health Consultation", price: 650 },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "General Health Consultation",
      description: "Standard comprehensive wellness and health checkup",
      duration_minutes: 30,
      price: 650,
      is_active: true,
    },
  });

  const s2 = await prisma.services.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: { name: "Pediatric Wellness Exam", price: 850 },
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      name: "Pediatric Wellness Exam",
      description: "Infant and adolescent growth, vitals and health consultation",
      duration_minutes: 45,
      price: 850,
      is_active: true,
    },
  });

  const s3 = await prisma.services.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: { name: "Cardiology Screening & ECG", price: 1500 },
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      name: "Cardiology Screening & ECG",
      description: "Cardiovascular examination with live telemetry review",
      duration_minutes: 45,
      price: 1500,
      is_active: true,
    },
  });

  // 3. Ensure Staff Accounts
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const nurseUser = await prisma.users.upsert({
    where: { email: "nurse.clara@wecare.com" },
    update: { is_active: true, last_login_at: now },
    create: {
      email: "nurse.clara@wecare.com",
      password_hash: "$2a$12$eX8m6cQw4Uv2pP7L8W9zQe3rTyUuI1oPaSdFgHjKlZxCvBnMqWeRt",
      first_name: "Clara",
      last_name: "Morales",
      role: "nurse",
      is_active: true,
      last_login_at: now,
    },
  });

  const staffUser = await prisma.users.upsert({
    where: { email: "reception.mark@wecare.com" },
    update: { is_active: true, last_login_at: now },
    create: {
      email: "reception.mark@wecare.com",
      password_hash: "$2a$12$eX8m6cQw4Uv2pP7L8W9zQe3rTyUuI1oPaSdFgHjKlZxCvBnMqWeRt",
      first_name: "Mark",
      last_name: "Lopez",
      role: "staff",
      is_active: true,
      last_login_at: now,
    },
  });

  // Doctor Users
  const drJane = await prisma.users.upsert({
    where: { email: "janedoe@wecare.com" },
    update: { is_active: true, last_login_at: now },
    create: {
      email: "janedoe@wecare.com",
      password_hash: "$2a$12$eX8m6cQw4Uv2pP7L8W9zQe3rTyUuI1oPaSdFgHjKlZxCvBnMqWeRt",
      first_name: "Jane",
      last_name: "Doe",
      role: "doctor",
      is_active: true,
      last_login_at: now,
    },
  });

  const drCassadra = await prisma.users.upsert({
    where: { email: "cassadraforeman@wecare.com" },
    update: { is_active: true, last_login_at: now },
    create: {
      email: "cassadraforeman@wecare.com",
      password_hash: "$2a$12$eX8m6cQw4Uv2pP7L8W9zQe3rTyUuI1oPaSdFgHjKlZxCvBnMqWeRt",
      first_name: "Cassadra",
      last_name: "Foreman",
      role: "doctor",
      is_active: true,
      last_login_at: now,
    },
  });

  const drMichael = await prisma.users.upsert({
    where: { email: "michaelsmith@wecare.com" },
    update: { is_active: true },
    create: {
      email: "michaelsmith@wecare.com",
      password_hash: "$2a$12$eX8m6cQw4Uv2pP7L8W9zQe3rTyUuI1oPaSdFgHjKlZxCvBnMqWeRt",
      first_name: "Michael",
      last_name: "Smith",
      role: "doctor",
      is_active: true,
    },
  });

  // Admin User
  const adminUser = await prisma.users.findUnique({
    where: { email: "ruent.dev@gmail.com" },
  });

  // 4. Update Doctors Shift & Door Availability Status
  const doctorJaneRec = await prisma.doctors.upsert({
    where: { user_id: drJane.id },
    update: {
      is_on_shift: true,
      is_available: true,
      specialization: "IM",
      location_id: loc1.id,
    },
    create: {
      user_id: drJane.id,
      is_on_shift: true,
      is_available: true,
      specialization: "IM",
      location_id: loc1.id,
      consultation_fee: 650,
      bio: "Internal Medicine Specialist with 10+ years experience in chronic care.",
    },
  });

  const doctorCassadraRec = await prisma.doctors.upsert({
    where: { user_id: drCassadra.id },
    update: {
      is_on_shift: true,
      is_available: false, // ON BREAK
      specialization: "Pedia",
      location_id: loc2.id,
    },
    create: {
      user_id: drCassadra.id,
      is_on_shift: true,
      is_available: false,
      specialization: "Pedia",
      location_id: loc2.id,
      consultation_fee: 850,
      bio: "Board-certified pediatrician specializing in adolescent healthcare.",
    },
  });

  const doctorMichaelRec = await prisma.doctors.upsert({
    where: { user_id: drMichael.id },
    update: {
      is_on_shift: false, // FINISHED FOR THE DAY
      is_available: true,
      specialization: "Surgery",
      location_id: loc1.id,
    },
    create: {
      user_id: drMichael.id,
      is_on_shift: false,
      is_available: true,
      specialization: "Surgery",
      location_id: loc1.id,
      consultation_fee: 1500,
      bio: "Consultant surgeon offering pre-operative and follow-up consultations.",
    },
  });

  // 5. Active User Sessions (Online Staff)
  await prisma.sessions.deleteMany({
    where: {
      user_id: { in: [nurseUser.id, staffUser.id, drJane.id] },
    },
  });

  // Add session for Nurse Clara
  await prisma.sessions.create({
    data: {
      user_id: nurseUser.id,
      token: "session_token_nurse_clara_" + Math.random().toString(36).substring(2),
      expires_at: expiresAt,
      ip_address: "192.168.1.45",
      user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Mobile",
    },
  });

  // Add session for Receptionist Mark
  await prisma.sessions.create({
    data: {
      user_id: staffUser.id,
      token: "session_token_reception_mark_" + Math.random().toString(36).substring(2),
      expires_at: expiresAt,
      ip_address: "192.168.1.18",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
    },
  });

  // Add session for Dr. Jane Doe
  await prisma.sessions.create({
    data: {
      user_id: drJane.id,
      token: "session_token_dr_jane_" + Math.random().toString(36).substring(2),
      expires_at: expiresAt,
      ip_address: "192.168.1.33",
      user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1",
    },
  });

  // Update Admin session to unexpired if needed
  if (adminUser) {
    const existingAdminSession = await prisma.sessions.findFirst({
      where: { user_id: adminUser.id },
      orderBy: { expires_at: "desc" },
    });
    if (existingAdminSession) {
      await prisma.sessions.update({
        where: { id: existingAdminSession.id },
        data: { expires_at: expiresAt, ip_address: "192.168.1.10", user_agent: "Windows Desktop" },
      });
    }
  }

  // 6. Realistic Patient Users
  const patientData = [
    { email: "maria.santos@gmail.com", first_name: "Maria", last_name: "Santos", phone: "+63 917 111 2233" },
    { email: "juan.delacruz@gmail.com", first_name: "Juan", last_name: "Dela Cruz", phone: "+63 918 222 3344" },
    { email: "ana.reyes@gmail.com", first_name: "Ana", last_name: "Reyes", phone: "+63 919 333 4455" },
    { email: "robert.tan@gmail.com", first_name: "Robert", last_name: "Tan", phone: "+63 920 444 5566" },
    { email: "elena.gomez@gmail.com", first_name: "Elena", last_name: "Gomez", phone: "+63 921 555 6677" },
  ];

  const patients = [];
  for (const p of patientData) {
    const user = await prisma.users.upsert({
      where: { email: p.email },
      update: { role: "patient" },
      create: {
        email: p.email,
        password_hash: "$2a$12$eX8m6cQw4Uv2pP7L8W9zQe3rTyUuI1oPaSdFgHjKlZxCvBnMqWeRt",
        first_name: p.first_name,
        last_name: p.last_name,
        phone: p.phone,
        role: "patient",
        is_active: true,
      },
    });
    patients.push(user);
  }

  // 7. Today's Appointments with Realistic, Non-overlapping Patient Queue Stages
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Delete all today's appointments before re-seeding to guarantee clean state
  await prisma.appointments.deleteMany({
    where: {
      appointment_date: todayDate,
    },
  });

  // Time Slot Helpers: ongoing right now
  const curHours = now.getHours();
  const curMinutes = now.getMinutes();

  const makeTime = (h, m) => {
    const d = new Date(todayDate);
    d.setHours(h, m, 0, 0);
    return d;
  };

  // Appointment 1: Maria Santos -> IN CONSULTATION (Slot covers current time)
  await prisma.appointments.create({
    data: {
      patient_id: patients[0].id, // Maria Santos
      doctor_id: doctorJaneRec.id,
      service_id: s1.id,
      location_id: loc1.id,
      appointment_date: todayDate,
      start_time: makeTime(curHours, 0),
      end_time: makeTime(curHours, 45),
      status: "checked_in",
      notes: "Routine health checkup and blood pressure management.",
    },
  });

  // Appointment 2: Ana Reyes -> WAITING in lobby (Scheduled next slot)
  await prisma.appointments.create({
    data: {
      patient_id: patients[2].id, // Ana Reyes
      doctor_id: doctorJaneRec.id,
      service_id: s1.id,
      location_id: loc1.id,
      appointment_date: todayDate,
      start_time: makeTime(curHours + 1, 0),
      end_time: makeTime(curHours + 1, 30),
      status: "checked_in",
      notes: "Prescription refill and lab results interpretation.",
    },
  });

  // Appointment 3: Robert Tan -> WAITING in lobby (Pediatrics)
  await prisma.appointments.create({
    data: {
      patient_id: patients[3].id, // Robert Tan
      doctor_id: doctorCassadraRec.id,
      service_id: s2.id,
      location_id: loc2.id,
      appointment_date: todayDate,
      start_time: makeTime(curHours + 1, 30),
      end_time: makeTime(curHours + 2, 15),
      status: "checked_in",
      notes: "Annual immunization and pediatric growth evaluation.",
    },
  });

  // Appointment 4: Elena Gomez -> WAITING in lobby (General Consultation)
  await prisma.appointments.create({
    data: {
      patient_id: patients[4].id, // Elena Gomez
      doctor_id: doctorMichaelRec.id,
      service_id: s1.id,
      location_id: loc1.id,
      appointment_date: todayDate,
      start_time: makeTime(curHours + 2, 0),
      end_time: makeTime(curHours + 2, 30),
      status: "checked_in",
      notes: "Pre-employment physical consultation.",
    },
  });

  // Appointment 5: Juan Dela Cruz -> CHECKED OUT (Completed earlier today)
  await prisma.appointments.create({
    data: {
      patient_id: patients[1].id, // Juan Dela Cruz
      doctor_id: doctorCassadraRec.id,
      service_id: s2.id,
      location_id: loc2.id,
      appointment_date: todayDate,
      start_time: makeTime(9, 0),
      end_time: makeTime(9, 45),
      status: "completed",
      notes: "Pediatric follow-up completed successfully.",
    },
  });

  // Appointment 6: Kimbely Alba -> CHECKED OUT (Completed earlier today)
  const existingPatient = await prisma.users.findUnique({
    where: { email: "kimbiealba21@gmail.com" },
  });

  if (existingPatient) {
    await prisma.appointments.create({
      data: {
        patient_id: existingPatient.id, // Kimbely Alba
        doctor_id: doctorJaneRec.id,
        service_id: s3.id,
        location_id: loc1.id,
        appointment_date: todayDate,
        start_time: makeTime(10, 0),
        end_time: makeTime(10, 45),
        status: "completed",
        notes: "Morning ECG and cardiovascular review completed.",
      },
    });
  }

  // Appointment 9 & 10: Pending approval
  await prisma.appointments.create({
    data: {
      patient_id: patients[3].id,
      doctor_id: doctorJaneRec.id,
      service_id: s1.id,
      location_id: loc1.id,
      appointment_date: new Date(todayDate.getTime() + 24 * 60 * 60 * 1000),
      start_time: makeTime(14, 0),
      end_time: makeTime(14, 30),
      status: "pending",
      notes: "Online booking waiting for reception confirmation.",
    },
  });

  await prisma.appointments.create({
    data: {
      patient_id: patients[4].id,
      doctor_id: doctorCassadraRec.id,
      service_id: s2.id,
      location_id: loc2.id,
      appointment_date: new Date(todayDate.getTime() + 48 * 60 * 60 * 1000),
      start_time: makeTime(15, 0),
      end_time: makeTime(15, 45),
      status: "pending",
      notes: "Pediatric wellness request.",
    },
  });

  // 8. Paid Payments & Invoices (Monthly Revenue)
  await prisma.payments.create({
    data: {
      patient_id: patients[0].id,
      amount: 4500,
      currency: "PHP",
      status: "paid",
      payment_method: "Credit Card",
      paid_at: now,
    },
  });

  await prisma.payments.create({
    data: {
      patient_id: patients[1].id,
      amount: 12500,
      currency: "PHP",
      status: "paid",
      payment_method: "GCash",
      paid_at: now,
    },
  });

  await prisma.payments.create({
    data: {
      patient_id: patients[2].id,
      amount: 18500,
      currency: "PHP",
      status: "paid",
      payment_method: "Cash",
      paid_at: now,
    },
  });

  await prisma.invoices.create({
    data: {
      patient_id: patients[3].id,
      amount: 10000,
      invoice_number: "INV-" + Date.now().toString().slice(-6),
      status: "PAID",
      total: 10000,
      due_date: now,
    },
  });

  // Sync RBAC roles for all users in the system
  const allRoles = await prisma.roles.findMany();
  const roleMap = new Map(allRoles.map((r) => [r.name.toLowerCase(), r.id]));
  const allUsers = await prisma.users.findMany({ select: { id: true, role: true } });
  for (const u of allUsers) {
    if (u.role && roleMap.has(u.role.toLowerCase())) {
      const roleId = roleMap.get(u.role.toLowerCase());
      await prisma.user_roles.upsert({
        where: { user_id_role_id: { user_id: u.id, role_id: roleId } },
        update: {},
        create: { user_id: u.id, role_id: roleId },
      });
    }
  }

  console.log("✅ Live clinic database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
