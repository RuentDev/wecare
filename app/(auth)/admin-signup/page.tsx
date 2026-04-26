import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma-db";
import { AdminSignupForm } from "@/components/form/admin-signup-form";
import Logo from "@/components/header/logo";
import { ShieldCheck } from "lucide-react";

export default async function AdminSignupPage() {
  // SECURITY CHECK: If any users exist, redirect to login
  const userCount = await prisma.users.count();
  if (userCount > 0) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden py-12">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 z-0 bg-[#F8FAFC]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -ml-64 -mb-64" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-neutral-gray/5 overflow-hidden p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Logo />
                <div className="absolute -top-2 -right-6 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <ShieldCheck size={10} />
                  SETUP
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-neutral-dark tracking-tight">System Initialization</h1>
            <p className="text-neutral-gray mt-2 font-medium">
              Create the master administrator account to get started.
            </p>
          </div>

          <AdminSignupForm />
        </div>

        <p className="text-center mt-8 text-sm text-neutral-gray font-medium">
          © {new Date().getFullYear()} WeCare Medical Clinic • Master Setup
        </p>
      </div>
    </main>
  );
}
