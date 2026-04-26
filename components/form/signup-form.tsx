"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signup } from "@/lib/actions/auth";
import { type SignupState } from "@/lib/validations/auth";
import { User, Lock, Mail, Phone, CheckCircle, ArrowRight } from "lucide-react";

const initialState: SignupState = {};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  if (state.success) {
    return (
      <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-neutral-dark">Account Created!</h2>
            <p className="text-neutral-gray text-lg">
              Welcome to WeCare. Your healthcare journey starts here.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button asChild className="w-full bg-primary hover:bg-blue-900 text-white font-bold py-6 rounded-2xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 text-lg group">
            <Link href="/" className="flex items-center justify-center gap-2">
              Go to Home Page
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          
          <p className="text-neutral-gray">
            Prefer to sign in manually?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="bg-red-50/50 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm animate-in fade-in slide-in-from-top-1">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-dark flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            First Name
          </label>
          <Input
            name="first_name"
            defaultValue={state.fields?.first_name}
            placeholder="John"
            className="rounded-xl border-neutral-gray/20 focus:ring-primary h-12 bg-white/50"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-dark flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Last Name
          </label>
          <Input
            name="last_name"
            defaultValue={state.fields?.last_name}
            placeholder="Doe"
            className="rounded-xl border-neutral-gray/20 focus:ring-primary h-12 bg-white/50"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-neutral-dark flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" />
          Email Address
        </label>
        <Input
          type="email"
          name="email"
          defaultValue={state.fields?.email}
          placeholder="john@example.com"
          className="rounded-xl border-neutral-gray/20 focus:ring-primary h-12 bg-white/50"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-neutral-dark flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" />
          Phone Number (Optional)
        </label>
        <Input
          type="tel"
          name="phone"
          defaultValue={state.fields?.phone}
          placeholder="+1 (555) 000-0000"
          className="rounded-xl border-neutral-gray/20 focus:ring-primary h-12 bg-white/50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-dark flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Password
          </label>
          <Input
            type="password"
            name="password"
            placeholder="••••••••"
            className="rounded-xl border-neutral-gray/20 focus:ring-primary h-12 bg-white/50"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-dark flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Confirm Password
          </label>
          <Input
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            className="rounded-xl border-neutral-gray/20 focus:ring-primary h-12 bg-white/50"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary hover:bg-blue-900 text-white font-bold py-6 rounded-2xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating account...
          </span>
        ) : (
          "Sign Up"
        )}
      </Button>

      <div className="mt-8 text-center">
        <p className="text-neutral-gray">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
}
