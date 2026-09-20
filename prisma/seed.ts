import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de datos para DocGuía...");

  // Limpiar base de datos
  await prisma.appointment.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.doctor.deleteMany();

  // 1. Médico General (ejemplo exacto del enunciado: Lunes 08:00-12:00 y 14:00-17:00)
  const doctor1 = await prisma.doctor.create({
    data: {
      name: "Dr. Camilo Arriagada",
      specialty: "Medicina General",
      avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80",
      availabilities: {
        create: [
          // Lunes (1)
          { dayOfWeek: 1, startTime: "08:00", endTime: "12:00" },
          { dayOfWeek: 1, startTime: "14:00", endTime: "17:00" },
          // Miércoles (3)
          { dayOfWeek: 3, startTime: "09:00", endTime: "13:00" },
          // Viernes (5)
          { dayOfWeek: 5, startTime: "08:30", endTime: "12:30" },
        ],
      },
    },
  });

  // 2. Pediatra
  const doctor2 = await prisma.doctor.create({
    data: {
      name: "Dra. Valentina Soto",
      specialty: "Pediatría",
      avatarUrl: "https://images.unsplash.com/photo-1594824813873-633221e35a16?w=200&auto=format&fit=crop&q=80",
      availabilities: {
        create: [
          // Martes (2)
          { dayOfWeek: 2, startTime: "09:00", endTime: "13:00" },
          { dayOfWeek: 2, startTime: "15:00", endTime: "18:00" },
          // Jueves (4)
          { dayOfWeek: 4, startTime: "10:00", endTime: "14:00" },
        ],
      },
    },
  });

  // 3. Cardiólogo
  const doctor3 = await prisma.doctor.create({
    data: {
      name: "Dr. Matías Valenzuela",
      specialty: "Cardiología",
      avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80",
      availabilities: {
        create: [
          // Lunes (1)
          { dayOfWeek: 1, startTime: "10:00", endTime: "14:00" },
          // Jueves (4)
          { dayOfWeek: 4, startTime: "14:00", endTime: "18:00" },
        ],
      },
    },
  });

  // Calcular el próximo lunes para insertar citas de demostración
  const today = new Date();
  const nextMonday = new Date(today);
  const day = today.getDay();
  const diff = (8 - day) % 7 || 7; // Próximo lunes
  nextMonday.setDate(today.getDate() + diff);

  const y = nextMonday.getFullYear();
  const m = nextMonday.getMonth();
  const d = nextMonday.getDate();

  // Citas previas para Dr. Camilo Arriagada el próximo lunes:
  // Cita 1: 08:20 - 08:40
  await prisma.appointment.create({
    data: {
      doctorId: doctor1.id,
      patientName: "Ignacio Morales",
      patientEmail: "ignacio.morales@gmail.com",
      patientPhone: "+56911223344",
      startTime: new Date(Date.UTC(y, m, d, 8, 20, 0)),
      endTime: new Date(Date.UTC(y, m, d, 8, 40, 0)),
      status: "CONFIRMED",
    },
  });

  // Cita 2: 14:20 - 14:40
  await prisma.appointment.create({
    data: {
      doctorId: doctor1.id,
      patientName: "Carolina Fuentes",
      patientEmail: "carolina.f@gmail.com",
      patientPhone: "+56955667788",
      startTime: new Date(Date.UTC(y, m, d, 14, 20, 0)),
      endTime: new Date(Date.UTC(y, m, d, 14, 40, 0)),
      status: "CONFIRMED",
    },
  });

  console.log("✅ Seed completado con éxito:");
  console.log(`- 3 médicos creados.`);
  console.log(`- Disponibilidades configuradas.`);
  console.log(`- 2 citas de demostración sembradas para el próximo lunes (${y}-${m + 1}-${d}).`);
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
