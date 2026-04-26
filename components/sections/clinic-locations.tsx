"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { mockLocations, ClinicLocation } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const LocationCard = ({
  location,
  isActive,
  onClick,
}: {
  location: ClinicLocation;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <Card
      className={cn(
        "p-6 transition-all duration-300 cursor-pointer border-2",
        isActive
          ? "shadow-md bg-blue-50/30"
          : "border-transparent hover:border-blue-200",
      )}
      onClick={onClick}
    >
      <h3 className="text-xl font-bold text-neutral-dark mb-4">
        {location.name}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-neutral-gray text-sm">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ">
            <Phone className="w-4 h-4" />
          </div>
          <span>{location.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-gray text-sm">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ">
            <Mail className="w-4 h-4" />
          </div>
          <span>{location.email}</span>
        </div>
      </div>

      <div className="flex items-start gap-2 text-neutral-gray text-sm">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center  shrink-0 mt-0.5">
          <MapPin className="w-4 h-4" />
        </div>
        <p className="leading-relaxed">{location.address}</p>
      </div>

      {isActive && (
        <a
          href={location.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2 text-white rounded-lg text-sm font-medium transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          View on Google Maps
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </Card>
  );
};

const ClinicMap = ({
  locations,
  selectedId,
}: {
  locations: ClinicLocation[];
  selectedId: string;
}) => {
  const selectedLocation =
    locations.find((loc) => loc.id === selectedId) || locations[0];
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(selectedLocation.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="relative w-full aspect-square sm:aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 bg-neutral-100">
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map showing ${selectedLocation.name}`}
        className="grayscale-[0.2] contrast-[1.1]"
      />
    </div>
  );
};

const ClinicLocations = () => {
  const [selectedLocation, setSelectedLocation] = useState<ClinicLocation>(
    mockLocations[0],
  );

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Decorative Blob */}
      <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-extrabold text-neutral-dark tracking-tight">
                Our Clinics
              </h2>
              <p className="text-neutral-gray text-lg">
                Visit us at our conveniently located medical centers. Click on a
                location to see details and directions.
              </p>
            </div>

            <div className="max-h-[500px] flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar">
              {mockLocations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  isActive={selectedLocation.id === location.id}
                  onClick={() => setSelectedLocation(location)}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Map */}
          <div className="lg:col-span-7">
            <ClinicMap
              locations={mockLocations}
              selectedId={selectedLocation.id}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClinicLocations;
