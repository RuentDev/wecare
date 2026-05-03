import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, Clock, User, Camera, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updatePatientAvatar } from "@/lib/actions/patients";
import { toast } from "sonner";

interface PatientProfileCardProps {
  patient: any;
}

export function PatientProfileCard({ patient }: PatientProfileCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(patient.avatar_url || "");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!patient) return null;

  const lastVisit = patient.appointments?.[0]?.appointment_date;
  
  // Allergies placeholder - can be linked to DB later
  const allergies: string[] = [];

  const handleUpdateAvatar = async () => {
    setIsUpdating(true);
    try {
      const result = await updatePatientAvatar(patient.id, avatarUrl);
      if (result.success) {
        toast.success("Profile image updated");
        setIsEditDialogOpen(false);
      } else {
        toast.error("Failed to update image");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden h-full">
      <CardContent className="p-6 space-y-6">
        <div className="flex gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl bg-[#FFF9EA] flex items-center justify-center overflow-hidden border-4 border-white shadow-sm relative">
              <Avatar className="w-full h-full rounded-none">
                <AvatarImage src={patient.avatar_url || ""} className="object-cover" />
                <AvatarFallback className="bg-transparent text-primary text-3xl font-black">
                  {patient.first_name?.[0]}{patient.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <button 
                onClick={() => setIsEditDialogOpen(true)}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="text-white w-8 h-8" />
              </button>
            </div>
          </div>

          <div className="flex-1 pt-2">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-none mb-2">
              {patient.first_name} {patient.last_name}
            </h2>
            <div className="flex items-center gap-4 text-slate-500 font-bold mb-6">
              <span className="text-lg">{patient.gender || "Female"}</span>
              <span className="text-lg">Age 32</span>
            </div>

            <div className="space-y-1">
              <p className="text-blue-500 font-bold tracking-wide">{patient.phone || "8745635422"}</p>
              <p className="text-blue-400 font-medium">{patient.email}</p>
            </div>
          </div>
        </div>

        {/* Last Visited Section */}
        <div className="bg-slate-50/80 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-600">Last Visited</span>
          <div className="text-sm font-bold text-slate-500">
            {lastVisit ? format(new Date(lastVisit), "dd/MM/yy, EEEE, h:mm a") : "11/03/23, Thursday, 9:30 am"}
          </div>
        </div>

        {/* Allergies Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-800">Known Allergies</h3>
          <div className="flex flex-wrap gap-2">
            {allergies.map((allergy, i) => (
              <Badge 
                key={i} 
                className="bg-[#FFF9EA] text-[#8B7E5E] border-none px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
              >
                {allergy}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Change Profile Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Image URL</label>
              <Input 
                value={avatarUrl} 
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="h-12 bg-slate-50 border-none rounded-xl font-bold"
              />
            </div>
            <Button 
              onClick={handleUpdateAvatar} 
              className="w-full h-12 rounded-xl font-black"
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Update Image"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
