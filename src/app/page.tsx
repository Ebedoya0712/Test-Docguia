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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-5 space-y-6">
        {/* Banner de Bienvenida / Contexto */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 rounded-2xl p-4 text-white shadow-sm flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-teal-200 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Reserva Inmediata</span>
            </div>
            <h2 className="text-base font-bold leading-snug">
              Agenda tu consulta médica
            </h2>
            <p className="text-xs text-teal-100/90 leading-relaxed">
              Selecciona profesional y horario. Citas de 20 minutos con
              confirmación al instante.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5 text-teal-100" />
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
        <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <DateSelector
            selectedDate={selectedDate}
            onSelectDate={(d) => setSelectedDate(d)}
          />
        </section>

        {/* 3. Parrilla de Slots */}
        <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
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
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Sistema seguro con protección contra reservas duplicadas</span>
          </div>
          <p className="text-[11px] text-slate-400">
            DocGuía © {new Date().getFullYear()} — Plataforma de Gestión de Citas
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
