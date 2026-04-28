'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mockDoctors, mockServices, getAvailableSlots } from '@/lib/mock-data';

interface BookingWidgetProps {
  onBookingStart: (data: { doctorId: string; serviceId: string; date: string; time: string }) => void;
}

export function BookingWidget({ onBookingStart }: BookingWidgetProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const availableSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return [];
    return getAvailableSlots(selectedDoctor, new Date(selectedDate), 30);
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

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of month
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

  const handleNextStep = () => {
    if (selectedDoctor && selectedService && selectedDate && selectedTime) {
      onBookingStart({
        doctorId: selectedDoctor,
        serviceId: selectedService,
        date: selectedDate,
        time: selectedTime,
      });
    }
  };

  const isStepComplete = selectedDoctor && selectedService && selectedDate && selectedTime;

  return (
    <Card className="bg-white rounded-[12px] shadow-md p-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Select Doctor */}
        <div>
          <label className="block text-sm font-semibold text-neutral-dark mb-3">
            Select a Doctor
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mockDoctors.map(doctor => (
              <button
                key={doctor.id}
                onClick={() => setSelectedDoctor(doctor.id)}
                className={`p-4 rounded-[12px] border-2 transition-all text-left ${
                  selectedDoctor === doctor.id
                    ? 'border-primary bg-blue-50'
                    : 'border-neutral-gray bg-white hover:border-secondary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{doctor.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-dark truncate">{doctor.name}</p>
                    <p className="text-xs text-neutral-gray">{doctor.specialty}</p>
                    <p className="text-xs text-secondary">★ {doctor.rating}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Select Service */}
        <div>
          <label className="block text-sm font-semibold text-neutral-dark mb-3">
            Select a Service
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <p className="font-semibold text-neutral-dark">{service.name}</p>
                <p className="text-xs text-neutral-gray mt-1">{service.duration} min • ${service.price}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Select Date */}
        <div>
          <label className="block text-sm font-semibold text-neutral-dark mb-3">
            Select a Date
          </label>
          <div className="bg-white rounded-[12px] border border-neutral-gray p-4 space-y-4">
            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-neutral-dark">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 hover:bg-neutral-light rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 hover:bg-neutral-light rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-neutral-gray">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
          </div>
        </div>

        {/* Select Time */}
        {selectedDate && (
          <div>
            <label className="block text-sm font-semibold text-neutral-dark mb-3">
              Select a Time
            </label>
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-[12px] border-2 transition-all text-sm font-medium ${
                      selectedTime === time
                        ? 'border-primary bg-blue-50 text-primary'
                        : 'border-neutral-gray bg-white text-neutral-dark hover:border-secondary'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-neutral-light rounded-[12px] p-4 text-center text-neutral-gray text-sm">
                No available slots for this date
              </div>
            )}
          </div>
        )}

        {/* Next Button */}
        <div className="pt-4">
          <Button
            onClick={handleNextStep}
            disabled={!isStepComplete}
            className="w-full bg-primary hover:bg-blue-900 text-white font-semibold py-3 rounded-[12px] transition-colors disabled:bg-neutral-gray disabled:cursor-not-allowed"
          >
            Continue to Patient Details
          </Button>
        </div>
      </div>
    </Card>
  );
}
