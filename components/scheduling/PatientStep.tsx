"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Phone, ClipboardList, Shield, Info } from "lucide-react";
import { Doctor, Service } from "@/lib/mock-data";

interface PatientStepProps {
  patientName: string;
  patientPhone: string;
  patientReason: string;
  doctor: Doctor | undefined;
  service: Service | undefined;
  selectedDate: string;
  selectedTime: string;
  setPatientName: (val: string) => void;
  setPatientPhone: (val: string) => void;
  setPatientReason: (val: string) => void;
}

export function PatientStep({
  patientName,
  patientPhone,
  patientReason,
  doctor,
  service,
  selectedDate,
  selectedTime,
  setPatientName,
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
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="rounded-xl border-neutral-gray h-12 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-gray uppercase tracking-widest mb-3">
                  <Phone className="w-3.5 h-3.5" />
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 000-0000"
                  className="rounded-xl border-neutral-gray h-12 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-gray uppercase tracking-widest mb-3">
                  <ClipboardList className="w-3.5 h-3.5" />
                  Reason for Visit
                </label>
                <textarea
                  value={patientReason}
                  onChange={(e) => setPatientReason(e.target.value)}
                  placeholder="Please describe your symptoms or reason for the appointment..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-gray text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <Shield className="w-5 h-5 text-primary" />
              <p className="text-xs text-blue-900 leading-relaxed">
                Your data is protected. We use industry-standard encryption to keep your medical information private and secure.
              </p>
            </div>
          </Card>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <Card className="p-6 rounded-[24px] bg-neutral-dark text-white shadow-xl sticky top-6">
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-secondary" />
              Booking Summary
            </h4>

            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-neutral-gray uppercase tracking-widest">Selected Service</p>
                <p className="font-bold text-secondary">{service?.name}</p>
                <p className="text-xs text-neutral-gray">{service?.duration} Minutes • ${service?.price}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-neutral-gray uppercase tracking-widest">Healthcare Provider</p>
                <p className="font-bold">{doctor?.name}</p>
                <p className="text-xs text-neutral-gray">{doctor?.specialty}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-neutral-gray uppercase tracking-widest">Date & Time</p>
                <p className="font-bold">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <p className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded w-fit mt-1">{selectedTime}</p>
              </div>

              <div className="pt-6 border-t border-white/10 mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-gray">Consultation Fee</span>
                  <span className="font-bold">${service?.price}.00</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-secondary">${service?.price}.00</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
