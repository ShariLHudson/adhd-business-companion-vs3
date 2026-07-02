/**
 * Momentum Builder™ — natural estate handoffs (delegates to Estate Registry™).
 */

import type { AppSection } from "@/lib/companionUi";
import { estateRegistryEntryById } from "@/lib/estateIntelligence/estateRegistry";
import { buildEstateInvitation } from "@/lib/estateIntelligence/estateRouter";

export type EstateConnectionNeed =
  | "think"
  | "create"
  | "learn"
  | "research"
  | "break"
  | "calm"
  | "organize_thoughts"
  | "decide";

export type EstateConnectionRoute = {
  need: EstateConnectionNeed;
  estateName: string;
  section: AppSection | null;
  /** Hospitality invitation — never feature-navigation language */
  invitation: string;
};

const NEED_TO_REGISTRY_ID: Record<EstateConnectionNeed, string> = {
  think: "clear-my-mind",
  create: "creative-studio",
  learn: "library",
  research: "observatory",
  break: "coffee-house",
  calm: "peaceful-places",
  organize_thoughts: "clear-my-mind",
  decide: "decision-compass",
};

function connectionFromRegistry(
  need: EstateConnectionNeed,
): EstateConnectionRoute | undefined {
  const entry = estateRegistryEntryById(NEED_TO_REGISTRY_ID[need]);
  if (!entry) return undefined;
  return {
    need,
    estateName: entry.name,
    section: entry.primarySection ?? null,
    invitation: buildEstateInvitation(entry),
  };
}

/** @deprecated Use registry-backed connections — kept for type compatibility. */
export const MOMENTUM_BUILDER_ESTATE_CONNECTIONS: readonly EstateConnectionRoute[] =
  (
    Object.keys(NEED_TO_REGISTRY_ID) as EstateConnectionNeed[]
  ).map((need) => connectionFromRegistry(need)).filter(Boolean) as EstateConnectionRoute[];

export function estateConnectionForNeed(
  need: EstateConnectionNeed,
): EstateConnectionRoute | undefined {
  return connectionFromRegistry(need);
}

/** Infer a gentle handoff from discovery signals — internal only. */
export function suggestEstateConnection(input: {
  emotionalState?: string;
  rawText?: string;
}): EstateConnectionRoute | null {
  const lower = (input.rawText ?? "").toLowerCase();
  if (/\b(overwhelm|scatter|jumble|too much in my head)\b/.test(lower)) {
    return estateConnectionForNeed("organize_thoughts") ?? null;
  }
  if (/\b(calm|anxious|stress|breathe|peaceful)\b/.test(lower)) {
    return estateConnectionForNeed("calm") ?? null;
  }
  if (/\b(research|trend|ai\b|observe|discover)\b/.test(lower)) {
    return estateConnectionForNeed("research") ?? null;
  }
  if (/\b(learn|pricing|marketing|how do i)\b/.test(lower)) {
    return estateConnectionForNeed("learn") ?? null;
  }
  if (/\b(create|write|workshop|launch|build)\b/.test(lower)) {
    return estateConnectionForNeed("create") ?? null;
  }
  if (/\b(decide|choose|which option|stuck between)\b/.test(lower)) {
    return estateConnectionForNeed("decide") ?? null;
  }
  if (input.emotionalState === "overwhelmed") {
    return estateConnectionForNeed("organize_thoughts") ?? null;
  }
  return null;
}

export function estateConnectionHintForChat(
  connection: EstateConnectionRoute | null,
): string | null {
  if (!connection) return null;
  return [
    "ESTATE TRANSITION (optional — only after forward motion in this room):",
    connection.invitation,
    "Never send the member to a menu. Offer — they choose.",
  ].join("\n");
}
