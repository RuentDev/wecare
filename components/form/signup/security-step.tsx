"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Mail, Lock } from "lucide-react";

interface Props {
  fields?: Record<string, string>;
}

export function SecurityStep({ fields }: Props) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <label className="text-sm font-bold text-neutral-dark flex items-center gap-2 ml-1">
          <Mail className="w-4 h-4 text-primary" />
          Email Address
        </label>
        <Input
          type="email"
          name="email"
          defaultValue={fields?.email}
          placeholder="john@example.com"
          className="h-12 rounded-[16px] border-neutral-gray/20 focus:ring-primary/20 transition-all bg-white/50"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-neutral-dark flex items-center gap-2 ml-1">
          <Lock className="w-4 h-4 text-primary" />
          Password
        </label>
        <Input
          type="password"
          name="password"
          placeholder="••••••••"
          className="h-12 rounded-[16px] border-neutral-gray/20 focus:ring-primary/20 transition-all bg-white/50"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-neutral-dark flex items-center gap-2 ml-1">
          <Lock className="w-4 h-4 text-primary" />
          Confirm Password
        </label>
        <Input
          type="password"
          name="confirmPassword"
          placeholder="••••••••"
          className="h-12 rounded-[16px] border-neutral-gray/20 focus:ring-primary/20 transition-all bg-white/50"
          required
        />
      </div>
    </div>
  );
}
