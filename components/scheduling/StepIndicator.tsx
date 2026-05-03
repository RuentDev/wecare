"use client";

import { Check, MapPin, Briefcase, Users, Clock, FileText } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { id: 1, name: "Location", icon: MapPin },
  { id: 2, name: "Service", icon: Briefcase },
  { id: 3, name: "Doctor", icon: Users },
  { id: 4, name: "Availability", icon: Clock },
  { id: 5, name: "Information", icon: FileText },
];

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="mb-12 flex items-center justify-start md:justify-center overflow-x-auto pb-6 scrollbar-hide px-4">
      <div className="flex items-center gap-8 md:gap-12 relative min-w-max">
        {/* Progress Line */}
        <div className="absolute top-[24px] left-[40px] right-[40px] h-1 bg-neutral-gray/30 -translate-y-1/2 z-0">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
        </div>

        {/* Steps */}
        {steps.slice(0, totalSteps).map((step) => {
          const StepIcon = step.icon;
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center min-w-[80px]"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                  isCompleted
                    ? "bg-primary text-white"
                    : isActive
                      ? "bg-primary text-white ring-4 ring-blue-100"
                      : "bg-white border-2 border-neutral-gray text-neutral-gray"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`mt-3 text-xs font-semibold whitespace-nowrap transition-colors duration-300 ${
                  isActive || isCompleted
                    ? "text-neutral-dark"
                    : "text-neutral-gray"
                }`}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
