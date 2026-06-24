/**
 * Relationship Observation Engine™
 * Transforms stored memories into observed behaviors — not trait labels.
 */

import { getUserInterventionEffectiveness } from "./companionInterventionLearning";
import { getPhase1OnboardingState } from "./phase1Onboarding";
import {
  buildWhatIveLearnedProfile,
  getPhase2DiscoveryState,
  type AdhdPatternId,
  type Phase2LearningStyleId,
} from "./phase2ProgressiveDiscovery";
import {
  buildUserOperatingManual,
  daysSinceRelationshipStart,
  getPhase3RelationshipState,
  type PredictivePatternId,
} from "./phase3AdaptiveRelationship";
import {
  buildPersonalOperatingManual,
  getPhase5EcosystemState,
} from "./phase5CompanionIntelligenceEcosystem";
import {
  collectOperatingSystemObservationCandidates,
} from "./adhdOperatingSystemIntelligence";
import { buildWisdomIntelligenceSummary } from "./wisdomIntelligence";
import {
  buildOriginSnapshot,
  buildPatternEvolution,
  buildThenNowComparisons,
  buildTransformationIntelligenceSnapshot,
} from "./transformationIntelligence";
import {
  topRelevantObservations,
  type ObservationRankingContext,
} from "./relationshipObservationRelevance";

export type { ObservationRankingContext };

export type ObservationCategory =
  | "decision_making"
  | "work_style"
  | "business_building"
  | "energy_patterns"
  | "adhd_patterns"
  | "focus_patterns"
  | "learning_style"
  | "relationship_style"
  | "growth_patterns"
  | "strengths"
  | "recurring_obstacles"
  | "transformation_signals";

export type ObservationConfidence = "early" | "forming" | "strong";

export type RelationshipObservation = {
  id: string;
  category: ObservationCategory;
  /** Behavioral observation — how the user works, not a label. */
  text: string;
  /** Optional evidence line (frequency, resource use, etc.). */
  evidence?: string;
  confidence: ObservationConfidence;
  frequency: number;
  recencyDays: number;
  score: number;
  source: string;
};

export type RelationshipObservationsResult = {
  observations: RelationshipObservation[];
  transformationNarrative: string;
  responseStructure: string;
};

const MAX_OBSERVATIONS = 7;
const MIN_OBSERVATIONS = 3;

/** Product / storage tokens that must never appear in user-facing observation text. */
export const RAW_SIGNAL_BAN_PATTERNS: RegExp[] = [
  /\bdecision compass\b/i,
  /\bclear my mind\b/i,
  /\bplan my day\b/i,
  /\badapt my day\b/i,
  /\bfocus audio\b/i,
  /\bcontent tools\b/i,
  /\bbrain parking\b/i,
  /\bsafe for today\b/i,
  /\bspin the wheel\b/i,
  /\bcontent[_ ]creation\b/i,
  /\bconversational clarity\b/i,
  /\bvisual[_ ]learning\b/i,
  /\bvisual comparison\b/i,
  /\bdecision[_ ]overload\b/i,
  /\bshiny[_ ]object\b/i,
  /\bfollow[_ ]through\b/i,
  /\boverthinks under uncertainty\b/i,
  /\bbenefits from\b/i,
  /\bneeds visual\b/i,
  /\b[a-z]+_[a-z_]+\b/,
];

const RESOURCE_SIGNAL_OBSERVATIONS: Record<string, string> = {
  decision_compass:
    "When several options are competing for attention, mapping them out visually appears to help you move forward.",
  clear_my_mind:
    "When your head feels crowded, getting thoughts out of your head and into something you can see often restores focus faster than pushing harder mentally.",
  create:
    "You generate momentum by making something tangible — ideas become real for you once they're in draft form.",
  plan_my_day:
    "You often move better once the day has a visible structure — wide-open ambiguity can drain momentum.",
  strategy:
    "Stepping back to see the bigger picture helps you choose a direction before diving into execution.",
  conversation:
    "You often seem to gain clarity by talking things through rather than trying to solve everything internally.",
};

