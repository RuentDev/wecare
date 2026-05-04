
import { prisma } from "../lib/prisma-db";
import { getPatients, getPatientStats } from "../lib/actions/patients";

async function test() {
  console.log("--- Testing Patient Retrieval ---");
  
  // 1. Get a doctor's user ID
  const doctorUser = await prisma.users.findFirst({
    where: { role: "doctor" },
    select: { id: true, first_name: true, last_name: true }
  });

  if (!doctorUser) {
    console.log("No doctor found in database.");
    return;
  }

  console.log(`Testing with Doctor: ${doctorUser.first_name} ${doctorUser.last_name} (${doctorUser.id})`);

  // 2. Test getPatients
  const patients = await getPatients({ doctorId: doctorUser.id });
  console.log(`Patients found: ${patients.length}`);
  if (patients.length > 0) {
    console.log("Sample patient:", patients[0].first_name, patients[0].last_name);
  }

  // 3. Test getPatientStats
  const stats = await getPatientStats({ doctorId: doctorUser.id });
  console.log("Stats:", stats);

  // 4. Test as Admin (no doctorId)
  const allPatients = await getPatients();
  console.log(`Total patients in system: ${allPatients.length}`);
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
