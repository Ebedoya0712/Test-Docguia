"use client";

import React from "react";
import { Calendar, Clock, Stethoscope, User, Sparkles } from "lucide-react";
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
  cancelToken?: string | null;
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
  cancelToken,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/70 backdrop-blur-xs transition-all duration-300">
      <div
        className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-100 text-center space-y-5 relative overflow-hidden"
        style={{
          animation: "swalPop 0.4s cubic-bezier(0.34, 1.4, 0.64, 1) forwards",
        }}
      >
        {/* Glow decorativo de fondo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -left-12 w-40 h-40 rounded-full bg-purple-200/40 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-purple-300/30 blur-2xl"
        />

        {/* ÍCONO ANIMADO ESTILO SWEETALERT (Trazado de círculo y check) */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          {/* Onda de pulso expansiva */}
          <div
            className="absolute inset-0 rounded-full bg-purple-400/20"
            style={{ animation: "swalPulse 1.8s ease-out infinite" }}
          />

          {/* SVG de trazado dinámico */}
          <div className="relative w-20 h-20 rounded-full bg-purple-50/90 shadow-lg shadow-purple-600/20 ring-4 ring-purple-100 flex items-center justify-center">
            <svg
              className="w-14 h-14"
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Círculo guía de fondo */}
              <circle
                cx="26"
                cy="26"
                r="23"
                stroke="#f3e8ff"
                strokeWidth="3.5"
              />
              {/* Círculo que se dibuja animado */}
              <circle
                cx="26"
                cy="26"
                r="23"
                stroke="#7e22ce"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="145"
                strokeDashoffset="145"
                style={{
                  animation: "swalCircle 0.5s ease-out 0.1s forwards",
                }}
              />
              {/* Checkmark que se dibuja de izquierda a derecha */}
              <path
                d="M15 27.5L23 35.5L37 18.5"
                stroke="#7e22ce"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="48"
                strokeDashoffset="48"
                style={{
                  animation: "swalCheck 0.35s ease-out 0.45s forwards",
                }}
              />
            </svg>

            {/* Chispa flotante superior */}
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-purple-700 text-white flex items-center justify-center shadow-md animate-bounce">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* TÍTULO Y MENSAJE CON REVELADO SUAVE */}
        <div
          className="space-y-1.5"
          style={{ animation: "fadeSlideUp 0.4s ease-out 0.25s both" }}
        >
          <h3 className="text-xl sm:text-2xl font-bold text-purple-950 tracking-tight">
            ¡Cita Reservada con Éxito!
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Hola{" "}
            <span className="font-semibold text-purple-900">
              {patientName}
            </span>
            , tu consulta ha sido confirmada en el sistema.
          </p>
        </div>

        {/* TARJETA DE RESUMEN INSTITUCIONAL */}
        <div
          className="bg-purple-50/70 border border-purple-100/90 rounded-2xl p-4 text-left space-y-2.5 shadow-xs"
          style={{ animation: "fadeSlideUp 0.4s ease-out 0.35s both" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-200 text-purple-900 flex items-center justify-center font-bold text-sm shrink-0 border border-purple-300 shadow-xs">
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
              <span className="truncate">Confirmación a {patientEmail}</span>
            </div>
          </div>
        </div>

        {/* CÓDIGO Y BOTÓN SWEETALERT */}
        <div
          className="space-y-3 pt-1"
          style={{ animation: "fadeSlideUp 0.4s ease-out 0.45s both" }}
        >
          {bookingId && (
            <div className="text-[11px] font-mono font-semibold text-purple-700 bg-purple-50 px-3.5 py-1 rounded-full border border-purple-200 inline-block shadow-xs">
              CÓDIGO: {bookingId.slice(0, 8).toUpperCase()}
            </div>
          )}

          {cancelToken && (
            <div className="pt-0.5">
              <a
                href={`/cancelar/${cancelToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-700 hover:text-purple-900 underline font-medium block transition-colors"
              >
                ¿Necesitas cancelar o reprogramar? Haz clic aquí
              </a>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 bg-purple-700 hover:bg-purple-800 active:scale-[0.98] text-white text-sm font-semibold rounded-2xl transition shadow-lg shadow-purple-700/25 cursor-pointer hover:shadow-xl hover:shadow-purple-700/30"
          >
            ¡Excelente, entendido!
          </button>
        </div>
      </div>
    </div>
  );
}
