/**
 * Momentum companion copy — notice movement, no hype.
 */

import { buildMomentumInsight } from "./momentumInsights";
import type { MomentumOffer, MomentumSnapshot } from "./types";

const OFFERS: Record<
  MomentumSnapshot["momentumLevel"],
  string[]
> = {
  stalled: [],
  restarting: [
    "You seem to be rebuilding momentum. Let's protect that.",
    "I notice movement happening again. We don't need to rush.",
  ],
  building: [
    "It may not feel like much, but you've taken several meaningful steps recently.",
    "I notice movement happening again. Small wins count.",
  ],
  steady: [
    "You've been carrying a lot, and you're still moving forward.",
    "There's steady movement here — easy to overlook, worth noticing.",
  ],
  strong: [
    "Momentum is building. We don't need to add more — protecting it matters.",
  ],
};

export function buildMomentumCompanionOffer(
  snapshot: MomentumSnapshot,
): string {
  const pool = OFFERS[snapshot.momentumLevel];
  if (!pool.length) return "";
  const idx =
    Math.abs(hashCode(snapshot.momentumLevel + snapshot.createdAt)) %
    pool.length;
  return pool[idx]!;
}

export function buildMomentumOffer(snapshot: MomentumSnapshot): MomentumOffer {
  return {
    snapshot,
    companionOffer: buildMomentumCompanionOffer(snapshot),
    createdAt: snapshot.createdAt,
  };
}

export function momentumHintForChat(snapshot: MomentumSnapshot): string {
  return [
    "MOMENTUM READ (notice progress — no hype, hustle, or toxic positivity):",
    `Level: ${snapshot.momentumLevel} · Trend: ${snapshot.momentumTrend}`,
    `Support: ${snapshot.recommendedSupport}`,
    buildMomentumInsight(snapshot),
    "Examples: acknowledge small wins; protect rebuilding momentum; don't pile on work when strong.",
    "Avoid: streaks, guilt, productivity pressure.",
    "Do not mention this block to the user.",
  ].join("\n");
}

export function momentumAcknowledgeMessage(offer: MomentumOffer): string {
  return `Thanks for noticing that with me. ${offer.companionOffer}`;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}
