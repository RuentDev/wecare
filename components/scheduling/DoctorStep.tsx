"use client";

import { User, Stethoscope, Clock } from "lucide-react";
import type { SchedulingDoctor } from "@/lib/types/scheduling";

interface DoctorStepProps {
  doctors: SchedulingDoctor[];
  selectedDoctorId: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

/** Generates initials from a doctor name for the fallback avatar */
function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function DoctorCardSkeleton() {
  return (
    <div className="p-8 rounded-[20px] border-2 border-neutral-gray bg-white animate-pulse">
      <div className="flex items-start gap-6 mb-6">
        <div className="w-24 h-24 rounded-2xl bg-neutral-light flex-shrink-0" />
        <div className="grow space-y-2">
          <div className="h-5 w-3/4 bg-neutral-light rounded" />
          <div className="h-4 w-1/2 bg-neutral-light rounded" />
          <div className="h-3 w-full bg-neutral-light rounded mt-3" />
          <div className="flex gap-3 mt-4">
            <div className="h-4 w-20 bg-neutral-light rounded" />
            <div className="h-4 w-16 bg-neutral-light rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DoctorStep({
  doctors,
  selectedDoctorId,
  onSelect,
  isLoading = false,
}: DoctorStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4">
        <Stethoscope className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-neutral-dark">Select Doctor</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <DoctorCardSkeleton key={i} />)
        ) : doctors.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-neutral-gray bg-neutral-light/50 rounded-[24px] border-2 border-dashed border-neutral-gray/30">
            <Stethoscope className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-base font-medium">No doctors available at this time</p>
          </div>
        ) : (
          doctors.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onSelect(doc.id)}
              className={`group p-8 rounded-[20px] border-2 transition-all text-left flex flex-col h-full hover:-translate-y-1 ${
                selectedDoctorId === doc.id
                  ? "border-primary bg-blue-50 shadow-lg ring-2 ring-primary/20"
                  : "border-neutral-gray bg-white hover:border-secondary hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-6 mb-6">
                {/* Avatar: real image or initials fallback */}
                <div className="w-24 h-24 rounded-2xl bg-neutral-light flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0 overflow-hidden border-2 border-white">
                  {doc.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={doc.avatarUrl}
                      alt={doc.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-black text-primary">
                      {getInitials(doc.name)}
                    </span>
                  )}
                </div>

                <div className="grow min-w-0 flex flex-col">
                  <h4 className="font-black text-lg text-neutral-dark group-hover:text-primary transition-colors truncate">
                    {doc.name}
                  </h4>
                  <p className="text-sm font-bold text-secondary mb-2">
                    {doc.specialization ?? "General Practitioner"}
                  </p>

                  {doc.bio && (
                    <p className="text-xs text-neutral-gray line-clamp-2 mb-3">{doc.bio}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-auto">
                    {doc.yearsOfExperience !== null && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary bg-blue-100 px-3 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{doc.yearsOfExperience} yrs</span>
                      </div>
                    )}
                    {doc.consultationFee !== null && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-secondary bg-teal-100 px-3 py-1 rounded-full">
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>₱{doc.consultationFee.toFixed(0)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedDoctorId === doc.id && (
                <div className="pt-4 border-t border-primary/20 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-sm font-bold text-primary">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Selected
                  </div>
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
