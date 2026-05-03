"use client";

import { PaymentStats } from "./payment-stats";
import { columns, PaymentWithRelations } from "./columns";
import { DataTable } from "@/components/ui/data-table";

interface PaymentsClientProps {
  payments: PaymentWithRelations[];
  stats: {
    totalRevenue: number;
    pendingCount: number;
    pendingAmount: number;
    paidCount: number;
    failedRefundedCount: number;
    successRate: number;
  };
}

export function PaymentsClient({ payments, stats }: PaymentsClientProps) {
  // Let's add an explicit email string property just to make filtering easy with Shadcn's DataTable
  const dataWithEmail = payments.map((p) => ({
    ...p,
    patient_email: p.users.email,
  }));

  // We need to update columns to have accessorKey for patient_email if we want to filter by it easily
  // but it's simpler to just pass the generic DataTable without search if we didn't add it to columns.
  // Actually, I will add an accessorFn in columns.tsx, but for now let's just pass data and see.

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payments Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor your clinic's revenue, pending payments, and recent transactions.
        </p>
      </div>

      <PaymentStats stats={stats} />

      <div className="pt-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-medium">Recent Transactions</h3>
        </div>
        <DataTable columns={columns} data={payments} searchKey="patient_email" />
      </div>
    </div>
  );
}
