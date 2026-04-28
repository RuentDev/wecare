"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { getColumns, DoctorColumn } from "./columns";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/app-context";

interface DoctorsClientProps {
  initialDoctors: any[];
}

export function DoctorsClient({ initialDoctors }: DoctorsClientProps) {
  const router = useRouter();
  const { user } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [specFilter, setSpecFilter] = useState<string>("all");

  const handleView = (doctor: any) => {
    toast.info(`Viewing details for Dr. ${doctor.users?.first_name}`);
  };

  const handleEdit = (doctor: any) => {
    router.push(`/admin/users/${doctor.id}`);
  };

  const handleDelete = (id: string) => {
    toast.error(`Delete requested for doctor ${id}`);
  };

  const formattedData: DoctorColumn[] = useMemo(() => {
    return initialDoctors.map((doc) => ({
      id: doc.id,
      name: `${doc.users?.first_name} ${doc.users?.last_name}`,
      email: doc.users?.email || "",
      avatarUrl: doc.users?.avatar_url,
      specialization: doc.specialization || "N/A",
      experience: doc.years_of_experience || 0,
      fee: doc.consultation_fee ? doc.consultation_fee.toString() : "0",
      isAvailable: doc.is_available ?? true,
      raw: doc,
    }));
  }, [initialDoctors]);

  const filteredData = useMemo(() => {
    return formattedData.filter((item) => {
      const matchesSpec =
        specFilter === "all" || item.specialization === specFilter;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.specialization.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSpec && matchesSearch;
    });
  }, [formattedData, specFilter, searchQuery]);

  const columns = getColumns(
    user?.role || "",
    handleView,
    handleEdit,
    handleDelete,
  );

  // Get unique specializations for filter
  const specializations = useMemo(() => {
    const specs = Array.from(
      new Set(formattedData.map((d) => d.specialization)),
    );
    return specs.filter((s) => s !== "N/A");
  }, [formattedData]);

  return (
    <Card className="glassmorphism border-none shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <CardContent className="p-0">
        <div className="p-6 border-b border-neutral-light bg-white/50 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-gray" />
              <Input
                placeholder="Search doctors by name, email or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/80 border-neutral-light rounded-xl focus-visible:ring-primary/20 transition-all"
              />
            </div>
            <Button
              variant="outline"
              className="rounded-xl border-neutral-light bg-white/80 md:hidden"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Select value={specFilter} onValueChange={setSpecFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-white/80 border-neutral-light rounded-xl">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-neutral-gray" />
                  <SelectValue placeholder="All Specializations" />
                </div>
              </SelectTrigger>
              <SelectContent className="glassmorphism border-none shadow-2xl">
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="px-2 pb-2">
          <DataTable columns={columns} data={filteredData} />
          {filteredData.length === 0 && (
            <div className="py-20 text-center">
              <div className="bg-neutral-light w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-neutral-gray" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-dark">
                No doctors found
              </h3>
              <p className="text-neutral-gray">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
