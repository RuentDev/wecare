"use client";

import { Calendar } from "lucide-react";
import type { SchedulingService } from "@/lib/types/scheduling";

interface ServiceStepProps {
  services: SchedulingService[];
  selectedServiceId: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

function ServiceCardSkeleton() {
  return (
    <div className="p-6 rounded-[16px] border-2 border-neutral-gray bg-white animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg bg-neutral-light" />
      </div>
      <div className="h-4 w-3/4 bg-neutral-light rounded mb-2" />
      <div className="h-3 w-full bg-neutral-light rounded mb-1" />
      <div className="h-3 w-2/3 bg-neutral-light rounded" />
      <div className="mt-4 pt-4 border-t border-neutral-gray/30 flex justify-between">
        <div className="h-3 w-16 bg-neutral-light rounded" />
        <div className="h-3 w-12 bg-neutral-light rounded" />
      </div>
    </div>
  );
}

export function ServiceStep({
  services,
  selectedServiceId,
  onSelect,
  isLoading = false,
}: ServiceStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-neutral-dark">Select Service</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <ServiceCardSkeleton key={i} />)
        ) : services.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-neutral-gray bg-neutral-light/50 rounded-[16px] border-2 border-dashed border-neutral-gray/30">
            <Calendar className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">No services available at this time</p>
          </div>
        ) : (
          services.map((service) => (
            <button
              key={service.id}
              onClick={() => onSelect(service.id)}
              className={`group p-6 rounded-[16px] border-2 transition-all text-left flex flex-col h-full ${
                selectedServiceId === service.id
                  ? "border-primary bg-blue-50/50 shadow-md ring-1 ring-primary/20"
                  : "border-neutral-gray bg-white hover:border-secondary hover:shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    selectedServiceId === service.id
                      ? "bg-primary text-white"
                      : "bg-neutral-light text-primary group-hover:bg-secondary group-hover:text-white"
                  }`}
                >
                  <Calendar className="w-6 h-6" />
                </div>
                {service.category && (
                  <span className="text-[10px] font-bold text-neutral-gray uppercase tracking-widest bg-neutral-light px-2 py-1 rounded-full">
                    {service.category}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-neutral-dark mb-2 group-hover:text-primary transition-colors">
                {service.name}
              </h4>
              <p className="text-sm text-neutral-gray grow">{service.description}</p>
              <div className="mt-4 pt-4 border-t border-neutral-gray/30 flex justify-between items-center text-xs font-semibold text-neutral-gray uppercase tracking-wider">
                <span>Duration</span>
                <span className="text-neutral-dark">{service.durationMinutes} mins</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
