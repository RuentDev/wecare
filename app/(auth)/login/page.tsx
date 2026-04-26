import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/form/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/login-bg.png')" }}
      >
        <div className="absolute inset-0 bg-linear-to-br from-white/80 via-white/40 to-primary/20 backdrop-blur-[2px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-neutral-dark hover:text-primary transition-colors text-sm font-semibold mb-6 group bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-sm"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Homepage
        </Link>
        
        <div className="bg-white/90 backdrop-blur-md rounded-[24px] shadow-2xl border border-white/20 overflow-hidden">
          <LoginForm />
        </div>
      </div>
      
      {/* Footer info */}
      <p className="relative z-10 mt-8 text-sm text-neutral-gray font-medium">
        © {new Date().getFullYear()} WeCare Medical Clinic. All rights reserved.
      </p>
    </main>
  );
}
