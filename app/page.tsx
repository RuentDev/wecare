'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LandingBookingSection } from '@/components/landing-booking-section';
import { mockDoctors, mockServices } from '@/lib/mock-data';
import { Star, Clock, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-neutral-dark leading-tight mb-4">
                Quality Healthcare, <span className="text-primary">Made Simple</span>
              </h1>
              <p className="text-lg text-neutral-gray max-w-2xl mx-auto">
                Book appointments with qualified healthcare professionals in just a few clicks.
              </p>
            </div>
          </div>
        </section>

        {/* Booking Portal Section */}
        <LandingBookingSection />

        {/* Features Section */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-neutral-light">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-neutral-dark text-center mb-12">Why Choose WeCare?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Clock className="w-8 h-8" />,
                  title: 'Easy Scheduling',
                  description: 'Book appointments in minutes with our intuitive booking system.',
                },
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: 'Professional Care',
                  description: 'Access to qualified and verified healthcare professionals.',
                },
                {
                  icon: <Star className="w-8 h-8" />,
                  title: 'Patient Focused',
                  description: 'Your health and comfort are our top priorities.',
                },
              ].map((feature, idx) => (
                <Card key={idx} className="rounded-[12px] p-6 bg-white border border-neutral-gray hover:shadow-lg transition-shadow">
                  <div className="text-primary mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-neutral-dark mb-2">{feature.title}</h3>
                  <p className="text-neutral-gray">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Doctors Section */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-neutral-dark text-center mb-12">Our Healthcare Professionals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDoctors.map(doctor => (
                <Card key={doctor.id} className="rounded-[12px] p-6 bg-white border border-neutral-gray hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{doctor.avatar}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-dark">{doctor.name}</h3>
                      <p className="text-sm text-secondary font-medium">{doctor.specialty}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-neutral-dark">
                          {doctor.rating} ({doctor.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-gray mt-4">{doctor.bio}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-neutral-light">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-neutral-dark text-center mb-12">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockServices.map(service => (
                <Card key={service.id} className="rounded-[12px] p-6 bg-white border border-neutral-gray hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-neutral-dark">{service.name}</h3>
                    <span className="text-primary font-bold">${service.price}</span>
                  </div>
                  <p className="text-sm text-neutral-gray mb-4">{service.description}</p>
                  <p className="text-xs text-secondary font-medium">Duration: {service.duration} minutes</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Book Your Appointment?</h2>
            <p className="text-lg text-blue-100 mb-8">
              Take the first step towards better health today.
            </p>
            <Button asChild className="bg-white hover:bg-blue-50 text-primary font-semibold py-3 px-8 rounded-[12px]">
              <Link href="/booking">Book Now</Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-neutral-dark text-white py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-semibold mb-4">About WeCare</h4>
                <p className="text-sm text-gray-300">Quality healthcare made accessible to everyone.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Services</h4>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li><a href="#" className="hover:text-white transition">Consultation</a></li>
                  <li><a href="#" className="hover:text-white transition">Follow-up</a></li>
                  <li><a href="#" className="hover:text-white transition">Treatments</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                  <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition">Terms</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-300">
              <p>&copy; 2026 WeCare Clinic. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
