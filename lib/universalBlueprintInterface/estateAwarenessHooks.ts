/**
 * 106 / 101 — Estate Awareness Hooks.
 * 101 implements recognition surfaces via `lib/progressRecognition`.
 * Round Table and Chamber remain contract-only.
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
  /** Routing point later prompts may consume — not always a live UI open. */
  routingKey: string;
  relationshipKinds: readonly string[];
  /** True when 101 progress recognition owns the surface logic. */
  implementedHere: boolean;
  /** Module path for implemented surfaces. */
  implementationModule?: string;
};

export const ESTATE_AWARENESS_HOOKS: readonly EstateAwarenessHook[] = [
  {
    surfaceId: "business_pulse",
    label: "Business Pulse",
    routingKey: "estate.awareness.business_pulse",
    relationshipKinds: ["supports", "informs", "related_to"],
    implementedHere: true,
    implementationModule: "lib/progressRecognition/businessPulse.ts",
  },
  {
    surfaceId: "wins",
    label: "Wins",
    routingKey: "estate.awareness.wins",
    relationshipKinds: ["related_to"],
    implementedHere: true,
    implementationModule: "lib/progressRecognition/adapters.ts",
  },
  {
    surfaceId: "hall_of_accomplishments",
    label: "Hall of Accomplishments",
    routingKey: "estate.awareness.hall_of_accomplishments",
    relationshipKinds: ["related_to"],
    implementedHere: true,
    implementationModule: "lib/progressRecognition/adapters.ts",
  },
  {
    surfaceId: "evidence_vault",
    label: "Evidence Vault",
    routingKey: "estate.awareness.evidence_vault",
    relationshipKinds: ["related_to"],
    implementedHere: true,
    implementationModule: "lib/progressRecognition/evidenceBoundary.ts",
  },
  {
    surfaceId: "celebration_garden",
    label: "Celebration Garden",
    routingKey: "estate.awareness.celebration_garden",
    relationshipKinds: ["related_to"],
    implementedHere: true,
    implementationModule: "lib/progressRecognition/celebrationRouting.ts",
  },
  {
    surfaceId: "celebration_hall",
    label: "Celebration Hall",
    routingKey: "estate.awareness.celebration_hall",
    relationshipKinds: ["related_to"],
    implementedHere: true,
    implementationModule: "lib/progressRecognition/celebrationRouting.ts",
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
