"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  return (
    <header className="bg-white border-b border-neutral-gray sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-lg text-neutral-dark hidden sm:inline">
              WeCare
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex gap-8">
            <Link
              href="/"
              className="text-neutral-dark hover:text-primary transition-colors text-sm font-medium"
            >
              Make an Appointment
            </Link>
            <Link
              href="/about"
              className="text-neutral-dark hover:text-primary transition-colors text-sm font-medium"
            >
              About
            </Link>
            <Link
              href="/services"
              className="text-neutral-dark hover:text-primary transition-colors text-sm font-medium"
            >
              Services
            </Link>
            <Link
              href="/ask-a-doctor"
              className="text-neutral-dark hover:text-primary transition-colors text-sm font-medium"
            >
              Ask a Doctor
            </Link>
            <Link
              href="/clinics"
              className="text-neutral-dark hover:text-primary transition-colors text-sm font-medium"
            >
              Clinics
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-neutral-dark">
                  Ruentgen
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* {user?.role === 'patient' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/patient/appointments">My Appointments</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/patient/medical-record">Medical Record</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard">Admin Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/doctors">Manage Doctors</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/appointments">Manage Appointments</Link>
                      </DropdownMenuItem>
                    </>
                  )} */}
                <DropdownMenuItem
                // onClick={logout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
