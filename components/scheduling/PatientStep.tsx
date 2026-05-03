"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Phone, Mail, ClipboardList, Shield, Info, MapPin, Briefcase, Users, Clock } from "lucide-react";
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-10 rounded-[24px] border-neutral-gray bg-white shadow-md space-y-6">
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
          <Card className="p-8 rounded-[24px] bg-gradient-to-br from-primary to-primary/90 text-white shadow-xl sticky top-6">
            <h4 className="text-xl font-black mb-8 flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-secondary" />
              Booking Summary
            </h4>

            <div className="space-y-8">
              {service && (
                <div className="space-y-2 pb-6 border-b border-white/20">
                  <p className="text-[11px] font-bold text-blue-100 uppercase tracking-widest">
                    <Briefcase className="w-3 h-3 inline mr-1" />
                    Service
                  </p>
                  <p className="font-black text-lg text-white">{service.name}</p>
                  <p className="text-sm text-blue-50">
                    {service.durationMinutes} minutes
                  </p>
                </div>
              )}

              {doctor && (
                <div className="space-y-2 pb-6 border-b border-white/20">
                  <p className="text-[11px] font-bold text-blue-100 uppercase tracking-widest">
                    <Users className="w-3 h-3 inline mr-1" />
                    Doctor
                  </p>
                  <p className="font-black text-lg text-white">{doctor.name}</p>
                  <p className="text-sm text-blue-50">
                    {doctor.specialization ?? "General Practitioner"}
                  </p>
                </div>
              )}

              <div className="space-y-2 pb-6 border-b border-white/20">
                <p className="text-[11px] font-bold text-blue-100 uppercase tracking-widest">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Schedule
                </p>
                <p className="font-black text-lg text-white">
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {selectedTime && (
                  <p className="text-sm font-bold text-secondary bg-white/20 px-3 py-2 rounded-lg w-fit">
                    {formatTime(selectedTime)}
                  </p>
                )}
              </div>

              {service && (
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
                    <span className="text-sm text-blue-100">Consultation Fee</span>
                    <span className="font-bold text-secondary">₱{service.price.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black">Total</span>
                    <span className="text-3xl font-black text-secondary">₱{service.price.toFixed(0)}</span>
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
