"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  ShieldAlert,
  Copy,
  KeyRound,
} from "lucide-react";
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
import { toast } from "sonner";
import { adminSetUserPassword } from "@/lib/actions/rbac";

interface DoctorDangerZoneProps {
  doctor: any;
}

export function DoctorDangerZone({ doctor }: DoctorDangerZoneProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
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
      const result = await adminSetUserPassword(doctor.user_id, newPassword);
      if (result.success) {
        toast.success("Password updated successfully", {
          description: "All active sessions have been terminated. The user can now log in with the new password.",
          duration: 6000,
        });
        setNewPassword("");
      } else {
        toast.error("Failed to update password");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="glassmorphism-card border-none rounded-[24px] bg-amber-50/5 border-amber-200/10 overflow-hidden mt-8">
      <CardHeader className="bg-amber-500/10 border-b border-amber-200/10">
        <CardTitle className="text-lg text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          Security & Access Control
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Force Password Reset</p>
            <p className="text-xs text-muted-foreground max-w-md">
              Reset this doctor's password and sign them out of all active devices immediately.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                disabled={isResetting}
                className="border-amber-200/50 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 gap-2 rounded-xl"
              >
                {isResetting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                Reset Password
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-white/20 glassmorphism shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Force Password Reset?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-4 mt-2">
                    <p className="text-sm text-muted-foreground">
                      This will immediately terminate all active sessions for{" "}
                      <span className="font-semibold text-foreground">
                        Dr. {doctor.users?.first_name} {doctor.users?.last_name}
                      </span>.
                    </p>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold">New Password</label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter or generate password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="font-mono text-sm glassmorphism-input"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyToClipboard}
                          title="Copy to clipboard"
                          type="button"
                          className="rounded-lg"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={generatePassword}
                          className="whitespace-nowrap gap-2 rounded-lg"
                          type="button"
                        >
                          <KeyRound className="h-4 w-4" />
                          Auto Generate
                        </Button>
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6">
                <AlertDialogCancel
                  className="rounded-xl border-white/10"
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
        </div>
      </CardContent>
    </Card>
  );
}
