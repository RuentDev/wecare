import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getLocations } from "@/lib/actions/locations";
import { getServices } from "@/lib/actions/services";
import { EditDoctorClient } from "@/components/admin/doctors/edit-doctor";

export const metadata = {
  title: "Add New Doctor | WeCare Admin",
  description: "Register a new practitioner in the system",
};

export default async function NewDoctorPage() {
  const [{ data: locations = [] }, { data: allServices = [] }] =
    await Promise.all([getLocations(), getServices()]);

  return (
    <main className="container mx-auto py-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        }
      >
        <EditDoctorClient
          locations={locations || []}
          allServices={allServices || []}
        />
      </Suspense>
    </main>
  );
}
