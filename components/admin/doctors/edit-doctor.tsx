"use client";

import { useState } from "react";
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
import { adminSetUserPassword } from "@/lib/actions/rbac";
import { toast } from "sonner";

interface EditDoctorClientProps {
  doctor: any;
}

export function EditDoctorClient({ doctor }: EditDoctorClientProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // const generatePassword = () => {
  //   const chars =
  //     "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  //   let pwd = "";
  //   for (let i = 0; i < 12; i++) {
  //     pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  //   }
  //   setNewPassword(pwd);
  // };

  // const copyToClipboard = () => {
  //   if (newPassword) {
  //     navigator.clipboard.writeText(newPassword);
  //     toast.success("Password copied to clipboard");
  //   }
  // };

  // const handleForcePasswordReset = async () => {
  //   if (!newPassword || newPassword.length < 6) {
  //     toast.error("Password must be at least 6 characters long.");
  //     return;
  //   }

  //   setIsResetting(true);
  //   try {
  //     const result = await adminSetUserPassword(doctor.id, newPassword);
  //     if (result.success) {
  //       toast.success("Password updated successfully", {
  //         description:
  //           "All active sessions have been terminated. The user can now log in with the new password.",
  //         duration: 6000,
  //       });
  //       setNewPassword("");
  //     } else {
  //       toast.error("Failed to update password");
  //     }
  //   } catch (err) {
  //     toast.error("An error occurred. Please try again.");
  //   } finally {
  //     setIsResetting(false);
  //   }
  // };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full hover:bg-white/50"
          >
            <Link href="/admin/users">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              Managing{" "}
              <span className="font-semibold text-primary">
                {doctor.first_name} {doctor.last_name}
              </span>
              <Badge variant="outline" className="ml-2 font-mono text-[10px]">
                ID: {doctor.id.substring(0, 8)}
              </Badge>
            </p>
          </div>
        </div>
        <Badge
          className={
            doctor.is_active
              ? "bg-success text-white"
              : "bg-destructive text-white"
          }
        >
          {doctor.is_active ? "Active Account" : "Inactive Account"}
        </Badge>
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          <Card className="glassmorphism border-none rounded-[24px]">
            <CardHeader>
              <CardTitle className="text-lg">Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium">
                  Role
                </span>
                <Badge
                  variant="secondary"
                  className="w-fit capitalize bg-primary/10 text-primary border-primary/20"
                >
                  {doctor.role}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-none rounded-[24px] bg-amber-50/10 border-amber-200/20">
            <CardHeader>
              <CardTitle className="text-lg text-amber-700 dark:text-amber-400">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Force a password reset or deactivate this account permanently.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isResetting}
                    className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 gap-2"
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
                          This will immediately terminate all active sessions
                          for{" "}
                          <span className="font-semibold text-foreground">
                            {doctor.first_name} {doctor.last_name}
                          </span>
                          .
                        </p>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold">
                            New Password
                          </label>
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
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={generatePassword}
                              className="whitespace-nowrap gap-2"
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
                      className="rounded-xl"
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
                      className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
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
        </div>
      </div> */}
    </div>
  );
}
