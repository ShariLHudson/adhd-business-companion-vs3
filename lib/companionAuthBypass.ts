/**
 * Temporarily skip companion sign-in while building.
 * Set NEXT_PUBLIC_COMPANION_AUTH_DISABLED=true in .env.local, then restart dev.
 * Remove or set to false to re-enable login.
 */
export function isCompanionAuthBypassed(): boolean {
  const value = process.env.NEXT_PUBLIC_COMPANION_AUTH_DISABLED?.trim();
  return value === "true" || value === "1";
}
