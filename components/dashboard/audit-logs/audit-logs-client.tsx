"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  History, 
  User, 
  Activity,
  ArrowRight,
  ExternalLink,
  Lock,
  Eye,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AuditLogsClientProps {
  data: any[];
}

export function AuditLogsClient({ data }: AuditLogsClientProps) {
  return (
    <div className="space-y-8 animate-in-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Security & Audit Logs</h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black h-6">VERIFIED</Badge>
          </div>
          <p className="text-slate-500 font-medium">Transparency into medical record changes and clinical activity.</p>
        </div>
        <Button variant="outline" className="rounded-xl border-slate-200 font-bold gap-2">
          <Lock className="w-4 h-4" /> Compliance Report
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[32px]">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
           <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <History className="w-5 h-5 text-primary" /> Activity Stream
              </CardTitle>
              <div className="flex items-center gap-3 w-full md:w-auto">
                 <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Filter by action or user..." 
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-sm focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                 </div>
                 <Button variant="outline" size="icon" className="rounded-xl border-slate-100 bg-white">
                   <Filter className="w-4 h-4" />
                 </Button>
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Table / Entity</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="px-8 py-20 text-center">
                        <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">No activity logs recorded yet.</p>
                     </td>
                   </tr>
                ) : (
                  data.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{format(new Date(log.created_at), "HH:mm:ss")}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{format(new Date(log.created_at), "MMM dd, yyyy")}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {log.users?.first_name[0]}{log.users?.last_name[0]}
                          </div>
                          <span className="text-sm font-bold text-slate-700">{log.users?.first_name} {log.users?.last_name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <Badge className={cn(
                          "font-black text-[9px] uppercase tracking-widest px-2 py-0.5",
                          log.action === "CREATE" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          log.action === "UPDATE" ? "bg-blue-50 text-blue-700 border-blue-100" :
                          "bg-red-50 text-red-700 border-red-100"
                        )}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                           <code className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">{log.table_name}</code>
                           <span className="text-[10px] font-bold text-slate-400 italic">ID: {log.record_id.slice(-6)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-right">
                        <Button variant="ghost" size="sm" className="rounded-xl font-bold text-primary group-hover:bg-primary/5">
                           View JSON <Eye className="w-3.5 h-3.5 ml-2" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
