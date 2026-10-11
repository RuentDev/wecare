import { getUserById } from "@/lib/actions/rbac";
import { getLocations } from "@/lib/actions/locations";
import { getServices } from "@/lib/actions/services";
import { EditUserClient } from "@/components/admin/users/edit-user-client";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

interface UserPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: UserPageProps) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    return {
      title: "User Not Found | WeCare Admin",
    };
  }

  const isDoctor = user.role === "doctor";
  const title = isDoctor
    ? `Dr. ${user.first_name} ${user.last_name} | WeCare Admin`
    : `${user.first_name} ${user.last_name} | WeCare Admin`;

  return {
    title,
    description: `Manage profile and permissions for ${user.first_name} ${user.last_name}`,
  };
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  // Fetch locations and services for doctor profile & services management
  const [{ data: locations = [] }, { data: allServices = [] }] =
    user.role === "doctor"
      ? await Promise.all([getLocations(), getServices()])
      : [{ data: [] }, { data: [] }];

  return (
    <main className="p-5">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        }
      >
        <EditUserClient
          user={user}
          locations={locations || []}
          allServices={allServices || []}
        />
      </Suspense>
    </main>
  );
}

