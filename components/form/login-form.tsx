"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/actions/auth";
import { type LoginState } from "@/lib/validations/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(login, initialState);

  useEffect(() => {
    if (state.success) {
      router.push("/dashboard");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <Card className="w-full max-w-md rounded-[12px] shadow-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-neutral-dark mb-2">
          Welcome to WeCare
        </h1>
        <p className="text-neutral-gray">Sign in to your account</p>
      </div>

      <form action={formAction} className="space-y-4">
        {state.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[12px] text-sm">
            {state.error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-dark mb-2">
            Email Address
          </label>
          <Input
            name="email"
            type="email"
            placeholder="Enter your email"
            className="rounded-[12px] border-neutral-gray"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-dark mb-2">
            Password
          </label>
          <Input
            name="password"
            type="password"
            placeholder="Enter your password"
            className="rounded-[12px] border-neutral-gray"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary hover:bg-blue-900 text-white font-semibold py-3 rounded-[12px] transition-colors disabled:bg-neutral-gray"
        >
          {isPending ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </Card>
  );
}
