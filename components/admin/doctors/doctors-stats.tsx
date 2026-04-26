"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Stethoscope, Star } from "lucide-react";

interface DoctorStatsProps {
  stats: {
    total: number;
    available: number;
    topSpecialization: string;
    specializationsCount: number;
  };
}

export function DoctorStats({ stats }: DoctorStatsProps) {
  const cards = [
    {
      title: "Total Doctors",
      value: stats.total,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
      description: "Registered practitioners"
    },
    {
      title: "Available Now",
      value: stats.available,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-100",
      description: "Ready for appointments"
    },
    {
      title: "Specialties",
      value: stats.specializationsCount,
      icon: Stethoscope,
      color: "text-purple-600",
      bg: "bg-purple-100",
      description: "Medical departments"
    },
    {
      title: "Top Specialty",
      value: stats.topSpecialization.replace("_", " "),
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      description: "Most frequent field"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
      {cards.map((card, index) => (
        <Card 
          key={card.title} 
          className="glassmorphism-card border-none shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${card.bg} ${card.color} rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-neutral-gray bg-neutral-light px-2.5 py-1 rounded-full uppercase tracking-wider">
                Real-time
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-bold text-neutral-dark tracking-tight">
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </h3>
              <p className="text-sm font-semibold text-neutral-dark opacity-80">{card.title}</p>
              <p className="text-xs text-neutral-gray">{card.description}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <card.icon className="w-24 h-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
