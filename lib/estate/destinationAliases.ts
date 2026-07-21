/**
 * 096 — Legacy destination aliases → authoritative Welcome Home / AppSection IDs.
 *
 * Aliases remain for compatibility only. Primary routes must use the current IDs.
 * Creative Studio (Chamber member) is intentionally NOT aliased to Create.
 */

export const AUTHORITATIVE_DESTINATION_IDS = [
  "create",
  "projects",
  "talk-it-out",
  "wander-the-grounds",
  "spark-estate-guide",
  "journal",
  "parking-lot",
  "evidence-vault",
] as const;

export type AuthoritativeDestinationId =
  (typeof AUTHORITATIVE_DESTINATION_IDS)[number];

/**
 * Legacy id → current destination id.
 * `creative-studio` is omitted — Chamber Creative Studio remains a valid member.
 */
export const LEGACY_DESTINATION_ALIASES = {
  "content-generator": "create",
  "estate-guidebook": "spark-estate-guide",
  "explore-estate": "wander-the-grounds",
  "goals-projects": "projects",
  /** Homestead browse / map entry → Wander the Grounds */
  homestead: "wander-the-grounds",
} as const satisfies Record<string, AuthoritativeDestinationId>;

export type LegacyDestinationAlias = keyof typeof LEGACY_DESTINATION_ALIASES;

/** Retirement plan for each retained alias (docs + audits). */
export const LEGACY_ALIAS_RETIREMENT_PLAN: Record<
  LegacyDestinationAlias,
  string
> = {
  "content-generator":
    "Retire once all Estate Brain toolIds and openSection paths use create; keep CPC redirect as safety net.",
  "estate-guidebook":
    "Retire once masterFeatureRegistry and How Do I use spark-estate-guide only.",
  "explore-estate":
    "Retire once menus and map openers use wander-the-grounds only.",
  "goals-projects":
    "Keep as place/space ambience id if needed; never as Welcome Home destination or primary openSection.",
  homestead:
    "Retire explore/guidebook homestead mappings; Welcome Home lobby stays separate from Wander.",
};

/**
 * Resolve a legacy or current destination id to the authoritative id.
 * Unknown ids pass through unchanged.
 */
export function resolveAuthoritativeDestinationId(
  id: string | null | undefined,
): string | null {
  const key = id?.trim();
  if (!key) return null;
  if (key in LEGACY_DESTINATION_ALIASES) {
    return LEGACY_DESTINATION_ALIASES[key as LegacyDestinationAlias];
  }
  return key;
}

/** True when id is a known legacy alias (not the authoritative primary). */
export function isLegacyDestinationAlias(id: string | null | undefined): boolean {
  const key = id?.trim();
  if (!key) return false;
  return key in LEGACY_DESTINATION_ALIASES;
}
