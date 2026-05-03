"use client";

import { MapPin, Building2 } from "lucide-react";
import type { SchedulingLocation } from "@/lib/types/scheduling";

interface LocationStepProps {
  locations: SchedulingLocation[];
  selectedLocationId: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

function LocationCardSkeleton() {
  return (
    <div className="p-8 rounded-[20px] border-2 border-neutral-gray bg-white animate-pulse">
      <div className="flex items-start gap-5 mb-6">
        <div className="w-14 h-14 rounded-xl bg-neutral-light flex-shrink-0" />
        <div className="grow space-y-2">
          <div className="h-5 w-3/4 bg-neutral-light rounded" />
          <div className="h-4 w-full bg-neutral-light rounded" />
          <div className="h-4 w-2/3 bg-neutral-light rounded" />
        </div>
      </div>
      <div className="pt-6 border-t border-neutral-gray/30 space-y-2">
        <div className="h-3 w-32 bg-neutral-light rounded" />
        <div className="h-3 w-40 bg-neutral-light rounded" />
      </div>
    </div>
  );
}

export function LocationStep({
  locations,
  selectedLocationId,
  onSelect,
  isLoading = false,
}: LocationStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-neutral-dark">Select Clinic Location</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <LocationCardSkeleton key={i} />)
        ) : locations.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-neutral-gray bg-neutral-light/50 rounded-[24px] border-2 border-dashed border-neutral-gray/30">
            <MapPin className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-base font-medium">No clinic locations available</p>
          </div>
        ) : (
          locations.map((location) => (
            <button
              key={location.id}
              onClick={() => onSelect(location.id)}
              className={`group p-8 rounded-[20px] border-2 transition-all text-left flex flex-col h-full hover:-translate-y-1 ${
                selectedLocationId === location.id
                  ? "border-primary bg-blue-50 shadow-lg ring-2 ring-primary/20"
                  : "border-neutral-gray bg-white hover:border-secondary hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-6 mb-6">
                <div
                  className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                    selectedLocationId === location.id
                      ? "bg-primary text-white scale-110"
                      : "bg-blue-50 text-primary group-hover:bg-teal-50 group-hover:text-secondary"
                  }`}
                >
                  <Building2 className="w-6 h-6" />
                </div>
                {selectedLocationId === location.id && (
                  <div className="ml-auto">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              <h4 className="font-black text-lg text-neutral-dark mb-3 group-hover:text-primary transition-colors">
                {location.name}
              </h4>

              <div className="space-y-3 mb-6 grow">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-neutral-gray">{location.address}</div>
                </div>
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                  <div className="text-sm font-semibold text-neutral-dark">{location.city}</div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-gray/20 flex flex-col gap-2 text-xs space-y-2">
                {location.phone && (
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-neutral-dark">Phone:</span>
                    <span className="text-neutral-gray">{location.phone}</span>
                  </div>
                )}
                {location.email && (
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-neutral-dark">Email:</span>
                    <span className="text-neutral-gray truncate">{location.email}</span>
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
