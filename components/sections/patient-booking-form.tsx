'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createAppointment, getDoctorById, getServiceById } from '@/lib/mock-data';

interface PatientBookingFormProps {
  bookingData: {
    doctorId: string;
    serviceId: string;
    date: string;
    time: string;
  };
  onSuccess: (appointmentId: string) => void;
}

interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  reasonForVisit: string;
}

export function PatientBookingForm({ bookingData, onSuccess }: PatientBookingFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    email: '',
    phone: '',
    reasonForVisit: '',
  });
  const [errors, setErrors] = useState<Partial<PatientFormData>>({});

  const doctor = getDoctorById(bookingData.doctorId);
  const service = getServiceById(bookingData.serviceId);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Partial<PatientFormData> = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    } else if (currentStep === 2) {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    } else if (currentStep === 3) {
      if (!formData.reasonForVisit.trim()) newErrors.reasonForVisit = 'Reason for visit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => (prev === 3 ? 3 : (prev + 1) as 1 | 2 | 3));
    }
  };

  const handlePreviousStep = () => {
    setStep((prev) => (prev === 1 ? 1 : (prev - 1) as 1 | 2 | 3));
  };

  const handleSubmit = () => {
    if (validateStep(step)) {
      // Create appointment
      const appointment = createAppointment({
        patientId: 'patient1', // In a real app, this would be the logged-in user
        doctorId: bookingData.doctorId,
        serviceId: bookingData.serviceId,
        date: new Date(bookingData.date),
        time: bookingData.time,
        status: 'scheduled',
        reason: formData.reasonForVisit,
      });

      onSuccess(appointment.id);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof PatientFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex gap-2">
        {[1, 2, 3].map(num => (
          <div
            key={num}
            className={`h-2 flex-1 rounded-full transition-colors ${
              num <= step ? 'bg-primary' : 'bg-neutral-gray'
            }`}
          />
        ))}
      </div>

      {/* Booking Summary Card */}
      <Card className="bg-blue-50 border border-blue-200 rounded-[12px] p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-neutral-gray text-xs font-medium">Doctor</p>
            <p className="font-semibold text-neutral-dark">{doctor?.name}</p>
          </div>
          <div>
            <p className="text-neutral-gray text-xs font-medium">Service</p>
            <p className="font-semibold text-neutral-dark">{service?.name}</p>
          </div>
          <div>
            <p className="text-neutral-gray text-xs font-medium">Date & Time</p>
            <p className="font-semibold text-neutral-dark">
              {new Date(bookingData.date).toLocaleDateString()} {bookingData.time}
            </p>
          </div>
          <div>
            <p className="text-neutral-gray text-xs font-medium">Cost</p>
            <p className="font-semibold text-primary">${service?.price}</p>
          </div>
        </div>
      </Card>

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <Card className="rounded-[12px] p-6">
          <h3 className="text-lg font-semibold text-neutral-dark mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">Full Name *</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="rounded-[12px] border-neutral-gray"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">Phone Number *</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="rounded-[12px] border-neutral-gray"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Contact Information */}
      {step === 2 && (
        <Card className="rounded-[12px] p-6">
          <h3 className="text-lg font-semibold text-neutral-dark mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">Email Address *</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                className="rounded-[12px] border-neutral-gray"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Reason for Visit */}
      {step === 3 && (
        <Card className="rounded-[12px] p-6">
          <h3 className="text-lg font-semibold text-neutral-dark mb-4">Reason for Visit</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">Reason for Visit *</label>
              <textarea
                name="reasonForVisit"
                value={formData.reasonForVisit}
                onChange={handleInputChange}
                placeholder="Describe the reason for your visit"
                rows={4}
                className="w-full px-4 py-2 rounded-[12px] border border-neutral-gray focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.reasonForVisit && <p className="text-red-500 text-xs mt-1">{errors.reasonForVisit}</p>}
            </div>
          </div>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 justify-between">
        <Button
          onClick={handlePreviousStep}
          disabled={step === 1}
          variant="outline"
          className="flex-1 rounded-[12px] disabled:opacity-50"
        >
          Back
        </Button>
        {step < 3 ? (
          <Button
            onClick={handleNextStep}
            className="flex-1 bg-primary hover:bg-blue-900 text-white rounded-[12px]"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-secondary hover:bg-teal-700 text-white rounded-[12px]"
          >
            Confirm Booking
          </Button>
        )}
      </div>
    </div>
  );
}
