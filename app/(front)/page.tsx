"use client";
import Scheduling from "@/components/scheduling";
import Hero from "@/components/sections/hero";
import Feature from "@/components/sections/feature";
import Doctors from "@/components/sections/doctors";
import Services from "@/components/sections/services";
import OurLocation from "@/components/sections/clinic-locations";
import CTA from "@/components/sections/cta";

export default function HomePage() {
  const date = new Date();
  return (
    <main className="bg-white">
      <Hero />
      <Scheduling date={date} />
      <Feature />
      <OurLocation />
      <Doctors />
      <Services />
      <CTA />
    </main>
  );
}
