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
    <div className="p-5 rounded-[16px] border-2 border-neutral-gray bg-white animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-neutral-light flex-shrink-0" />
        <div className="grow space-y-2">
          <div className="h-4 w-3/4 bg-neutral-light rounded" />
          <div className="h-3 w-1/2 bg-neutral-light rounded" />
          <div className="h-3 w-full bg-neutral-light rounded mt-2" />
          <div className="h-3 w-2/3 bg-neutral-light rounded" />
          <div className="flex gap-3 mt-3">
            <div className="h-3 w-20 bg-neutral-light rounded" />
            <div className="h-3 w-16 bg-neutral-light rounded" />
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
        <User className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-neutral-dark">Select Doctor</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <DoctorCardSkeleton key={i} />)
        ) : doctors.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-neutral-gray bg-neutral-light/50 rounded-[16px] border-2 border-dashed border-neutral-gray/30">
            <User className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">No doctors available at this time</p>
          </div>
        ) : (
          doctors.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onSelect(doc.id)}
              className={`group p-5 rounded-[16px] border-2 transition-all text-left ${
                selectedDoctorId === doc.id
                  ? "border-primary bg-blue-50/50 shadow-md ring-1 ring-primary/20"
                  : "border-neutral-gray bg-white hover:border-secondary hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar: real image or initials fallback */}
                <div className="w-16 h-16 rounded-2xl bg-neutral-light flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform flex-shrink-0 overflow-hidden">
                  {doc.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={doc.avatarUrl}
                      alt={doc.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-black text-primary">
                      {getInitials(doc.name)}
                    </span>
                  )}
                </div>

                <div className="grow min-w-0">
                  <h4 className="font-bold text-neutral-dark text-lg group-hover:text-primary transition-colors truncate">
                    {doc.name}
                  </h4>
                  <p className="text-sm font-semibold text-secondary">
                    {doc.specialization ?? "General Practitioner"}
                  </p>

                  {doc.bio && (
                    <p className="text-xs text-neutral-gray mt-2 line-clamp-2">{doc.bio}</p>
                  )}

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {doc.yearsOfExperience !== null && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-gray uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        <span>{doc.yearsOfExperience} yrs exp</span>
                      </div>
                    )}
                    {doc.consultationFee !== null && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-secondary uppercase tracking-widest">
                        <Stethoscope className="w-3 h-3" />
                        <span>₱{doc.consultationFee.toFixed(0)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
