"use client";

import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Check, RefreshCw } from "lucide-react";
import Webcam from "react-webcam";
import { updatePatientAvatar } from "@/lib/actions/patients";
import { toast } from "sonner";

interface ImageUploadDialogProps {
  patientId: string;
  onSuccess?: (url: string) => void;
  children: React.ReactNode;
}

export function ImageUploadDialog({ patientId, onSuccess, children }: ImageUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"choice" | "camera" | "upload" | "preview">("choice");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setMode("preview");
    }
  }, [webcamRef]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setMode("preview");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!capturedImage) return;

    setIsUploading(true);
    try {
      // In a real app, you'd upload to S3/Cloudinary here.
      // For this implementation, we'll use the base64 string directly as the avatar_url
      // to demonstrate functionality without a complex storage setup.
      const result = await updatePatientAvatar(patientId, capturedImage);
      
      if (result.success) {
        toast.success("Profile image updated successfully");
        onSuccess?.(capturedImage);
        setIsOpen(false);
        reset();
      } else {
        toast.error("Failed to update profile image");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while uploading");
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setMode("choice");
    setCapturedImage(null);
    setIsUploading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[32px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Update Profile Photo</DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {mode === "choice" && (
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-32 flex flex-col gap-3 rounded-3xl border-2 border-slate-100 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => setMode("camera")}
              >
                <Camera className="w-8 h-8 text-primary" />
                <span className="font-bold">Use Camera</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-32 flex flex-col gap-3 rounded-3xl border-2 border-slate-100 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-primary" />
                <span className="font-bold">Upload File</span>
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
          )}

          {mode === "camera" && (
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100 border-2 border-slate-100">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  videoConstraints={{ facingMode: "user" }}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl font-bold" onClick={() => setMode("choice")}>Cancel</Button>
                <Button className="flex-1 rounded-xl font-bold gap-2" onClick={capture}>
                  <Camera className="w-4 h-4" /> Capture Photo
                </Button>
              </div>
            </div>
          )}

          {mode === "preview" && capturedImage && (
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100 border-2 border-slate-100">
                <img src={capturedImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl font-bold gap-2" onClick={() => setMode("choice")} disabled={isUploading}>
                  <RefreshCw className="w-4 h-4" /> Retake
                </Button>
                <Button className="flex-1 rounded-xl font-bold gap-2" onClick={handleSave} disabled={isUploading}>
                  {isUploading ? "Uploading..." : <><Check className="w-4 h-4" /> Save Photo</>}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
