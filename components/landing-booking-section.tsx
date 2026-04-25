'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Shield, CheckCircle } from 'lucide-react';
import { mockDoctors, mockServices, getAvailableSlots, createAppointment } from '@/lib/mock-data';

export function LandingBookingSection() {
  const [step, setStep] = useState<'services' | 'details'>('services');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Patient details
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientReason, setPatientReason] = useState('');

  const availableSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return [];
    return getAvailableSlots(selectedDoctor, selectedDate, 30);
  }, [selectedDoctor, selectedDate]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const today = new Date();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const isDisabled = date < today;
      const isSelected = selectedDate === dateStr;

      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && setSelectedDate(dateStr)}
          disabled={isDisabled}
          className={`h-10 rounded-lg text-sm font-medium transition-colors ${
            isDisabled
              ? 'text-neutral-gray cursor-not-allowed'
              : isSelected
              ? 'bg-primary text-white'
              : 'bg-neutral-light text-neutral-dark hover:bg-secondary hover:text-white'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const doctor = mockDoctors.find(d => d.id === selectedDoctor);
  const service = mockServices.find(s => s.id === selectedService);

  const handleConfirmBooking = () => {
    if (patientName && patientPhone && patientReason && selectedDoctor && selectedService && selectedDate && selectedTime) {
      createAppointment({
        patientId: 'landing-patient',
        doctorId: selectedDoctor,
        serviceId: selectedService,
        date: selectedDate,
        time: selectedTime,
        status: 'scheduled',
        reason: patientReason,
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Reset form
        setStep('services');
        setSelectedDoctor('');
        setSelectedService('');
        setSelectedDate('');
        setSelectedTime('');
        setPatientName('');
        setPatientPhone('');
        setPatientReason('');
      }, 3000);
    }
  };

  if (showSuccess) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-light">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-neutral-dark">Appointment Confirmed!</h2>
            <p className="text-neutral-gray max-w-md">
              Your appointment with {doctor?.name} has been successfully booked for {new Date(selectedDate).toLocaleDateString()} at {selectedTime}.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const isSelectionComplete = selectedDoctor && selectedService && selectedDate && selectedTime;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-neutral-light">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-dark mb-2">Book Your Appointment</h2>
          <p className="text-neutral-gray">Quick and easy scheduling with our healthcare professionals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Services & Calendar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Selection */}
            <Card className="rounded-[12px] p-6 bg-white border border-neutral-gray shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-neutral-dark">Select Service</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {mockServices.map(service => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`p-4 rounded-[12px] border-2 transition-all text-left ${
                      selectedService === service.id
                        ? 'border-primary bg-blue-50'
                        : 'border-neutral-gray bg-white hover:border-secondary'
                    }`}
                  >
                    <p className="font-semibold text-neutral-dark text-sm">{service.name}</p>
                    <p className="text-xs text-neutral-gray mt-1">{service.description}</p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Doctor Selection */}
            <Card className="rounded-[12px] p-6 bg-white border border-neutral-gray shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-neutral-dark">Select Doctor</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockDoctors.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc.id)}
                    className={`p-4 rounded-[12px] border-2 transition-all text-left ${
                      selectedDoctor === doc.id
                        ? 'border-primary bg-blue-50'
                        : 'border-neutral-gray bg-white hover:border-secondary'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{doc.avatar}</div>
                      <div>
                        <p className="font-semibold text-neutral-dark text-sm">{doc.name}</p>
                        <p className="text-xs text-secondary">{doc.specialty}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Date & Time Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Calendar */}
              <Card className="rounded-[12px] p-6 bg-white border border-neutral-gray shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-neutral-dark">Pick Date</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-neutral-dark">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="p-1 hover:bg-neutral-light rounded transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="p-1 hover:bg-neutral-light rounded transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                      <div key={`${day}-${idx}`} className="text-center text-xs font-semibold text-neutral-gray h-8 flex items-center justify-center">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
                </div>
              </Card>

              {/* Time Slots */}
              <Card className="rounded-[12px] p-6 bg-white border border-neutral-gray shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-neutral-dark">Available Slots</h3>
                </div>
                {selectedDate ? (
                  availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {/* All time slots from 9 AM to 5 PM in 45-minute intervals */}
                      {['09:00 AM', '09:45 AM', '10:30 AM', '11:15 AM', '01:00 PM', '02:30 PM', '03:15 PM', '04:00 PM'].map(time => {
                        const isAvailable = availableSlots.includes(time);
                        const isSelected = selectedTime === time;
                        
                        return (
                          <button
                            key={time}
                            onClick={() => isAvailable && setSelectedTime(time)}
                            disabled={!isAvailable}
                            className={`p-3 rounded-[12px] border-2 transition-all text-sm font-medium ${
                              isSelected && isAvailable
                                ? 'border-primary bg-white text-primary border-primary'
                                : isAvailable
                                ? 'border-neutral-gray bg-white text-neutral-dark hover:border-secondary'
                                : 'border-neutral-gray bg-neutral-light text-neutral-gray cursor-not-allowed'
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-neutral-light rounded-[12px] p-4 text-center text-neutral-gray text-sm">
                      No available slots for this date
                    </div>
                  )
                ) : (
                  <div className="bg-neutral-light rounded-[12px] p-4 text-center text-neutral-gray text-sm">
                    Select a date to view available slots
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Right Column: Patient Details */}
          <div>
            <Card className="rounded-[12px] p-6 bg-white border border-neutral-gray shadow-sm sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-neutral-dark">Patient Details</h3>
              </div>

              <div className="space-y-4 mb-6">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-gray uppercase mb-2">Full Name</label>
                  <Input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="John Doe"
                    className="rounded-[12px] border-neutral-gray text-sm"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-gray uppercase mb-2">Phone Number</label>
                  <Input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="rounded-[12px] border-neutral-gray text-sm"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-gray uppercase mb-2">Reason for Visit</label>
                  <textarea
                    value={patientReason}
                    onChange={(e) => setPatientReason(e.target.value)}
                    placeholder="Tell us how we can help..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-[12px] border border-neutral-gray text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                {/* Service Summary */}
                {service && (
                  <div className="border-t border-neutral-gray pt-4">
                    <p className="text-xs text-neutral-gray uppercase font-semibold mb-2">Service Fee</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm font-semibold text-neutral-dark">{service.name}</p>
                        <p className="text-xs text-neutral-gray">{service.duration} minutes</p>
                      </div>
                      <p className="text-lg font-bold text-primary">${service.price}.00</p>
                    </div>
                  </div>
                )}

                {/* Insurance Note */}
                {service && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-[12px]">
                    <Shield className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-neutral-dark">Insurance Coverage</p>
                      <p className="text-neutral-gray">Estimated - Pending</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Button */}
              <Button
                onClick={handleConfirmBooking}
                disabled={!isSelectionComplete || !patientName || !patientPhone || !patientReason}
                className="w-full bg-primary hover:bg-blue-900 text-white font-semibold py-3 rounded-[12px] transition-colors disabled:bg-neutral-gray disabled:cursor-not-allowed"
              >
                Confirm Appointment →
              </Button>

              {/* Trust Badge */}
              <div className="mt-6 pt-6 border-t border-neutral-gray text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-secondary" />
                  <p className="text-xs font-semibold text-secondary">Top-Rated Clinic 2024</p>
                </div>
                <p className="text-xs text-neutral-gray">Accredited by Global Medical Standards</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
