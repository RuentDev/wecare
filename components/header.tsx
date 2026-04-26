"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Make an Appointment" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/ask-a-doctor", label: "Ask a Doctor" },
    { href: "/clinics", label: "Clinics" },
  ];

  return (
    <header className="bg-background border-b border-neutral-100 sticky top-0 z-50 backdrop-blur-sm bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="font-bold text-lg text-neutral-dark hidden sm:inline group-hover:text-primary transition-colors">
              WeCare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-neutral-dark hover:text-primary text-sm font-medium rounded-md transition-all duration-200 hover:bg-neutral-light"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Auth Buttons - Desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-neutral-dark border-neutral-300 hover:bg-neutral-light"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button 
                  variant="default" 
                  size="sm"
                >
                  Sign Up
                </Button>
              </Link>
            </div>

            {/* User Dropdown - Desktop (commented out for now) */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="hidden lg:flex text-neutral-dark hover:bg-neutral-light hover:text-primary font-medium"
                >
                  Ruentgen
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user?.role === 'patient' && (
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
                  )}
                <DropdownMenuItem
                // onClick={logout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-neutral-dark hover:bg-neutral-light transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden pb-4 border-t border-neutral-100 pt-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-neutral-dark hover:text-primary hover:bg-neutral-light rounded-md text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
