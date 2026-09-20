import React from "react";
import { Calendar } from "lucide-react";

interface DateSelectorProps {
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (date: string) => void;
}

function formatDateToLocal(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function DateSelector({
  selectedDate,
  onSelectDate,
}: DateSelectorProps) {
  const today = new Date();
  const formatYMD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatYMD(today);

  // Generar los próximos 6 días para accesos rápidos móviles
  const quickDays = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const ymd = formatYMD(d);
    return {
      ymd,
      dayName:
        i === 0
          ? "Hoy"
          : i === 1
          ? "Mañana"
          : d.toLocaleDateString("es-CL", { weekday: "short" }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString("es-CL", { month: "short" }),
    };
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Seleccionar Fecha
        </label>
        <div className="relative flex items-center">
          <label
            htmlFor="native-date-picker"
            className="flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100/80 px-2.5 py-1 rounded-lg cursor-pointer transition border border-purple-200/70"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Ver calendario</span>
          </label>
          <input
            id="native-date-picker"
            type="date"
            min={todayStr}
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) onSelectDate(e.target.value);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
          />
        </div>
      </div>

      {/* Selector rápido de días (Horizontal scroll optimizado para móviles) */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none snap-x">
        {quickDays.map((qd) => {
          const isSelected = qd.ymd === selectedDate;
          return (
            <button
              key={qd.ymd}
              onClick={() => onSelectDate(qd.ymd)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-16 py-2.5 rounded-xl border transition-all active:scale-95 snap-start ${
                isSelected
                  ? "bg-purple-700 border-purple-700 text-white shadow-sm shadow-purple-700/20"
                  : "bg-white border-slate-200 text-slate-700 hover:border-purple-200 hover:bg-purple-50/30"
              }`}
            >
              <span
                className={`text-[11px] uppercase font-semibold tracking-wider ${
                  isSelected ? "text-purple-200" : "text-slate-400"
                }`}
              >
                {qd.dayName}
              </span>
              <span className="text-lg font-bold leading-tight my-0.5">
                {qd.dayNumber}
              </span>
              <span
                className={`text-[10px] capitalize ${
                  isSelected ? "text-purple-200" : "text-slate-400"
                }`}
              >
                {qd.monthName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fecha seleccionada formateada */}
      <div className="text-xs text-slate-500 font-medium capitalize flex items-center gap-1 pt-0.5">
        <span>Fecha elegida:</span>
        <span className="text-purple-950 font-semibold">
          {formatDateToLocal(selectedDate)}
        </span>
      </div>
    </div>
  );
}
