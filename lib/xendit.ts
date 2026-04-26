import { Xendit } from "xendit-node";

if (!process.env.XENDIT_SECRET_KEY) {
  throw new Error("XENDIT_SECRET_KEY is not defined in environment variables");
}

export const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY,
});

export const xenditClient = xendit;
