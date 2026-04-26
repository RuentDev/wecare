export interface Product {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
}

// Deposit options for dental appointments
export const DEPOSIT_PRODUCTS: Product[] = [
  {
    id: "deposit-standard",
    name: "Appointment Deposit",
    description: "Standard appointment booking deposit - refundable if cancelled 24 hours in advance",
    priceInCents: 2500, // $25.00
  },
  {
    id: "deposit-specialist",
    name: "Specialist Appointment Deposit",
    description: "Deposit for specialist consultations - refundable if cancelled 48 hours in advance",
    priceInCents: 5000, // $50.00
  },
];

// Service packages for prepayment
export const SERVICE_PACKAGES: Product[] = [
  {
    id: "package-checkup",
    name: "Dental Checkup & Cleaning",
    description: "Complete dental examination with professional cleaning",
    priceInCents: 15000, // $150.00
  },
  {
    id: "package-whitening",
    name: "Professional Teeth Whitening",
    description: "In-office professional whitening treatment",
    priceInCents: 35000, // $350.00
  },
  {
    id: "package-orthodontic-consult",
    name: "Orthodontic Consultation",
    description: "Comprehensive orthodontic evaluation with treatment planning",
    priceInCents: 10000, // $100.00
  },
];

// Get all products
export const PRODUCTS: Product[] = [...DEPOSIT_PRODUCTS, ...SERVICE_PACKAGES];

// Helper to find product by ID
export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

// Helper to format price
export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceInCents / 100);
}