const INTERVENTION_SIGNAL_OBSERVATIONS: Record<string, string> = {
  clear_my_mind: RESOURCE_SIGNAL_OBSERVATIONS.clear_my_mind!,
  decision_compass: RESOURCE_SIGNAL_OBSERVATIONS.decision_compass!,
  plan_my_day: RESOURCE_SIGNAL_OBSERVATIONS.plan_my_day!,
  adapt_my_day:
    "When the plan breaks, you recover faster by reshaping the day than by forcing the original schedule.",
  create_workspace: RESOURCE_SIGNAL_OBSERVATIONS.create!,
  content_tools:
    "You tend to generate ideas easily; choosing which ones to pursue is usually the harder part.",
  templates:
    "Reusable starting points lower the activation energy — blank pages cost you more than refining something that already exists.",
  strategies:
    "Having a named approach to try often helps you commit to one path instead of debating every option from scratch.",
  snippets:
    "Small reusable pieces of language or structure help you ship faster when perfectionism wants one more rewrite.",
  projects:
    "Seeing work organized into projects helps you protect focus — scattered tasks pull attention in every direction.",
  focus_audio:
    "External rhythm or sound sometimes helps you stay with one thread when internal noise gets loud.",
  email: "Batching communication often protects your deep-work windows from constant context switching.",
  calendar:
    "Time boundaries help you protect energy — unstructured days tend to fill with reactive work.",
  sales_call_support:
    "Preparing for sales conversations ahead of time helps you show up with confidence instead of improvising under pressure.",
  visibility_support:
    "Support around being seen helps you share work before it feels perfect — visibility often lags behind readiness.",
  conversation_coaching: RESOURCE_SIGNAL_OBSERVATIONS.conversation!,
};

const MOMENTUM_SIGNAL_OBSERVATIONS: Record<string, string> = {
  content_creation: INTERVENTION_SIGNAL_OBSERVATIONS.content_tools!,
  content_creation_label:
    "You tend to generate ideas easily; choosing which ones to pursue is usually the harder part.",
  sales_conversation:
    "Live conversations often create momentum for you — talking with someone real moves things faster than planning alone.",
  sales_conversations:
    "Live conversations often create momentum for you — talking with someone real moves things faster than planning alone.",
  client_outreach:
    "Reaching out directly tends to create movement — waiting for inbound interest alone often stalls progress.",
  offer_refinement:
    "Sharpening what you offer can feel productive, though it sometimes delays putting the offer in front of people.",
  launch_activity:
    "Launch windows energize you, though they can also expand scope faster than you intended.",
  decision_compass_momentum:
    "Choosing a direction — even imperfectly — often unlocks momentum faster than holding every option open.",
  create: RESOURCE_SIGNAL_OBSERVATIONS.create!,
  conversation: RESOURCE_SIGNAL_OBSERVATIONS.conversation!,
  conversations: RESOURCE_SIGNAL_OBSERVATIONS.conversation!,
  clear_priorities:
    "When priorities are explicit, movement comes faster — ambiguity is often what slows you down.",
};

const DECISION_MANUAL_SIGNAL_OBSERVATIONS: Record<string, string> = {
  benefits_from_decision_compass: RESOURCE_SIGNAL_OBSERVATIONS.decision_compass!,
  needs_visual_comparison:
    "You often need to see choices side by side before a decision feels settled — not because you're indecisive, but because you can see merit in more than one path.",
  overthinks_under_uncertainty:
    "When the path forward isn't clear, thinking can loop instead of narrowing — clarity often arrives after you shrink the question.",
  conversational_clarity_before_committing: RESOURCE_SIGNAL_OBSERVATIONS.conversation!,
};

