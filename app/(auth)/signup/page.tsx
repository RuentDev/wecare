import { Card } from "@/components/ui/card";
import { UserCircle } from "lucide-react";
import { SignupForm } from "@/components/form/signup-form";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-blue-50 via-white to-blue-50 py-12 px-4 flex items-center justify-center">
      <div className="absolute inset-0 bg-grid-slate-100 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <Card className="w-full max-w-xl rounded-[24px] shadow-2xl border-white/40 bg-white/80 backdrop-blur-xl p-8 md:p-12 transition-all hover:shadow-primary/10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
            <UserCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-br from-neutral-dark to-primary bg-clip-text text-transparent mb-2">
            Create your Account
          </h1>
          <p className="text-neutral-gray text-lg">
            Join WeCare and start your healthcare journey
          </p>
        </div>

        <SignupForm />
      </Card>
    </main>
  );
}
