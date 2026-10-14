import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Calendar, ShieldCheck, Mail } from "lucide-react";
import type { User } from "@/lib/types/user";

interface AccountSummaryCardProps {
  user: User;
}

export function AccountSummaryCard({ user }: AccountSummaryCardProps) {
  const memberSince = user.created_at
    ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
        new Date(user.created_at)
      )
    : "Recent";

  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "PT";

  return (
    <Card className="glassmorphism border-none rounded-[24px] shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-foreground">
          Account Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 pt-2">
        {/* Profile Avatar & Identity */}
        <div className="flex flex-col items-center text-center gap-2.5 py-2">
          <Avatar className="size-20 rounded-2xl border-2 border-primary/20 shadow-md">
            <AvatarImage
              src={user.avatar_url || ""}
              alt={`${user.first_name} ${user.last_name}`}
              className="object-cover"
            />
            <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-bold text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <h3 className="font-bold text-base text-foreground">
              {user.first_name} {user.last_name}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Mail className="size-3 text-muted-foreground" />
              {user.email}
            </p>
          </div>
        </div>

        <div className="h-px bg-white/20 w-full" />

        {/* Account Details list */}
        <div className="flex flex-col gap-3.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Role</span>
            <Badge
              variant="secondary"
              className="w-fit capitalize bg-primary/10 text-primary border-primary/20 font-semibold"
            >
              <UserIcon className="size-3 mr-1" />
              {user.role}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Status</span>
            <Badge
              className={
                user.is_active
                  ? "bg-emerald-600 text-white shadow-xs font-semibold"
                  : "bg-destructive text-white shadow-xs font-semibold"
              }
            >
              {user.is_active ? "Active Account" : "Inactive Account"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Calendar className="size-3.5 text-primary/70" /> Member Since
            </span>
            <span className="text-xs font-semibold text-foreground">
              {memberSince}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-500" /> Verification
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {user.email_verified ? "Verified Email" : "Registered Patient"}
            </span>
          </div>
        </div>

        {/* Security / System Notice */}
        <div className="rounded-xl bg-slate-100/70 dark:bg-slate-800/40 p-3 text-[11px] text-muted-foreground leading-relaxed border border-border/40">
          Personal contact details are protected under clinical privacy standards. All changes are logged securely.
        </div>
      </CardContent>
    </Card>
  );
}
