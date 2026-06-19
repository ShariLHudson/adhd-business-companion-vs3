/**
 * Visual Thinking Sprint #1 — Decision Map view model from shared session data.
 */

import {
  optionLabels,
  type DecisionCompassAnswers,
  type DecisionResult,
  type DecisionType,
} from "./decisionCompass";
import type { PersistedDecisionCompassSession } from "./decisionCompassSessionStore";
import { enrichAuthority } from "./decisionCompassSessionAuthority";

export type DecisionMapOptionBranch = {
  label: string;
  reasons: string[];
  benefits: string[];
  concerns: string[];
  tradeoffs: string[];
  successPicture: string | null;
};

export type DecisionMapScore = {
  id: string;
  label: string;
  optionAPct: number;
  optionBPct: number;
  winner: "A" | "B" | null;
};

export type DecisionMapRecommendation = {
  choice: string;
  headline: string;
  summary: string;
  primaryReasons: string[];
};

export type DecisionMapViewModel = {
  decision: string;
  optionA: DecisionMapOptionBranch;
  optionB: DecisionMapOptionBranch;
  scores: DecisionMapScore[];
  recommendation: DecisionMapRecommendation | null;
  hasContent: boolean;
};

const TRADEOFF_DIMENSIONS: { id: string; label: string }[] = [
  { id: "freedom", label: "Freedom" },
  { id: "growth", label: "Growth" },
  { id: "stress", label: "Stress" },
  { id: "alignment", label: "Alignment" },
  { id: "clearer", label: "Clarity" },
  { id: "momentum", label: "Momentum" },
  { id: "values", label: "Values" },
  { id: "relief", label: "Relief" },
  { id: "future-me", label: "Future You" },
];

const PICK_BENEFIT_LABELS: Record<string, string> = {
  clearer: "Clearer first step",
  momentum: "More momentum",
  values: "Aligns with values",
  relief: "Feels lighter",
  "future-me": "Future You would thank you",
};

function text(answers: DecisionCompassAnswers, key: string): string | null {
  const val = answers[key]?.trim();
  return val || null;
}

function branchForSide(
  side: "a" | "b",
  label: string,
  answers: DecisionCompassAnswers,
  decisionType: DecisionType | null,
): DecisionMapOptionBranch {
  const suffix = side;
  const reasons: string[] = [];
  const benefits: string[] = [];
  const concerns: string[] = [];
  const tradeoffs: string[] = [];

  const why = text(answers, `why-${suffix}`);
  if (why) reasons.push(why);

  const firstHour = text(answers, `first-hour-${suffix}`);
  if (firstHour) reasons.push(firstHour);

  const hope = text(answers, `hope-${suffix}`);
  if (hope) {
    reasons.push(hope);
    benefits.push(hope);
  }

  const concern = text(answers, `concern-${suffix}`);
  if (concern) concerns.push(concern);

  const fear = text(answers, `fear-${suffix}`);
  if (fear) concerns.push(fear);

  const success = text(answers, `success-${suffix}`);
  const successPicture = success;

  for (const dim of TRADEOFF_DIMENSIONS) {
    const pick = answers[dim.id];
    if (pick === (side === "a" ? "A" : "B")) {
      tradeoffs.push(dim.label);
      const benefitLabel = PICK_BENEFIT_LABELS[dim.id];
      if (benefitLabel) benefits.push(benefitLabel);
    }
  }

  if (decisionType === "action" && firstHour && !benefits.length) {
    benefits.push("Has a concrete first hour");
  }

  return {
    label,
    reasons,
    benefits,
    concerns,
    tradeoffs,
    successPicture,
  };
}

export function buildDecisionMapScores(
  answers: DecisionCompassAnswers,
): DecisionMapScore[] {
  return TRADEOFF_DIMENSIONS.map(({ id, label }) => {
    const pick = answers[id];
    if (pick !== "A" && pick !== "B") {
      return { id, label, optionAPct: 0, optionBPct: 0, winner: null };
    }
    const winner: "A" | "B" = pick;
    return {
      id,
      label,
      optionAPct: winner === "A" ? 80 : 30,
      optionBPct: winner === "B" ? 80 : 30,
      winner,
    };
  }).filter((s) => s.winner !== null);
}

