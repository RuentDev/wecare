import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { getDoctorById } from "@/lib/actions/doctors";
import { getUserById } from "@/lib/actions/rbac";

import { EditDoctorClient } from "@/components/admin/doctors/edit-doctor";
import DoctorNotFound from "../not-found";

interface DoctorPageProps {
  params: Promise<{ id: string }>;
}

const DoctorPage = async ({ params }: DoctorPageProps) => {
  const { id } = await params;
  const doctor = await getDoctorById(id);
  const doctorUser = await getUserById(doctor?.user_id!);
  if (!doctor || !doctorUser) {
    return <DoctorNotFound />;
  }

  return (
    <main className="p-5">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        }
      >
        {/* <EditDoctorClient doctor={doctor} /> */}
      </Suspense>
    </main>
  );
};

export default DoctorPage;
