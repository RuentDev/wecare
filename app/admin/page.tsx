import { getAdminDashboardData } from "@/lib/actions/admin-dashboard";
import { DashboardLiveContainer } from "@/components/admin/dashboard/dashboard-live-container";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const initialData = await getAdminDashboardData();

  return (
    <main>
      <DashboardLiveContainer initialData={initialData} />
    </main>
  );
}
