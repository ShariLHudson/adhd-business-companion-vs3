/**
 * Development / founder-cert only — artificial delay before accepting an
 * assistant response so stale-response discard can be browser-proven.
 *
 * Activation (either):
 * - `window.__SPARK_CHAT_RESPONSE_DELAY_MS = 8000` in the browser console
 * - `NEXT_PUBLIC_CHAT_RESPONSE_DELAY_MS=8000` in a non-production env
 *
 * Never delays in production builds.
 */

declare global {
  interface Window {
    __SPARK_CHAT_RESPONSE_DELAY_MS?: number;
  }
}

export function readDevChatResponseDelayMs(): number {
  if (process.env.NODE_ENV === "production") return 0;
  if (typeof window !== "undefined") {
    const fromWindow = Number(window.__SPARK_CHAT_RESPONSE_DELAY_MS);
    if (Number.isFinite(fromWindow) && fromWindow > 0) {
      return Math.min(fromWindow, 60_000);
    }
  }
  const fromEnv = Number(process.env.NEXT_PUBLIC_CHAT_RESPONSE_DELAY_MS);
  if (Number.isFinite(fromEnv) && fromEnv > 0) {
    return Math.min(fromEnv, 60_000);
  }
  return 0;
}

/** Await only when a positive delay is configured in non-production. */
export async function maybeDelayChatResponseForDev(): Promise<void> {
  const ms = readDevChatResponseDelayMs();
  if (ms <= 0) return;
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
