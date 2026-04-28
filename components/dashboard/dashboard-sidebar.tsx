"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FlaskConical, 
  MessageSquare, 
  ShieldCheck, 
  BarChart3, 
  Activity,
  User,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  label: string;
  href: string;
  icon: any;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  // Doctor Routes
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["doctor"] },
  { label: "Schedule", href: "/dashboard/schedule", icon: Calendar, roles: ["doctor"] },
  { label: "Patients", href: "/dashboard/patients", icon: Users, roles: ["doctor"] },
  { label: "Lab Results", href: "/dashboard/labs", icon: FlaskConical, roles: ["doctor"] },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare, roles: ["doctor", "patient"] },
  { label: "Audit Logs", href: "/dashboard/audit-logs", icon: ShieldCheck, roles: ["doctor"] },
  { label: "Reports", href: "/dashboard/reports", icon: BarChart3, roles: ["doctor"] },
  { label: "Health Metrics", href: "/dashboard/metrics", icon: Activity, roles: ["doctor"] },
  
  // Patient Routes
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["patient"] },
  { label: "Appointments", href: "/dashboard/appointments", icon: Calendar, roles: ["patient"] },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard, roles: ["patient"] },
  { label: "Services", href: "/dashboard/services", icon: Settings, roles: ["patient"] },
  { label: "Profile", href: "/dashboard/profile", icon: User, roles: ["patient", "doctor"] },
];

export function DashboardSidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredItems = sidebarItems.filter(item => item.roles.includes(userRole));

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-50 flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl tracking-tight text-slate-800">WeCare</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary font-bold" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 shrink-0",
                isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Toggle */}
      <div className="p-4 border-t border-slate-100 space-y-1 shrink-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 transition-all"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!isCollapsed && <span>Collapse Sidebar</span>}
        </button>
        
        <Link
          href="/api/auth/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </Link>
      </div>
    </aside>
  );
}
