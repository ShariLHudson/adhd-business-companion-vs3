/**
 * ADHD Business Ecosystem™ — Relationship phase registry.
 * Phases 1–5 are active product layers; 6–10 are future capability gates.
 */

import { isPhase1OnboardingComplete } from "./phase1Onboarding";
import { isPhase2DiscoveryActive, getPhase2DiscoveryState } from "./phase2ProgressiveDiscovery";
import { isPhase3AdaptiveRelationshipActive } from "./phase3AdaptiveRelationship";
import { isPhase4BusinessOperatingPartnerActive } from "./phase4BusinessOperatingPartner";

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
  | "phase_10_legacy_transformation";

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
    tagline: "Networked companion intelligence.",
    milestone: "Intelligence scales beyond one user.",
    status: "future",
  },
  {
    id: "phase_7_business_intelligence_ecosystem",
    number: 7,
    name: "Business Intelligence Ecosystem",
    tagline: "Deep business intelligence layer.",
    milestone: "Business intelligence compounds.",
    status: "future",
  },
  {
    id: "phase_8_autonomous_preparation",
    number: 8,
    name: "Autonomous Preparation",
    tagline: "Prepare before the user asks.",
    milestone: "Work is ready when you arrive.",
    status: "future",
  },
  {
    id: "phase_9_wisdom_intelligence",
    number: 9,
    name: "Wisdom Intelligence",
    tagline: "Long-horizon wisdom.",
    milestone: "Wisdom over time.",
    status: "future",
  },
  {
    id: "phase_10_legacy_transformation",
    number: 10,
    name: "Legacy & Transformation",
    tagline: "Transformation and legacy.",
    milestone: "The business and founder transformed.",
    status: "future",
  },
];

export function getCurrentRelationshipPhase(): RelationshipPhaseMeta {
  if (!isPhase1OnboardingComplete()) {
    return RELATIONSHIP_PHASES[0]!;
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
