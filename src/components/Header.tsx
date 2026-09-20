import React from "react";
import { CalendarCheck2, Stethoscope } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/30">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                DocGuía
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                Reserva
              </span>
            </div>
            <p className="text-xs text-slate-500">Agendamiento médico simple</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
          <CalendarCheck2 className="w-3.5 h-3.5 text-teal-600" />
          <span>Slots 20 min</span>
        </div>
      </div>
    </header>
  );
}
