import { getServices, getServiceCategories } from "@/lib/actions/services";
import { ServicesPageClient } from "@/components/admin/services/services-page-client";

export const dynamic = "force-dynamic";

export default async function ServicesManagement() {
  const [servicesResult, categoriesResult] = await Promise.all([
    getServices(),
    getServiceCategories(),
  ]);

  const services = servicesResult.data ?? [];
  const categories = categoriesResult.data ?? [];

  return (
    <main className="min-h-full">
      <ServicesPageClient services={services} categories={categories} />
    </main>
  );
}
