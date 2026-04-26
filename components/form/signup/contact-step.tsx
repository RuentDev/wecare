"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Phone, MapPin } from "lucide-react";

interface Props {
  fields?: Record<string, string>;
}

export function ContactStep({ fields }: Props) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <label className="text-sm font-bold text-neutral-dark flex items-center gap-2 ml-1">
          <Phone className="w-4 h-4 text-primary" />
          Phone Number
        </label>
        <Input
          type="tel"
          name="phone"
          defaultValue={fields?.phone}
          placeholder="+1 (555) 000-0000"
          className="h-12 rounded-[16px] border-neutral-gray/20 focus:ring-primary/20 transition-all bg-white/50"
        />
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-neutral-dark">Address Details</h3>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-dark ml-1">Street Address</label>
          <Input
            name="street"
            defaultValue={fields?.street}
            placeholder="123 Main St"
            className="h-12 rounded-[16px] border-neutral-gray/20 focus:ring-primary/20 transition-all bg-white/50"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-dark ml-1">City</label>
            <Input
              name="city"
              defaultValue={fields?.city}
              placeholder="Los Angeles"
              className="h-12 rounded-[16px] border-neutral-gray/20 focus:ring-primary/20 transition-all bg-white/50"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-dark ml-1">State</label>
            <Input
              name="state"
              defaultValue={fields?.state}
              placeholder="CA"
              className="h-12 rounded-[16px] border-neutral-gray/20 focus:ring-primary/20 transition-all bg-white/50"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-dark ml-1">Postal Code</label>
          <Input
            name="postal_code"
            defaultValue={fields?.postal_code}
            placeholder="90001"
            className="h-12 rounded-[16px] border-neutral-gray/20 focus:ring-primary/20 transition-all bg-white/50"
            required
          />
        </div>
      </div>
    </div>
  );
}
