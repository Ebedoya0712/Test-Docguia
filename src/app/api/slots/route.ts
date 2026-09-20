import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlots } from "@/lib/slots";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    const date = searchParams.get("date"); // "YYYY-MM-DD"

    if (!doctorId || !date) {
      return NextResponse.json(
        { error: "Se requieren los parámetros 'doctorId' y 'date' (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const [year, month, day] = date.split("-").map(Number);
    if (!year || !month || !day) {
      return NextResponse.json(
        { error: "Formato de fecha inválido. Utiliza YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // 1. Obtener médico y sus reglas de disponibilidad
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        availabilities: true,
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Médico no encontrado" },
        { status: 404 }
      );
    }

    // 2. Rango del día en UTC
    const dayStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    // 3. Buscar citas existentes para ese médico en ese día
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        status: "CONFIRMED",
        startTime: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      select: {
        startTime: true,
        endTime: true,
        status: true,
      },
    });

    // 4. Generar slots descontando citas
    const slots = generateSlots({
      dateStr: date,
      availabilities: doctor.availabilities,
      bookedAppointments: appointments,
      slotDurationMinutes: 20,
    });

    return NextResponse.json({
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        avatarUrl: doctor.avatarUrl,
      },
      date,
      slots,
    });
  } catch (error) {
    console.error("Error al calcular slots:", error);
    return NextResponse.json(
      { error: "Error interno al calcular slots" },
      { status: 500 }
    );
  }
}
