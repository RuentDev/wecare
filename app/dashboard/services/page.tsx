import { getServices, getServiceStats, getServiceCategories } from "@/lib/actions/services";
import { ServicesPageClient } from "@/components/admin/services/services-page-client";

export default async function ServicesManagement() {
  const [servicesResult, statsResult, categoriesResult] = await Promise.all([
    getServices(),
    getServiceStats(),
    getServiceCategories(),
  ]);

  const services = servicesResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const stats = statsResult.data ?? {
    total: 0,
    active: 0,
    inactive: 0,
    activeCategories: 0,
    averagePrice: 0,
  };

  return (
    <main className="min-h-full">
      <ServicesPageClient services={services} categories={categories} stats={stats} />
    </main>
  );
}
