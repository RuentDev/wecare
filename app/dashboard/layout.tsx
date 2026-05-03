import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopBar } from "@/components/dashboard/dashboard-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

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
    <SidebarProvider>
      <DashboardSidebar userRole={user.role} />
      <SidebarInset className="bg-slate-50/50">
        <DashboardTopBar user={user} />
        <main className="p-5">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
