import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bookings/cancel?token=... -> Obtener detalles de la cita a cancelar
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token de cancelación requerido" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { cancelToken: token },
      include: {
        doctor: {
          select: {
            name: true,
            specialty: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada o enlace inválido" },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error al consultar cita:", error);
    return NextResponse.json(
      { error: "Error interno al consultar la cita" },
      { status: 500 }
    );
  }
}

// POST /api/bookings/cancel -> Ejecutar la cancelación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cancelToken } = body;

    if (!cancelToken) {
      return NextResponse.json(
        { error: "Token de cancelación requerido" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { cancelToken },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    if (appointment.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Esta cita ya fue cancelada previamente" },
        { status: 400 }
      );
    }

    // Actualizar estado a CANCELLED (lo que libera el slot inmediatamente)
    const updated = await prisma.appointment.update({
      where: { cancelToken },
      data: { status: "CANCELLED" },
      include: {
        doctor: {
          select: {
            name: true,
            specialty: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Cita cancelada con éxito",
      appointment: updated,
    });
  } catch (error) {
    console.error("Error al cancelar cita:", error);
    return NextResponse.json(
      { error: "Error interno al procesar la cancelación" },
      { status: 500 }
    );
  }
}
