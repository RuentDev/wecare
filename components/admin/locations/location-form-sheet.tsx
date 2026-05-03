"use client";

import { useState, useTransition } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { createLocation, updateLocation } from "@/lib/actions/locations";
import type { AdminLocation } from "@/lib/types/locations";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LocationFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: AdminLocation | null;
}

export function LocationFormSheet({
  open,
  onOpenChange,
  location,
}: LocationFormSheetProps) {
  const isEditing = !!location;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const input = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: (formData.get("state") as string) || null,
      postal_code: (formData.get("postal_code") as string) || null,
      country: (formData.get("country") as string) || "Philippines",
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      opening_time: (formData.get("opening_time") as string) || null,
      closing_time: (formData.get("closing_time") as string) || null,
      is_active: formData.get("is_active") === "on",
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateLocation(location.id, input)
        : await createLocation(input);

      if (result.success) {
        onOpenChange(false);
      } else {
        setError(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>
            {isEditing ? "Edit Location" : "Add New Location"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the clinic location details below."
              : "Fill in the details to create a new clinic location."}
          </SheetDescription>
        </SheetHeader>

        <form
          id="location-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <Label htmlFor="loc-name">Location Name *</Label>
                <Input
                  id="loc-name"
                  name="name"
                  required
                  placeholder="e.g. Main Clinic"
                  defaultValue={location?.name ?? ""}
                />
              </div>

              {/* Address Section */}
              <div className="space-y-4 rounded-xl border p-4 bg-muted/20">
                <h4 className="text-sm font-medium">Address Information</h4>
                <div className="space-y-2">
                  <Label htmlFor="loc-address">Street Address *</Label>
                  <Input
                    id="loc-address"
                    name="address"
                    required
                    placeholder="123 Health Ave"
                    defaultValue={location?.address ?? ""}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loc-city">City *</Label>
                    <Input
                      id="loc-city"
                      name="city"
                      required
                      placeholder="Manila"
                      defaultValue={location?.city ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loc-state">State / Province</Label>
                    <Input
                      id="loc-state"
                      name="state"
                      placeholder="Metro Manila"
                      defaultValue={location?.state ?? ""}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loc-postal">Postal Code</Label>
                    <Input
                      id="loc-postal"
                      name="postal_code"
                      placeholder="1000"
                      defaultValue={location?.postal_code ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loc-country">Country</Label>
                    <Input
                      id="loc-country"
                      name="country"
                      placeholder="Philippines"
                      defaultValue={location?.country ?? "Philippines"}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loc-phone">Phone Number</Label>
                  <Input
                    id="loc-phone"
                    name="phone"
                    type="tel"
                    placeholder="+63 2 123 4567"
                    defaultValue={location?.phone ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loc-email">Email Address</Label>
                  <Input
                    id="loc-email"
                    name="email"
                    type="email"
                    placeholder="clinic@wecare.com"
                    defaultValue={location?.email ?? ""}
                  />
                </div>
              </div>

              {/* Operating Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loc-opening">Opening Time</Label>
                  <Input
                    id="loc-opening"
                    name="opening_time"
                    type="time"
                    defaultValue={location?.opening_time ?? "08:00"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loc-closing">Closing Time</Label>
                  <Input
                    id="loc-closing"
                    name="closing_time"
                    type="time"
                    defaultValue={location?.closing_time ?? "17:00"}
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-3 mt-4 bg-muted/10">
                <div className="space-y-0.5">
                  <Label htmlFor="loc-active" className="text-sm font-medium">
                    Active Location
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enable to allow patients to book appointments here.
                  </p>
                </div>
                <Switch
                  id="loc-active"
                  name="is_active"
                  defaultChecked={location?.is_active ?? true}
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 mt-4">
                  {error}
                </p>
              )}
            </div>
          </ScrollArea>

          <SheetFooter className="px-6 py-4 border-t mt-auto shrink-0 bg-background/50 backdrop-blur-sm">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} form="location-form">
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Location"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
