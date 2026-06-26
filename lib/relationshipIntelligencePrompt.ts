/**
 * Relationship Intelligence — highest-priority prompt block for established companions.
 * Prepended to the LLM system prompt so it overrides generic coaching openers.
 */

import { shouldSuppressRelationshipIntelligenceForUserText } from "./relationshipIntelligenceBoundaries";
import { isPhase7BusinessIntelligenceEcosystemActive } from "./businessIntelligenceEcosystem";
import {
  getCurrentRelationshipPhase,
  isEstablishedRelationshipForChat,
  relationshipMemoryContextForChat,
  relationshipPhaseSummaryForChat,
} from "./companionRelationshipPhases";
import { buildEcosystemIntelligenceSnapshot } from "./ecosystemIntelligence";
import { isPhase1OnboardingComplete } from "./phase1Onboarding";
import { phase1RelationshipProfileForChat } from "./phase1Onboarding";
import { getPhase5EcosystemState } from "./phase5CompanionIntelligenceEcosystem";
import {
  buildWhatIveLearnedProfile,
  getPhase2DiscoveryState,
} from "./phase2ProgressiveDiscovery";
import { isPhase5CompanionIntelligenceEcosystemActive } from "./phase5CompanionIntelligenceEcosystem";
import { isPhase6CompanionIntelligenceNetworkActive } from "./phase6CompanionIntelligenceNetwork";
import { isPhase8AutonomousPreparationActive } from "./autonomousPreparation";
import { isPhase9WisdomIntelligenceActive } from "./wisdomIntelligence";
import { isPhase10TransformationIntelligenceActive } from "./transformationIntelligence";
import { isPhase11EcosystemIntelligenceActive } from "./ecosystemIntelligence";
import {
  adhdOperatingSystemHintForChat,
  detectOperatingQuestionFocus,
  operatingPatternsForUserQuestion,
} from "./adhdOperatingSystemIntelligence";
import { buildUserOperatingManual } from "./phase3AdaptiveRelationship";
import { buildTransformationIntelligenceSnapshot } from "./transformationIntelligence";
import { buildWisdomIntelligenceSummary } from "./wisdomIntelligence";
import {
  buildRelationshipObservationsBundle,
  buildTransformationNarrative,
  formatObservationsForPrompt,
  observationsForUserQuestion,
  relationshipObservationResponseStructure,
} from "./relationshipObservationEngine";
import { buildRelationshipResponseContractBlock } from "./relationshipResponseContract";
import {
  assessRelationshipMemoryConfidence,
  type RelationshipMemoryConfidence,
} from "./relationshipMemoryConfidence";

export type { RelationshipMemoryConfidence };
export { assessRelationshipMemoryConfidence };

const GENERIC_OPENING_BANS = [
  "This is a common challenge",
  "This is a common experience",
  "Many entrepreneurs",
  "Many people",
  "People with ADHD often",
  "Research shows",
  "Studies suggest",
  "It's common for",
  "A lot of founders",
];

export function hasRelationshipMemoryForResponse(): boolean {
  return assessRelationshipMemoryConfidence() !== "none";
}

export function buildRelationshipProfileSummary(): string {
  const parts: string[] = [];
  const phase1 = phase1RelationshipProfileForChat();
  if (phase1) parts.push(phase1);

  const profile = buildWhatIveLearnedProfile();
  if (profile.business.type) parts.push(`Business type: ${profile.business.type}`);
  if (profile.business.currentGoal) parts.push(`Current goal: ${profile.business.currentGoal}`);
  if (profile.business.idealClient) parts.push(`Ideal client: ${profile.business.idealClient}`);
  if (profile.strengths.length) parts.push(`Strengths: ${profile.strengths.join("; ")}`);
  if (profile.challenges.length) parts.push(`Challenges: ${profile.challenges.join("; ")}`);
  if (profile.helpfulResources.length) {
    parts.push(`Helpful resources: ${profile.helpfulResources.join("; ")}`);
  }
  if (profile.workStyle) parts.push(`Work style: ${profile.workStyle}`);

  return parts.join(" | ") || "No profile summary yet.";
}

export function buildRelationshipPatternSummary(): string {
  const p2 = getPhase2DiscoveryState();
  const manual = buildUserOperatingManual();
  const lines: string[] = [];

  for (const p of p2.adhdPatterns.filter((pat) => pat.count >= 2).slice(0, 6)) {
    lines.push(`- ${p.id.replace(/_/g, " ")} (observed ${p.count}×)`);
  }
  for (const f of manual.frictionPatterns.slice(0, 4)) {
    lines.push(`- Friction: ${f}`);
  }
  for (const c of p2.challenges.sort((a, b) => b.count - a.count).slice(0, 4)) {
    lines.push(`- Challenge: ${c.label} (${c.count}×)`);
  }

  const p5 = getPhase5EcosystemState();
  const growth = Object.entries(p5.growthSignals)
    .filter(([, v]) => (v ?? 0) >= 2)
    .map(([k]) => k.replace(/_/g, " "));
  if (growth.length) lines.push(`- Growth signals: ${growth.join(", ")}`);

  return lines.length ? lines.join("\n") : "Patterns still forming from conversation.";
}

