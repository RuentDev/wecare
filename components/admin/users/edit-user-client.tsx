"use client";

import { UserForm } from "./user-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCog, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EditUserClientProps {
  user: any;
}

export function EditUserClient({ user }: EditUserClientProps) {
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
                {user.first_name} {user.last_name}
              </span>
              <Badge variant="outline" className="ml-2 font-mono text-[10px]">
                ID: {user.id.substring(0, 8)}
              </Badge>
            </p>
          </div>
        </div>
        <Badge
          className={
            user.is_active
              ? "bg-success text-white"
              : "bg-destructive text-white"
          }
        >
          {user.is_active ? "Active Account" : "Inactive Account"}
        </Badge>
      </div>

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
                  {user.role}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium">
                  RBAC Permissions
                </span>
                <div className="flex flex-wrap gap-1">
                  {user.user_roles?.map((ur: any) => (
                    <Badge
                      key={ur.roles.id}
                      variant="outline"
                      className="text-[10px]"
                    >
                      {ur.roles.name}
                    </Badge>
                  ))}
                  {(!user.user_roles || user.user_roles.length === 0) && (
                    <span className="text-xs italic text-muted-foreground">
                      No roles assigned
                    </span>
                  )}
                </div>
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
              <Button
                variant="outline"
                className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                Force Password Reset
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
