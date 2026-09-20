import { describe, it, expect } from "vitest";
import { generateSlots, getFreeSlots, AvailabilityBlock } from "../src/lib/slots";

describe("Lógica de Generación de Slots (DocGuía)", () => {
  const mockAvailabilities: AvailabilityBlock[] = [
    // Lunes (dayOfWeek = 1): 08:00 a 10:00 y 14:00 a 15:00
    { dayOfWeek: 1, startTime: "08:00", endTime: "10:00" },
    { dayOfWeek: 1, startTime: "14:00", endTime: "15:00" },
    // Miércoles (dayOfWeek = 3): 09:00 a 10:00
    { dayOfWeek: 3, startTime: "09:00", endTime: "10:00" },
  ];

  it("1. Genera correctamente los slots de 20 minutos para bloques múltiples en un día", () => {
    // 2026-09-21 es Lunes (dayOfWeek = 1)
    const slots = generateSlots({
      dateStr: "2026-09-21",
      availabilities: mockAvailabilities,
      slotDurationMinutes: 20,
    });

    // Bloque 1: 08:00 a 10:00 = 120 mins / 20 = 6 slots
    // (08:00-08:20, 08:20-08:40, 08:40-09:00, 09:00-09:20, 09:20-09:40, 09:40-10:00)
    // Bloque 2: 14:00 a 15:00 = 60 mins / 20 = 3 slots
    // (14:00-14:20, 14:20-14:40, 14:40-15:00)
    // Total = 9 slots
    expect(slots).toHaveLength(9);
    expect(slots[0].timeLabel).toBe("08:00");
    expect(slots[0].endTimeLabel).toBe("08:20");
    expect(slots[5].timeLabel).toBe("09:40");
    expect(slots[5].endTimeLabel).toBe("10:00");
    expect(slots[6].timeLabel).toBe("14:00");
    expect(slots[8].timeLabel).toBe("14:40");
    expect(slots.every((s) => s.available)).toBe(true);
  });

  it("2. Descuenta correctamente las citas ya reservadas marcándolas como no disponibles", () => {
    // 2026-09-21 (Lunes), reservamos la cita de las 08:20 a 08:40 y de 14:00 a 14:20
    const bookedAppointments = [
      {
        startTime: new Date(Date.UTC(2026, 8, 21, 8, 20, 0)),
        endTime: new Date(Date.UTC(2026, 8, 21, 8, 40, 0)),
        status: "CONFIRMED",
      },
      {
        startTime: new Date(Date.UTC(2026, 8, 21, 14, 0, 0)),
        endTime: new Date(Date.UTC(2026, 8, 21, 14, 20, 0)),
        status: "CONFIRMED",
      },
    ];

    const slots = generateSlots({
      dateStr: "2026-09-21",
      availabilities: mockAvailabilities,
      bookedAppointments,
      slotDurationMinutes: 20,
    });

    const freeSlots = getFreeSlots(slots);

    // De 9 slots totales, 2 están ocupados -> quedan 7 libres
    expect(slots).toHaveLength(9);
    expect(freeSlots).toHaveLength(7);

    // Slot 08:20 debe figurar como no disponible
    const slot0820 = slots.find((s) => s.timeLabel === "08:20");
    expect(slot0820?.available).toBe(false);

    // Slot 08:00 debe figurar como disponible
    const slot0800 = slots.find((s) => s.timeLabel === "08:00");
    expect(slot0800?.available).toBe(true);
  });

  it("3. Retorna lista vacía si el médico no atiende el día seleccionado", () => {
    // 2026-09-20 es Domingo (dayOfWeek = 0), no hay disponibilidad
    const slots = generateSlots({
      dateStr: "2026-09-20",
      availabilities: mockAvailabilities,
    });

    expect(slots).toEqual([]);
    expect(getFreeSlots(slots)).toEqual([]);
  });
});
