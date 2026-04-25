'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-white border-b border-neutral-gray sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <span className="font-bold text-lg text-neutral-dark hidden sm:inline">WeCare</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex gap-8">
            <Link href="/" className="text-neutral-dark hover:text-primary transition-colors text-sm font-medium">
              Find a Doctor
            </Link>
            <Link href="/" className="text-neutral-dark hover:text-primary transition-colors text-sm font-medium">
              Services
            </Link>
            {isAuthenticated && user?.role === 'patient' && (
              <Link href="/patient/appointments" className="text-neutral-dark hover:text-primary transition-colors text-sm font-medium">
                My Appointments
              </Link>
            )}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-neutral-dark">
                    {user?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
