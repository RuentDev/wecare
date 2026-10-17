import "server-only";
import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (stripeInstance) return stripeInstance;
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeInstance;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripeClient();
    if (!client) {
      throw new Error(
        "STRIPE_SECRET_KEY is not defined in environment variables. Please configure it in .env.local."
      );
    }
    return (client as unknown as Record<string, unknown>)[prop as string];
  },
});
