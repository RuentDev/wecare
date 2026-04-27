"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/actions/auth";
import { type LoginState } from "@/lib/validations/auth";
import { useApp } from "@/contexts/app-context";
import Logo from "@/components/header/logo";
import { UserPlus } from "lucide-react";

const initialState: LoginState = {};

export function LoginForm() {
  const router = useRouter();
  const { setUser } = useApp();
  const [state, formAction, isPending] = useActionState(login, initialState);

  useEffect(() => {
    if (state.success) {
      if (state.user) {
        setUser(state.user);

        // Role-based redirection
        if (
          state.user.role === "admin" ||
          state.user.role === "staff" ||
          state.user.role === "nurse" ||
          state.user.role === "doctor"
        ) {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        // Fallback if user object is missing for some reason
        router.push("/dashboard");
      }
      router.refresh();
    }
  }, [state.success, state.user, router, setUser]);

  return (
    <div className="w-full p-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h1 className="text-3xl font-bold text-neutral-dark mb-2 tracking-tight">
          Welcome to WeCare
        </h1>
        <p className="text-neutral-gray font-medium">
          Sign in to your professional portal
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        {state.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[16px] text-sm font-medium animate-in fade-in zoom-in duration-300">
            {state.error}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-neutral-dark ml-1">
            Email Address
          </label>
          <Input
            name="email"
            type="email"
            placeholder="Enter your email"
            className="h-12 rounded-[16px] border-neutral-gray/20 focus:ring-primary/20 transition-all bg-white/50"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-neutral-dark ml-1">
            Password
          </label>
          <Input
            name="password"
            type="password"
            placeholder="Enter your password"
            className="h-12 rounded-[16px] border-neutral-gray/20 focus:ring-primary/20 transition-all bg-white/50"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-base rounded-[16px] shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:bg-neutral-gray/50 disabled:shadow-none"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-neutral-gray font-medium text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary font-bold hover:underline inline-flex items-center gap-1"
          >
            <UserPlus className="w-4 h-4" /> Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
