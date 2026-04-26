"use client";
import Scheduling from "@/components/sections/scheduling";
import Feature from "@/components/sections/feature";
import Doctors from "@/components/sections/doctors";
import Services from "@/components/sections/services";
import OurLocation from "@/components/sections/clinic-locations";
import CTA from "@/components/sections/cta";
import HeroB from "@/components/sections/hero-b";

export default function HomePage() {
  const date = new Date();
  return (
    <main className="bg-white">
      <HeroB />
      <Scheduling date={date} />
      <Feature />
      <OurLocation />
      <Doctors />
      <Services />
      <CTA />
    </main>
  );
}
