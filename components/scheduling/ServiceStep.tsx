"use client";

import { Service } from "@/lib/mock-data";
import { Calendar } from "lucide-react";

interface ServiceStepProps {
  services: Service[];
  selectedServiceId: string;
  onSelect: (id: string) => void;
}

export function ServiceStep({
  services,
  selectedServiceId,
  onSelect,
}: ServiceStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-neutral-dark">Select Service</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
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
              <p className="text-lg font-bold text-primary">${service.price}</p>
            </div>
            <h4 className="font-bold text-neutral-dark mb-2 group-hover:text-primary transition-colors">
              {service.name}
            </h4>
            <p className="text-sm text-neutral-gray grow">
              {service.description}
            </p>
            <div className="mt-4 pt-4 border-t border-neutral-gray/30 flex justify-between items-center text-xs font-semibold text-neutral-gray uppercase tracking-wider">
              <span>Duration</span>
              <span className="text-neutral-dark">{service.duration} mins</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
