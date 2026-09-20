"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { DoctorSelector, Doctor } from "@/components/DoctorSelector";
import { DateSelector } from "@/components/DateSelector";
import { SlotGrid } from "@/components/SlotGrid";
import { BookingModal } from "@/components/BookingModal";
import { TimeSlot } from "@/lib/slots";
import { Stethoscope, ShieldCheck, Sparkles } from "lucide-react";

export default function BookingPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Fecha por defecto: hoy en formato YYYY-MM-DD
  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar médicos
  useEffect(() => {
    async function fetchDoctors() {
      try {
        setIsLoadingDoctors(true);
        const res = await fetch("/api/doctors");
        if (!res.ok) throw new Error("Error al obtener profesionales");
        const data = await res.json();
        setDoctors(data);
        if (data.length > 0) {
          setSelectedDoctor(data[0]);
        }
      } catch (err: unknown) {
        console.error("Error:", err);
      } finally {
        setIsLoadingDoctors(false);
      }
    }
    fetchDoctors();
  }, []);

  // Cargar slots cuando cambie doctor o fecha
  const fetchSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) return;

    try {
      setIsLoadingSlots(true);
      setSlotsError(null);
      setSelectedSlot(null);

      const res = await fetch(
        `/api/slots?doctorId=${selectedDoctor.id}&date=${selectedDate}`
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al cargar disponibilidad");
      }

      const data = await res.json();
      setSlots(data.slots || []);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al consultar slots";
      setSlotsError(msg);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-5 space-y-5">
        {/* Banner DocGuía */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-purple-800 to-purple-950 rounded-3xl p-5 text-white shadow-lg shadow-purple-900/15">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -bottom-10 h-44 w-44 rounded-full bg-purple-500/20 blur-2xl"
          />
          <div className="relative space-y-1.5">
            <div className="flex items-center gap-1.5 text-purple-200 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Agenda Médica Online</span>
            </div>
            <h2 className="text-lg font-bold leading-snug tracking-tight">
              Reserva tu consulta médica
            </h2>
            <p className="text-xs text-purple-100/80 leading-relaxed max-w-sm">
              Selecciona profesional y horario. Citas de 20 minutos con
              confirmación al instante.
            </p>
          </div>
        </div>

        {/* 1. Selector de Médico */}
        <section>
          <DoctorSelector
            doctors={doctors}
            selectedDoctorId={selectedDoctor?.id || null}
            onSelectDoctor={(doc) => setSelectedDoctor(doc)}
            isLoading={isLoadingDoctors}
          />
        </section>

        {/* 2. Selector de Fecha */}
        <section className="bg-white p-4 rounded-2xl border border-purple-100/80 shadow-xs">
          <DateSelector
            selectedDate={selectedDate}
            onSelectDate={(d) => setSelectedDate(d)}
          />
        </section>

        {/* 3. Parrilla de Slots */}
        <section className="bg-white p-4 rounded-2xl border border-purple-100/80 shadow-xs">
          <SlotGrid
            slots={slots}
            selectedSlot={selectedSlot}
            onSelectSlot={handleSelectSlot}
            isLoading={isLoadingSlots}
            error={slotsError}
            onRetry={fetchSlots}
            doctorName={selectedDoctor?.name}
          />
        </section>

        {/* Garantías / Trust footer */}
        <footer className="pt-2 pb-6 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-purple-900/80 font-medium bg-purple-50/80 border border-purple-200/60 px-3 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Sistema seguro con protección contra reservas duplicadas</span>
          </div>
          <p className="text-[11px] text-slate-400">
            DocGuía © {new Date().getFullYear()} — Plataforma de Gestión Médica
          </p>
        </footer>
      </main>

      {/* Modal de Reserva y Confirmación */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        doctor={selectedDoctor}
        slot={selectedSlot}
        dateStr={selectedDate}
        onBookingSuccess={() => {
          fetchSlots();
        }}
      />
    </div>
  );
}
