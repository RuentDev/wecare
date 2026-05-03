import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Recursively serializes Prisma data, converting Decimal objects to numbers
 * and ensuring compatibility with Next.js Client Components.
 */
export function serializePrisma<T>(data: T): T {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    return data.map(serializePrisma) as any;
  }

  if (data instanceof Date) return data;

  if (typeof data === "object") {
    // Check for Prisma Decimal
    if (
      (data as any).constructor?.name === "Decimal" ||
      (typeof (data as any).toNumber === "function" && (data as any).hasOwnProperty('d'))
    ) {
      return (data as any).toNumber();
    }

    const result: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = serializePrisma((data as any)[key]);
      }
    }
    return result;
  }

  return data;
}

export function formatCurrency(amount: number, currency: string = "PHP") {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
