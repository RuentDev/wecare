"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  CheckCircle2,
  Activity,
  Search,
  Plus,
  X,
  BriefcaseMedical,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { updateDoctorServices } from "@/lib/actions/doctors";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DoctorServicesManagerProps {
  doctorId: string;
  allServices: any[];
  currentServices: any[];
}

export function DoctorServicesManager({
  doctorId,
  allServices,
  currentServices,
}: DoctorServicesManagerProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    currentServices.map((ds) => ds.service_id),
  );
  const [isSaving, setIsSaving] = useState(false);

  // Services currently assigned to the doctor
  const assignedServices = useMemo(() => {
    return allServices.filter((s) => selectedServiceIds.includes(s.id));
  }, [allServices, selectedServiceIds]);

  // Services available to be added (filtered by search)
  const availableServices = useMemo(() => {
    return allServices
      .filter((s) => !selectedServiceIds.includes(s.id))
      .filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
  }, [allServices, selectedServiceIds, searchTerm]);

  const addService = (serviceId: string) => {
    if (!selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds((prev) => [...prev, serviceId]);
    }
  };

  const removeService = (serviceId: string) => {
    setSelectedServiceIds((prev) => prev.filter((id) => id !== serviceId));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateDoctorServices(doctorId, selectedServiceIds);
      if (result.success) {
        toast.success("Doctor services updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update services");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BriefcaseMedical className="w-5 h-5 text-primary" />
            Service Configuration
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage the specific medical services this doctor provides.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-xl shadow-lg shadow-primary/20 px-6 gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Update Services
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Search & Selection Side */}
        <div className="space-y-6">
          <Card className="glassmorphism-card border-none overflow-hidden rounded-[24px] p-0 gap-1">
            <CardHeader className="p-5 pb-0">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                Find Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by service name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glassmorphism-input pl-10"
                />
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {availableServices.length > 0 ? (
                  availableServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {service.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 border-white/20 bg-white/5"
                          >
                            {service.category || "General"}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            ₱{service.price}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => addService(service.id)}
                        className="h-8 w-8 rounded-full hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p className="text-sm">
                      No available services match your search.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Services Side */}
        <div className="space-y-6">
          <Card className="glassmorphism-card border-none overflow-hidden rounded-[24px] py-0 gap-1">
            <CardHeader className="p-5 bg-primary/5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Managed Services ({assignedServices.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                {assignedServices.length > 0 ? (
                  assignedServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10 group animate-in-fade animate-in-slide-up"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-primary">
                          {service.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                          {service.description || "No description"}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeService(service.id)}
                        className="h-8 w-8 rounded-full hover:bg-destructive hover:text-white text-destructive/70 transition-all"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                      <BriefcaseMedical className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      No services assigned yet
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Search and click + to add services
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
