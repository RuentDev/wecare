import { UsersClient } from "@/components/admin/users/users-client";
import { getUsers, getRoles } from "@/lib/actions/rbac";
import { getCurrentUser } from "@/lib/auth";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export default async function UsersPage() {
  const [users, currentUser, roles] = await Promise.all([
    getUsers(), 
    getCurrentUser(),
    getRoles().catch(() => []) // Fallback to empty array if user lacks roles:manage permission
  ]);

  return (
    <main className="space-y-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        }
      >
        <UsersClient initialUsers={users} roles={roles} currentUserRole={currentUser?.role} />
      </Suspense>
    </main>
  );
}
