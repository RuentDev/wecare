import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PatientProfileClient } from "@/components/dashboard/profile/patient-profile-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | WeCare Patient Portal",
  description: "Manage your personal information and contact details",
};

function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="size-8 animate-spin text-primary opacity-60" />
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        Loading Profile Details...
      </p>
    </div>
  );
}

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/profile");
  }

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <PatientProfileClient user={user} />
    </Suspense>
  );
}
