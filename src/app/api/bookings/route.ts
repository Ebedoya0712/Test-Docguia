import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctorId, startTime, patientName, patientEmail, patientPhone } = body;

    if (!doctorId || !startTime || !patientName || !patientEmail) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (doctorId, startTime, patientName, patientEmail)" },
        { status: 400 }
      );
    }

    const startDate = new Date(startTime);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: "Fecha y hora de inicio no válida" },
        { status: 400 }
      );
    }

    // Calcular hora de término (20 minutos exactos)
    const endDate = new Date(startDate.getTime() + 20 * 60 * 1000);

    // Verificar si el médico existe
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Médico no encontrado" },
        { status: 404 }
      );
    }

    // Crear la cita (La restricción única en la base de datos previene colisiones concurrentes)
    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientName: patientName.trim(),
        patientEmail: patientEmail.trim().toLowerCase(),
        patientPhone: patientPhone ? patientPhone.trim() : null,
        startTime: startDate,
        endTime: endDate,
        status: "CONFIRMED",
      },
      include: {
        doctor: {
          select: {
            name: true,
            specialty: true,
          },
        },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    // Manejo de condición de carrera: Si dos personas eligen el mismo slot simultáneamente
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            error: "CONFLICT",
            message:
              "Lo sentimos, este horario acaba de ser reservado por otro paciente mientras tomabas tu decisión. Por favor selecciona otro slot disponible.",
          },
          { status: 409 }
        );
      }
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error("Error al registrar reserva:", error);
    return NextResponse.json(
      {
        error: "Error interno al procesar la reserva",
        detail: message,
      },
      { status: 500 }
    );
  }
}
