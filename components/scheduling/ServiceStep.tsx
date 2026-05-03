"use client";

import { Briefcase, Clock, DollarSign } from "lucide-react";
import type { SchedulingService } from "@/lib/types/scheduling";

interface ServiceStepProps {
  services: SchedulingService[];
  selectedServiceId: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

function ServiceCardSkeleton() {
  return (
    <div className="p-8 rounded-[20px] border-2 border-neutral-gray bg-white animate-pulse">
      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 rounded-xl bg-neutral-light" />
        <div className="w-16 h-6 bg-neutral-light rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-neutral-light rounded mb-3" />
      <div className="h-4 w-full bg-neutral-light rounded mb-2" />
      <div className="h-4 w-2/3 bg-neutral-light rounded mb-6" />
      <div className="pt-6 border-t border-neutral-gray/30 flex justify-between gap-4">
        <div className="h-4 w-24 bg-neutral-light rounded" />
        <div className="h-4 w-20 bg-neutral-light rounded" />
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
        <Briefcase className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-neutral-dark">Select Service</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)
        ) : services.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-neutral-gray bg-neutral-light/50 rounded-[24px] border-2 border-dashed border-neutral-gray/30">
            <Briefcase className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-base font-medium">No services available at this time</p>
          </div>
        ) : (
          services.map((service) => (
            <button
              key={service.id}
              onClick={() => onSelect(service.id)}
              className={`group p-8 rounded-[20px] border-2 transition-all text-left flex flex-col h-full hover:-translate-y-1 ${
                selectedServiceId === service.id
                  ? "border-primary bg-blue-50 shadow-lg ring-2 ring-primary/20"
                  : "border-neutral-gray bg-white hover:border-secondary hover:shadow-md"
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`p-3 rounded-xl transition-all ${
                    selectedServiceId === service.id
                      ? "bg-primary text-white scale-110"
                      : "bg-blue-50 text-primary group-hover:bg-teal-50 group-hover:text-secondary"
                  }`}
                >
                  <Briefcase className="w-6 h-6" />
                </div>
                {service.category && (
                  <span className="text-[11px] font-bold text-primary bg-blue-100 px-3 py-1 rounded-full">
                    {service.category}
                  </span>
                )}
              </div>

              <h4 className="font-black text-lg text-neutral-dark mb-2 group-hover:text-primary transition-colors">
                {service.name}
              </h4>

              {service.description && (
                <p className="text-sm text-neutral-gray grow mb-4">{service.description}</p>
              )}

              <div className="pt-6 border-t border-neutral-gray/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-gray uppercase tracking-widest">
                  <Clock className="w-4 h-4" />
                  <span>{service.durationMinutes} mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-secondary" />
                  <span className="font-black text-secondary text-lg">{service.price.toFixed(0)}</span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
