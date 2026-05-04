"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CreditCard, User, HeartPulse } from "lucide-react";

interface InsuranceDetailsProps {
  insurance: any;
}

export function InsuranceDetails({ insurance }: InsuranceDetailsProps) {
  if (!insurance) {
    return (
      <Card className="border-none shadow-xl bg-white rounded-[32px] p-12 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">No Insurance Records</h3>
        <p className="text-slate-500 font-bold max-w-xs mx-auto">There are no insurance or identification numbers recorded for this patient.</p>
      </Card>
    );
  }

  const sections = [
    {
      title: "Government Identification",
      icon: <User className="w-5 h-5 text-blue-500" />,
      items: [
        { label: "PhilHealth Number", value: insurance.philhealth_number },
        { label: "PWD ID Number", value: insurance.pwd_number },
        { label: "Senior Citizen ID", value: insurance.senior_citizen_number },
      ]
    },
    {
      title: "Health Maintenance Organization (HMO)",
      icon: <HeartPulse className="w-5 h-5 text-emerald-500" />,
      items: [
        { label: "Provider", value: insurance.hmo_provider },
        { label: "Policy / Member ID", value: insurance.hmo_number },
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {sections.map((section, idx) => (
        <Card key={idx} className="border-none shadow-lg bg-white rounded-[32px] overflow-hidden">
          <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                {section.icon}
              </div>
              <CardTitle className="text-lg font-black text-slate-900">{section.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {section.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between group">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                <span className="text-lg font-black text-slate-900 bg-slate-50 px-4 py-2 rounded-xl group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                  {item.value || "Not provided"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
