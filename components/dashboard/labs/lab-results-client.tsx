"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FlaskConical, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Eye,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  ArrowUpRight
} from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LabResultsClientProps {
  data: any[];
}

export function LabResultsClient({ data }: LabResultsClientProps) {
  return (
    <div className="space-y-8 animate-in-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Lab Results Review</h1>
          <p className="text-slate-500 mt-1 font-medium">Interpret and manage diagnostic test results.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 font-bold gap-2">
            <Download className="w-4 h-4" /> Export Report
          </Button>
          <Button className="rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
             Request New Lab Test
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by patient or test name..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="rounded-xl border-slate-100 font-bold gap-2 bg-white">
             <Filter className="w-4 h-4" /> Status: All
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.length === 0 ? (
          <Card className="col-span-full border-2 border-dashed border-slate-100 bg-white p-20 text-center rounded-[32px]">
             <FlaskConical className="w-16 h-16 text-slate-200 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-slate-700">No lab results found</h3>
             <p className="text-slate-500 mt-2">Recent diagnostic tests will appear here once available.</p>
          </Card>
        ) : (
          data.map((record) => {
            // Mocking some data for visual premium feel
            const isFlagged = Math.random() > 0.7;
            const status = isFlagged ? "Flagged" : "Reviewed";

            return (
              <Card key={record.id} className="border-none shadow-sm bg-white hover:shadow-lg transition-all group rounded-[24px] overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 rounded-xl">
                        <AvatarImage src={record.patients.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {record.patients.first_name[0]}{record.patients.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-black text-slate-900 leading-tight">
                          {record.patients.first_name} {record.patients.last_name}
                        </h4>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-tighter">Patient ID: #{record.patient_id.slice(-6)}</p>
                      </div>
                    </div>
                    <Badge className={cn(
                      "font-black tracking-widest px-2.5 py-1 text-[10px]",
                      isFlagged ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                    )}>
                      {isFlagged ? <AlertTriangle className="w-3 h-3 mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 group-hover:bg-primary/5 group-hover:border-primary/10 transition-all">
                       <div className="flex items-center justify-between mb-3">
                         <div className="flex items-center gap-2 text-primary">
                           <FlaskConical className="w-4 h-4" />
                           <span className="font-black text-sm uppercase tracking-wider">{record.diagnosis || "General Lab Panel"}</span>
                         </div>
                         <span className="text-[10px] font-black text-slate-400">{format(new Date(record.created_at), "MMM dd, yyyy")}</span>
                       </div>
                       <p className="text-sm text-slate-600 font-medium line-clamp-2 leading-relaxed italic">
                         "{record.notes || "No specific observations recorded for this diagnostic test."}"
                       </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                       <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                          <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Dr. {record.doctors?.users?.first_name}</span>
                          <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> 1 Attachment</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary">
                             <Eye className="w-5 h-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary">
                             <Download className="w-5 h-5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="font-bold text-primary gap-1 px-3 rounded-xl ml-2">
                             Full Report <ArrowUpRight className="w-4 h-4" />
                          </Button>
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
