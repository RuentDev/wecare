import { getServices, getServiceStats } from "@/lib/actions/services";
import { ServicesPageClient } from "@/components/admin/services/services-page-client";

export default async function ServicesManagement() {
  const [servicesResult, statsResult] = await Promise.all([
    getServices(),
    getServiceStats(),
  ]);

  const services = servicesResult.data ?? [];
  const stats = statsResult.data ?? {
    total: 0,
    active: 0,
    inactive: 0,
    activeCategories: 0,
    averagePrice: 0,
  };

  return (
    <main className="min-h-full">
      <ServicesPageClient services={services} stats={stats} />
    </main>
  );
}
