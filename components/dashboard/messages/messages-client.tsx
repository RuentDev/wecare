"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  MessageSquare, 
  Send, 
  MoreVertical, 
  User, 
  Clock,
  Phone,
  Video,
  Info,
  ShieldCheck,
  SearchIcon,
  Plus
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MessagesClientProps {
  initialLogs: any[];
  user: any;
}

export function MessagesClient({ initialLogs, user }: MessagesClientProps) {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  // Group logs by recipient/sender for mock conversation list
  const conversations = [
    { id: "1", name: "Sarah Johnson", lastMessage: "Thank you for the prescription, Dr.", time: "10:30 AM", unread: 2, avatar: "" },
    { id: "2", name: "Michael Chen", lastMessage: "When should I follow up?", time: "Yesterday", unread: 0, avatar: "" },
    { id: "3", name: "Emily Davis", lastMessage: "The lab results are attached.", time: "Monday", unread: 0, avatar: "" },
    { id: "4", name: "Clinic Staff", lastMessage: "Meeting at 2 PM today.", time: "11:15 AM", unread: 1, avatar: "" },
  ];

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col md:flex-row gap-6 animate-in-fade">
      {/* Sidebar - Conversation List */}
      <Card className="w-full md:w-80 lg:w-96 border-none shadow-sm bg-white overflow-hidden rounded-[32px] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
           <h2 className="text-xl font-black text-slate-900">Messages</h2>
           <Button variant="ghost" size="icon" className="rounded-xl text-primary hover:bg-primary/5">
             <Plus className="w-5 h-5" />
           </Button>
        </div>
        <div className="p-4 bg-slate-50/50 border-b border-slate-100">
           <div className="relative">
             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search conversations..." 
               className="w-full pl-9 pr-4 py-2 bg-white border-none rounded-xl text-sm focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
             />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group",
                selectedConversation?.id === conv.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "hover:bg-slate-50 text-slate-700"
              )}
            >
              <Avatar className="h-12 w-12 rounded-xl border-2 border-white shadow-sm">
                <AvatarFallback className={cn(
                  "font-bold",
                  selectedConversation?.id === conv.id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                )}>
                  {conv.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-sm truncate">{conv.name}</span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-tighter",
                    selectedConversation?.id === conv.id ? "text-white/60" : "text-slate-400"
                  )}>{conv.time}</span>
                </div>
                <p className={cn(
                  "text-xs font-medium truncate",
                  selectedConversation?.id === conv.id ? "text-white/80" : "text-slate-500"
                )}>
                  {conv.lastMessage}
                </p>
              </div>
              {conv.unread > 0 && selectedConversation?.id !== conv.id && (
                <div className="w-5 h-5 bg-primary rounded-lg flex items-center justify-center">
                   <span className="text-[10px] font-black text-white">{conv.unread}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 border-none shadow-sm bg-white overflow-hidden rounded-[32px] flex flex-col">
        {!selectedConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
            <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center mb-6 shadow-sm border border-slate-100">
               <MessageSquare className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Select a conversation</h3>
            <p className="text-slate-500 mt-2 max-w-sm">
              Click on a patient or staff member from the left panel to start secure HIPAA-compliant messaging.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                 <Avatar className="h-12 w-12 rounded-xl">
                   <AvatarFallback className="bg-primary/10 text-primary font-black">{selectedConversation.name[0]}</AvatarFallback>
                 </Avatar>
                 <div>
                   <h4 className="font-black text-slate-900 leading-tight">{selectedConversation.name}</h4>
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      Online
                   </div>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-primary hover:bg-slate-50 h-10 w-10">
                   <Phone className="w-5 h-5" />
                 </Button>
                 <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-primary hover:bg-slate-50 h-10 w-10">
                   <Video className="w-5 h-5" />
                 </Button>
                 <div className="h-6 w-px bg-slate-100 mx-1"></div>
                 <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-primary hover:bg-slate-50 h-10 w-10">
                   <Info className="w-5 h-5" />
                 </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
               <div className="flex flex-col gap-2 max-w-[70%]">
                 <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                      Hello Doctor, I've been feeling a bit of chest pain since this morning. Should I be concerned?
                    </p>
                 </div>
                 <span className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-widest">10:28 AM</span>
               </div>

               <div className="flex flex-col items-end gap-2 max-w-[70%] ml-auto">
                 <div className="bg-primary p-4 rounded-2xl rounded-tr-none shadow-lg shadow-primary/20">
                    <p className="text-sm font-bold text-white leading-relaxed">
                      Please monitor your blood pressure and avoid strenuous activity. Are you experiencing any dizziness?
                    </p>
                 </div>
                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 px-1 uppercase tracking-widest">
                   10:30 AM <ShieldCheck className="w-3 h-3 text-emerald-500" />
                 </div>
               </div>

               <div className="flex flex-col gap-2 max-w-[70%]">
                 <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                      No dizziness, just a dull ache. I've taken the vitals as you suggested.
                    </p>
                 </div>
                 <span className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-widest">10:32 AM</span>
               </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 md:p-6 border-t border-slate-100 shrink-0">
               <div className="bg-slate-50 rounded-[24px] p-2 flex items-center gap-2 border border-slate-100 shadow-inner">
                  <input 
                    type="text" 
                    placeholder="Type a secure message..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 px-4 font-medium text-slate-700 placeholder:text-slate-400"
                  />
                  <Button className="rounded-2xl w-12 h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center justify-center p-0 transition-all active:scale-90">
                     <Send className="w-5 h-5 text-white" />
                  </Button>
               </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
