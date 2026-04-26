"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { adminSignup } from "@/lib/actions/auth";
import { type SignupState } from "@/lib/validations/auth";
import {
  CheckCircle,
  ArrowRight,
  LogIn,
  Home,
  Loader2,
  Mail,
  User,
  Lock,
} from "lucide-react";

const initialState: SignupState = {};

export function AdminSignupForm() {
  const [state, formAction, isPending] = useActionState(adminSignup, initialState);

  if (state.success) return <SuccessView />;

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <ErrorMessage message={state.error} />}

      <div className="space-y-4">
        {/* Username Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-dark flex items-center gap-2">
            <User size={14} className="text-primary" />
            Username
          </label>
          <div className="relative group">
            <input
              name="username"
              type="text"
              defaultValue={state.fields?.username}
              placeholder="admin_root"
              className="w-full h-12 bg-neutral-gray/5 border border-neutral-gray/10 rounded-[16px] px-4 outline-hidden focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium text-neutral-dark placeholder:text-neutral-gray/50"
              required
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-dark flex items-center gap-2">
            <Mail size={14} className="text-primary" />
            Email Address
          </label>
          <div className="relative group">
            <input
              name="email"
              type="email"
              defaultValue={state.fields?.email}
              placeholder="admin@wecare.com"
              className="w-full h-12 bg-neutral-gray/5 border border-neutral-gray/10 rounded-[16px] px-4 outline-hidden focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium text-neutral-dark placeholder:text-neutral-gray/50"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-dark flex items-center gap-2">
            <Lock size={14} className="text-primary" />
            Password
          </label>
          <div className="relative group">
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full h-12 bg-neutral-gray/5 border border-neutral-gray/10 rounded-[16px] px-4 outline-hidden focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium text-neutral-dark placeholder:text-neutral-gray/50"
              required
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-[20px] shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 text-lg flex items-center justify-center gap-3"
        >
          {isPending ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              Initialize Admin Account
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>

      <div className="text-center pt-2">
        <p className="text-neutral-gray font-medium text-sm">
          Already initialized?{" "}
          <Link
            href="/login"
            className="text-primary font-bold hover:underline inline-flex items-center gap-1"
          >
            <LogIn className="w-4 h-4" /> Sign In
          </Link>
        </p>
      </div>
    </form>
  );
}

function SuccessView() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      router.push("/login");
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500 py-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-inner border border-green-100">
          <CheckCircle className="w-12 h-12 animate-bounce" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-neutral-dark">
            Admin Created!
          </h2>
          <p className="text-neutral-gray font-medium">
            System initialization successful. Redirecting to login in {countdown}s...
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          asChild
          className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-[20px] shadow-xl shadow-primary/20 text-lg group"
        >
          <Link href="/login" className="flex items-center justify-center gap-2">
            <LogIn className="w-5 h-5" /> Sign In Now{" "}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>

        <div className="flex items-center justify-center gap-2 text-neutral-gray text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Automatic redirect in progress</span>
        </div>
      </div>
    </div>
  );
}

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-red-50 border border-red-100 text-red-700 px-5 py-3 rounded-[16px] text-sm font-medium animate-in fade-in zoom-in">
    {message}
  </div>
);
