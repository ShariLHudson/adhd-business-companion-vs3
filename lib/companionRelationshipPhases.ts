/**
 * ADHD Business Ecosystem™ — Relationship phase registry.
 * Phases 1–11 — highest qualifying phase wins (11 → 10 → 9 → 8 → 7 → … → 1).
 * Experience goals: docs/COMPANION_RELATIONSHIP_FRAMEWORK.md (T-009)
 */

import { isPhase8AutonomousPreparationActive } from "./autonomousPreparation";
import { isPhase7BusinessIntelligenceEcosystemActive } from "./businessIntelligenceEcosystem";
import { isPhase11EcosystemIntelligenceActive } from "./ecosystemIntelligence";
import { isPhase1OnboardingComplete } from "./phase1Onboarding";
import { isPhase2DiscoveryActive, getPhase2DiscoveryState } from "./phase2ProgressiveDiscovery";
import { isPhase3AdaptiveRelationshipActive } from "./phase3AdaptiveRelationship";
import { isPhase4BusinessOperatingPartnerActive } from "./phase4BusinessOperatingPartner";
import { isPhase5CompanionIntelligenceEcosystemActive } from "./phase5CompanionIntelligenceEcosystem";
import { isPhase6CompanionIntelligenceNetworkActive } from "./phase6CompanionIntelligenceNetwork";
import { isPhase10TransformationIntelligenceActive } from "./transformationIntelligence";
import { isPhase9WisdomIntelligenceActive } from "./wisdomIntelligence";
import { buildWhatIveLearnedProfile } from "./phase2ProgressiveDiscovery";

export type RelationshipPhaseId =
  | "phase_1_initial_trust"
  | "phase_2_progressive_discovery"
  | "phase_3_adaptive_relationship"
  | "phase_4_business_operating_partner"
  | "phase_5_companion_intelligence_ecosystem"
  | "phase_6_companion_intelligence_network"
  | "phase_7_business_intelligence_ecosystem"
  | "phase_8_autonomous_preparation"
  | "phase_9_wisdom_intelligence"
  | "phase_10_legacy_transformation"
  | "phase_11_ecosystem_intelligence";

export type RelationshipPhaseStatus = "active" | "future";

export type RelationshipPhaseMeta = {
  id: RelationshipPhaseId;
  number: number;
  name: string;
  tagline: string;
  milestone: string;
  status: RelationshipPhaseStatus;
};

export const RELATIONSHIP_PHASES: RelationshipPhaseMeta[] = [
  {
    id: "phase_1_initial_trust",
    number: 1,
    name: "Initial Trust",
    tagline: "Learn enough to help.",
    milestone: "You understand my business.",
    status: "active",
  },
  {
    id: "phase_2_progressive_discovery",
    number: 2,
    name: "Progressive Discovery",
    tagline: "Learn how the user works.",
    milestone: "You understand how I work.",
    status: "active",
  },
  {
    id: "phase_3_adaptive_relationship",
    number: 3,
    name: "Adaptive Relationship Intelligence",
    tagline: "Learn patterns and anticipate needs.",
    milestone: "You understand my patterns.",
    status: "active",
  },
  {
    id: "phase_4_business_operating_partner",
    number: 4,
    name: "Business Operating Partner",
    tagline: "Help run the business, not just conversations.",
    milestone: "You help me run my business.",
    status: "active",
  },
  {
    id: "phase_5_companion_intelligence_ecosystem",
    number: 5,
    name: "Companion Intelligence Ecosystem",
    tagline: "Adaptive intelligence that evolves with the user over years.",
    milestone: "You help me become the person I want to become.",
    status: "active",
  },
  {
    id: "phase_6_companion_intelligence_network",
    number: 6,
    name: "Companion Intelligence Network",
    tagline: "Connected intelligence across the entire ecosystem.",
    milestone: "Everything I need seems connected.",
    status: "active",
  },
  {
    id: "phase_7_business_intelligence_ecosystem",
    number: 7,
    name: "Business Intelligence Ecosystem",
    tagline: "Understand the business as a living system.",
    milestone: "This companion understands my business.",
    status: "active",
  },
  {
    id: "phase_8_autonomous_preparation",
    number: 8,
    name: "Autonomous Preparation",
    tagline: "Prepare before the user asks.",
    milestone: "Work is ready when you arrive.",
    status: "active",
  },
  {
    id: "phase_9_wisdom_intelligence",
    number: 9,
    name: "Wisdom Intelligence",
    tagline: "Long-horizon wisdom.",
    milestone: "Wisdom over time.",
    status: "active",
  },
  {
    id: "phase_10_legacy_transformation",
    number: 10,
    name: "Legacy & Transformation",
    tagline: "Transformation and legacy.",
    milestone: "I've changed more than I realized.",
    status: "active",
  },
  {
    id: "phase_11_ecosystem_intelligence",
    number: 11,
    name: "Ecosystem Intelligence",
    tagline: "Understand the whole life system.",
    milestone: "This companion understands my life, not just my business.",
    status: "active",
  },
];

