"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Stethoscope, 
  FileText, 
  Pill, 
  Calendar,
  User,
  ChevronDown,
  Paperclip
} from "lucide-react";
import { format } from "date-fns";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MedicalHistoryTimelineProps {
  history: any[];
}

export function MedicalHistoryTimeline({ history }: MedicalHistoryTimelineProps) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[32px]">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" /> Medical History Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {history.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">No previous medical records found.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {history.map((record, index) => (
              <AccordionItem 
                key={record.id} 
                value={record.id} 
                className="border-b border-slate-100 last:border-none"
              >
                <AccordionTrigger className="hover:no-underline hover:bg-slate-50/50 transition-colors p-6">
                  <div className="flex items-start gap-6 text-left w-full">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary group-data-[state=open]:bg-primary group-data-[state=open]:text-white transition-colors">
                        <Calendar className="w-5 h-5" />
                      </div>
                      {index !== history.length - 1 && (
                        <div className="w-0.5 h-12 bg-slate-100 mt-2"></div>
                      )}
                    </div>
                    
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between pr-4">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">
                          {format(new Date(record.created_at), "MMMM dd, yyyy")}
                        </p>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold text-[10px]">
                           {record.appointments?.services?.name || "Consultation"}
                        </Badge>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 leading-tight">
                        {record.diagnosis || "General Consultation"}
                      </h4>
                      <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Dr. {record.doctors?.users?.first_name} {record.doctors?.users?.last_name}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-8 ml-16">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <FileText className="w-3 h-3" /> Clinical Notes
                          </p>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            {record.notes || "No additional notes provided."}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <Stethoscope className="w-3 h-3" /> Treatment
                          </p>
                          <p className="text-sm text-slate-700 font-bold leading-relaxed">
                            {record.treatment || "No treatment recorded."}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <Pill className="w-3 h-3" /> Prescription
                          </p>
                          <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl">
                             <p className="text-sm text-primary font-black leading-relaxed italic">
                                {record.prescription || "No prescription issued."}
                             </p>
                          </div>
                        </div>
                        
                        {record.attachments && (
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                               <Paperclip className="w-3 h-3" /> Attachments
                            </p>
                            <div className="flex gap-2">
                               <Badge variant="outline" className="rounded-lg border-slate-200 bg-white font-bold gap-2 py-1.5 px-3">
                                 Lab_Result_280426.pdf <ChevronDown className="w-3 h-3 opacity-50" />
                               </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                   </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
