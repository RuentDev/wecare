"use client";

import Link from "next/link";
import { ArrowLeft, User, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PatientProfileForm } from "./patient-profile-form";
import { AccountSummaryCard } from "./account-summary-card";
import type { User as UserType } from "@/lib/types/user";

interface PatientProfileClientProps {
  user: UserType;
}

export function PatientProfileClient({ user }: PatientProfileClientProps) {
  return (
    <div className="w-full space-y-6">
      {/* Top Header matching Admin User View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full hover:bg-white/50 cursor-pointer shrink-0"
          >
            <Link href="/dashboard" aria-label="Back to dashboard">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                My Profile
              </h1>
              <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 rounded-full px-2.5">
                <User className="size-3" />
                Patient
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Manage your personal information and contact details
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge
            className={
              user.is_active
                ? "bg-emerald-600 text-white px-3 py-1 rounded-full shadow-xs font-semibold"
                : "bg-destructive text-white px-3 py-1 rounded-full shadow-xs font-semibold"
            }
          >
            {user.is_active ? "Active Account" : "Inactive Account"}
          </Badge>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 cols): Profile Form */}
        <div className="lg:col-span-2">
          <Card className="glassmorphism-card border-none overflow-hidden rounded-[24px] shadow-sm">
            <CardHeader className="bg-linear-to-r from-primary/5 to-transparent border-b border-white/20 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <UserCog className="size-5 text-primary" /> Profile Information
              </CardTitle>
              <CardDescription>
                Keep your personal and contact details up-to-date for healthcare communications.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <PatientProfileForm user={user} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 col): Account Summary */}
        <div className="lg:col-span-1">
          <AccountSummaryCard user={user} />
        </div>
      </div>
    </div>
  );
}
