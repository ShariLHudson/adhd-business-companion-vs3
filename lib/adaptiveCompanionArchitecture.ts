/**
 * Adaptive Companion Architecture — layer registry and health evaluation.
 *
 * Systems over features: this module is the canonical map of intelligence layers,
 * their owners, observability hooks, and the future-feature validation gate.
 *
 * Human-readable spec: docs-companion-intelligence/23_Adaptive_Companion_Architecture.md
 */

import { ALL_VALIDATION_SCENARIOS } from "./companionValidationScenarios";
import type { ScenarioCategory } from "./companionValidationFramework";
import { isProfileLearningEnabled, isUnifiedSignalBusEnabled } from "./intelligence-layer/featureFlags";

export type ArchitectureLayerId =
  | "user_intelligence"
  | "behavioral_intelligence"
  | "intervention_intelligence"
  | "trust_relationship_intelligence"
  | "predictive_intelligence"
  | "ecosystem_intelligence"
  | "board_intelligence"
  | "continuous_learning";

export type LayerMaturity = "production" | "partial" | "stub" | "future";

export type LayerModularity = 1 | 2 | 3 | 4 | 5;

export type ArchitectureLayer = {
  id: ArchitectureLayerId;
  name: string;
  learnsOrContains: string[];
  canonicalModules: string[];
  maturity: LayerMaturity;
  modularity: LayerModularity;
  observable: boolean;
  expandableWithoutRewrite: boolean;
  replaceable: boolean;
  selfImproving: boolean;
  gaps: string[];
};

export type FutureFeatureValidation = {
  improvesUserOutcomes: boolean;
  improvesTrust: boolean;
  improvesConfidence: boolean;
  reducesFriction: boolean;
  improvesMomentum: boolean;
  fitsOneCompanionPhilosophy: boolean;
  evolvesWithoutArchitecturalDebt: boolean;
  approved: boolean;
  blockers: string[];
};

export type ArchitectureHealthSnapshot = {
  evaluatedAt: string;
  layers: ArchitectureLayer[];
  behavioralScenarioCount: number;
  behavioralCategories: Record<string, number>;
  profileLearningEnabled: boolean;
  unifiedSignalBusEnabled: boolean;
  fragmentationRisks: string[];
  unificationPriorities: string[];
};

/** Seven-question gate — every future feature must pass before build. */
export function validateFutureFeature(input: {
  improvesUserOutcomes: boolean;
  improvesTrust: boolean;
  improvesConfidence: boolean;
  reducesFriction: boolean;
  improvesMomentum: boolean;
  fitsOneCompanionPhilosophy: boolean;
  evolvesWithoutArchitecturalDebt: boolean;
}): FutureFeatureValidation {
  const checks = [
    { key: "improvesUserOutcomes", label: "Does it improve user outcomes?" },
    { key: "improvesTrust", label: "Does it improve trust?" },
    { key: "improvesConfidence", label: "Does it improve confidence?" },
    { key: "reducesFriction", label: "Does it reduce friction?" },
    { key: "improvesMomentum", label: "Does it improve momentum?" },
    { key: "fitsOneCompanionPhilosophy", label: "Does it fit the One Companion philosophy?" },
    {
      key: "evolvesWithoutArchitecturalDebt",
      label: "Can it evolve without architectural debt?",
    },
  ] as const;

  const blockers = checks
    .filter((c) => !input[c.key])
    .map((c) => c.label);

  return {
    ...input,
    approved: blockers.length === 0,
    blockers,
  };
}

function countScenariosByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const scenario of ALL_VALIDATION_SCENARIOS) {
    counts[scenario.category] = (counts[scenario.category] ?? 0) + 1;
  }
  return counts;
}

