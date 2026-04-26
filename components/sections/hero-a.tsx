"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Stethoscope } from "lucide-react";

const HeroA = () => {
  return (
    <section className="relative min-h-[600px] sm:min-h-[700px] overflow-hidden bg-white">
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12 sm:py-20">
          {/* Left Column - Content */}
          <div className="flex flex-col justify-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 w-fit">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-sm font-medium text-primary">Your Trusted Healthcare Partner</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-dark leading-tight mb-6 text-balance">
              Healthcare That Cares
            </h1>

            {/* Subheading */}
            <p className="text-lg text-neutral-gray mb-8 text-pretty">
              Book appointments with qualified healthcare professionals. Experience compassionate care, expert treatment, and your wellness as our top priority.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-10">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-neutral-dark">Board-Certified Doctors</h3>
                  <p className="text-sm text-neutral-gray">Access to experienced medical professionals</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-neutral-dark">24/7 Availability</h3>
                  <p className="text-sm text-neutral-gray">Book appointments whenever it works for you</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-neutral-dark">Quick & Easy Booking</h3>
                  <p className="text-sm text-neutral-gray">Schedule in just a few clicks</p>
                </div>
              </div>
            </div>

            {/* Trust Signal */}
            <p className="text-sm text-neutral-gray mb-8">
              <span className="font-semibold text-neutral-dark">Trusted by 5,000+ patients</span> across our clinics
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link href="/appointments">
                <Button
                  size="lg"
                  className="bg-primary text-white hover:bg-primary/90 font-semibold px-8 group"
                >
                  Book Appointment
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/doctors">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-neutral-300 text-neutral-dark hover:bg-neutral-light font-semibold px-8"
                >
                  View Doctors
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-md">
              {/* Gradient card background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl opacity-10 blur-2xl" />

              {/* Main illustration card */}
              <div className="relative flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl border border-primary/20 overflow-hidden">
                {/* Floating elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Center Icon */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                    <div className="relative bg-gradient-to-br from-primary to-secondary p-8 rounded-full">
                      <Stethoscope className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>

                {/* Floating stat boxes */}
                <div className="absolute top-8 right-8 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg">
                  <p className="text-xl font-bold text-primary">5000+</p>
                  <p className="text-xs text-neutral-gray">Happy Patients</p>
                </div>

                <div className="absolute bottom-8 left-8 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg">
                  <p className="text-xl font-bold text-secondary">100%</p>
                  <p className="text-xs text-neutral-gray">Certified Pros</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroA;
