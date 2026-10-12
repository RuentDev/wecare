import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccessDeniedProps {
  title?: string;
  description?: string;
  permission?: string;
  backHref?: string;
}

export function AccessDenied({
  title = "Access Restricted",
  description = "You do not have the required permissions to view this section.",
  permission,
  backHref = "/dashboard",
}: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-6 ring-8 ring-destructive/5">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>

      <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {permission && (
        <div className="mt-4 px-3 py-1.5 rounded-lg bg-muted text-xs font-mono text-muted-foreground border border-border/60">
          Required privilege: <span className="font-semibold text-foreground">{permission}</span>
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        <Button asChild variant="default" className="gap-2 rounded-xl">
          <Link href={backHref}>
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
