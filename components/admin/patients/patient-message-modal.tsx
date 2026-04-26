"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendPatientNotification } from "@/lib/actions/patients";
import { toast } from "sonner";
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  Bell, 
  Mail, 
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PatientMessageModalProps {
  patientId: string | null;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientMessageModal({ 
  patientId, 
  patientName,
  isOpen, 
  onClose 
}: PatientMessageModalProps) {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("general");
  const [loading, setLoading] = useState(false);

  async function handleSendMessage() {
    if (!subject || !content) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await sendPatientNotification({
        userId: patientId!,
        subject,
        content,
        type,
      });

      if (result.success) {
        toast.success("Message sent successfully");
        onClose();
        setSubject("");
        setContent("");
      } else {
        toast.error(result.error || "Failed to send message");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] glassmorphism border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">Direct Message</DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground">
                Sending notification to <span className="text-foreground font-bold">{patientName}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="type" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notification Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type" className="h-11 rounded-xl bg-white/40 border-primary/5 shadow-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="glassmorphism border-primary/10 rounded-xl">
                  <SelectItem value="general" className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-blue-500" />
                      <span>General Announcement</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="appointment" className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Appointment Reminder</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent" className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span>Urgent Medical Note</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Follow-up on your recent visit"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-11 rounded-xl bg-white/40 border-primary/5 shadow-sm"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Message Content</Label>
              <Textarea
                id="content"
                placeholder="Write your message here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] rounded-xl bg-white/40 border-primary/5 shadow-sm resize-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              This message will be delivered to the patient's registered email address and reflected in their portal notifications.
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancel</Button>
          <Button 
            onClick={handleSendMessage} 
            disabled={loading}
            className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-8 shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
