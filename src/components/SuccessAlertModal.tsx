"use client";

import React from "react";
import { Check, Calendar, Clock, Stethoscope, User, Sparkles } from "lucide-react";
import { Doctor } from "./DoctorSelector";
import { TimeSlot } from "@/lib/slots";

interface SuccessAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  slot: TimeSlot | null;
  dateStr: string;
  patientName: string;
  patientEmail: string;
  bookingId: string | null;
}

export function SuccessAlertModal({
  isOpen,
  onClose,
  doctor,
  slot,
  dateStr,
  patientName,
  patientEmail,
  bookingId,
}: SuccessAlertModalProps) {
  if (!isOpen || !doctor || !slot) return null;

  const formatDate = (str: string) => {
    const [y, m, d] = str.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("es-CL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-purple-100 text-center space-y-5 animate-in zoom-in-95 duration-250">
        {/* Ícono animado estilo SweetAlert en púrpura DocGuía */}
        <div className="relative mx-auto w-20 h-20">
          <div className="w-20 h-20 rounded-full bg-purple-50 border-4 border-purple-600 flex items-center justify-center text-purple-700 shadow-lg shadow-purple-700/20 ring-8 ring-purple-100/80 animate-in zoom-in-75 duration-300">
            <Check className="w-10 h-10 text-purple-700 stroke-[3.5] animate-in zoom-in-50 duration-300 delay-100" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Título y Mensaje principal */}
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-bold text-purple-950 tracking-tight">
            ¡Cita Reservada con Éxito!
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Hola <span className="font-semibold text-slate-700">{patientName}</span>,
            tu consulta ha sido confirmada en el sistema.
          </p>
        </div>

        {/* Resumen institucional de la Cita */}
        <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 text-left space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-200 text-purple-900 flex items-center justify-center font-bold text-sm shrink-0 border border-purple-300">
              <Stethoscope className="w-5 h-5 text-purple-700" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-purple-950 truncate">
                {doctor.name}
              </h4>
              <p className="text-xs text-purple-700 font-medium">
                {doctor.specialty}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-purple-200/60 space-y-1.5 text-xs text-slate-700">
            <div className="flex items-center gap-2 capitalize">
              <Calendar className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              <span>{formatDate(dateStr)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              <span className="font-semibold text-purple-950">
                {slot.timeLabel} - {slot.endTimeLabel} (20 min)
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate">Notificación enviada a {patientEmail}</span>
            </div>
          </div>
        </div>

        {/* Código identificador de reserva */}
        {bookingId && (
          <div className="text-[11px] font-mono text-purple-600 bg-purple-50/60 px-3 py-1 rounded-full border border-purple-200/60 inline-block">
            CÓDIGO: {bookingId.slice(0, 8).toUpperCase()}
          </div>
        )}

        {/* Botón principal estilo SweetAlert */}
        <div>
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 bg-purple-700 hover:bg-purple-800 active:scale-[0.98] text-white text-sm font-semibold rounded-2xl transition shadow-lg shadow-purple-700/25 cursor-pointer"
          >
            ¡Excelente, entendido!
          </button>
        </div>
      </div>
    </div>
  );
}
