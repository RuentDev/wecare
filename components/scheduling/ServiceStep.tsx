"use client";

import { useMemo, useState } from "react";
import { Briefcase, Clock, Search, X, FilterX } from "lucide-react";
import type { SchedulingService } from "@/lib/types/scheduling";

interface ServiceStepProps {
  services: SchedulingService[];
  selectedServiceId: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

interface CategoryItem {
  id: string;
  label: string;
  count: number;
}

const ALL_CATEGORY = "ALL";
const OTHER_CATEGORY = "Other";

function ServiceCardSkeleton() {
  return (
    <div className="p-8 rounded-[20px] border-2 border-neutral-gray bg-white animate-pulse">
      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 rounded-xl bg-neutral-light" />
        <div className="w-16 h-6 bg-neutral-light rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-neutral-light rounded mb-3" />
      <div className="h-4 w-full bg-neutral-light rounded mb-2" />
      <div className="h-4 w-2/3 bg-neutral-light rounded mb-6" />
      <div className="pt-6 border-t border-neutral-gray/30 flex justify-between gap-4">
        <div className="h-4 w-24 bg-neutral-light rounded" />
        <div className="h-4 w-20 bg-neutral-light rounded" />
      </div>
    </div>
  );
}

export function ServiceStep({
  services,
  selectedServiceId,
  onSelect,
  isLoading = false,
}: ServiceStepProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract unique categories and their counts
  const categories = useMemo<CategoryItem[]>(() => {
    if (services.length === 0) return [];

    const counts = new Map<string, number>();
    let otherCount = 0;

    services.forEach((service) => {
      const cat = service.category?.trim();
      if (!cat) {
        otherCount += 1;
      } else {
        counts.set(cat, (counts.get(cat) ?? 0) + 1);
      }
    });

    const result: CategoryItem[] = [
      { id: ALL_CATEGORY, label: "All Services", count: services.length },
    ];

    Array.from(counts.keys())
      .sort((a, b) => a.localeCompare(b))
      .forEach((cat) => {
        result.push({
          id: cat,
          label: cat,
          count: counts.get(cat) ?? 0,
        });
      });

    if (otherCount > 0) {
      result.push({
        id: OTHER_CATEGORY,
        label: OTHER_CATEGORY,
        count: otherCount,
      });
    }

    return result;
  }, [services]);

  // Filter services by category and search query
  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return services.filter((service) => {
      const cat = service.category?.trim();
      const matchesCategory =
        selectedCategory === ALL_CATEGORY ||
        (selectedCategory === OTHER_CATEGORY
          ? !cat
          : cat === selectedCategory);

      const matchesSearch =
        query === "" ||
        service.name.toLowerCase().includes(query) ||
        (service.description?.toLowerCase().includes(query) ?? false);

      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory(ALL_CATEGORY);
    setSearchQuery("");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Step Header with Title & Search Input */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold text-neutral-dark">Select Service</h3>
        </div>

        {!isLoading && services.length > 0 && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-gray absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-neutral-gray/60 rounded-xl text-neutral-dark placeholder:text-neutral-gray focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray hover:text-neutral-dark p-0.5 rounded-full cursor-pointer transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category Filter Buttons Bar */}
      {!isLoading && categories.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-sm ring-2 ring-primary/20 border border-primary"
                    : "bg-white text-neutral-dark border border-neutral-gray/60 hover:border-primary/40 hover:bg-neutral-light"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-blue-50 text-primary"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Services Grid or Empty States */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))
        ) : services.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-neutral-gray bg-neutral-light/50 rounded-[24px] border-2 border-dashed border-neutral-gray/30">
            <Briefcase className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-base font-medium">
              No services available at this time
            </p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-[24px] border-2 border-dashed border-neutral-gray/40">
            <FilterX className="w-12 h-12 mb-3 text-neutral-gray/50" />
            <h4 className="text-base font-bold text-neutral-dark mb-1">
              No matching services found
            </h4>
            <p className="text-sm text-neutral-gray max-w-sm mb-6">
              {searchQuery
                ? `No services matched "${searchQuery}" in this category.`
                : "No services are available in this category."}
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-light hover:bg-neutral-gray/40 text-neutral-dark font-bold text-xs rounded-xl border border-neutral-gray/60 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredServices.map((service) => (
            <button
              type="button"
              key={service.id}
              onClick={() => onSelect(service.id)}
              className={`cursor-pointer group p-8 rounded-[20px] border-2 transition-all text-left flex flex-col h-full hover:-translate-y-1 ${
                selectedServiceId === service.id
                  ? "border-primary bg-blue-50 shadow-lg ring-2 ring-primary/20"
                  : "border-neutral-gray bg-white hover:border-secondary hover:shadow-md"
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`p-3 rounded-xl transition-all ${
                    selectedServiceId === service.id
                      ? "bg-primary text-white scale-110"
                      : "bg-blue-50 text-primary group-hover:bg-teal-50 group-hover:text-secondary"
                  }`}
                >
                  <Briefcase className="w-6 h-6" />
                </div>
                {service.category && (
                  <span className="text-[11px] font-bold text-primary bg-blue-100 px-3 py-1 rounded-full">
                    {service.category}
                  </span>
                )}
              </div>

              <h4 className="font-black text-lg text-neutral-dark mb-2 group-hover:text-primary transition-colors">
                {service.name}
              </h4>

              {service.description && (
                <p className="text-sm text-neutral-gray grow mb-4">
                  {service.description}
                </p>
              )}

              <div className="pt-6 border-t border-neutral-gray/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-gray uppercase tracking-widest">
                  <Clock className="w-4 h-4" />
                  <span>{service.durationMinutes} mins</span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
