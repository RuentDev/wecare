import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopBar } from "@/components/dashboard/dashboard-topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  // Ensure role-based access - only doctors and patients should be here
  // Admin/Staff should generally use the /admin portal, but we'll allow them here for testing
  if (user.role === "admin" || user.role === "staff") {
    // Optionally redirect admins to /admin, but let's keep it flexible for now
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <DashboardSidebar userRole={user.role} />
      <div className="transition-all duration-300 lg:pl-64">
        <DashboardTopBar user={user} />
        <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
