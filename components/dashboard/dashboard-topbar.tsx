"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, User, Menu, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardTopBar({ user }: { user: any }) {
  const pathname = usePathname();

  // Simple breadcrumb logic
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumb = pathSegments.map((segment, index) => {
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    return { label, href: "/" + pathSegments.slice(0, index + 1).join("/") };
  });

  return (
    <header className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500">
          {breadcrumb.map((item, index) => (
            <div key={item.href} className="flex items-center gap-2">
              {index > 0 && <span className="text-slate-300">/</span>}
              <span className={index === breadcrumb.length - 1 ? "text-slate-900 font-bold" : ""}>
                {item.label}
              </span>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Quick search..." 
            className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>

        <div className="h-8 w-px bg-slate-100 mx-1"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="pl-1 pr-2 gap-2 h-10 rounded-xl hover:bg-slate-50 transition-all">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-[10px] text-slate-500 capitalize leading-tight">
                  {user.role}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-100 shadow-xl shadow-slate-200/50">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg gap-2">
              <User className="w-4 h-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg gap-2">
              <Settings className="w-4 h-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg gap-2 text-red-500 focus:text-red-500 focus:bg-red-50">
              <LogOut className="w-4 h-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
