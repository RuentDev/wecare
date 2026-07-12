"use client";

import { useState, useTransition, useRef } from "react";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download, UploadCloud, FileSpreadsheet } from "lucide-react";
import { importServices } from "@/lib/actions/services";
import { toast } from "sonner";

interface ImportServicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportServicesDialog({
  open,
  onOpenChange,
}: ImportServicesDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    // Generate CSV template
    const headers = ["name", "description", "category", "duration_minutes", "price", "is_active"];
    const sampleData = ["General Consultation", "Standard consultation", "General", "30", "500", "true"];
    const csvContent = `${headers.join(",")}\n${sampleData.join(",")}\n`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "services_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please select a CSV file to import.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Error parsing CSV: ${results.errors[0].message}`);
          return;
        }

        const data = results.data as Record<string, string>[];

        // Transform and validate data structure to match expected format
        const formattedData = data.map((row) => ({
          name: row.name?.trim() || "",
          description: row.description?.trim() || undefined,
          category_name: row.category?.trim() || undefined,
          duration_minutes: parseInt(row.duration_minutes, 10) || 30,
          price: parseFloat(row.price) || 0,
          is_active: row.is_active ? row.is_active.trim().toLowerCase() !== "false" : true,
        }));

        startTransition(async () => {
          const result = await importServices(formattedData);
          if (result.success) {
            let msg = `Successfully imported ${result.count || 0} services.`;
            if (result.skipped && result.skipped > 0) {
              msg += ` Skipped ${result.skipped} duplicate(s).`;
            }
            toast.success(msg);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            onOpenChange(false);
          } else {
            setError(result.error ?? "Failed to import services.");
          }
        });
      },
      error: (err) => {
        setError(`Error reading file: ${err.message}`);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import Services
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import services. You can download a template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg border border-border/50">
          <div className="text-sm">Need a template?</div>
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2">
            <Download className="w-4 h-4" />
            Download CSV
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-upload">CSV File *</Label>
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setError(null);
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                setError(null);
                onOpenChange(false);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !file} className="gap-2">
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}
              {isPending ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