/** Registry of the eight trademark layers — update modules here as layers evolve. */
export const ADAPTIVE_COMPANION_LAYERS: ArchitectureLayer[] = [
  {
    id: "user_intelligence",
    name: "User Intelligence",
    learnsOrContains: [
      "preferences",
      "learning styles",
      "work rhythms",
      "energy patterns",
      "business habits",
      "ADHD patterns",
    ],
    canonicalModules: [
      "lib/intelligence-layer/",
      "lib/companionAdaptiveUserEngine.ts",
      "lib/ecosystem/userIntelligenceEngine.ts",
    ],
    maturity: "partial",
    modularity: 4,
    observable: true,
    expandableWithoutRewrite: true,
    replaceable: true,
    selfImproving: false,
    gaps: [
      "Profile learning disabled by default (NEXT_PUBLIC_PROFILE_LEARNING)",
      "Companion profile is client localStorage — no server-authoritative sync",
      "Relationship memory split from IntelligenceProfile",
    ],
  },
  {
    id: "behavioral_intelligence",
    name: "Behavioral Intelligence",
    learnsOrContains: [
      "ADHD Entrepreneur Behavioral Framework",
      "surface intent vs actual need",
      "validation scenarios",
      "sales & visibility intelligence",
    ],
    canonicalModules: [
      "lib/companionValidationFramework.ts",
      "lib/companionValidationScenarios.ts",
      "lib/adhdEntrepreneurIntelligence.ts",
      "lib/adhdNativeIntelligence.ts",
      "lib/adhdMultiTurnPatterns.ts",
      "lib/companionActionBias.ts",
      "lib/companionIntuitiveAwareness.ts",
      "lib/companionSalesIntelligence.ts",
      "lib/companionVisibilityIntelligence.ts",
    ],
    maturity: "production",
    modularity: 3,
    observable: true,
    expandableWithoutRewrite: true,
    replaceable: true,
    selfImproving: false,
    gaps: [
      "47 scenarios — target 200–500+; categories still TypeScript union, not data-driven registry",
      "Scorecard validates offline (vitest) — not yet runtime policy in CompanionGovernor",
      "Behavior rules fragmented across ~15 modules",
    ],
  },
  {
    id: "intervention_intelligence",
    name: "Intervention Intelligence",
    learnsOrContains: [
      "recommended interventions",
      "acceptance / ignore signals",
      "intervention buckets",
      "ecosystem priority arbitration",
    ],
    canonicalModules: [
      "lib/intelligence-layer/interventionRegistry.ts",
      "lib/ecosystem-intelligence/ecosystemEngine.ts",
      "lib/companionGovernor.ts",
      "lib/conversationIntervention.ts",
    ],
    maturity: "partial",
    modularity: 4,
    observable: true,
    expandableWithoutRewrite: true,
    replaceable: true,
    selfImproving: false,
    gaps: [
      "Effectiveness loop partial — trust audit exists, closed-loop outcomes incomplete",
      "Governor OS not sole turn entry (page.tsx still orchestrates)",
      "companionEcosystemIntent has narrow feature-routing rules",
    ],
  },
  {
    id: "trust_relationship_intelligence",
    name: "Trust & Relationship Intelligence",
    learnsOrContains: [
      "trust indicators",
      "confidence wins",
      "engagement patterns",
      "re-entry patterns",
      "follow-through",
    ],
    canonicalModules: [
      "lib/companionTrustEngine.ts",
      "lib/companionConfidenceEngine.ts",
      "lib/intelligence-layer/trustSignals.ts",
      "lib/intelligence-layer/trustEvolutionAudit.ts",
      "lib/relationship-intelligence/relationshipEngine.ts",
      "lib/companionOutcomeThread.ts",
    ],
    maturity: "partial",
    modularity: 3,
    observable: true,
    expandableWithoutRewrite: true,
    replaceable: true,
    selfImproving: false,
    gaps: [
      "Trust trait evolution gated on attribution wiring",
      "Three relationship stores (companion memory, relationship-intelligence, founder graph)",
      "8 trust scenarios vs 47 behavioral — asymmetric coverage",
    ],
  },
  {
    id: "predictive_intelligence",
    name: "Predictive Intelligence",
    learnsOrContains: [
      "burnout risk",
      "overwhelm risk",
      "launch avoidance risk",
      "confidence crash risk",
      "follow-through risk",
    ],
    canonicalModules: [
      "lib/predictive-support/predictiveEngine.ts",
      "lib/predictive-support/predictivePatterns.ts",
      "lib/ecosystem/digitalTwin/predictionEngine.ts",
    ],
    maturity: "partial",
    modularity: 3,
    observable: true,
    expandableWithoutRewrite: true,
    replaceable: true,
    selfImproving: false,
    gaps: [
      "Heuristic rules only — no prediction accuracy feedback loop",
      "Two prediction systems (companion predictive-support vs founder digital twin)",
      "Predictions advisory only — enforce never auto-act in prompts",
    ],
  },
  {
    id: "ecosystem_intelligence",
    name: "Ecosystem Intelligence",
    learnsOrContains: [
      "features",
      "tools",
      "workspaces",
      "17 vertical intelligence layers",
      "cross-system hub",
    ],
    canonicalModules: [
      "lib/ecosystem-intelligence/",
      "lib/ecosystem/",
      "lib/companionEcosystemIntent.ts",
    ],
    maturity: "production",
    modularity: 5,
    observable: true,
    expandableWithoutRewrite: true,
    replaceable: true,
    selfImproving: false,
    gaps: [
      "Naming collision: companion hub vs founder lib/ecosystem",
      "crossSystemIntelligenceHub has future integration stubs",
      "Companion and founder ecosystems not unified under one API",
    ],
  },
  {
    id: "board_intelligence",
    name: "Board Intelligence",
    learnsOrContains: [
      "workspace advisor roles (marketing, operations, planning, mindset)",
      "founder board advisors (7 roles)",
      "ADHD-filtered advisory hints",
    ],
    canonicalModules: [
      "lib/workspaceContextLock.ts",
      "lib/adhdEntrepreneurIntelligence.ts",
      "lib/ecosystem/board/",
      "lib/companionIntelligence.ts",
    ],
    maturity: "partial",
    modularity: 2,
    observable: false,
    expandableWithoutRewrite: false,
    replaceable: true,
    selfImproving: false,
    gaps: [
      "Three parallel advisor models (4 workspace, 7 founder, 8 legacy AdvisorType)",
      "No shared advisor registry",
      "Founder board not wired through companionIntelligenceRouter for end-user chat",
    ],
  },
  {
    id: "continuous_learning",
    name: "Continuous Learning Engine",
    learnsOrContains: [
      "user outcomes",
      "scenario performance",
      "intervention success",
      "companion effectiveness",
      "profile trait evolution",
    ],
    canonicalModules: [
      "lib/intelligence-layer/profileEvolution.ts",
      "lib/intelligence-layer/learningGates.ts",
      "lib/intelligence-layer/signalBus.ts",
      "lib/ecosystem/learning/",
    ],
    maturity: "stub",
    modularity: 2,
    observable: true,
    expandableWithoutRewrite: true,
    replaceable: true,
    selfImproving: false,
    gaps: [
      "Production learning OFF by default",
      "Signal bus in shadow mode only",
      "Companion learning and founder learning not reconciled on one bus",
      "No closed-loop intervention outcome attribution at scale",
    ],
  },
];