function recommendedSide(
  choice: string,
  labelA: string,
  labelB: string,
): "A" | "B" | null {
  const c = choice.trim().toLowerCase();
  if (c === labelA.toLowerCase() || c === "option a" || c === "a") return "A";
  if (c === labelB.toLowerCase() || c === "option b" || c === "b") return "B";
  if (labelA && c.includes(labelA.toLowerCase().slice(0, 12))) return "A";
  if (labelB && c.includes(labelB.toLowerCase().slice(0, 12))) return "B";
  return null;
}

export function primaryReasonsForRecommendation(
  session: PersistedDecisionCompassSession,
  result: DecisionResult,
): string[] {
  const { a: labelA, b: labelB } = optionLabels(session.answers);
  const side = recommendedSide(result.choice, labelA, labelB);
  const reasons: string[] = [];

  if (side === "A" || side === "B") {
    const suffix = side === "A" ? "a" : "b";
    const why = text(session.answers, `why-${suffix}`);
    if (why) reasons.push(why);
    const hope = text(session.answers, `hope-${suffix}`);
    if (hope) reasons.push(hope);
    const success = text(session.answers, `success-${suffix}`);
    if (success) reasons.push(success);
    const firstHour = text(session.answers, `first-hour-${suffix}`);
    if (firstHour) reasons.push(firstHour);
  }

  for (const dim of TRADEOFF_DIMENSIONS) {
    const pick = session.answers[dim.id];
    if (pick === side) {
      reasons.push(PICK_BENEFIT_LABELS[dim.id] ?? `Stronger on ${dim.label.toLowerCase()}`);
    }
  }

  if (!reasons.length && result.summary) {
    const stripped = result.summary.replace(/\*\*/g, "").trim();
    if (stripped) reasons.push(stripped);
  }

  return [...new Set(reasons)].slice(0, 5);
}

export function buildDecisionMapView(
  session: PersistedDecisionCompassSession | null,
): DecisionMapViewModel {
  const emptyBranch = (label: string): DecisionMapOptionBranch => ({
    label,
    reasons: [],
    benefits: [],
    concerns: [],
    tradeoffs: [],
    successPicture: null,
  });

  if (!session) {
    return {
      decision: "",
      optionA: emptyBranch("Option A"),
      optionB: emptyBranch("Option B"),
      scores: [],
      recommendation: null,
      hasContent: false,
    };
  }

  const { a: labelA, b: labelB } = optionLabels(session.answers);
  const optionA = session.optionA?.trim() || labelA;
  const optionB = session.optionB?.trim() || labelB;
  const decision =
    session.decision?.trim() || session.answers.decision?.trim() || "";

  const branchA = branchForSide(
    "a",
    optionA,
    session.answers,
    session.decisionType,
  );
  const branchB = branchForSide(
    "b",
    optionB,
    session.answers,
    session.decisionType,
  );
  const scores = buildDecisionMapScores(session.answers);

  let recommendation: DecisionMapRecommendation | null = null;
  const rec = session.recommendation;
  if (rec) {
    recommendation = {
      choice: rec.choice,
      headline: rec.headline,
      summary: rec.summary.replace(/\*\*/g, ""),
      primaryReasons: primaryReasonsForRecommendation(session, rec),
    };
  }

  const hasContent = Boolean(
    decision ||
      branchA.reasons.length ||
      branchB.reasons.length ||
      scores.length ||
      recommendation,
  );

  return {
    decision,
    optionA: branchA,
    optionB: branchB,
    scores,
    recommendation,
    hasContent,
  };
}

/** Build from authority snapshot — uses existing enrichAuthority path. */
export function buildDecisionMapViewFromSession(
  session: PersistedDecisionCompassSession | null,
): DecisionMapViewModel {
  if (!session) return buildDecisionMapView(null);
  enrichAuthority(session);
  return buildDecisionMapView(session);
}
