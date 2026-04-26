"use client";

import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { id: 1, name: "Service" },
  { id: 2, name: "Doctor" },
  { id: 3, name: "Availability" },
  { id: 4, name: "Information" },
];

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="mb-12 flex items-center justify-center">
      <div className="flex items-center gap-20 relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-gray -translate-y-1/2 z-0"></div>
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>

        {/* Steps */}
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary text-white"
                    : isActive
                      ? "bg-primary text-white ring-4 ring-blue-100"
                      : "bg-white border-2 border-neutral-gray text-neutral-gray"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span className="font-bold">{step.id}</span>
                )}
              </div>
              <span
                className={`absolute -bottom-7 text-xs font-semibold whitespace-nowrap transition-colors duration-300 ${
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
