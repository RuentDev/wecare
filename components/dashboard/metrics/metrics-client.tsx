"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  TrendingUp, 
  Droplets, 
  Thermometer, 
  Scale, 
  Ruler, 
  Calendar,
  Filter,
  Download,
  ArrowUpRight,
  ChevronDown,
  BrainCircuit,
  Heart
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";
import { format } from "date-fns";

interface MetricsClientProps {
  data: any[];
}

export function MetricsClient({ data }: MetricsClientProps) {
  // Mock data for trends
  const trendData = [
    { name: 'Mon', bp: 120, temp: 36.6, weight: 70 },
    { name: 'Tue', bp: 122, temp: 36.8, weight: 70.2 },
    { name: 'Wed', bp: 118, temp: 36.5, weight: 69.8 },
    { name: 'Thu', bp: 121, temp: 36.7, weight: 70.1 },
    { name: 'Fri', bp: 125, temp: 37.1, weight: 70.5 },
    { name: 'Sat', bp: 119, temp: 36.6, weight: 70.2 },
    { name: 'Sun', bp: 120, temp: 36.5, weight: 70 },
  ];

  return (
    <div className="space-y-8 animate-in-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Health Metrics & Trends</h1>
          <p className="text-slate-500 mt-1 font-medium">Aggregated clinical data across your patient population.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 font-bold gap-2">
            <Filter className="w-4 h-4" /> Filter Patient Group
          </Button>
          <Button className="rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
             <Download className="w-4 h-4" /> Export Analytics
          </Button>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg. BP</p>
                <h3 className="text-2xl font-black text-slate-900">120/80</h3>
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-red-500 w-[70%]"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg. SpO2</p>
                <h3 className="text-2xl font-black text-slate-900">98%</h3>
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 w-[95%]"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Thermometer className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg. Temp</p>
                <h3 className="text-2xl font-black text-slate-900">36.7°C</h3>
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-amber-500 w-[65%]"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Health Score</p>
                <h3 className="text-2xl font-black text-slate-900">82/100</h3>
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 w-[82%]"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Blood Pressure Trend */}
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[32px]">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Droplets className="w-5 h-5 text-red-500" /> Systolic Trend
            </CardTitle>
            <Badge variant="outline" className="rounded-xl border-slate-200 font-bold px-3 py-1">Last 7 Days</Badge>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorBP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                    domain={[100, 140]}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bp" 
                    stroke="#ef4444" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorBP)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Temperature Trend */}
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[32px]">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-amber-500" /> Temperature Average
            </CardTitle>
            <Badge variant="outline" className="rounded-xl border-slate-200 font-bold px-3 py-1">Last 7 Days</Badge>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                    domain={[36, 38]}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                  />
                  <Bar 
                    dataKey="temp" 
                    fill="#f59e0b" 
                    radius={[10, 10, 0, 0]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Vitals Feed */}
      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[32px]">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Recent Vital Checks</CardTitle>
          <Button variant="ghost" className="font-bold text-primary gap-2">Export Data <ArrowUpRight className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="p-0">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-100">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">BP</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">HR</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Temp</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">SpO2</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {data.slice(0, 10).map((vit) => (
                     <tr key={vit.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4">
                           <span className="font-bold text-slate-900">{vit.patients?.first_name} {vit.patients?.last_name}</span>
                        </td>
                        <td className="px-8 py-4 text-center font-bold text-slate-700">{vit.blood_pressure || "--"}</td>
                        <td className="px-8 py-4 text-center font-bold text-slate-700">{vit.heart_rate || "--"}</td>
                        <td className="px-8 py-4 text-center font-bold text-slate-700">{vit.temperature || "--"}°C</td>
                        <td className="px-8 py-4 text-center">
                           <Badge className="bg-blue-50 text-blue-700 border-none font-bold">{vit.oxygen_saturation || "--"}%</Badge>
                        </td>
                        <td className="px-8 py-4 text-right">
                           <span className="text-xs font-bold text-slate-400 uppercase">{format(new Date(vit.created_at), "HH:mm")}</span>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
