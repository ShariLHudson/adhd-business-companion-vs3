/**
 * Future Shari messages — warm, optional, never commanding.
 */

import type { FutureShariOffer, FutureShariSnapshot } from "./types";

const INTRO_LINES = [
  "I have a Future Shari thought.",
  "Want to hear something Future You might appreciate?",
];

export function futureIntroLine(rotationKey = "0"): string {
  let h = 0;
  for (let i = 0; i < rotationKey.length; i++) {
    h = (h << 5) - h + rotationKey.charCodeAt(i);
    h |= 0;
  }
  return INTRO_LINES[Math.abs(h) % INTRO_LINES.length]!;
}

export function buildFutureShariOffer(
  snapshot: FutureShariSnapshot,
): FutureShariOffer {
  return {
    snapshot,
    introLine: futureIntroLine(snapshot.opportunity),
    createdAt: snapshot.createdAt,
  };
}

export function futureTellMeMessage(offer: FutureShariOffer): string {
  return `Future Shari thought: ${offer.snapshot.futureMessage} ${offer.snapshot.suggestedAction}`;
}

export function futureHintForChat(snapshot: FutureShariSnapshot): string {
  return [
    "FUTURE SHARI (optional gentle suggestion — never a command):",
    `Opportunity: ${snapshot.opportunity}`,
    `Future benefit: ${snapshot.futureBenefit}`,
    `Small cost today: ${snapshot.futureCost}`,
    `Timeframe: ${snapshot.timeframe}`,
    `If natural, you may weave in: "${snapshot.futureMessage}"`,
    "Tone: caring friend for tomorrow — no guilt, pressure, should, or fear.",
    "Do not mention Future Shari as a system label unless user already uses it.",
  ].join("\n");
}
