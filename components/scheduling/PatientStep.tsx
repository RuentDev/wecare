"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Phone, Mail, ClipboardList, Shield, Info } from "lucide-react";
import type { SchedulingDoctor, SchedulingService } from "@/lib/types/scheduling";

interface PatientStepProps {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientReason: string;
  doctor: SchedulingDoctor | undefined;
  service: SchedulingService | undefined;
  selectedDate: Date;
  selectedTime: string;
  setPatientName: (val: string) => void;
  setPatientEmail: (val: string) => void;
  setPatientPhone: (val: string) => void;
  setPatientReason: (val: string) => void;
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function PatientStep({
  patientName,
  patientEmail,
  patientPhone,
  patientReason,
  doctor,
  service,
  selectedDate,
  selectedTime,
  setPatientName,
  setPatientEmail,
  setPatientPhone,
  setPatientReason,
}: PatientStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-neutral-dark">Patient Information</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 rounded-[24px] border-neutral-gray bg-white shadow-sm space-y-6">
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-gray uppercase tracking-widest mb-3">
                  <User className="w-3.5 h-3.5" />
                  Full Name
                </label>
                <Input
                  id="patient-name"
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Juan dela Cruz"
                  className="rounded-xl border-neutral-gray h-12 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-gray uppercase tracking-widest mb-3">
                  <Mail className="w-3.5 h-3.5" />
                  Email Address
                </label>
                <Input
                  id="patient-email"
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="e.g. juan@example.com"
                  className="rounded-xl border-neutral-gray h-12 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-gray uppercase tracking-widest mb-3">
                  <Phone className="w-3.5 h-3.5" />
                  Phone Number
                </label>
                <Input
                  id="patient-phone"
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="e.g. +63 917 123 4567"
                  className="rounded-xl border-neutral-gray h-12 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-gray uppercase tracking-widest mb-3">
                  <ClipboardList className="w-3.5 h-3.5" />
                  Reason for Visit
                </label>
                <textarea
                  id="patient-reason"
                  value={patientReason}
                  onChange={(e) => setPatientReason(e.target.value)}
                  placeholder="Please describe your symptoms or reason for the appointment…"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-gray text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <Shield className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-xs text-blue-900 leading-relaxed">
                Your data is protected. We use industry-standard encryption to keep your
                medical information private and secure.
              </p>
            </div>
          </Card>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 rounded-[24px] text-white shadow-xl sticky top-6">
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-secondary" />
              Booking Summary
            </h4>

            <div className="space-y-6">
              {service && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    Selected Service
                  </p>
                  <p className="font-bold text-secondary">{service.name}</p>
                  <p className="text-xs text-neutral-500">
                    {service.durationMinutes} Minutes • ₱{service.price.toFixed(0)}
                  </p>
                </div>
              )}

              {doctor && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    Healthcare Provider
                  </p>
                  <p className="font-bold text-secondary">{doctor.name}</p>
                  <p className="text-xs text-neutral-500">
                    {doctor.specialization ?? "General Practitioner"}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  Date &amp; Time
                </p>
                <p className="font-bold text-secondary">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {selectedTime && (
                  <p className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded w-fit mt-1">
                    {formatTime(selectedTime)}
                  </p>
                )}
              </div>

              {service && (
                <div className="pt-6 border-t border-white/10 mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-neutral-500">Consultation Fee</span>
                    <span className="font-bold">₱{service.price.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-secondary">₱{service.price.toFixed(0)}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
