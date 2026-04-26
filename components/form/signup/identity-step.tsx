"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { User, CheckCircle } from "lucide-react";

interface Props {
  fields?: Record<string, string>;
}

export function IdentityStep({ fields }: Props) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-sm font-bold text-neutral-dark flex items-center gap-2 ml-1">
            <User className="w-4 h-4 text-primary" />
            First Name
          </label>
          <Input
            name="first_name"
            defaultValue={fields?.first_name}
            placeholder="John"
            className="h-12 rounded-[16px] border-neutral-gray/20 focus:ring-primary/20 transition-all bg-white/50"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-neutral-dark flex items-center gap-2 ml-1">
            <User className="w-4 h-4 text-primary" />
            Last Name
          </label>
          <Input
            name="last_name"
            defaultValue={fields?.last_name}
            placeholder="Doe"
            className="h-12 rounded-[16px] border-neutral-gray/20 focus:ring-primary/20 transition-all bg-white/50"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-sm font-bold text-neutral-dark flex items-center gap-2 ml-1">
            <User className="w-4 h-4 text-primary" />
            Gender
          </label>
          <select
            name="gender"
            defaultValue={fields?.gender}
            className="w-full rounded-[16px] border-neutral-gray/20 focus:border-primary focus:ring-4 focus:ring-primary/10 h-12 bg-white/50 px-4 text-sm font-medium transition-all outline-hidden appearance-none cursor-pointer"
            required
          >
            <option value="" disabled>Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-neutral-dark flex items-center gap-2 ml-1">
            <CheckCircle className="w-4 h-4 text-primary" />
            Birthday
          </label>
          <Input
            type="date"
            name="date_of_birth"
            defaultValue={fields?.date_of_birth}
            className="h-12 rounded-[16px] border-neutral-gray/20 focus:ring-primary/20 transition-all bg-white/50"
            required
          />
        </div>
      </div>
    </div>
  );
}
