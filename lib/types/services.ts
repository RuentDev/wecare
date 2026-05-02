/**
 * Canonical types for the admin services management page.
 * Maps to the real DB shape returned by the services server actions.
 */

import { service_category } from "../generated/prisma";

export type AdminService = {
  id: string;
  name: string;
  description: string | null;
  category: service_category | null;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  doctorCount: number;
  createdAt: Date | null;
};

export type ServiceStats = {
  total: number;
  active: number;
  inactive: number;
  activeCategories: number;
  averagePrice: number;
};
