"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { payment_status } from "@/lib/generated/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Eye, CheckCircle, RefreshCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updatePaymentStatus } from "@/lib/actions/payments";
import { toast } from "sonner";
import { useState, useTransition } from "react";

export type PaymentWithRelations = {
  id: string;
  amount: number;
  currency: string | null;
  status: payment_status | null;
  payment_method: string | null;
  stripe_payment_intent_id: string | null;
  created_at: Date | null;
  users: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
  };
  appointments: {
    id: string;
    appointment_date: Date;
    start_time: Date;
    service_id: string;
    services: {
      name: string;
    };
  } | null;
};

// Component for the actions menu to handle its own loading state
const PaymentActions = ({ payment }: { payment: PaymentWithRelations }) => {
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = (newStatus: payment_status) => {
    startTransition(async () => {
      try {
        const result = await updatePaymentStatus(payment.id, newStatus);
        if (result.success) {
          toast.success(`Payment marked as ${newStatus}`);
        } else {
          toast.error(result.error || "Failed to update status");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
          <span className="sr-only">Open menu</span>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(payment.id)}
        >
          Copy payment ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        
        {payment.status === "pending" && (
          <DropdownMenuItem onClick={() => handleUpdateStatus("paid")}>
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            Mark as Paid
          </DropdownMenuItem>
        )}
        
        {payment.status === "paid" && (
          <DropdownMenuItem onClick={() => handleUpdateStatus("refunded")}>
            <RefreshCcw className="mr-2 h-4 w-4 text-orange-500" />
            Process Refund
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<PaymentWithRelations>[] = [
  {
    accessorKey: "patient_email",
    header: "Patient",
    accessorFn: (row) => `${row.users.first_name} ${row.users.last_name} ${row.users.email}`,
    cell: ({ row }) => {
      const user = row.original.users;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar_url || ""} alt={user.first_name} />
            <AvatarFallback>
              {user.first_name?.[0]}
              {user.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {user.first_name} {user.last_name}
            </span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      return (
        <div className="font-medium">
          {formatCurrency(amount, row.original.currency || "PHP")}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as payment_status;
      
      const getStatusBadge = (status: payment_status) => {
        switch (status) {
          case "paid":
            return <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25">Paid</Badge>;
          case "pending":
            return <Badge className="bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/25">Pending</Badge>;
          case "refunded":
            return <Badge className="bg-slate-500/15 text-slate-600 hover:bg-slate-500/25">Refunded</Badge>;
          case "failed":
            return <Badge variant="destructive">Failed</Badge>;
          default:
            return <Badge variant="outline">{status}</Badge>;
        }
      };

      return getStatusBadge(status);
    },
  },
  {
    accessorKey: "payment_method",
    header: "Method",
    cell: ({ row }) => {
      const method = row.getValue("payment_method") as string;
      return <div className="capitalize">{method || "N/A"}</div>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as Date;
      return <div className="text-sm text-muted-foreground">{formatDate(date)}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <PaymentActions payment={row.original} />,
  },
];
