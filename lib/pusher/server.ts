import Pusher from "pusher";

let pusherServerInstance: Pusher | null = null;

/**
 * Returns a singleton instance of the Pusher server client if configured.
 * Returns null if Pusher environment variables are not yet provided.
 */
export function getPusherServer(): Pusher | null {
  if (pusherServerInstance) {
    return pusherServerInstance;
  }

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER || "mt1";

  if (!appId || !key || !secret) {
    return null;
  }

  pusherServerInstance = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return pusherServerInstance;
}
