"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Trash2, 
  Plus, 
  ChevronDown,
  LayoutGrid
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ClinicalSectionProps {
  title: string;
  items: any[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: string, value: any) => void;
  type: "consultation" | "diagnosis" | "medication";
}

export function ClinicalSection({ 
  title, 
  items, 
  onAdd, 
  onRemove, 
  onUpdate,
  type
}: ClinicalSectionProps) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-xl font-black text-slate-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-2 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            className="pl-11 h-12 bg-slate-50/50 border-none rounded-xl font-medium text-slate-600 focus-visible:ring-1 focus-visible:ring-primary/20" 
            placeholder="Search"
          />
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-4 group">
              <span className="text-sm font-bold text-slate-500 min-w-[24px]">
                {index + 1}.
              </span>
              
              <div className="flex-1 flex flex-wrap md:flex-nowrap items-center gap-3">
                <Input 
                  value={item.name}
                  onChange={(e) => onUpdate(index, "name", e.target.value)}
                  className="flex-[1.5] h-12 bg-slate-50/30 border-none rounded-xl font-bold text-slate-700"
                  placeholder={type === "medication" ? "Medication Name" : "Condition/Reason"}
                />

                {type !== "medication" ? (
                  <>
                    <Select 
                      value={item.type} 
                      onValueChange={(val) => onUpdate(index, "type", val)}
                    >
                      <SelectTrigger className="flex-1 h-12 bg-slate-50/30 border-none rounded-xl font-bold text-slate-400">
                        <SelectValue placeholder="Diagnosis Type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input 
                      value={item.details}
                      onChange={(e) => onUpdate(index, "details", e.target.value)}
                      className="flex-2 h-12 bg-slate-50/30 border-none rounded-xl font-medium text-slate-400"
                      placeholder="Details (Max 100 words)"
                    />
                  </>
                ) : (
                  <div className="flex flex-1 flex-wrap md:flex-nowrap gap-2">
                    <Select value={item.frequency} onValueChange={(val) => onUpdate(index, "frequency", val)}>
                      <SelectTrigger className="h-12 bg-slate-50/30 border-none rounded-xl font-bold text-slate-400 min-w-[120px]">
                        <SelectValue placeholder="Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="twice">Twice Daily</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1">
                      <Input 
                        className="w-16 h-12 bg-slate-50/30 border-none rounded-xl text-center font-bold text-slate-700" 
                        defaultValue="0"
                      />
                      <Select defaultValue="ml">
                        <SelectTrigger className="h-12 bg-slate-50/30 border-none rounded-xl font-bold text-slate-400 w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="mg">mg</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Select value={item.duration} onValueChange={(val) => onUpdate(index, "duration", val)}>
                      <SelectTrigger className="h-12 bg-slate-50/30 border-none rounded-xl font-bold text-slate-400 min-w-[120px]">
                        <SelectValue placeholder="Duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">7 Days</SelectItem>
                        <SelectItem value="14days">14 Days</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={item.instruction} onValueChange={(val) => onUpdate(index, "instruction", val)}>
                      <SelectTrigger className="h-12 bg-slate-50/30 border-none rounded-xl font-bold text-slate-400 min-w-[120px]">
                        <SelectValue placeholder="Instruction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="after-meal">After Meal</SelectItem>
                        <SelectItem value="before-meal">Before Meal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onRemove(index)}
                className="text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button 
          variant="outline" 
          onClick={onAdd}
          className="w-full mt-4 border-dashed border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </CardContent>
    </Card>
  );
}
