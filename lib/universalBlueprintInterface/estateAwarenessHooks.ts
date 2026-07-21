/**
 * 106 — Estate Awareness Hooks.
 * Expose relationship contracts and routing points only.
 * Does not implement Business Pulse, Wins, Hall, Vault, Gardens, Round Table, or Chamber systems.
 */

export type EstateAwarenessSurfaceId =
  | "business_pulse"
  | "wins"
  | "hall_of_accomplishments"
  | "evidence_vault"
  | "celebration_garden"
  | "celebration_hall"
  | "round_table"
  | "chamber_members";

export type EstateAwarenessHook = {
  surfaceId: EstateAwarenessSurfaceId;
  label: string;
  /** Routing point later prompts may consume — not a live UI open. */
  routingKey: string;
  relationshipKinds: readonly string[];
  implementedHere: false;
};

export const ESTATE_AWARENESS_HOOKS: readonly EstateAwarenessHook[] = [
  {
    surfaceId: "business_pulse",
    label: "Business Pulse",
    routingKey: "estate.awareness.business_pulse",
    relationshipKinds: ["supports", "informs"],
    implementedHere: false,
  },
  {
    surfaceId: "wins",
    label: "Wins",
    routingKey: "estate.awareness.wins",
    relationshipKinds: ["related_to"],
    implementedHere: false,
  },
  {
    surfaceId: "hall_of_accomplishments",
    label: "Hall of Accomplishments",
    routingKey: "estate.awareness.hall_of_accomplishments",
    relationshipKinds: ["related_to"],
    implementedHere: false,
  },
  {
    surfaceId: "evidence_vault",
    label: "Evidence Vault",
    routingKey: "estate.awareness.evidence_vault",
    relationshipKinds: ["related_to"],
    implementedHere: false,
  },
  {
    surfaceId: "celebration_garden",
    label: "Celebration Garden",
    routingKey: "estate.awareness.celebration_garden",
    relationshipKinds: ["related_to"],
    implementedHere: false,
  },
  {
    surfaceId: "celebration_hall",
    label: "Celebration Hall",
    routingKey: "estate.awareness.celebration_hall",
    relationshipKinds: ["related_to"],
    implementedHere: false,
  },
  {
    surfaceId: "round_table",
    label: "Round Table",
    routingKey: "estate.awareness.round_table",
    relationshipKinds: ["informs"],
    implementedHere: false,
  },
  {
    surfaceId: "chamber_members",
    label: "Chamber Members",
    routingKey: "estate.awareness.chamber_members",
    relationshipKinds: ["informs"],
    implementedHere: false,
  },
] as const;

export function listEstateAwarenessHooks(): readonly EstateAwarenessHook[] {
  return ESTATE_AWARENESS_HOOKS;
}

export function getEstateAwarenessHook(
  surfaceId: EstateAwarenessSurfaceId,
): EstateAwarenessHook | null {
  return ESTATE_AWARENESS_HOOKS.find((h) => h.surfaceId === surfaceId) ?? null;
}
