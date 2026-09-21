"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import {
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  CalendarX2,
} from "lucide-react";

interface AppointmentDetails {
  id: string;
  patientName: string;
  patientEmail: string;
  startTime: string;
  endTime: string;
  status: string;
  doctor: {
    name: string;
    specialty: string;
    avatarUrl: string | null;
  };
}

export default function CancelAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    async function fetchAppointment() {
      if (!token) return;
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/bookings/cancel?token=${token}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Cita no encontrada");
        }
        const data = await res.json();
        setAppointment(data);
        if (data.status === "CANCELLED") {
          setIsCancelled(true);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al cargar la cita");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAppointment();
  }, [token]);

  const handleCancel = async () => {
    if (!token) return;
    try {
      setIsCancelling(true);
      setError(null);
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelToken: token }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo cancelar la cita");
      }
      setIsCancelled(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cancelar");
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-CL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const hours = String(d.getUTCHours()).padStart(2, "0");
    const mins = String(d.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${mins}`;
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-xl sm:max-w-md w-full mx-auto px-4 py-8 space-y-6">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 hover:text-purple-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al agendamiento</span>
        </button>

        {isLoading ? (
          <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-sm text-center space-y-3 animate-pulse">
            <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto" />
            <div className="h-4 w-48 bg-slate-200 rounded mx-auto" />
            <div className="h-3 w-32 bg-slate-200 rounded mx-auto" />
          </div>
        ) : error && !appointment ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-red-200 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto ring-8 ring-red-50/60">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900">
                Enlace no válido o expirado
              </h3>
              <p className="text-xs text-slate-500">{error}</p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-purple-700/20"
            >
              Ir a la página principal
            </button>
          </div>
        ) : isCancelled ? (
          /* CITA CANCELADA */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-50/60">
              <CalendarX2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-lg text-purple-950">
                Cita Cancelada
              </h3>
              <p className="text-xs text-slate-500">
                El horario ha sido liberado exitosamente en el sistema de DocGuía.
              </p>
            </div>

            {appointment && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1 text-slate-600">
                <p>
                  <strong className="text-slate-800">Profesional:</strong>{" "}
                  {appointment.doctor.name}
                </p>
                <p>
                  <strong className="text-slate-800">Paciente:</strong>{" "}
                  {appointment.patientName}
                </p>
                <p>
                  <strong className="text-slate-800">Fecha:</strong>{" "}
                  {formatDate(appointment.startTime)}
                </p>
              </div>
            )}

            <button
              onClick={() => router.push("/")}
              className="w-full py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-purple-700/20 cursor-pointer"
            >
              Reservar un nuevo horario
            </button>
          </div>
        ) : appointment ? (
          /* CONFIRMAR CANCELACIÓN */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-bold text-purple-950">
                Gestión de Cita Médica
              </h2>
              <p className="text-xs text-slate-500">
                Revisa los datos antes de cancelar tu turno de atención.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-200 text-purple-900 flex items-center justify-center font-bold text-sm">
                  {appointment.doctor.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-purple-950">
                    {appointment.doctor.name}
                  </h4>
                  <p className="text-xs text-purple-700 font-medium">
                    {appointment.doctor.specialty}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-200/60 space-y-1 text-xs text-slate-700">
                <div className="flex items-center gap-2 capitalize">
                  <Calendar className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  <span>{formatDate(appointment.startTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  <span className="font-semibold text-purple-950">
                    {formatTime(appointment.startTime)} -{" "}
                    {formatTime(appointment.endTime)} (20 min)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  <span>Paciente: {appointment.patientName}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 active:scale-[0.99] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cancelando cita...</span>
                  </>
                ) : (
                  <span>Confirmar Cancelación</span>
                )}
              </button>

              <button
                onClick={() => router.push("/")}
                disabled={isCancelling}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Mantener mi cita
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
