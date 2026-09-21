import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        availabilities: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(doctors);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error al obtener médicos:", error);
    return NextResponse.json(
      {
        error: "Error al obtener la lista de médicos",
        detail: message,
      },
      { status: 500 }
    );
  }
}