export function buildRelationshipWisdomSummaryForPrompt(): string {
  if (!isPhase7BusinessIntelligenceEcosystemActive()) {
    return "Wisdom layer not yet active (needs business depth).";
  }
  const summary = buildWisdomIntelligenceSummary();
  const lines = [
    summary.narrative,
    ...summary.patternWisdom.slice(0, 4).map((w) => `- ${w}`),
    ...summary.items
      .filter((i) => i.confidence !== "early")
      .slice(0, 5)
      .map((i) => `- [${i.kind}] ${i.text}`),
  ];
  return lines.filter(Boolean).join("\n") || "No wisdom items recorded yet.";
}

export function buildRelationshipTransformationSummaryForPrompt(): string {
  const narrative = buildTransformationNarrative();
  const snap = buildTransformationIntelligenceSnapshot();
  const lines = [
    narrative,
    ...snap.thenNow.slice(0, 2).map(
      (t) =>
        `- Shift in ${t.label.toLowerCase()}: earlier you sounded like "${t.then}" — lately more "${t.now}"`,
    ),
  ];
  return lines.filter(Boolean).join("\n") || "Transformation evidence still forming.";
}

export function buildRelationshipEcosystemSummaryForPrompt(): string {
  const snap = buildEcosystemIntelligenceSnapshot();
  const domains = snap.domains
    .filter((d) => d.state !== "emerging")
    .slice(0, 5)
    .map((d) => `${d.label}: ${d.narrative}`);
  const lines = [
    `Life season: ${snap.season} — ${snap.seasonNarrative}`,
    snap.capacityNarrative,
    ...domains.map((d) => `- ${d}`),
    ...snap.interconnections.slice(0, 2).map((c) => `- ${c.narrative}`),
  ];
  return lines.filter(Boolean).join("\n") || "Ecosystem signals still emerging.";
}

function questionSpecificGuidance(userText?: string): string | null {
  const t = userText?.trim() ?? "";
  if (!t) return null;

  const relevant = observationsForUserQuestion(t);
  const observationLines = relevant.map((o) => `- ${o.text}`);

  if (
    /\b(?:patterns?|noticed|observe).*(?:decision|decide|choos)/i.test(t) ||
    /\bhow i make decisions?\b/i.test(t)
  ) {
    if (!observationLines.length) return null;
    return [
      "USER ASKED ABOUT DECISION PATTERNS — answer from observed behaviors below, NOT trait labels:",
      ...observationLines,
      'PASS example opener: "I\'ve noticed that when several good options exist, choosing one becomes harder because you can see the value in each direction."',
      'FAIL: "You have decision overload."',
    ].join("\n");
  }

  if (
    /\b(?:new (?:things|projects|ideas)|building new|instead of finishing|finish what|keep starting|good starter|poor finisher|bad finisher|trouble finishing)\b/i.test(
      t,
    )
  ) {
    const operating = operatingPatternsForUserQuestion(t);
    const operatingLines = operating.map((i) => `- ${i.text}`);
    const novelty = relevant.find(
      (o) =>
        o.source?.startsWith("os:") ||
        /maintenance|momentum|creative phase|novelty|finishing|ready/i.test(o.text) ||
        o.source.includes("shiny") ||
        o.source.includes("follow"),
    );
    const lines = novelty
      ? [`- ${novelty.text}`, ...operatingLines.filter((l) => l !== `- ${novelty.text}`).slice(0, 2)]
      : operatingLines.length
        ? operatingLines.slice(0, 3)
        : relevant.slice(0, 3).map((o) => `- ${o.text}`);
    return [
      "STARTING NEW VS FINISHING — prioritize completion + momentum patterns first.",
      "USER ASKED ABOUT STARTING VS FINISHING — lead with operating patterns (WHY momentum drops), not symptom labels:",
      "- New ideas often get your strongest energy — finishing is where momentum tends to drop.",
      ...lines,
      "Prioritize completion + momentum patterns — NOT conversational clarity or visual mapping unless directly relevant.",
      'PASS example: "Looking at your patterns, this doesn\'t seem to be a starting problem — energy is usually strong during creation. The drop tends to happen when work becomes repetitive or administrative."',
      'FAIL: "You have shiny object syndrome." / "You have trouble finishing."',
    ].join("\n");
  }

  return null;
}

export function relationshipResponseQualityGuardrails(): string {
  return [
    relationshipObservationResponseStructure(),
    "",
    "RESPONSE QUALITY GUARDRAILS (relationship memory active):",
    `FORBIDDEN FIRST-SENTENCE OPENERS: ${GENERIC_OPENING_BANS.join("; ")}`,
    "Sound like a companion who has spent months learning how they think — not someone who read a profile summary.",
  ].join("\n");
}