function normalizeSignalKey(signal: string): string {
  return signal
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function containsRawSignalName(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (trimmed.length < 28) return true;
  return RAW_SIGNAL_BAN_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function isCompanionGradeObservation(text: string): boolean {
  if (containsRawSignalName(text)) return false;
  if (!/\b(you|your|often|tend|when|seem|usually|sometimes)\b/i.test(text)) {
    return false;
  }
  return true;
}

function humanizeEvidence(evidence: string): string {
  return evidence
    .replace(/\bDecision Compass\b/gi, "choice-mapping support")
    .replace(/\bClear My Mind\b/gi, "mental decluttering")
    .replace(/\bPlan My Day\b/gi, "day structuring")
    .replace(/\boperating manual signals\b/i, "how you tend to work")
    .replace(/\blearning-style signal\b/i, "how you learn best")
    .replace(/\bFollow-through growth signal\b/i, "finishing momentum")
    .replace(/[A-Za-z]+_[A-Za-z_]+/g, (match) => match.replace(/_/g, " "));
}

function lookupSignalObservation(
  map: Record<string, string>,
  signal: string,
): string | null {
  const key = normalizeSignalKey(signal);
  if (map[key]) return map[key]!;
  const compact = key.replace(/_/g, "");
  for (const [candidateKey, observation] of Object.entries(map)) {
    const candidateCompact = candidateKey.replace(/_/g, "");
    if (
      compact.includes(candidateCompact) ||
      candidateCompact.includes(compact)
    ) {
      return observation;
    }
  }
  return null;
}

function translateResourceSignal(resourceId: string): string | null {
  return (
    RESOURCE_SIGNAL_OBSERVATIONS[resourceId] ??
    lookupSignalObservation(RESOURCE_SIGNAL_OBSERVATIONS, resourceId)
  );
}

function translateInterventionSignal(
  interventionId: string,
  label?: string,
): string | null {
  return (
    INTERVENTION_SIGNAL_OBSERVATIONS[interventionId] ??
    lookupSignalObservation(INTERVENTION_SIGNAL_OBSERVATIONS, interventionId) ??
    (label ? translateMomentumSignal(label) : null)
  );
}

function translateDecisionManualSignal(signal: string): string | null {
  const direct = lookupSignalObservation(DECISION_MANUAL_SIGNAL_OBSERVATIONS, signal);
  if (direct) return direct;

  const norm = normalizeSignalKey(signal);
  if (/visual|comparison|map|options/.test(norm)) {
    return DECISION_MANUAL_SIGNAL_OBSERVATIONS.needs_visual_comparison!;
  }
  if (/conversational|talk|clarity|commit/.test(norm)) {
    return DECISION_MANUAL_SIGNAL_OBSERVATIONS.conversational_clarity_before_committing!;
  }
  if (/overthink|uncertain|uncertainty|stuck/.test(norm)) {
    return DECISION_MANUAL_SIGNAL_OBSERVATIONS.overthinks_under_uncertainty!;
  }
  if (/decision/.test(norm)) {
    return RESOURCE_SIGNAL_OBSERVATIONS.decision_compass!;
  }
  return null;
}

function translateMomentumSignal(signal: string): string | null {
  const direct = lookupSignalObservation(MOMENTUM_SIGNAL_OBSERVATIONS, signal);
  if (direct) return direct;

  const norm = normalizeSignalKey(signal);
  if (/content|creat|generat|idea/.test(norm)) {
    return MOMENTUM_SIGNAL_OBSERVATIONS.content_creation_label!;
  }
  if (/conversation|talk|coach/.test(norm)) {
    return MOMENTUM_SIGNAL_OBSERVATIONS.conversation!;
  }
  if (/priority|focus|clear/.test(norm)) {
    return MOMENTUM_SIGNAL_OBSERVATIONS.clear_priorities!;
  }
  if (/sales|client|outreach/.test(norm)) {
    return MOMENTUM_SIGNAL_OBSERVATIONS.sales_conversation!;
  }
  if (/launch|ship|publish/.test(norm)) {
    return MOMENTUM_SIGNAL_OBSERVATIONS.launch_activity!;
  }
  if (/decision|compass|choose/.test(norm)) {
    return MOMENTUM_SIGNAL_OBSERVATIONS.decision_compass_momentum!;
  }
  if (/offer|refin/.test(norm)) {
    return MOMENTUM_SIGNAL_OBSERVATIONS.offer_refinement!;
  }
  return null;
}

function finalizeObservationText(text: string): string | null {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  const withoutLabelPrefix = behavioralizeLabeledLine(trimmed);
  if (!isCompanionGradeObservation(withoutLabelPrefix)) return null;
  return withoutLabelPrefix.endsWith(".")
    ? withoutLabelPrefix
    : `${withoutLabelPrefix}.`;
}

const ADHD_PATTERN_OBSERVATIONS: Record<
  AdhdPatternId,
  { text: string; category: ObservationCategory }
> = {
  shiny_object_syndrome: {
    category: "adhd_patterns",
    text:
      "New ideas often create energy and momentum for you, sometimes making an unfinished project feel less interesting.",
  },
  follow_through_challenges: {
    category: "recurring_obstacles",
    text:
      "You often keep refining an idea because you care deeply about getting it right, which can make it difficult to decide something is ready.",
  },
  perfectionism: {
    category: "adhd_patterns",
    text:
      "Quality matters to you — and that care can turn into one more tweak instead of calling something done.",
  },
  planning_addiction: {
    category: "work_style",
    text:
      "Planning can feel productive for you — sometimes more energizing than the next visible step forward.",
  },
  launch_avoidance: {
    category: "business_building",
    text:
      "The stretch between 'almost ready' and 'out in the world' tends to be where momentum slows for you.",
  },
  visibility_resistance: {
    category: "business_building",
    text:
      "Creating often comes more naturally than being seen — visibility conversations can carry more weight than the work itself.",
  },
  pricing_anxiety: {
    category: "business_building",
    text:
      "When pricing comes up, uncertainty can crowd out the value you already bring — not because the value isn't there.",
  },
  overwhelm_cycles: {
    category: "energy_patterns",
    text:
      "When load builds, everything can feel equally urgent — and that's often when pushing harder stops helping.",
  },
};

const PREDICTIVE_PATTERN_OBSERVATIONS: Record<
  PredictivePatternId,
  { text: string; category: ObservationCategory }
> = {
  decision_overload_after_ideas: {
    category: "decision_making",
    text:
      "When several good options exist, choosing one path can become harder because you can see value in multiple directions.",
  },
  launch_overwhelm: {
    category: "business_building",
    text:
      "Launch windows can bring a wave of 'everything at once' — and that's when scope tends to expand fastest.",
  },
  visibility_avoidance: {
    category: "business_building",
    text:
      "You may delay sharing work until it feels safer — even when the draft is already good enough to learn from.",
  },
  pricing_confidence_drop: {
    category: "business_building",
    text:
      "Pricing conversations can temporarily shrink your confidence, even when clients respond well to what you offer.",
  },
  monday_friction: {
    category: "energy_patterns",
    text:
      "Mondays sometimes carry extra friction for you — the week hasn't found its rhythm yet.",
  },
  cognitive_overload: {
    category: "focus_patterns",
    text:
      "When too much is in your head at once, focus fragments — not from lack of care, but from carrying too many open loops.",
  },
  launch_avoidance: {
    category: "business_building",
    text:
      "Shipping can feel riskier than building — so 'one more improvement' often wins over 'good enough to test.'",
  },
  disengagement: {
    category: "relationship_style",
    text:
      "When momentum drops, you may go quiet rather than ask for help — not because you don't care, but because restarting feels heavy.",
  },
};

const LEARNING_STYLE_OBSERVATIONS: Partial<
  Record<Phase2LearningStyleId, { text: string; category: ObservationCategory }>
> = {
  visual: {
    category: "learning_style",
    text:
      "You often seem to gain clarity when options are mapped visually — holding everything in your head alone gets harder.",
  },
  conversational: {
    category: "learning_style",
    text:
      "You often seem to gain clarity while talking something through rather than before the conversation begins.",
  },
  action_oriented: {
    category: "work_style",
    text:
      "Movement creates understanding for you — a small first step often reveals what a long plan couldn't.",
  },
  read_write: {
    category: "learning_style",
    text:
      "Writing ideas down or reading them back often helps you see structure you couldn't feel while thinking alone.",
  },
  hybrid: {
    category: "learning_style",
    text:
      "You learn in more than one mode — talking, seeing, and doing each unlock different parts of clarity for you.",
  },
};

function confidenceFromCount(count: number): ObservationConfidence {
  if (count >= 4) return "strong";
  if (count >= 2) return "forming";
  return "early";
}

function daysSince(iso: string, now: Date): number {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 999;
  return Math.max(0, Math.floor((now.getTime() - t) / 86_400_000));
}

function recencyScore(recencyDays: number): number {
  if (recencyDays <= 7) return 1;
  if (recencyDays <= 30) return 0.85;
  if (recencyDays <= 90) return 0.65;
  if (recencyDays <= 180) return 0.45;
  return 0.25;
}

function confidenceScore(c: ObservationConfidence): number {
  if (c === "strong") return 1;
  if (c === "forming") return 0.65;
  return 0.35;
}

function relationshipAgeBoost(relationshipDays: number, patternCount: number): number {
  if (relationshipDays >= 365 && patternCount >= 3) return 0.15;
  if (relationshipDays >= 90 && patternCount >= 2) return 0.1;
  if (relationshipDays >= 30) return 0.05;
  return 0;
}

function rankObservation(input: {
  frequency: number;
  confidence: ObservationConfidence;
  recencyDays: number;
  relationshipDays: number;
}): number {
  const freqNorm = Math.min(input.frequency / 6, 1);
  const recency = recencyScore(input.recencyDays);
  const conf = confidenceScore(input.confidence);
  const age = relationshipAgeBoost(input.relationshipDays, input.frequency);
  return freqNorm * 0.35 + conf * 0.3 + recency * 0.25 + age * 0.1;
}

function pushCandidate(
  list: RelationshipObservation[],
  seen: Set<string>,
  candidate: Omit<RelationshipObservation, "score"> & { score?: number },
  now: Date,
) {
  const key = candidate.text.toLowerCase().slice(0, 80);
  if (seen.has(key)) return;
  seen.add(key);

  const relationshipDays = daysSinceRelationshipStart(now);
  const score =
    candidate.score ??
    rankObservation({
      frequency: candidate.frequency,
      confidence: candidate.confidence,
      recencyDays: candidate.recencyDays,
      relationshipDays,
    });

  list.push({ ...candidate, score });
}

function behavioralizeLabeledLine(text: string): string {
  const colon = text.indexOf(":");
  if (colon > 0 && colon < 48) {
    const label = text.slice(0, colon).trim();
    const body = text.slice(colon + 1).trim();
    const translated = translateMomentumSignal(label) ?? translateDecisionManualSignal(label);
    if (translated) return translated;
    if (body.length > 24 && !/^(early|growing|strong)$/i.test(label)) {
      return body;
    }
  }

  const translated =
    translateDecisionManualSignal(text) ??
    translateMomentumSignal(text) ??
    translateInterventionSignal(normalizeSignalKey(text), text);
  if (translated) return translated;

  return text
    .replace(/\bshiny object syndrome\b/gi, "starting new ideas")
    .replace(/\bdecision overload\b/gi, "too many good options at once")
    .replace(/\bfollow[- ]through challenges?\b/gi, "finishing what you start");
}

function evolutionObservation(
  patternId: string,
  improving: boolean,
  label: string,
): string | null {
  const adhdId = patternId as AdhdPatternId;
  const behavioral = ADHD_PATTERN_OBSERVATIONS[adhdId];
  if (behavioral) {
    return improving
      ? `${behavioral.text} Lately, you're navigating this more intentionally than when we started.`
      : behavioral.text;
  }
  return improving
    ? `This friction still shows up sometimes — but you're handling it differently than when we started.`
    : challengeObservation(label);
}

function challengeObservation(label: string): string | null {
  const lower = label.toLowerCase();
  if (/finish|follow.?through|complete/i.test(lower)) {
    return "Finishing often competes with starting something new — not because you lack commitment, but because open loops pull attention.";
  }
  if (/overwhelm/i.test(lower)) {
    return "When overwhelm shows up, everything can feel equally urgent — and that's when narrowing scope matters most.";
  }
  if (/decision|choos/i.test(lower)) {
    return "Decisions can stall when you can see merit in more than one path — clarity often comes after narrowing, not before.";
  }
  if (/visibility|marketing|seen/i.test(lower)) {
    return "Being seen can feel heavier than creating — the work may be ready before you feel ready to share it.";
  }
  if (containsRawSignalName(label)) {
    return "This theme keeps resurfacing in our conversations — it's a recurring friction point, not a one-off bad week.";
  }
  return `You've named "${label}" repeatedly in our conversations — it's a recurring friction point, not a one-off bad week.`;
}

function strengthObservation(strength: string): string | null {
  if (containsRawSignalName(strength)) return null;
  const body = strength.trim();
  if (body.length < 4) return null;
  return `I've noticed ${body.charAt(0).toLowerCase()}${body.slice(1)} shows up as a real asset in how you work — not just something you aspire to.`;
}

function collectObservationCandidates(now = new Date()): RelationshipObservation[] {
  const p2 = getPhase2DiscoveryState();
  const p3 = getPhase3RelationshipState();
  const p5 = getPhase5EcosystemState();
  const profile = buildWhatIveLearnedProfile();
  const manual = buildPersonalOperatingManual();
  const userManual = buildUserOperatingManual();
  const wisdom = buildWisdomIntelligenceSummary();
  const candidates: RelationshipObservation[] = [];
  const seen = new Set<string>();

  const osCandidates = collectOperatingSystemObservationCandidates(now);
  const osIds = new Set(osCandidates.map((c) => c.id));
  const hasOsCompletion = osCandidates.some(
    (c) =>
      c.source === "os:completion" ||
      c.source === "os:business" ||
      c.id.startsWith("os-completion-"),
  );
  const hasOsOverwhelm = osCandidates.some(
    (c) => c.id === "os-momentum-overwhelm-competition",
  );

  for (const os of osCandidates) {
    pushCandidate(candidates, seen, os, now);
  }

  for (const pattern of p2.adhdPatterns) {
    if (
      hasOsCompletion &&
      (pattern.id === "follow_through_challenges" || pattern.id === "shiny_object_syndrome")
    ) {
      continue;
    }
    if (hasOsOverwhelm && pattern.id === "overwhelm_cycles") continue;
    const def = ADHD_PATTERN_OBSERVATIONS[pattern.id];
    if (!def) continue;
    const conf = confidenceFromCount(pattern.count);
    if (conf === "early" && pattern.count < 2) continue;
    pushCandidate(
      candidates,
      seen,
      {
        id: `adhd-${pattern.id}`,
        category: def.category,
        text: def.text,
        evidence: `Observed across ${pattern.count} conversations`,
        confidence: conf,
        frequency: pattern.count,
        recencyDays: daysSince(pattern.lastSeen, now),
        source: pattern.id,
      },
      now,
    );
  }

  for (const pattern of p3.predictivePatterns) {
    const def = PREDICTIVE_PATTERN_OBSERVATIONS[pattern.id];
    if (!def) continue;
    const conf =
      pattern.confidence === "strong"
        ? "strong"
        : pattern.confidence === "growing"
          ? "forming"
          : "early";
    if (conf === "early" && pattern.count < 2) continue;
    pushCandidate(
      candidates,
      seen,
      {
        id: `predictive-${pattern.id}`,
        category: def.category,
        text: def.text,
        evidence: `Pattern noted ${pattern.count}×`,
        confidence: conf,
        frequency: pattern.count,
        recencyDays: daysSince(pattern.lastSeen, now),
        source: pattern.id,
      },
      now,
    );
  }

  for (const challenge of p2.challenges.filter((c) => c.count >= 2)) {
    const text = finalizeObservationText(challengeObservation(challenge.label) ?? "");
    if (!text) continue;
    pushCandidate(
      candidates,
      seen,
      {
        id: `challenge-${challenge.label}`,
        category: "recurring_obstacles",
        text,
        evidence: humanizeEvidence(`Named ${challenge.count}× in conversation`),
        confidence: confidenceFromCount(challenge.count),
        frequency: challenge.count,
        recencyDays: daysSince(challenge.lastSeen, now),
        source: challenge.label,
      },
      now,
    );
  }

  const styleDef = LEARNING_STYLE_OBSERVATIONS[p2.learningStyle.primary];
  if (styleDef && p2.learningStyle.confidence >= 0.35) {
    pushCandidate(
      candidates,
      seen,
      {
        id: `learning-${p2.learningStyle.primary}`,
        category: styleDef.category,
        text: styleDef.text,
        evidence:
          p2.learningStyle.confidence >= 0.65
            ? humanizeEvidence("Consistent signal for how you learn best")
            : humanizeEvidence("Emerging signal for how you learn best"),
        confidence:
          p2.learningStyle.confidence >= 0.65
            ? "strong"
            : p2.learningStyle.confidence >= 0.45
              ? "forming"
              : "early",
        frequency: Math.round(p2.learningStyle.confidence * 6),
        recencyDays: daysSince(p2.lastSessionAt, now),
        source: p2.learningStyle.primary,
      },
      now,
    );
  }

  for (const resource of p2.resources.filter((r) => r.helpfulScore >= 50)) {
    const text = finalizeObservationText(translateResourceSignal(resource.id) ?? "");
    if (!text) continue;
    pushCandidate(
      candidates,
      seen,
      {
        id: `resource-${resource.id}`,
        category: "decision_making",
        text,
        evidence: humanizeEvidence(`Rated helpful in recent use (${resource.helpfulScore}/100)`),
        confidence: resource.helpfulScore >= 70 ? "strong" : "forming",
        frequency: Math.round(resource.helpfulScore / 20),
        recencyDays: daysSince(p2.lastSessionAt, now),
        source: resource.id,
      },
      now,
    );
  }

  if (p2.energy.peakWindow && p2.energy.completionsByWindow[p2.energy.peakWindow] >= 2) {
    pushCandidate(
      candidates,
      seen,
      {
        id: `energy-${p2.energy.peakWindow}`,
        category: "energy_patterns",
        text: `You often find your stride in the ${p2.energy.peakWindow} — that's when movement tends to stick.`,
        evidence: `${p2.energy.completionsByWindow[p2.energy.peakWindow]} completions in that window`,
        confidence: "forming",
        frequency: p2.energy.completionsByWindow[p2.energy.peakWindow],
        recencyDays: daysSince(p2.lastSessionAt, now),
        source: p2.energy.peakWindow,
      },
      now,
    );
  }

  for (const decision of manual.howIMakeDecisions.slice(0, 2)) {
    const text = finalizeObservationText(translateDecisionManualSignal(decision) ?? "");
    if (!text) continue;
    pushCandidate(
      candidates,
      seen,
      {
        id: `decision-manual-${decision.slice(0, 24)}`,
        category: "decision_making",
        text,
        evidence: humanizeEvidence("Observed across how you tend to decide"),
        confidence: "forming",
        frequency: 3,
        recencyDays: daysSince(p2.lastSessionAt, now),
        source: "operating_manual",
      },
      now,
    );
  }

  for (const momentum of manual.whatCreatesMomentum.slice(0, 2)) {
    const text = finalizeObservationText(translateMomentumSignal(momentum) ?? "");
    if (!text) continue;
    pushCandidate(
      candidates,
      seen,
      {
        id: `momentum-${momentum.slice(0, 24)}`,
        category: "growth_patterns",
        text,
        evidence: humanizeEvidence("Momentum pattern from recent sessions"),
        confidence: "forming",
        frequency: 3,
        recencyDays: daysSince(p2.lastSessionAt, now),
        source: "momentum",
      },
      now,
    );
  }

  for (const strength of profile.strengths.slice(0, 2)) {
    const text = finalizeObservationText(strengthObservation(strength) ?? "");
    if (!text) continue;
    pushCandidate(
      candidates,
      seen,
      {
        id: `strength-${strength}`,
        category: "strengths",
        text,
        evidence: humanizeEvidence("Named as a strength in relationship profile"),
        confidence: "forming",
        frequency: 2,
        recencyDays: daysSince(p2.lastSessionAt, now),
        source: strength,
      },
      now,
    );
  }

  for (const w of wisdom.patternWisdom.slice(0, 2)) {
    const text = finalizeObservationText(behavioralizeLabeledLine(w));
    if (!text) continue;
    pushCandidate(
      candidates,
      seen,
      {
        id: `wisdom-${text.slice(0, 24)}`,
        category: "transformation_signals",
        text,
        evidence: humanizeEvidence("Earned wisdom from repeated experience"),
        confidence: "strong",
        frequency: 4,
        recencyDays: daysSince(p2.lastSessionAt, now),
        source: "wisdom",
      },
      now,
    );
  }

  for (const evolution of buildPatternEvolution(now).slice(0, 2)) {
    if (evolution.evidence === "early") continue;
    if (
      hasOsCompletion &&
      (evolution.id === "shiny_object_syndrome" ||
        evolution.id === "follow_through_challenges")
    ) {
      continue;
    }
    const improving = /improved|differently|shifting/i.test(evolution.narrative);
    const text = finalizeObservationText(
      evolutionObservation(evolution.id, improving, evolution.label) ?? "",
    );
    if (!text) continue;
    pushCandidate(
      candidates,
      seen,
      {
        id: `evolution-${evolution.id}`,
        category: "transformation_signals",
        text,
        evidence: humanizeEvidence(`Seen across ${p2.sessionCount} sessions`),
        confidence: evolution.evidence === "strong" ? "strong" : "forming",
        frequency: 4,
        recencyDays: daysSince(p2.lastSessionAt, now),
        source: evolution.id,
      },
      now,
    );
  }

  const followThrough = p5.growthSignals.follow_through_improving ?? 0;
  if (followThrough >= 2) {
    pushCandidate(
      candidates,
      seen,
      {
        id: "growth-follow-through",
        category: "growth_patterns",
        text:
          "You're finishing more than you used to — the pattern hasn't vanished, but the ratio is shifting.",
        evidence: humanizeEvidence(`Finishing momentum noted ${followThrough}× recently`),
        confidence: confidenceFromCount(followThrough),
        frequency: followThrough,
        recencyDays: daysSince(p2.lastSessionAt, now),
        source: "follow_through_improving",
      },
      now,
    );
  }

  if (profile.business.currentGoal) {
    pushCandidate(
      candidates,
      seen,
      {
        id: "business-goal",
        category: "business_building",
        text: `Right now, "${profile.business.currentGoal}" keeps surfacing as the thread you're trying to protect — not just a task on a list.`,
        evidence: "Current goal signal from recent conversations",
        confidence: "forming",
        frequency: 3,
        recencyDays: daysSince(p2.goals[0]?.recordedAt ?? p2.lastSessionAt, now),
        source: profile.business.currentGoal,
      },
      now,
    );
  }

  const effective = getUserInterventionEffectiveness()
    .filter((e) => e.rates.adaptiveWeight >= 60 && e.counts.completed >= 2)
    .slice(0, 1);
  for (const e of effective) {
    const text = finalizeObservationText(
      translateInterventionSignal(e.id, e.label) ?? "",
    );
    if (!text) continue;
    pushCandidate(
      candidates,
      seen,
      {
        id: `intervention-${e.id}`,
        category: "focus_patterns",
        text,
        evidence: humanizeEvidence(
          `Helped you move forward ${e.counts.completed}× recently`,
        ),
        confidence: e.counts.completed >= 4 ? "strong" : "forming",
        frequency: e.counts.completed,
        recencyDays: daysSince(p2.lastSessionAt, now),
        source: e.id,
      },
      now,
    );
  }

  if (userManual.frictionPatterns.length && candidates.length < MIN_OBSERVATIONS) {
    for (const friction of userManual.frictionPatterns.slice(0, 2)) {
      const text = finalizeObservationText(challengeObservation(friction) ?? "");
      if (!text) continue;
      pushCandidate(
        candidates,
        seen,
        {
          id: `friction-${friction}`,
          category: "recurring_obstacles",
          text,
          evidence: humanizeEvidence("Friction pattern from how you work"),
          confidence: "forming",
          frequency: 2,
          recencyDays: daysSince(p2.lastSessionAt, now),
          source: friction,
        },
        now,
      );
    }
  }

  return candidates.sort((a, b) => b.score - a.score);
}

/**
 * Top 3–7 strongest behavioral observations, ranked by frequency, confidence, recency, and relationship age.
 */
export function buildRelationshipObservations(
  now = new Date(),
  options?: { userText?: string; limit?: number; workspace?: string | null },
): RelationshipObservation[] {
  const limit = Math.min(options?.limit ?? MAX_OBSERVATIONS, MAX_OBSERVATIONS);
  const candidates = collectObservationCandidates(now);
  const context: ObservationRankingContext = {
    userText: options?.userText,
    workspace: options?.workspace,
    now,
  };

  const ranked = topRelevantObservations(candidates, context, MAX_OBSERVATIONS);

  const strong = ranked.filter((o) => o.confidence !== "early");
  const pool = strong.length >= MIN_OBSERVATIONS ? strong : ranked;
  const count = Math.max(MIN_OBSERVATIONS, Math.min(limit, pool.length));
  return pool.slice(0, count);
}

/** @deprecated Use relationshipObservationRelevance.rankObservationsByRelevance */
function prioritizeForQuestion(
  observations: RelationshipObservation[],
  userText: string,
): RelationshipObservation[] {
  const t = userText.toLowerCase();
  const boost = (o: RelationshipObservation, amount: number) => ({
    ...o,
    score: o.score + amount,
  });

  return [...observations]
    .map((o) => {
      if (
        /\b(?:patterns?|noticed|observe).*(?:decision|decide|choos)/i.test(t) ||
        /\bhow i make decisions?\b/i.test(t)
      ) {
        if (o.category === "decision_making") return boost(o, 0.55);
        if (o.category === "recurring_obstacles") return boost(o, -0.15);
      }
      if (
        /\b(?:new (?:things|projects|ideas)|building new|instead of finishing|finish what|keep starting|shiny)\b/i.test(
          t,
        ) &&
        (o.category === "adhd_patterns" || o.category === "recurring_obstacles")
      ) {
        return boost(o, 0.35);
      }
      if (/\b(?:pattern|noticed|observe)/i.test(t)) {
        return boost(o, 0.15);
      }
      return o;
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Narrative of how the user has changed over time — not label summaries.
 */
export function buildTransformationNarrative(now = new Date()): string {
  const origin = buildOriginSnapshot(now);
  const thenNow = buildThenNowComparisons(now);
  const p2 = getPhase2DiscoveryState();
  const p1 = getPhase1OnboardingState().profile;
  const currentGoal = p2.goals[0]?.text ?? p1.immediateGoal;
  const parts: string[] = [];

  const earlyThemes = [
    origin.primaryChallenge,
    ...origin.struggles.slice(0, 2),
    origin.goals[0],
  ]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase());

  const earlyUncertainty =
    earlyThemes.some((t) => /uncertain|overwhelm|what to build|finish|decision/i.test(t)) ||
    origin.confidenceThemes.some((c) => /confidence|doubt|uncertain/i.test(c));

  const recentFocus = currentGoal ?? p2.business.primaryOffer ?? p2.business.type;
  const protectingVision =
    recentFocus &&
    /launch|workshop|offer|program|architecture|vision|protect/i.test(recentFocus);

  if (earlyUncertainty && protectingVision) {
    parts.push(
      "Earlier conversations focused heavily on uncertainty about what to build and whether it was ready. More recent conversations focus on protecting the vision and architecture you've already created.",
    );
  } else if (thenNow.length >= 2) {
    const shift = thenNow
      .slice(0, 2)
      .map((t) => `where you once described "${t.then}", you now describe "${t.now}"`)
      .join("; ");
    parts.push(`Over our time together, ${shift}.`);
  } else if (thenNow.length === 1) {
    const t = thenNow[0]!;
    parts.push(
      `Earlier you often sounded like "${t.then}" — lately more like "${t.now}".`,
    );
  }

  const evolution = buildPatternEvolution(now).find((e) => e.evidence !== "early");
  if (evolution) {
    parts.push(evolution.narrative);
  }

  const snap = buildTransformationIntelligenceSnapshot(now);
  if (!parts.length && snap.thenNow.length) {
    parts.push(snap.transformationNarrative);
  }

  if (!parts.length) {
    return "Your story here is still being written — each conversation adds evidence of how you think, work, and grow.";
  }

  return parts.join(" ");
}

export function formatObservationsForPrompt(
  observations: RelationshipObservation[],
): string {
  if (!observations.length) {
    return "Observations still forming — reflect what you have; invite correction; do not invent certainty.";
  }

  return observations
    .map(
      (o, i) =>
        `${i + 1}. ${o.text}${o.evidence ? ` (${o.evidence})` : ""}`,
    )
    .join("\n");
}

export function relationshipObservationResponseStructure(): string {
  return [
    "REQUIRED RESPONSE STRUCTURE (when observations exist):",
    "1. OBSERVATION — Start with 'I've noticed…' or 'From our conversations…' citing a specific observed behavior below (NOT a trait label).",
    "2. REFLECTION — Name what it means without judgment (tension, care, pattern — not diagnosis).",
    "3. GUIDANCE — One concrete, scoped next move tied to their history.",
    "4. QUESTION (optional) — At most one; only if something essential is missing. Example: 'Does that feel accurate?'",
    "",
    "FORBIDDEN when observation confidence exists:",
    "- Opening with trait labels: 'You have shiny object syndrome', 'You have decision overload', 'You have creative energy'",
    "- Generic openers: This is common; Many people; Many entrepreneurs; People with ADHD; Research shows; Studies show",
    "- 'It sounds like…' as the FIRST sentence (only after an observation)",
  ].join("\n");
}

export function buildRelationshipObservationsBundle(
  now = new Date(),
  options?: { userText?: string; workspace?: string | null },
): RelationshipObservationsResult {
  const observations = buildRelationshipObservations(now, options);
  return {
    observations,
    transformationNarrative: buildTransformationNarrative(now),
    responseStructure: relationshipObservationResponseStructure(),
  };
}

/** Observations most relevant to a user question (for turn-specific guidance). */
export function observationsForUserQuestion(
  userText: string,
  now = new Date(),
  workspace?: string | null,
): RelationshipObservation[] {
  return buildRelationshipObservations(now, { userText, workspace, limit: 4 });
}
