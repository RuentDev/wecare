"use client";
import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Loader2 } from 'lucide-react';
import { getPublicServices } from '@/lib/actions/scheduling';
import type { SchedulingService } from '@/lib/types/scheduling';

const Services = () => {
  const [services, setServices] = useState<SchedulingService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPublicServices().then(r => {
      if (r.success && r.data) {
        setServices(r.data);
      }
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (services.length === 0) return null;
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-neutral-light">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-neutral-dark text-center mb-12">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map(service => (
                <Card key={service.id} className="rounded-[12px] p-6 bg-white border border-neutral-gray hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-neutral-dark">{service.name}</h3>
                    <span className="text-primary font-bold">${service.price}</span>
                  </div>
                  <p className="text-sm text-neutral-gray mb-4 line-clamp-2">{service.description}</p>
                  <p className="text-xs text-secondary font-medium">Duration: {service.durationMinutes} minutes</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
  )
}

export default Services