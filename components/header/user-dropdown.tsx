"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import Link from "next/link";
import { useApp } from "@/contexts/app-context";
import { ChevronDown } from "lucide-react";

const UserDropdown = () => {
  const { user, logout } = useApp();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button
            variant="outline"
            size="sm"
            className="text-neutral-dark border-neutral-300"
          >
            Login
          </Button>
        </Link>
        <Link href="/signup">
          <Button variant="default" size="sm">
            Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="hidden lg:flex text-neutral-dark hover:bg-neutral-light hover:text-primary font-medium"
        >
          {user.first_name}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {user.role === "patient" && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="cursor-pointer">
                Dasboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/appointments" className="cursor-pointer">
                My Appointments
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/medical-record" className="cursor-pointer">
                Medical Record
              </Link>
            </DropdownMenuItem>
          </>
        )}
        {(user.role === "admin" || user.role === "staff") && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer">
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/appointments" className="cursor-pointer">
                Appointments
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/services" className="cursor-pointer">
                Services
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="cursor-pointer">
                Settings
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem
          onClick={logout}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
