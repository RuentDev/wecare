import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/form/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-neutral-light py-12 px-4 flex flex-col items-center justify-center gap-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-neutral-gray hover:text-primary transition-colors text-sm font-medium mb-2 group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Homepage
        </Link>
        <LoginForm />
      </div>
    </main>
  );
}
