"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { mockDoctors, mockServices, createAppointment } from "@/lib/mock-data";
import { StepIndicator } from "./scheduling/StepIndicator";
import { ServiceStep } from "./scheduling/ServiceStep";
import { DoctorStep } from "./scheduling/DoctorStep";
import { DateTimeStep } from "./scheduling/DateTimeStep";
import { PatientStep } from "./scheduling/PatientStep";

export function Scheduling() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Selection states
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Patient states
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientReason, setPatientReason] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);

  const doctor = mockDoctors.find((d) => d.id === selectedDoctor);
  const service = mockServices.find((s) => s.id === selectedService);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleConfirmBooking = () => {
    if (
      patientName &&
      patientPhone &&
      patientReason &&
      selectedDoctor &&
      selectedService &&
      selectedDate &&
      selectedTime
    ) {
      createAppointment({
        patientId: "landing-patient",
        doctorId: selectedDoctor,
        serviceId: selectedService,
        date: selectedDate,
        time: selectedTime,
        status: "scheduled",
        reason: patientReason,
      });
      setShowSuccess(true);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!selectedService;
      case 2:
        return !!selectedDoctor;
      case 3:
        return !!selectedDate && !!selectedTime;
      case 4:
        return !!patientName && !!patientPhone && !!patientReason;
      default:
        return false;
    }
  };

  if (showSuccess) {
    return (
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-neutral-light min-h-[50vh] flex items-center">
        <div className="max-w-3xl mx-auto w-full">
          <div className="bg-white rounded-[32px] p-12 shadow-xl text-center space-y-8 animate-in zoom-in duration-500">
            <div className="inline-flex bg-green-100 rounded-full p-6 text-green-600 animate-bounce">
              <CheckCircle className="w-16 h-16" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-neutral-dark">
                Appointment Confirmed!
              </h2>
              <p className="text-xl text-neutral-gray max-w-lg mx-auto">
                We've scheduled your visit with{" "}
                <span className="text-primary font-bold">{doctor?.name}</span>{" "}
                for{" "}
                <span className="text-neutral-dark font-bold">
                  {new Date(selectedDate).toLocaleDateString()}
                </span>{" "}
                at{" "}
                <span className="text-neutral-dark font-bold">
                  {selectedTime}
                </span>
                .
              </p>
            </div>
            <div className="pt-8 border-t border-neutral-gray/30 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.reload()}
                className="bg-primary hover:bg-blue-900 text-white font-bold py-4 px-8 rounded-2xl h-auto text-lg transition-all shadow-lg hover:shadow-primary/30"
              >
                Back to Home
              </Button>
              <Button
                variant="outline"
                className="border-2 border-neutral-gray text-neutral-dark font-bold py-4 px-8 rounded-2xl h-auto text-lg hover:bg-neutral-light transition-all"
              >
                Download Receipt
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 px-5 sm:px-6 lg:px-8 bg-neutral-light min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black text-neutral-dark mb-4 tracking-tight">
            Book Your Appointment
          </h2>
          <p className="text-lg text-neutral-gray max-w-2xl mx-auto">
            Experience premium healthcare with our easy scheduling system.
            Follow the steps below to secure your consultation.
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        {/* Form Content */}
        <div className="min-h-[500px]">
          {currentStep === 1 && (
            <ServiceStep
              services={mockServices}
              selectedServiceId={selectedService}
              onSelect={(id) => {
                setSelectedService(id);
                setTimeout(handleNext, 300); // Small delay for visual feedback
              }}
            />
          )}
          {currentStep === 2 && (
            <DoctorStep
              doctors={mockDoctors}
              selectedDoctorId={selectedDoctor}
              onSelect={(id) => {
                setSelectedDoctor(id);
                setTimeout(handleNext, 300);
              }}
            />
          )}
          {currentStep === 3 && (
            <DateTimeStep
              selectedDoctorId={selectedDoctor}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateSelect={setSelectedDate}
              onTimeSelect={setSelectedTime}
            />
          )}
          {currentStep === 4 && (
            <PatientStep
              patientName={patientName}
              patientPhone={patientPhone}
              patientReason={patientReason}
              doctor={doctor}
              service={service}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              setPatientName={setPatientName}
              setPatientPhone={setPatientPhone}
              setPatientReason={setPatientReason}
            />
          )}
        </div>

        {/* Navigation Footer */}
        <div className="mt-16">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[32px] p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500">
            {/* Left: Back Button */}
            <div className="w-full md:w-auto order-2 md:order-1">
              <Button
                onClick={handleBack}
                disabled={currentStep === 1}
                variant="ghost"
                className={`w-full md:w-auto flex items-center justify-center gap-2 text-neutral-gray hover:text-neutral-dark font-bold text-lg h-14 px-8 rounded-2xl transition-all duration-300 ${
                  currentStep === 1
                    ? "opacity-0 pointer-events-none"
                    : "opacity-100"
                }`}
              >
                <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                Previous
              </Button>
            </div>

            {/* Middle: Progress & Trust */}
            <div className="flex flex-col items-center gap-3 order-1 md:order-2">
              <div className="flex items-center gap-3 bg-neutral-light/50 px-4 py-2 rounded-full border border-neutral-gray/10">
                <div className="flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-widest">
                  <Shield className="w-4 h-4" />
                  Secure Booking
                </div>
                <div className="w-1 h-1 bg-neutral-gray/30 rounded-full"></div>
                <p className="text-xs font-bold text-neutral-gray uppercase tracking-widest">
                  Step {currentStep} of {totalSteps}
                </p>
              </div>
              <div className="hidden md:flex gap-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      i + 1 <= currentStep
                        ? "w-6 bg-primary"
                        : "w-2 bg-neutral-gray/20"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right: Next/Confirm Button */}
            <div className="w-full md:w-auto order-3">
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="w-full md:w-auto group bg-primary hover:bg-blue-900 text-white font-black py-4 px-10 rounded-2xl h-14 text-lg transition-all duration-300 shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 disabled:bg-neutral-gray disabled:shadow-none disabled:translate-y-0"
                >
                  Continue
                  <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleConfirmBooking}
                  disabled={!isStepValid()}
                  className="w-full md:w-auto group bg-secondary hover:bg-teal-700 text-white font-black py-4 px-10 rounded-2xl h-14 text-lg transition-all duration-300 shadow-[0_10px_20px_rgba(20,184,166,0.2)] hover:shadow-[0_15px_30px_rgba(20,184,166,0.3)] hover:-translate-y-0.5 disabled:bg-neutral-gray disabled:shadow-none disabled:translate-y-0"
                >
                  Confirm Booking
                  <CheckCircle className="w-5 h-5 ml-2 transition-all group-hover:scale-110" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
