"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  };

  const fillDemoPatient = () => {
    setEmail("patient@example.com");
    setPassword("password123");
  };

  const fillDemoAdmin = () => {
    setEmail("admin@example.com");
    setPassword("admin123");
  };

  return (
    <>
      <main className="min-h-screen bg-neutral-light py-12 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md rounded-[12px] shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-dark mb-2">
              Welcome to WeCare
            </h1>
            <p className="text-neutral-gray">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[12px] text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="rounded-[12px] border-neutral-gray"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-900 text-white font-semibold py-3 rounded-[12px] transition-colors disabled:bg-neutral-gray"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-neutral-gray space-y-2">
            <p className="text-xs text-neutral-gray font-medium">
              Demo Credentials:
            </p>
            <button
              type="button"
              onClick={fillDemoPatient}
              className="w-full text-left p-3 bg-neutral-light hover:bg-blue-50 text-sm text-neutral-dark rounded-[12px] transition-colors"
            >
              <p className="font-medium">Patient Account</p>
              <p className="text-xs text-neutral-gray">patient@example.com</p>
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="w-full text-left p-3 bg-neutral-light hover:bg-blue-50 text-sm text-neutral-dark rounded-[12px] transition-colors"
            >
              <p className="font-medium">Admin Account</p>
              <p className="text-xs text-neutral-gray">admin@example.com</p>
            </button>
          </div>
        </Card>
      </main>
    </>
  );
}
