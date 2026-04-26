import Stats from "@/components/admin/stats";
import Appointments from "@/components/dashboard/appointments";

export default function AdminDashboardPage() {
  const date = new Date();
  return (
    <div className="space-y-6">
      <Stats />
      <Appointments date={date} />
    </div>
  );
}
