"use client";
import { Doctor } from "@/lib/mock-data";
import { User, Star } from "lucide-react";

interface DoctorStepProps {
  doctors: Doctor[];
  selectedDoctorId: string;
  onSelect: (id: string) => void;
}

export function DoctorStep({
  doctors,
  selectedDoctorId,
  onSelect,
}: DoctorStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-neutral-dark">Select Doctor</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {doctors.map((doc) => (
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
              <div className="w-16 h-16 rounded-2xl bg-neutral-light flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                {doc.avatar}
              </div>
              <div className="grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-neutral-dark text-lg group-hover:text-primary transition-colors">
                      {doc.name}
                    </h4>
                    <p className="text-sm font-semibold text-secondary">
                      {doc.specialty}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-yellow-700">
                      {doc.rating}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-gray mt-2 line-clamp-2">
                  {doc.bio}
                </p>
                <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-neutral-gray uppercase tracking-widest">
                  <span>{doc.reviewCount} Reviews</span>
                  <span className="w-1 h-1 bg-neutral-gray rounded-full"></span>
                  <span>Available Today</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
