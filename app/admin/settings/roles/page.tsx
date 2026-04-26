import { getRoles, getPermissions } from "@/lib/actions/rbac";
import { RolesClient } from "@/components/admin/settings/roles-client";
import { Suspense } from "react";
import { RolesLoading } from "@/components/admin/settings/roles-loading";

// Force dynamic rendering to ensure data freshness and security
export const dynamic = "force-dynamic";

export default async function RolesAndPermissionsPage() {
  // Fetch data directly on the server
  // This will happen before the HTML is sent to the client
  const [roles, permissions] = await Promise.all([
    getRoles(),
    getPermissions(),
  ]);

  return (
    <Suspense fallback={<RolesLoading />}>
      <RolesClient initialRoles={roles} initialPermissions={permissions} />
    </Suspense>
  );
}
