export interface AvailabilityBlock {
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  startTime: string; // "HH:mm", ej. "08:00"
  endTime: string;   // "HH:mm", ej. "12:00"
}

export interface ExistingAppointment {
  startTime: Date | string;
  endTime: Date | string;
  status?: string;
}

export interface TimeSlot {
  startTime: string;    // ISO string UTC
  endTime: string;      // ISO string UTC
  timeLabel: string;    // "08:00"
  endTimeLabel: string; // "08:20"
  available: boolean;
}

/**
 * Convierte "HH:mm" a minutos desde las 00:00
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Formatea minutos a "HH:mm"
 */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Genera los slots de una fecha específica dada la disponibilidad del médico y las citas reservadas.
 * Duración por defecto: 20 minutos.
 */
export function generateSlots({
  dateStr,
  availabilities,
  bookedAppointments = [],
  slotDurationMinutes = 20,
}: {
  dateStr: string; // "YYYY-MM-DD"
  availabilities: AvailabilityBlock[];
  bookedAppointments?: ExistingAppointment[];
  slotDurationMinutes?: number;
}): TimeSlot[] {
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error("Formato de fecha inválido. Debe ser YYYY-MM-DD");
  }

  // Obtenemos el día de la semana (0 = domingo, 1 = lunes, etc.)
  const targetDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dayOfWeek = targetDate.getUTCDay();

  // Filtrar bloques del médico para este día de la semana
  const dayBlocks = availabilities.filter((a) => a.dayOfWeek === dayOfWeek);
  if (dayBlocks.length === 0) {
    return [];
  }

  // Filtrar citas activas (no canceladas)
  const activeBookings = bookedAppointments
    .filter((a) => !a.status || a.status === "CONFIRMED")
    .map((a) => ({
      startMs: new Date(a.startTime).getTime(),
      endMs: new Date(a.endTime).getTime(),
    }));

  const slots: TimeSlot[] = [];

  // Ordenar bloques cronológicamente
  const sortedBlocks = [...dayBlocks].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  for (const block of sortedBlocks) {
    const blockStartMins = timeToMinutes(block.startTime);
    const blockEndMins = timeToMinutes(block.endTime);

    for (
      let currentMin = blockStartMins;
      currentMin + slotDurationMinutes <= blockEndMins;
      currentMin += slotDurationMinutes
    ) {
      const slotEndMin = currentMin + slotDurationMinutes;

      const slotStartDate = new Date(
        Date.UTC(
          year,
          month - 1,
          day,
          Math.floor(currentMin / 60),
          currentMin % 60,
          0
        )
      );

      const slotEndDate = new Date(
        Date.UTC(
          year,
          month - 1,
          day,
          Math.floor(slotEndMin / 60),
          slotEndMin % 60,
          0
        )
      );

      const slotStartMs = slotStartDate.getTime();
      const slotEndMs = slotEndDate.getTime();

      // Verificar colisión con citas reservadas:
      // Se solapa si (reserva.inicio < slot.fin) y (reserva.fin > slot.inicio)
      const isBooked = activeBookings.some(
        (b) => b.startMs < slotEndMs && b.endMs > slotStartMs
      );

      slots.push({
        startTime: slotStartDate.toISOString(),
        endTime: slotEndDate.toISOString(),
        timeLabel: minutesToTime(currentMin),
        endTimeLabel: minutesToTime(slotEndMin),
        available: !isBooked,
      });
    }
  }

  return slots;
}

/**
 * Retorna exclusivamente los slots libres
 */
export function getFreeSlots(slots: TimeSlot[]): TimeSlot[] {
  return slots.filter((slot) => slot.available);
}
