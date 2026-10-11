import { getAdminLocations, getLocationStats } from "@/lib/actions/locations";
import { LocationsPageClient } from "@/components/admin/locations/locations-page-client";

export const dynamic = "force-dynamic";

export default async function LocationsManagement() {
  const [locationsResult, statsResult] = await Promise.all([
    getAdminLocations(),
    getLocationStats(),
  ]);

  const locations = locationsResult.data ?? [];
  const stats = statsResult.data ?? {
    total: 0,
    active: 0,
    inactive: 0,
    cities: 0,
  };

  return (
    <main className="min-h-full">
      <LocationsPageClient locations={locations} stats={stats} />
    </main>
  );
}
