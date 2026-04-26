"use client";
import { Scheduling } from "@/components/scheduling";
import Hero from "@/components/sections/hero";
import Feature from "@/components/sections/feature";
import Doctors from "@/components/sections/doctors";
import Services from "@/components/sections/services";
import CTA from "@/components/sections/cta";

export default function HomePage() {
  return (
    <main className="bg-white">
      <Hero />
      <Scheduling />
      <Feature />
      <Doctors />
      <Services />
      <CTA />
    </main>
  );
}
