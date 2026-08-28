import prisma from "./lib/prisma";
import {
  createPatient,
  getPatient,
  searchPatients,
  updatePatientPhone,
  deletePatient,
} from "./patients";
import {
  createDoctor,
  getDoctor,
  listDoctorsBySpecialty,
  deleteDoctor,
} from "./doctors";
import {
  bookAppointment,
  getAppointmentFull,
  getDoctorUpcomingAppointments,
  setAppointmentStatus,
  cancelAllPatientAppointments,
  deleteAppointment,
} from "./appointments";

async function runTests() {
  console.log("==========================================");
  console.log("   HOSPITAL APPOINTMENT API - TEST SUITE   ");
  console.log("==========================================\n");

  const timestamp = Date.now();

  // 1. Test Doctor CRUD
  console.log("--- 1. Testing Doctor Functions ---");
  const doctor = await createDoctor({
    name: "Dr. Ananya Ray",
    specialty: "Orthopedics",
    email: `ananya.ray.${timestamp}@hospital.io`,
  });
  console.log("✓ createDoctor:", doctor.name, `(${doctor.specialty})`);

  const fetchedDoctor = await getDoctor(doctor.id);
  console.log("✓ getDoctor:", fetchedDoctor.name, `[ID: ${fetchedDoctor.id}]`);

  const orthoDoctors = await listDoctorsBySpecialty("Ortho");
  console.log(`✓ listDoctorsBySpecialty ('Ortho'): found ${orthoDoctors.length} doctor(s)`);

  // 2. Test Patient CRUD
  console.log("\n--- 2. Testing Patient Functions ---");
  const patient = await createPatient({
    name: "Aarav Patel",
    email: `aarav.patel.${timestamp}@example.com`,
    phone: "9876500001",
    dateOfBirth: new Date("1995-08-15"),
  });
  console.log("✓ createPatient:", patient.name, `[ID: ${patient.id}]`);

  const fetchedPatient = await getPatient(patient.id);
  console.log("✓ getPatient:", fetchedPatient.name);

  const updatedPatient = await updatePatientPhone(patient.id, "9998887776");
  console.log("✓ updatePatientPhone:", updatedPatient.phone);

  const searchedPatients = await searchPatients("Aarav");
  console.log(`✓ searchPatients ('Aarav'): found ${searchedPatients.length} patient(s)`);

  // 3. Test Appointment Functions
  console.log("\n--- 3. Testing Appointment Functions ---");
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const appointment1 = await bookAppointment(
    patient.id,
    doctor.id,
    tomorrow,
    "Knee consultation"
  );
  console.log(
    "✓ bookAppointment 1:",
    `ID: ${appointment1.id}, Patient: ${appointment1.patient.name}, Doctor: ${appointment1.doctor.name}`
  );

  const dayAfterTomorrow = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const appointment2 = await bookAppointment(
    patient.id,
    doctor.id,
    dayAfterTomorrow,
    "Follow-up check"
  );
  console.log(
    "✓ bookAppointment 2:",
    `ID: ${appointment2.id}, Patient: ${appointment2.patient.name}, Doctor: ${appointment2.doctor.name}`
  );

  const fullAppointment = await getAppointmentFull(appointment1.id);
  console.log(
    "✓ getAppointmentFull:",
    `Appt #${fullAppointment.id} | Status: ${fullAppointment.status} | Patient: ${fullAppointment.patient.name} | Doctor: ${fullAppointment.doctor.name}`
  );

  const upcomingAppts = await getDoctorUpcomingAppointments(doctor.id);
  console.log(
    `✓ getDoctorUpcomingAppointments (Dr. ${doctor.name}): ${upcomingAppts.length} upcoming`
  );

  const statusUpdated = await setAppointmentStatus(appointment1.id, "completed");
  console.log("✓ setAppointmentStatus:", `Appt #${statusUpdated.id} marked as ${statusUpdated.status}`);

  const cancelledCount = await cancelAllPatientAppointments(patient.id);
  console.log(`✓ cancelAllPatientAppointments: cancelled ${cancelledCount} scheduled appointment(s)`);

  const deletedAppt = await deleteAppointment(appointment1.id);
  console.log("✓ deleteAppointment: deleted Appt #", deletedAppt.id);

  // 4. Cleanup Doctor & Patient
  console.log("\n--- 4. Testing Deletion Cleanup ---");
  const deletedPatient = await deletePatient(patient.id);
  console.log("✓ deletePatient: deleted patient", deletedPatient.name);

  const deletedDoctor = await deleteDoctor(doctor.id);
  console.log("✓ deleteDoctor: deleted doctor", deletedDoctor.name);

  console.log("\n==========================================");
  console.log("   ALL TESTS COMPLETED SUCCESSFULLY! ✓    ");
  console.log("==========================================");
}

runTests()
  .catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
