import React from "react";
import { Clock, CalendarX, AlertCircle, RefreshCw } from "lucide-react";
import { TimeSlot } from "@/lib/slots";

interface SlotGridProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  doctorName?: string;
}

export function SlotGrid({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading,
  error,
  onRetry,
  doctorName,
}: SlotGridProps) {
  // 1. Estado de carga (Skeleton UI)
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-14 bg-white border border-slate-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // 2. Estado de error
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-red-900">
            Error al consultar disponibilidad
          </h4>
          <p className="text-xs text-red-700 mt-1 max-w-xs mx-auto">{error}</p>
        </div>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 active:scale-95 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Intentar nuevamente</span>
        </button>
      </div>
    );
  }

  // 3. Estado vacío: El médico no tiene bloques de atención este día
  if (slots.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
          <CalendarX className="w-6 h-6" />
        </div>
        <div className="max-w-xs mx-auto">
          <h4 className="font-semibold text-slate-800 text-sm">
            Sin atención programada
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {doctorName || "El profesional"} no atiende en la fecha
            seleccionada. Por favor selecciona otro día en el calendario.
          </p>
        </div>
      </div>
    );
  }

  const freeCount = slots.filter((s) => s.available).length;

  // Estado vacío secundario: Todos los slots están ocupados
  if (freeCount === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-2">
        <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-5 h-5" />
        </div>
        <h4 className="font-semibold text-sm text-amber-900">
          Cupos agotados para este día
        </h4>
        <p className="text-xs text-amber-700 max-w-xs mx-auto">
          Todos los horarios de 20 minutos ya han sido reservados. Prueba
          seleccionando otro día.
        </p>
      </div>
    );
  }

  // Separar en bloques Mañana (< 13:00) y Tarde (>= 13:00) para mejor usabilidad
  const morningSlots = slots.filter(
    (s) => parseInt(s.timeLabel.split(":")[0], 10) < 13
  );
  const afternoonSlots = slots.filter(
    (s) => parseInt(s.timeLabel.split(":")[0], 10) >= 13
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-teal-600" />
          <h3 className="font-semibold text-sm text-slate-900">
            Horarios Disponibles
          </h3>
        </div>
        <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
          {freeCount} de {slots.length} libres
        </span>
      </div>

      {morningSlots.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Mañana
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {morningSlots.map((slot) => renderSlotButton(slot))}
          </div>
        </div>
      )}

      {afternoonSlots.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Tarde
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {afternoonSlots.map((slot) => renderSlotButton(slot))}
          </div>
        </div>
      )}
    </div>
  );

  function renderSlotButton(slot: TimeSlot) {
    const isSelected = selectedSlot?.startTime === slot.startTime;

    if (!slot.available) {
      return (
        <div
          key={slot.startTime}
          className="min-h-[48px] flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100/70 border border-slate-200/60 text-slate-400 cursor-not-allowed select-none"
        >
          <span className="text-xs font-medium line-through">
            {slot.timeLabel}
          </span>
          <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
            Ocupado
          </span>
        </div>
      );
    }

    return (
      <button
        key={slot.startTime}
        onClick={() => onSelectSlot(slot)}
        className={`min-h-[48px] flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-150 active:scale-95 ${
          isSelected
            ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20 ring-2 ring-teal-600/30"
            : "bg-white border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-slate-800"
        }`}
      >
        <span className="text-sm font-semibold">{slot.timeLabel}</span>
        <span
          className={`text-[10px] ${
            isSelected ? "text-teal-100" : "text-slate-400"
          }`}
        >
          20 min
        </span>
      </button>
    );
  }
}
