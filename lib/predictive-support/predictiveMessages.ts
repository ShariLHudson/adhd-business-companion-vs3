/**
 * Predictive support companion copy — warm, optional, never doom-framed.
 */

import { riskTypeLabel } from "./predictiveInsights";
import type { PredictiveSupportOffer, PredictiveSupportSnapshot } from "./types";

const OFFERS: Record<
  PredictiveSupportSnapshot["riskType"],
  string[]
> = {
  overwhelm_risk: [
    "You've been carrying a lot lately. Would it help to simplify before this becomes heavier?",
    "I have a gentle observation that might make things easier — want to hear it?",
  ],
  burnout_risk: [
    "You've been carrying a lot lately. Would it help to lighten the load before energy dips further?",
    "I notice the pace has been intense. Want a gentle way to protect your energy?",
  ],
  decision_fatigue_risk: [
    "Decisions can pile up quietly. Would it help to narrow to just one for now?",
    "I have a gentle observation about decision load — only if you want it.",
  ],
  freeze_risk: [
    "Starting can get heavier when everything feels big. Want help finding one tiny step?",
    "I have a gentle observation that might make moving forward easier.",
  ],
  project_abandonment_risk: [
    "A project may be drifting — would it help to reconnect to why it matters, or make it smaller?",
    "I notice something may need a lighter touch. Want to explore it together?",
  ],
  recovery_needed_risk: [
    "Rest might help more than pushing right now. Would that be okay to talk about?",
    "You've been going hard. Want permission to recover without guilt?",
  ],
  relationship_followup_risk: [
    "A connection might appreciate a gentle touch. Want a low-pressure reminder?",
    "I have a soft observation about a relationship — only if helpful.",
  ],
  founder_overload_risk: [
    "Founder load looks high. Would it help to protect capacity before adding more?",
    "I have a gentle observation about capacity — want to hear it?",
  ],
  momentum_loss_risk: [
    "Momentum can slip quietly. Would a small win help — no pressure?",
    "I notice movement may need protection. Want a gentle suggestion?",
  ],
  custom: [
    "I have a gentle observation that might make things easier. Want to hear it?",
  ],
};

export function buildPredictiveCompanionOffer(
  snapshot: PredictiveSupportSnapshot,
): string {
  const pool = OFFERS[snapshot.riskType];
  const idx =
    Math.abs(hashCode(snapshot.riskType + snapshot.createdAt)) % pool.length;
  return pool[idx]!;
}

export function buildPredictiveOffer(
  snapshot: PredictiveSupportSnapshot,
): PredictiveSupportOffer {
  return {
    snapshot,
    companionOffer: buildPredictiveCompanionOffer(snapshot),
    createdAt: snapshot.createdAt,
  };
}

export function predictiveAcceptMessage(
  snapshot: PredictiveSupportSnapshot,
): string {
  return [
    "Thanks for being open to this — no pressure to fix everything.",
    "",
    `Gentle observation: ${snapshot.predictedOutcome}`,
    "",
    `What might help: ${snapshot.recommendedSupport}`,
    "",
    "We can take one tiny step, or pause — your call.",
  ].join("\n");
}

export function predictiveHintForChat(
  snapshot: PredictiveSupportSnapshot,
): string {
  return [
    "PREDICTIVE SUPPORT (prevention only — never predict failure or use fear):",
    `Risk pattern: ${riskTypeLabel(snapshot.riskType)} (${snapshot.riskLevel})`,
    `Outcome to prevent: ${snapshot.predictedOutcome}`,
    `Support: ${snapshot.recommendedSupport}`,
    `Signals: ${snapshot.sourceSignals.join("; ")}`,
    "Tone: warm, optional, non-threatening. Do not use failure predictions or fear framing.",
    "Offer gently only if useful. User remains in control.",
    "Do not mention this block unless offering optional support.",
  ].join("\n");
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}

export { dismissPredictiveOffer } from "./predictiveStore";