export function getArchitectureLayer(id: ArchitectureLayerId): ArchitectureLayer | undefined {
  return ADAPTIVE_COMPANION_LAYERS.find((l) => l.id === id);
}

export function evaluateArchitectureHealth(): ArchitectureHealthSnapshot {
  const behavioralCategories = countScenariosByCategory();

  return {
    evaluatedAt: new Date().toISOString(),
    layers: ADAPTIVE_COMPANION_LAYERS,
    behavioralScenarioCount: ALL_VALIDATION_SCENARIOS.length,
    behavioralCategories,
    profileLearningEnabled: isProfileLearningEnabled(),
    unifiedSignalBusEnabled: isUnifiedSignalBusEnabled(),
    fragmentationRisks: [
      "Three stacks: companion profile, companion vertical hub, founder ecosystem",
      "Triple board model without shared registry",
      "Dual user intelligence (local profile vs server UIE)",
      "Dual prediction (companion vs digital twin)",
    ],
    unificationPriorities: [
      "CompanionGovernor as single turn entry",
      "Data-driven scenario category registry (200–500+ target)",
      "Unified signal bus with learning gates enabled in staged rollout",
      "Shared advisor registry for Board Intelligence",
      "Server-authoritative user profile sync",
      "Intervention outcome attribution → Continuous Learning loop",
    ],
  };
}

export function formatArchitectureHealthText(snapshot?: ArchitectureHealthSnapshot): string {
  const s = snapshot ?? evaluateArchitectureHealth();
  const layerLines = s.layers.map(
    (l) =>
      `  ${l.name}: ${l.maturity} | modularity ${l.modularity}/5 | scenarios n/a | gaps: ${l.gaps.length}`,
  );
  const categoryLines = Object.entries(s.behavioralCategories)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, n]) => `  ${cat}: ${n}`);

  return [
    "Adaptive Companion Architecture — Health Snapshot",
    `Evaluated: ${s.evaluatedAt}`,
    `Behavioral scenarios: ${s.behavioralScenarioCount} (target 200–500+)`,
    "Categories:",
    ...categoryLines,
    `Profile learning: ${s.profileLearningEnabled ? "ON" : "OFF"}`,
    `Unified signal bus: ${s.unifiedSignalBusEnabled ? "ON" : "OFF"}`,
    "Layers:",
    ...layerLines,
    "Fragmentation risks:",
    ...s.fragmentationRisks.map((r) => `  - ${r}`),
    "Unification priorities:",
    ...s.unificationPriorities.map((p) => `  - ${p}`),
  ].join("\n");
}

/** Categories are derived from scenarios — not a hardcoded list. */
export function getBehavioralCategoryIds(): ScenarioCategory[] {
  return [...new Set(ALL_VALIDATION_SCENARIOS.map((s) => s.category))];
}
