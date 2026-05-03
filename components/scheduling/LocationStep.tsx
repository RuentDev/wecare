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
    <div className="p-6 rounded-[16px] border-2 border-neutral-gray bg-white animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-neutral-light flex-shrink-0" />
        <div className="grow space-y-2">
          <div className="h-4 w-3/4 bg-neutral-light rounded" />
          <div className="h-3 w-full bg-neutral-light rounded" />
          <div className="h-3 w-2/3 bg-neutral-light rounded" />
          <div className="flex gap-2 mt-3">
            <div className="h-3 w-20 bg-neutral-light rounded" />
            <div className="h-3 w-24 bg-neutral-light rounded" />
          </div>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <LocationCardSkeleton key={i} />)
        ) : locations.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-neutral-gray bg-neutral-light/50 rounded-[16px] border-2 border-dashed border-neutral-gray/30">
            <MapPin className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">No clinic locations available</p>
          </div>
        ) : (
          locations.map((location) => (
            <button
              key={location.id}
              onClick={() => onSelect(location.id)}
              className={`group p-6 rounded-[16px] border-2 transition-all text-left flex flex-col h-full ${
                selectedLocationId === location.id
                  ? "border-primary bg-blue-50/50 shadow-md ring-1 ring-primary/20"
                  : "border-neutral-gray bg-white hover:border-secondary hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`p-3 rounded-lg transition-colors flex-shrink-0 ${
                    selectedLocationId === location.id
                      ? "bg-primary text-white"
                      : "bg-neutral-light text-primary group-hover:bg-secondary group-hover:text-white"
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                </div>
                {selectedLocationId === location.id && (
                  <div className="ml-auto">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              <h4 className="font-bold text-neutral-dark text-lg mb-2 group-hover:text-primary transition-colors">
                {location.name}
              </h4>

              <div className="space-y-2 mb-4 grow">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-neutral-gray">{location.address}</div>
                </div>
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-neutral-gray font-medium">{location.city}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-gray/30 flex flex-col gap-2 text-xs">
                {location.phone && (
                  <div className="text-neutral-gray">
                    <span className="font-semibold text-neutral-dark">Phone: </span>
                    {location.phone}
                  </div>
                )}
                {location.email && (
                  <div className="text-neutral-gray">
                    <span className="font-semibold text-neutral-dark">Email: </span>
                    {location.email}
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
