/**
 * Companion Intelligence — consumes the master profile only.
 * Does not collect signals.
 */

import { getIntelligenceProfile } from "./profileStore";
import {
  flattenTraitMaps,
  topTraitsFromMap,
} from "./profileEvolution";
import type {
  CompanionIntelligenceSlice,
  CompanionPersonalization,
  SupportStyleTrait,
  TraitScore,
} from "./types";

function pickTopSupportMode(profile: ReturnType<typeof getIntelligenceProfile>): SupportStyleTrait | null {
  const scores = topTraitsFromMap(profile.relationship.supportStyle, 1, 0.1);
  const trait = scores[0]?.trait;
  const valid: SupportStyleTrait[] = [
    "brainstorming",
    "accountability",
    "coaching",
    "problem_solving",
    "encouragement",
    "strategic_planning",
  ];
  return valid.includes(trait as SupportStyleTrait)
    ? (trait as SupportStyleTrait)
    : null;
}

function deriveTone(
  emotional: TraitScore[],
  overwhelmed: boolean,
): CompanionPersonalization["tone"] {
  if (overwhelmed) return "calm";
  const frustrated = emotional.some((t) => t.trait === "often_frustrated" && t.score > 60);
  const excited = emotional.some((t) => t.trait === "often_excited" && t.score > 60);
  if (frustrated) return "warm";
  if (excited) return "encouraging";
  const direct = topTraitsFromMap(
    getIntelligenceProfile().relationship.communicationStyle,
    1,
  ).some((t) => t.trait === "prefers_direct" && t.score > 55);
  return direct ? "direct" : "warm";
}

function deriveResponseLength(): CompanionPersonalization["responseLength"] {
  const comm = getIntelligenceProfile().relationship.communicationStyle;
  const detailed = comm.prefers_detailed?.score ?? 50;
  const short = comm.prefers_short?.score ?? 50;
  if (short > 62 && short > detailed) return "short";
  if (detailed > 62 && detailed > short) return "detailed";
  return "balanced";
}

function deriveAccountabilityLevel(): CompanionPersonalization["accountabilityLevel"] {
  const acc = getIntelligenceProfile().relationship.supportStyle.accountability;
  const nag = getIntelligenceProfile().relationship.trust.disengages_from_nagging;
  if (nag && nag.score > 65) return "low";
  if (acc && acc.score > 60) return "high";
  return "medium";
}

function buildCoachingHints(profile: ReturnType<typeof getIntelligenceProfile>): string[] {
  const hints: string[] = [];

  const overwhelm = profile.human.emotional.often_overwhelmed;
  if (overwhelm && overwhelm.score > 58 && overwhelm.confidence > 0.15) {
    hints.push("Break work into smaller pieces; avoid piling on tasks.");
  }

  const perfectionist = profile.human.executiveFunction.perfectionist;
  if (perfectionist && perfectionist.score > 58) {
    hints.push("Favor progress over polish; celebrate drafts.");
  }

  const smallWins = profile.adhd.momentum.small_wins;
  if (smallWins && smallWins.score > 55) {
    hints.push("Highlight small wins to build momentum.");
  }

  const accountability = profile.adhd.momentum.accountability;
  if (accountability && accountability.score > 55) {
    hints.push("Offer gentle accountability check-ins.");
  }

  const exampleDriven = profile.human.learning.example_driven;
  if (exampleDriven && exampleDriven.score > 55) {
    hints.push("Use concrete examples when explaining.");
  }

  const encouragement = profile.relationship.supportStyle.encouragement;
  if (encouragement && encouragement.score > 55) {
    hints.push("Lead with encouragement before strategy.");
  }

  return hints.slice(0, 6);
}

