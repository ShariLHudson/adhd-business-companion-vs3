/**
 * Chamber of Momentum™ — demo mode (Phase 8).
 * Opt-in via `?chamberDemo=1` — scripted member experience, not live user data.
 */

export const CHAMBER_DEMO_QUERY_PARAM = "chamberDemo" as const;

export const CHAMBER_DEMO_DISCLAIMER =
  "Demo preview — sample momentum journey, not your personal data." as const;

export const COMPANION_CHAMBER_DEMO_HREF =
  `/companion?section=chamber-of-momentum&${CHAMBER_DEMO_QUERY_PARAM}=1` as const;

export function readChamberDemoQuery(
  search: string | URLSearchParams | null | undefined,
): boolean {
  if (!search) return false;
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search;
  const value = params.get(CHAMBER_DEMO_QUERY_PARAM)?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function isChamberDemoMode(
  search?: string | URLSearchParams | null,
): boolean {
  if (search !== undefined) return readChamberDemoQuery(search);
  if (typeof window === "undefined") return false;
  return readChamberDemoQuery(window.location.search);
}
