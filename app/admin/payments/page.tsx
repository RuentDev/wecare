import { PaymentsClient } from "@/components/admin/payments/payments-client";
import { getPayments, getPaymentStats } from "@/lib/actions/payments";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const revalidate = 0; // Dynamic route for payments

export default async function AdminPaymentPage() {
  const [payments, stats] = await Promise.all([
    getPayments(),
    getPaymentStats(),
  ]);

  return (
    <main className="container py-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        }
      >
        <PaymentsClient payments={payments as any} stats={stats} />
      </Suspense>
    </main>
  );
}