function buildOwnerManualSummary(
  profile: ReturnType<typeof getIntelligenceProfile>,
): string[] {
  const lines: string[] = [];

  const humanTop = topTraitsFromMap(
  flattenTraitMaps(
      profile.human.executiveFunction,
      profile.human.emotional,
      profile.human.energy,
    ).reduce(
      (acc, t) => {
        acc[t.trait] = t;
        return acc;
      },
      {} as Record<string, TraitScore>,
    ),
    2,
    0.12,
  );
  for (const t of humanTop) {
    lines.push(`Tends toward ${t.trait.replace(/_/g, " ")}.`);
  }

  const momentumTop = topTraitsFromMap(profile.adhd.momentum, 2, 0.12);
  for (const t of momentumTop) {
    lines.push(`Momentum often comes from ${t.trait.replace(/_/g, " ")}.`);
  }

  const resistanceTop = topTraitsFromMap(profile.adhd.resistance, 1, 0.12);
  for (const t of resistanceTop) {
    lines.push(`May avoid when facing ${t.trait.replace(/_/g, " ")}.`);
  }

  return lines.slice(0, 5);
}

export function buildCompanionPersonalization(): CompanionPersonalization {
  const profile = getIntelligenceProfile();
  const emotional = topTraitsFromMap(profile.human.emotional, 3);
  const overwhelmed =
    (profile.human.emotional.often_overwhelmed?.score ?? 0) > 58;

  return {
    tone: deriveTone(emotional, overwhelmed),
    responseLength: deriveResponseLength(),
    primarySupportMode: pickTopSupportMode(profile),
    accountabilityLevel: deriveAccountabilityLevel(),
    coachingHints: buildCoachingHints(profile),
    ownerManualSummary: buildOwnerManualSummary(profile),
    generatedAt: new Date().toISOString(),
  };
}

export function getCompanionIntelligenceSlice(): CompanionIntelligenceSlice {
  const profile = getIntelligenceProfile();
  const personalization = buildCompanionPersonalization();

  const topHuman = topTraitsFromMap(
    flattenTraitMaps(
      profile.human.executiveFunction,
      profile.human.emotional,
      profile.human.energy,
    ).reduce(
      (acc, t) => {
        acc[t.trait] = t;
        return acc;
      },
      {} as Record<string, TraitScore>,
    ),
    3,
    0.1,
  ).map((t) => t.trait);

  const topAdhdMomentum = topTraitsFromMap(profile.adhd.momentum, 3, 0.1).map(
    (t) => t.trait,
  );

  const topBusiness = topTraitsFromMap(
    flattenTraitMaps(
      profile.business.identity,
      profile.business.visibility,
      profile.business.revenueActivity,
    ).reduce(
      (acc, t) => {
        acc[t.trait] = t;
        return acc;
      },
      {} as Record<string, TraitScore>,
    ),
    3,
    0.1,
  ).map((t) => t.trait);

  return {
    personalization,
    topHumanTraits: topHuman,
    topAdhdMomentum,
    topBusinessFocus: topBusiness,
  };
}

/** Prompt-ready context string — invisible to user, one companion voice */
export function formatCompanionIntelligenceForPrompt(): string | null {
  const slice = getCompanionIntelligenceSlice();
  const { personalization: p } = slice;
  if (
    slice.topHumanTraits.length === 0 &&
    slice.topAdhdMomentum.length === 0 &&
    p.coachingHints.length === 0
  ) {
    return null;
  }

  const parts: string[] = [
    "[Companion Intelligence — internal owner manual; one voice only]",
    `Tone: ${p.tone}; length: ${p.responseLength}; accountability: ${p.accountabilityLevel}.`,
  ];
  if (p.primarySupportMode) {
    parts.push(`Preferred support: ${p.primarySupportMode.replace(/_/g, " ")}.`);
  }
  if (p.coachingHints.length) {
    parts.push(`Coaching: ${p.coachingHints.join(" ")}`);
  }
  if (p.ownerManualSummary.length) {
    parts.push(`Patterns: ${p.ownerManualSummary.join(" ")}`);
  }
  return parts.join("\n");
}
