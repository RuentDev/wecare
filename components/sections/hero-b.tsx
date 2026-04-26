"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Stethoscope, Heart, Calendar, Users, ArrowRight } from "lucide-react";

const FloatingIcon = ({
  icon: Icon,
  delay,
  position,
}: {
  icon: React.ComponentType<{ className?: string }>;
  delay: string;
  position: string;
}) => (
  <div
    className={`absolute ${position} animate-float opacity-10 sm:opacity-20 pointer-events-none`}
    style={{
      animation: `float 6s ease-in-out infinite`,
      animationDelay: delay,
    }}
  >
    <Icon className="w-16 h-16 sm:w-24 sm:h-24 text-white" />
  </div>
);

const HeroB = () => {
  return (
    <section className="relative min-h-[600px] sm:min-h-[700px] overflow-hidden flex items-center">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-secondary" />

      {/* Floating Icons Background */}
      <FloatingIcon icon={Stethoscope} delay="0s" position="top-10 left-10" />
      <FloatingIcon icon={Heart} delay="1s" position="top-20 right-20" />
      <FloatingIcon icon={Calendar} delay="2s" position="bottom-32 left-1/4" />
      <FloatingIcon icon={Users} delay="1.5s" position="bottom-20 right-1/3" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center max-w-3xl mx-auto">
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 text-balance">
            Your Health, Our Priority
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto text-pretty">
            Book appointments with qualified healthcare professionals in just a few clicks. Your wellness journey starts here.
          </p>

          {/* Trust Signals */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10 text-white/80 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span>Trusted by 5,000+ patients</span>
            </div>
            <div className="hidden sm:flex w-px h-5 bg-white/30" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span>Available 24/7</span>
            </div>
            <div className="hidden sm:flex w-px h-5 bg-white/30" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span>Board-certified doctors</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/appointments">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/95 font-semibold px-8 group"
              >
                Book Appointment Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/doctors">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 font-semibold px-8"
              >
                View Available Doctors
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </section>
  );
};

export default HeroB;
