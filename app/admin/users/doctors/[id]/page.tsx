import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { getDoctorById } from "@/lib/actions/doctors";
import { getLocations } from "@/lib/actions/locations";
import { getServices } from "@/lib/actions/services";

import { EditDoctorClient } from "@/components/admin/doctors/edit-doctor";
import DoctorNotFound from "../not-found";

interface DoctorPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DoctorPageProps) {
  const { id } = await params;
  const doctor = await getDoctorById(id);

  if (!doctor) {
    return {
      title: "Doctor Not Found",
    };
  }

  return {
    title: `Edit ${doctor.users?.first_name} ${doctor.users?.last_name}`,
  };
}

const DoctorPage = async ({ params }: DoctorPageProps) => {
  const { id } = await params;
  const doctor = await getDoctorById(id);

  if (!doctor) {
    return <DoctorNotFound />;
  }

  const [{ data: locations = [] }, { data: allServices = [] }] =
    await Promise.all([getLocations(), getServices()]);

  return (
    <main>
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        }
      >
        <EditDoctorClient
          doctor={doctor}
          locations={locations || []}
          allServices={allServices || []}
        />
      </Suspense>
    </main>
  );
};

export default DoctorPage;
