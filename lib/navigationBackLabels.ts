/**
 * Back-label helpers — leaf module (no workspaceMode / Create catalog).
 * Project Homes and NavigationReturnBar must stay off the Create graph.
 */

export const WELCOME_HOME_NAV_LABEL = "Welcome Home";

/** @deprecated Prefer WELCOME_HOME_NAV_LABEL — kept for legacy string matches. */
export const BACK_TO_ESTATE = WELCOME_HOME_NAV_LABEL;

/** True when a back destination means the Spark Estate home. */
export function isEstateHomeDestination(
  destination: string | null | undefined,
): boolean {
  if (!destination) return false;
  const normalized = normalizeBackDestination(destination).toLowerCase();
  return (
    normalized === "home" ||
    normalized === "estate" ||
    normalized === "welcome home" ||
    normalized === "return to estate" ||
    normalized === "back to estate" ||
    normalized === "back to welcome home"
  );
}

/**
 * Standard label: "Back to Clear My Mind"
 * Pass the destination only — not the full "Back to" prefix.
 */
export function formatAppBackLabel(destination: string): string {
  const trimmed = destination.trim();
  if (!trimmed) return "Back";
  if (isEstateHomeDestination(trimmed)) return BACK_TO_ESTATE;
  if (/^back to\b/i.test(trimmed)) return trimmed;
  return `Back to ${trimmed}`;
}

/** Strip "Back to " prefix when migrating legacy labels. */
export function normalizeBackDestination(
  label: string | null | undefined,
): string {
  if (!label) return "";
  return label.replace(/^back to\s+/i, "").trim();
}
