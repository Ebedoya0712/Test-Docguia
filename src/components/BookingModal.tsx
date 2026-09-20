"use client";

import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  CalendarPlus,
} from "lucide-react";
import { TimeSlot } from "@/lib/slots";
import { Doctor } from "./DoctorSelector";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  slot: TimeSlot | null;
  dateStr: string;
  onBookingSuccess: () => void;
}

export function BookingModal({
  isOpen,
  onClose,
  doctor,
  slot,
  dateStr,
  onBookingSuccess,
}: BookingModalProps) {
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConflict, setIsConflict] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(
    null
  );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsConflict(false);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor.id,
          startTime: slot.startTime,
          patientName,
          patientEmail,
          patientPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          // Manejo específico de colisión / condición de carrera
          setIsConflict(true);
          setErrorMessage(
            data.message ||
              "Este horario acaba de ser reservado por otro paciente mientras decidías."
          );
          // Notificar al componente padre para que refresque la lista de slots
          onBookingSuccess();
          return;
        }
        throw new Error(data.error || "Ocurrió un error al reservar");
      }

      // Éxito
      setConfirmedBookingId(data.id);
      setIsConfirmed(true);
      onBookingSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar la reserva";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPatientName("");
    setPatientEmail("");
    setPatientPhone("");
    setErrorMessage(null);
    setIsConflict(false);
    setIsConfirmed(false);
    setConfirmedBookingId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {isConfirmed ? "¡Reserva Confirmada!" : "Completar Reserva"}
            </h3>
            <p className="text-xs text-slate-500">
              {isConfirmed
                ? "Te esperamos en la consulta médica"
                : "Ingresa tus datos para agendar tu cita"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Tarjeta de Resumen de Cita */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100/80 space-y-2.5">
            <div className="flex items-center gap-3">
              {doctor.avatarUrl ? (
                <img
                  src={doctor.avatarUrl}
                  alt={doctor.name}
                  className="w-10 h-10 rounded-full object-cover border border-teal-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-teal-200 text-teal-900 flex items-center justify-center font-bold text-sm">
                  {doctor.name[0]}
                </div>
              )}
              <div>
                <h4 className="font-semibold text-sm text-slate-900">
                  {doctor.name}
                </h4>
                <p className="text-xs text-teal-800 font-medium">
                  {doctor.specialty}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-teal-100 flex flex-wrap gap-y-1 gap-x-4 text-xs text-slate-700">
              <div className="flex items-center gap-1.5 capitalize">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                <span>{formatDate(dateStr)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-700" />
                <span className="font-semibold text-slate-900">
                  {slot.timeLabel} - {slot.endTimeLabel} (20 min)
                </span>
              </div>
            </div>
          </div>

          {/* VISTA DE CONFIRMACIÓN */}
          {isConfirmed ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto ring-8 ring-teal-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-bold text-lg text-slate-900">
                  Cita agendada con éxito
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Hemos enviado los detalles de tu cita a{" "}
                  <span className="font-semibold text-slate-700">
                    {patientEmail}
                  </span>
                </p>
                {confirmedBookingId && (
                  <p className="text-[11px] text-slate-400 mt-2 font-mono">
                    Código de cita: {confirmedBookingId.slice(0, 8).toUpperCase()}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleClose}
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl transition shadow-md shadow-teal-600/20"
                >
                  Entendido / Agendar otra cita
                </button>
              </div>
            </div>
          ) : (
            /* FORMULARIO DE RESERVA */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Alerta de Conflicto / Condición de carrera */}
              {isConflict && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-900 text-xs">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-semibold">Horario no disponible</p>
                    <p className="text-amber-800 leading-relaxed">
                      {errorMessage}
                    </p>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="text-xs font-semibold underline text-amber-950 hover:text-black block"
                    >
                      Cerrar y seleccionar otro horario libre
                    </button>
                  </div>
                </div>
              )}

              {/* Alerta de Error genérico */}
              {errorMessage && !isConflict && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Paciente *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Constanza Silva"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      disabled={isSubmitting || isConflict}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      disabled={isSubmitting || isConflict}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono Móvil (opcional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      disabled={isSubmitting || isConflict}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isConflict}
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] text-white text-sm font-semibold rounded-xl transition shadow-md shadow-teal-600/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirmando cita...</span>
                    </>
                  ) : (
                    <>
                      <CalendarPlus className="w-4 h-4" />
                      <span>Confirmar Reserva</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
