"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  BarChart3,
  Settings,
  Plus,
  HelpCircle,
  LogOut,
} from "lucide-react";

export function AdminSidebar() {
  const { logout } = useAuth();

  const navItems = [
    { icon: Calendar, label: "Calendar", href: "/admin/dashboard" },
    { icon: Users, label: "Patients", href: "/admin/patients" },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-neutral-gray min-h-screen flex flex-col fixed left-0 top-0 pt-6">
      {/* Logo */}
      <div className="px-6 mb-8">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <div>
            <p className="font-bold text-neutral-dark text-sm">WeCare Admin</p>
            <p className="text-xs text-neutral-gray uppercase tracking-wide">
              Medical Management
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-dark hover:bg-neutral-light transition-colors font-medium text-sm"
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* New Appointment Button */}
      <div className="px-4 mb-4">
        <Button className="w-full bg-primary hover:bg-blue-900 text-white rounded-lg font-semibold py-2.5 flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />
          New Appointment
        </Button>
      </div>

      {/* Bottom Actions */}
      <div className="px-4 space-y-2 border-t border-neutral-gray pt-4">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-dark hover:bg-neutral-light transition-colors text-sm">
          <HelpCircle className="w-5 h-5" />
          Help Center
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-dark hover:bg-neutral-light transition-colors text-sm"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
