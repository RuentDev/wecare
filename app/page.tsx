"use client";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LandingBookingSection } from "@/components/landing-booking-section";
import { mockDoctors, mockServices } from "@/lib/mock-data";
import { Star } from "lucide-react";
import Hero from "@/components/sections/hero";
import Feature from "@/components/sections/feature";
import Doctors from "@/components/sections/doctors";
import Services from "@/components/sections/services";
import CTA from "@/components/sections/cta";

export default function HomePage() {
  return (
    <main className="bg-white">
      <Hero />
      <LandingBookingSection />
      <Feature />
      <Doctors />
      <Services />
      <CTA />
    </main>
  );
}
