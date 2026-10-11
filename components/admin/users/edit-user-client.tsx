"use client";

import { useState } from "react";
import { UserForm } from "./user-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  UserCog,
  ArrowLeft,
  ShieldAlert,
  Loader2,
  KeyRound,
  Copy,
  Stethoscope,
  CalendarDays,
  BriefcaseMedical,
  ExternalLink,
  MapPin,
  CircleDollarSign,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DoctorInfoForm } from "@/components/admin/doctors/doctor-info-form";
import { DoctorServicesManager } from "@/components/admin/doctors/doctor-services-manager";
import { DoctorAppointments } from "@/components/admin/doctors/doctor-appointments";
import { adminSetUserPassword } from "@/lib/actions/rbac";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { UserWithDoctorDetails } from "@/lib/types/user";
import type { ClinicLocation } from "@/lib/types/locations";
import type { AdminService } from "@/lib/types/services";

interface EditUserClientProps {
  user: UserWithDoctorDetails;
  locations?: ClinicLocation[];
  allServices?: AdminService[];
}

export function EditUserClient({
  user,
  locations = [],
  allServices = [],
}: EditUserClientProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const isDoctor = user.role === "doctor";
  const doctor = user.doctors;

  const doctorPayload = doctor
    ? {
        ...doctor,
        user_id: user.id,
        users: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone || "",
          is_active: user.is_active ?? true,
        },
      }
    : null;

  const generatePassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
  };

  const copyToClipboard = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
      toast.success("Password copied to clipboard");
    }
  };

  const handleForcePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setIsResetting(true);
    try {
      const result = await adminSetUserPassword(user.id, newPassword);
      if (result.success) {
        toast.success("Password updated successfully", {
          description:
            "All active sessions have been terminated. The user can now log in with the new password.",
          duration: 6000,
        });
        setNewPassword("");
      } else {
        toast.error("Failed to update password");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const dangerZoneCard = (
    <Card className="glassmorphism border-none rounded-[24px] bg-amber-50/10 border-amber-200/20">
      <CardHeader>
        <CardTitle className="text-lg text-amber-700 dark:text-amber-400">
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Force a password reset or invalidate active sessions for this account.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              disabled={isResetting}
              className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 gap-2 cursor-pointer"
            >
              {isResetting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldAlert className="h-4 w-4" />
              )}
              Force Password Reset
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Force Password Reset?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This will immediately terminate all active sessions for{" "}
                    <span className="font-semibold text-foreground">
                      {user.first_name} {user.last_name}
                    </span>
                    .
                  </p>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold">New Password</label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter or generate password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyToClipboard}
                        title="Copy to clipboard"
                        className="cursor-pointer"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={generatePassword}
                        className="whitespace-nowrap gap-2 cursor-pointer"
                      >
                        <KeyRound className="h-4 w-4" />
                        Auto Generate
                      </Button>
                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="rounded-xl cursor-pointer"
                onClick={() => setNewPassword("")}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleForcePasswordReset();
                }}
                disabled={isResetting || !newPassword}
                className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
              >
                {isResetting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Update Password
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );

  const accountSummaryCard = (
    <Card className="glassmorphism border-none rounded-[24px]">
      <CardHeader>
        <CardTitle className="text-lg">Account Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground font-medium">Role</span>
          <Badge
            variant="secondary"
            className={cn(
              "w-fit capitalize",
              isDoctor
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-primary/10 text-primary border-primary/20",
            )}
          >
            {isDoctor && <Stethoscope className="w-3 h-3 mr-1" />}
            {user.role}
          </Badge>
        </div>

        {isDoctor && doctor && (
          <>
            {doctor.specialization && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-primary/70" /> Specialization
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {doctor.specialization}
                </span>
              </div>
            )}

            {doctor.locations && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary/70" /> Clinic Location
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {doctor.locations.name} ({doctor.locations.city})
                </span>
              </div>
            )}

            {doctor.consultation_fee !== null && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <CircleDollarSign className="w-3.5 h-3.5 text-primary/70" />{" "}
                  Consultation Fee
                </span>
                <span className="text-sm font-semibold text-foreground">
                  ₱{Number(doctor.consultation_fee).toLocaleString()}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-white/10">
              <Button
                variant="outline"
                asChild
                className="w-full rounded-xl border-primary/20 text-primary hover:bg-primary/10 gap-2 cursor-pointer text-xs font-semibold"
              >
                <Link href={`/admin/users/doctors/${doctor.id}`}>
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Practitioner Hub
                </Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full hover:bg-white/50 cursor-pointer"
          >
            <Link href="/admin/users">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {isDoctor ? `Dr. ${user.first_name} ${user.last_name}` : "User Profile"}
              </h1>
              {isDoctor && (
                <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 rounded-full px-2.5">
                  <Stethoscope className="w-3 h-3" />
                  Practitioner
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground flex items-center gap-2 text-sm mt-0.5">
              Managing{" "}
              <span className="font-semibold text-primary">
                {user.first_name} {user.last_name}
              </span>
              <Badge variant="outline" className="ml-1 font-mono text-[10px]">
                ID: {user.id.substring(0, 8)}
              </Badge>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            className={
              user.is_active
                ? "bg-success text-white px-3 py-1 rounded-full shadow-xs"
                : "bg-destructive text-white px-3 py-1 rounded-full shadow-xs"
            }
          >
            {user.is_active ? "Active Account" : "Inactive Account"}
          </Badge>

          {isDoctor && doctor && (
            <Badge
              className={cn(
                "px-3 py-1 rounded-full shadow-xs",
                doctor.is_available
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-red-500/10 text-red-500 border-red-500/20",
              )}
              variant="outline"
            >
              {doctor.is_available ? "Available" : "Unavailable"}
            </Badge>
          )}

          {isDoctor && doctor && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 gap-1.5 cursor-pointer ml-2 shadow-xs"
            >
              <Link href={`/admin/users/doctors/${doctor.id}`}>
                <ExternalLink className="w-3.5 h-3.5" />
                Practitioner Hub
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isDoctor ? (
        <Tabs defaultValue="doctor" className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 h-11 p-1">
            <TabsTrigger
              value="doctor"
              className="cursor-pointer px-5 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all gap-2 rounded-xl text-sm font-semibold"
            >
              <Stethoscope className="h-4 w-4" />
              Doctor Profile
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="cursor-pointer px-5 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all gap-2 rounded-xl text-sm font-semibold"
            >
              <UserCog className="h-4 w-4" />
              Account Credentials
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="cursor-pointer px-5 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all gap-2 rounded-xl text-sm font-semibold"
            >
              <BriefcaseMedical className="h-4 w-4" />
              Managed Services
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="cursor-pointer px-5 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all gap-2 rounded-xl text-sm font-semibold"
            >
              <CalendarDays className="h-4 w-4" />
              Appointments
              {doctor?.appointments && doctor.appointments.length > 0 && (
                <Badge className="ml-1 bg-white/20 text-white border-none text-[10px] h-4 px-1.5 min-w-4 flex justify-center">
                  {doctor.appointments.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doctor" className="space-y-6">
            <DoctorInfoForm
              doctor={doctorPayload}
              locations={locations}
            />
          </TabsContent>

          <TabsContent value="account">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="glassmorphism-card border-none overflow-hidden rounded-[24px]">
                  <CardHeader className="bg-linear-to-r from-primary/5 to-transparent border-b border-white/20">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <UserCog className="w-5 h-5 text-primary" /> Edit Account
                      Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <UserForm initialData={user} mode="edit" />
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                {accountSummaryCard}
                {dangerZoneCard}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="services">
            {doctor?.id ? (
              <DoctorServicesManager
                doctorId={doctor.id}
                allServices={allServices}
                currentServices={doctor.doctor_services || []}
              />
            ) : null}
          </TabsContent>

          <TabsContent value="appointments">
            <Card className="glassmorphism-card border-none overflow-hidden rounded-[24px]">
              <CardHeader className="bg-linear-to-r from-primary/5 to-transparent border-b border-white/20">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CalendarDays className="w-5 h-5 text-primary" /> Appointment
                  History
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <DoctorAppointments
                  appointments={doctor?.appointments || []}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="glassmorphism-card border-none overflow-hidden rounded-[24px]">
              <CardHeader className="bg-linear-to-r from-primary/5 to-transparent border-b border-white/20">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <UserCog className="w-5 h-5 text-primary" /> Edit User
                  Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <UserForm initialData={user} mode="edit" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            {accountSummaryCard}
            {dangerZoneCard}
          </div>
        </div>
      )}
    </div>
  );
}