export function getCurrentRelationshipPhase(): RelationshipPhaseMeta {
  if (!isPhase1OnboardingComplete()) {
    return RELATIONSHIP_PHASES[0]!;
  }
  if (isPhase11EcosystemIntelligenceActive()) {
    return RELATIONSHIP_PHASES[10]!;
  }
  if (isPhase10TransformationIntelligenceActive()) {
    return RELATIONSHIP_PHASES[9]!;
  }
  if (isPhase9WisdomIntelligenceActive()) {
    return RELATIONSHIP_PHASES[8]!;
  }
  if (isPhase8AutonomousPreparationActive()) {
    return RELATIONSHIP_PHASES[7]!;
  }
  if (isPhase7BusinessIntelligenceEcosystemActive()) {
    return RELATIONSHIP_PHASES[6]!;
  }
  if (isPhase6CompanionIntelligenceNetworkActive()) {
    return RELATIONSHIP_PHASES[5]!;
  }
  if (isPhase5CompanionIntelligenceEcosystemActive()) {
    return RELATIONSHIP_PHASES[4]!;
  }
  if (isPhase4BusinessOperatingPartnerActive()) {
    return RELATIONSHIP_PHASES[3]!;
  }
  if (isPhase3AdaptiveRelationshipActive()) {
    return RELATIONSHIP_PHASES[2]!;
  }
  if (isPhase2DiscoveryActive()) {
    return RELATIONSHIP_PHASES[1]!;
  }
  return RELATIONSHIP_PHASES[0]!;
}

export function relationshipPhaseSummaryForChat(): string {
  const current = getCurrentRelationshipPhase();
  const p2 = getPhase2DiscoveryState();
  return [
    `RELATIONSHIP PHASE: ${current.number} — ${current.name}`,
    `Milestone: ${current.milestone}`,
    `Days together: ${daysSince(p2.firstSessionAt)}`,
  ].join(" | ");
}

function daysSince(iso: string, now = new Date()): number {
  const start = new Date(iso).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((now.getTime() - start) / 86_400_000));
}

/** Minimum phase before companion stops discovery-style onboarding tone. */
const ESTABLISHED_RELATIONSHIP_PHASE = 4;

export function isEstablishedRelationshipForChat(): boolean {
  if (!isPhase1OnboardingComplete()) return false;
  return getCurrentRelationshipPhase().number >= ESTABLISHED_RELATIONSHIP_PHASE;
}

export function relationshipMemoryContextForChat(): string | undefined {
  if (!isPhase1OnboardingComplete()) return undefined;

  const current = getCurrentRelationshipPhase();
  const profile = buildWhatIveLearnedProfile();
  const p2 = getPhase2DiscoveryState();
  const parts = [
    relationshipPhaseSummaryForChat(),
    `Sessions together: ${p2.sessionCount}.`,
  ];

  if (profile.challenges.length) {
    parts.push(`Recurring challenges: ${profile.challenges.slice(0, 4).join("; ")}.`);
  }
  if (profile.strengths.length) {
    parts.push(`Known strengths: ${profile.strengths.slice(0, 3).join("; ")}.`);
  }
  const patterns = p2.adhdPatterns
    .filter((p) => p.count >= 2)
    .slice(0, 4)
    .map((p) => p.id.replace(/_/g, " "));
  if (patterns.length) {
    parts.push(`Observed ADHD patterns: ${patterns.join("; ")}.`);
  }
  if (profile.business.type) {
    parts.push(`Business: ${profile.business.type}.`);
  }
  if (profile.business.currentGoal) {
    parts.push(`Current goal signal: ${profile.business.currentGoal}.`);
  }

  if (current.number >= ESTABLISHED_RELATIONSHIP_PHASE) {
    parts.push(
      "ESTABLISHED RELATIONSHIP: Use this history. Reflect what you already know before asking exploratory questions.",
    );
  }

  return parts.join(" ");
}

export function establishedRelationshipCoachHintForChat(): string | null {
  if (!isEstablishedRelationshipForChat()) return null;

  const current = getCurrentRelationshipPhase();
  const profile = buildWhatIveLearnedProfile();
  const p2 = getPhase2DiscoveryState();
  const patterns = p2.adhdPatterns
    .filter((p) => p.count >= 2)
    .map((p) => p.id.replace(/_/g, " "));

  const parts = [
    "ESTABLISHED RELATIONSHIP COACHING (mandatory when history exists):",
    `Relationship depth: Phase ${current.number}. This is NOT onboarding or first-week discovery.`,
    "FIRST: Offer a reflective read using known patterns, ADHD tendencies, business context, and prior challenges.",
    "THEN: At most ONE follow-up question — only if something essential is still missing.",
    "FORBIDDEN: generic 'common challenge' openers, 'what do you think is driving…' as the lead, questionnaire tone.",
  ];

  if (patterns.length) {
    parts.push(`Known patterns to reference if relevant: ${patterns.join(", ")}.`);
  }
  if (profile.challenges[0]) {
    parts.push(`Recurring challenge: ${profile.challenges[0]}.`);
  }
  if (profile.helpfulResources[0]) {
    parts.push(`What has helped before: ${profile.helpfulResources[0]}.`);
  }

  parts.push(
    "For shiny-object / finish-what-you-started questions: name novelty-vs-completion tension, perfectionism, or overwhelm if patterns support it — then invite correction.",
  );

  return parts.join("\n");
}