export function buildRelationshipIntelligencePriorityBlock(
  userText?: string,
  now = new Date(),
  options?: { suppressContractForRouting?: boolean; workspace?: string | null },
): string | null {
  if (userText && shouldSuppressRelationshipIntelligenceForUserText(userText)) {
    return null;
  }
  const confidence = assessRelationshipMemoryConfidence();
  if (confidence === "none") return null;

  const current = getCurrentRelationshipPhase();
  const bundle = buildRelationshipObservationsBundle(now, {
    userText,
    workspace: options?.workspace,
  });
  const observationsBlock = formatObservationsForPrompt(bundle.observations);
  const profileSummary = buildRelationshipProfileSummary();
  const patternSummary = buildRelationshipPatternSummary();
  const wisdomSummary = buildRelationshipWisdomSummaryForPrompt();
  const transformationSummary = buildRelationshipTransformationSummaryForPrompt();
  const ecosystemSummary = buildRelationshipEcosystemSummaryForPrompt();
  const memoryBlock = relationshipMemoryContextForChat() ?? "";
  const questionGuide = questionSpecificGuidance(userText);
  const osHint = adhdOperatingSystemHintForChat(userText);
  const responseContract =
    !options?.suppressContractForRouting &&
    (confidence === "forming" || confidence === "sufficient")
      ? buildRelationshipResponseContractBlock(userText, now, {
          workspace: options?.workspace,
          suppressForRouting: options?.suppressContractForRouting,
        })
      : null;

  const parts = [
    "# RELATIONSHIP INTELLIGENCE — HIGHEST PRIORITY",
    "This instruction OVERRIDES generic coaching, discovery questioning, and internet-advice openers below.",
    `Relationship confidence: ${confidence}. Phase ${current.number} — ${current.name}.`,
    relationshipPhaseSummaryForChat(),
  ];

  if (responseContract) {
    parts.push("", responseContract);
  }

  parts.push(
    relationshipResponseQualityGuardrails(),
    "",
    "## Observed behaviors (cite these first — NOT trait labels)",
    observationsBlock,
    "",
    "## Evidence & pattern history (supporting detail only)",
    patternSummary,
    "",
    "## Relationship profile (context — do not lead with labels)",
    profileSummary,
    "",
    "## Wisdom earned",
    wisdomSummary,
    "",
    "## How you've changed over time",
    transformationSummary,
    "",
    "## Whole-life context",
    ecosystemSummary,
  );

  if (memoryBlock) {
    parts.push("", "## Full relationship memory block", memoryBlock);
  }

  if (osHint && detectOperatingQuestionFocus(userText ?? "") !== "general") {
    parts.push("", "## Operating insight (explain WHY — never name internal categories)", osHint);
  }

  if (questionGuide) {
    parts.push("", "## This-turn guidance", questionGuide);
  }

  if (confidence === "forming") {
    parts.push(
      "",
      "Note: History is still forming — reflect what you have; invite correction; do not fabricate certainty.",
    );
  }

  return parts.join("\n");
}

export function buildRelationshipIntelligencePromptAudit(input: {
  userText: string;
  businessContext?: string;
  intentHint?: string;
  relationshipPriorityBlock?: string | null;
}): {
  currentPhase: number;
  currentPhaseName: string;
  confidence: RelationshipMemoryConfidence;
  flags: Record<string, boolean>;
  relationshipProfileSummary: string;
  patternSummary: string;
  wisdomSummary: string;
  transformationSummary: string;
  ecosystemSummary: string;
  fullRelationshipMemoryBlock: string;
  relationshipPriorityBlock: string | null;
  promptSections: { name: string; length: number }[];
  finalPromptLengthEstimate: number;
} {
  const current = getCurrentRelationshipPhase();
  const priority =
    input.relationshipPriorityBlock ??
    buildRelationshipIntelligencePriorityBlock(input.userText);
  const memoryBlock = relationshipMemoryContextForChat() ?? "";

  const sections = [
    { name: "relationshipIntelligencePriority", length: priority?.length ?? 0 },
    { name: "businessContext", length: input.businessContext?.length ?? 0 },
    { name: "intentHint", length: input.intentHint?.length ?? 0 },
  ];

  const finalPromptLengthEstimate = sections.reduce((sum, s) => sum + s.length, 0) + 12000;

  return {
    currentPhase: current.number,
    currentPhaseName: current.name,
    confidence: assessRelationshipMemoryConfidence(),
    flags: {
      phase5: isPhase5CompanionIntelligenceEcosystemActive(),
      phase6: isPhase6CompanionIntelligenceNetworkActive(),
      phase7: isPhase7BusinessIntelligenceEcosystemActive(),
      phase8: isPhase8AutonomousPreparationActive(),
      phase9: isPhase9WisdomIntelligenceActive(),
      phase10: isPhase10TransformationIntelligenceActive(),
      phase11: isPhase11EcosystemIntelligenceActive(),
    },
    relationshipProfileSummary: buildRelationshipProfileSummary(),
    patternSummary: buildRelationshipPatternSummary(),
    wisdomSummary: buildRelationshipWisdomSummaryForPrompt(),
    transformationSummary: buildRelationshipTransformationSummaryForPrompt(),
    ecosystemSummary: buildRelationshipEcosystemSummaryForPrompt(),
    fullRelationshipMemoryBlock: memoryBlock,
    relationshipPriorityBlock: priority,
    promptSections: sections,
    finalPromptLengthEstimate,
  };
}
