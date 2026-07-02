/**
 * Companion auth gate — development skips sign-in by default.
 *
 * - `NODE_ENV=development` → bypass login (straight to /companion chat)
 * - `NEXT_PUBLIC_COMPANION_AUTH_DISABLED=false` → force login even in dev
 * - `NEXT_PUBLIC_COMPANION_AUTH_DISABLED=true` → skip login in any environment
 *
 * @see .env.example
 */

export function isCompanionAuthBypassed(): boolean {
  const flag = process.env.NEXT_PUBLIC_COMPANION_AUTH_DISABLED?.trim().toLowerCase();
  if (flag === "false" || flag === "0") return false;
  if (flag === "true" || flag === "1") return true;
  return process.env.NODE_ENV === "development";
}

/** Dev fast path — skip login gate and long welcome cinematics. */
export function isCompanionDevFastPath(): boolean {
  return isCompanionAuthBypassed();
}
