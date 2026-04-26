import { UsersClient } from "@/components/admin/users/users-client";
import { getUsers, getRoles } from "@/lib/actions/rbac";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export default async function UsersPage() {
  const [users, roles] = await Promise.all([getUsers(), getRoles()]);

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage your staff, doctors, and patient accounts.
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        }
      >
        <UsersClient initialUsers={users} roles={roles} />
      </Suspense>
    </main>
  );
}
