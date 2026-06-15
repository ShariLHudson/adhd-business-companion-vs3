/**
 * Founder-facing relationship reporting — opportunities, not surveillance.
 */

import { getRelationshipStore } from "./relationshipStore";
import type { FounderRelationshipReport, Relationship } from "./types";

const MS_DAY = 86_400_000;

export function buildFounderRelationshipReport(
  now = new Date(),
): FounderRelationshipReport {
  const store = getRelationshipStore();
  const since7d = now.getTime() - 7 * MS_DAY;
  const sincePrior7d = now.getTime() - 14 * MS_DAY;

  const recentSamples = store.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );
  const priorSamples = store.founderSamples.filter((s) => {
    const t = new Date(s.at).getTime();
    return t >= sincePrior7d && t < since7d;
  });

  const relationships = store.relationships;
  const followUpOpportunities = buildFollowUpOpportunities(relationships, now);
  const referralOpportunities = relationships
    .filter((r) => r.relationshipType === "referral_partner" || r.relationshipType === "affiliate")
    .map((r) => ({ name: r.name, type: r.relationshipType }))
    .slice(0, 5);
  const partnershipOpportunities = relationships
    .filter((r) =>
      ["collaborator", "vendor", "referral_partner"].includes(r.relationshipType),
    )
    .map((r) => ({ name: r.name, type: r.relationshipType }))
    .slice(0, 5);

  const topSignal = recentSamples[0]?.signalKind;

  return {
    generatedAt: now.toISOString(),
    relationshipsAdded: recentSamples.length,
    sampleSize: relationships.length,
    followUpOpportunities,
    referralOpportunities,
    partnershipOpportunities,
    relationshipTrend: computeTrend(recentSamples.length, priorSamples.length),
    recommendedFounderAction: founderActionFor(topSignal, relationships.length),
    notes:
      "Local preview — relationship memories are user-controlled and deletable.",
  };
}

function buildFollowUpOpportunities(
  relationships: Relationship[],
  now: Date,
): { name: string; suggestion: string }[] {
  const out: { name: string; suggestion: string }[] = [];
  for (const r of relationships) {
    const touch = r.nextSuggestedTouchpoint;
    if (touch) {
      out.push({ name: r.name, suggestion: touch.label });
      continue;
    }
    if (r.lastInteraction) {
      const days =
        (now.getTime() - new Date(r.lastInteraction).getTime()) / MS_DAY;
      if (days >= 14) {
        out.push({ name: r.name, suggestion: "Gentle check-in" });
      }
    }
  }
  return out.slice(0, 6);
}

function computeTrend(
  recent: number,
  prior: number,
): "rising" | "stable" | "easing" {
  if (recent >= prior + 2) return "rising";
  if (recent <= prior - 2) return "easing";
  return "stable";
}

function founderActionFor(
  signalKind: string | undefined,
  total: number,
): string {
  if (total === 0) {
    return "Monitor relationship signal uptake — keep remember-offers optional.";
  }
  switch (signalKind) {
    case "referral":
      return "Referral relationships are being saved — consider lightweight referral tracking in workspace.";
    case "follow_up":
    case "should_email":
    case "should_call":
      return "Follow-up memories are common — surface gentle touchpoint prompts, never guilt.";
    case "reconnect":
    case "havent_talked":
      return "Reconnect signals rising — offer optional check-in reminders only.";
    default:
      return "Relationship memory is active — keep CRM-lite features optional and user-controlled.";
  }
}
