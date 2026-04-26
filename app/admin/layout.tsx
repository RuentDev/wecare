import { Sidebar } from "@/components/admin/sidebar";
import { DashboardHeader } from "@/components/admin/dashboard-header";

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: {
    default: "WeCare | Dashboard",
    template: "WeCare Admin",
  },
  description: "WeCare clinic administration dashboard",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  if (user.role !== "admin" && user.role !== "staff") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        <DashboardHeader />
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
