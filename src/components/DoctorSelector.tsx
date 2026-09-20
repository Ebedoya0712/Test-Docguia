import React from "react";
import { UserCheck } from "lucide-react";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatarUrl: string | null;
  availabilities?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

interface DoctorSelectorProps {
  doctors: Doctor[];
  selectedDoctorId: string | null;
  onSelectDoctor: (doctor: Doctor) => void;
  isLoading?: boolean;
}

export function DoctorSelector({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
  isLoading,
}: DoctorSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-64 h-24 bg-white border border-slate-200 rounded-2xl p-3 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Seleccionar Profesional
        </label>
        <span className="text-xs text-purple-700 font-medium">
          {doctors.length} disponibles
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none snap-x">
        {doctors.map((doctor) => {
          const isSelected = doctor.id === selectedDoctorId;
          const workingDays = Array.from(
            new Set(doctor.availabilities?.map((a) => a.dayOfWeek) || [])
          ).sort((a, b) => a - b);

          return (
            <button
              key={doctor.id}
              onClick={() => onSelectDoctor(doctor)}
              className={`flex-shrink-0 w-64 text-left p-3.5 rounded-2xl border transition-all duration-150 snap-start active:scale-[0.98] ${
                isSelected
                  ? "bg-purple-50/80 border-purple-500 shadow-sm shadow-purple-500/10 ring-1 ring-purple-500"
                  : "bg-white border-slate-200 hover:border-purple-200 hover:bg-purple-50/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {doctor.avatarUrl ? (
                    <img
                      src={doctor.avatarUrl}
                      alt={doctor.name}
                      className="w-12 h-12 rounded-full object-cover border border-purple-100 shadow-xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
                      {doctor.name.replace("Dr. ", "").replace("Dra. ", "")[0]}
                    </div>
                  )}
                  {isSelected && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center text-white ring-2 ring-white">
                      <UserCheck className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-slate-900 truncate">
                    {doctor.name}
                  </h3>
                  <p className="text-xs text-purple-700 font-medium truncate">
                    {doctor.specialty}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Atención:{" "}
                    {workingDays.length > 0
                      ? workingDays.map((d) => DAY_NAMES[d]).join(", ")
                      : "Consultar"}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
