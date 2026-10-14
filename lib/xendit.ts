import { Xendit } from "xendit-node";

let xenditInstance: Xendit | null = null;

export function getXenditClient(): Xendit | null {
  if (xenditInstance) return xenditInstance;
  if (!process.env.XENDIT_SECRET_KEY) {
    console.warn("XENDIT_SECRET_KEY is not defined in environment variables");
    return null;
  }
  xenditInstance = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY,
  });
  return xenditInstance;
}

export const xendit = new Proxy({} as Xendit, {
  get(_target, prop) {
    const client = getXenditClient();
    if (!client) {
      throw new Error("XENDIT_SECRET_KEY is not defined in environment variables");
    }
    return (client as unknown as Record<string, unknown>)[prop as string];
  },
});

export const xenditClient = xendit;
