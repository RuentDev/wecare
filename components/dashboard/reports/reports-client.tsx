"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Download, 
  Calendar,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Printer,
  Eye,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

interface ReportsClientProps {
  invoices: any[];
  stats: any;
}

export function ReportsClient({ invoices, stats }: ReportsClientProps) {
  const totalRevenue = invoices.reduce((acc, inv) => acc + Number(inv.amount), 0);
  const pendingRevenue = invoices.filter(inv => inv.status === "unpaid").reduce((acc, inv) => acc + Number(inv.amount), 0);

  return (
    <div className="space-y-8 animate-in-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clinical Performance & Billing</h1>
          <p className="text-slate-500 mt-1 font-medium">Analyze your clinical volume and financial metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 font-bold gap-2">
            <Download className="w-4 h-4" /> Download Q4 Report
          </Button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110">
                <DollarSign className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 border-emerald-100 font-black">+12.5%</Badge>
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Total Revenue</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">${totalRevenue.toLocaleString()}</h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110">
                <Clock className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="bg-amber-50/50 text-amber-700 border-amber-100 font-black">Action</Badge>
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Pending Invoices</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">${pendingRevenue.toLocaleString()}</h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110">
                <Users className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-100 font-black">Monthly</Badge>
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Patients Seen</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.thisMonth}</h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary text-white overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute -right-4 -top-4 opacity-10">
               <TrendingUp className="w-24 h-24" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center transition-transform group-hover:scale-110">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-bold text-primary-foreground/70 uppercase tracking-tight">Completion Rate</p>
            <h3 className="text-3xl font-black text-white mt-1">94.2%</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient Volume Chart */}
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[32px] lg:col-span-2">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Patient Volume Trend
              </CardTitle>
              <p className="text-sm text-slate-500 font-medium mt-1">Daily appointment counts for the last 7 days.</p>
            </div>
            <Button variant="outline" className="rounded-xl border-slate-200 font-bold h-10 px-4">Last 30 Days</Button>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trend}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#0ea5e9" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[32px]">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Recent Billing</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5 rounded-lg">View All</Button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
             {invoices.length === 0 ? (
                <p className="text-sm text-slate-400 font-medium text-center py-8">No recent invoices.</p>
             ) : (
               invoices.slice(0, 5).map((inv) => (
                 <div key={inv.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                          <FileText className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-800 leading-tight">{inv.patient.first_name} {inv.patient.last_name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Invoice #{inv.id.slice(-6)}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-slate-900">${Number(inv.amount).toLocaleString()}</p>
                       <Badge className={cn(
                         "text-[8px] font-black uppercase tracking-tighter mt-1",
                         inv.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                       )}>
                         {inv.status}
                       </Badge>
                    </div>
                 </div>
               ))
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
