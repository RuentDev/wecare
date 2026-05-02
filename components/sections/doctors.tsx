"use client";
import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Star, Loader2 } from 'lucide-react';
import { getPublicDoctors } from '@/lib/actions/scheduling';
import type { SchedulingDoctor } from '@/lib/types/scheduling';

const Doctors = () => {
  const [doctors, setDoctors] = useState<SchedulingDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPublicDoctors().then(r => {
      if (r.success && r.data) {
        setDoctors(r.data);
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

  if (doctors.length === 0) return null;
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-neutral-dark text-center mb-12">Our Healthcare Professionals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map(doctor => (
                <Card key={doctor.id} className="rounded-[12px] p-6 bg-white border border-neutral-gray hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{doctor.avatarUrl || "👩‍⚕️"}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-dark">{doctor.name}</h3>
                      <p className="text-sm text-secondary font-medium">{doctor.specialization}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-neutral-dark">
                          4.9 (124 reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-gray mt-4 line-clamp-3">{doctor.bio}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
  )
}

export default Doctors