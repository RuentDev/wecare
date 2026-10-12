import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { AccessDenied } from "@/components/dashboard/access-denied";
import { redirect } from "next/navigation";

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const canView = await hasPermission(user.id, "billing:read");
  if (!canView) {
    return (
      <AccessDenied
        title="Billing Access Restricted"
        description="Your account currently does not have privileges to view billing invoices."
        permission="billing:read"
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Billing & Invoices</h1>
      <p className="text-muted-foreground text-sm">
        Review your medical invoices and billing history.
      </p>
    </div>
  );
}

