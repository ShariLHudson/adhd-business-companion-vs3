/**
 * Spark Estate™ — master operating document (Phase 29).
 * Single high-level operating view that protects the vision while the ecosystem grows.
 *
 * @see docs/protocols/SPARK_ESTATE_MASTER_OPERATING_DOCUMENT_SPECIFICATION_PHASE29.md
 */

import { SPARK_ESTATE_CREATION_STEPS } from "@/lib/universalCreation/sparkEstateCreationJourney";
import { verifySparkEstateCreationJourney } from "@/lib/universalCreation/sparkEstateCreationJourney";
import { verifySparkEstateCompletionSystem } from "@/lib/universalCreation/sparkEstateCompletionSystem";
import { verifySparkEstateAiPromptAndIntelligenceLayerArchitecture } from "./sparkEstateAiPromptAndIntelligenceLayerArchitecture";
import { verifySparkEstateCardEcosystem } from "./sparkEstateCardEcosystem";
import { verifySparkEstateConversationEngine } from "./sparkEstateConversationEngine";
import { verifySparkEstateFileAndDataArchitecture } from "./sparkEstateFileAndDataArchitectureMap";
import { verifySparkEstateSystemGovernanceAndQualityStandards } from "./sparkEstateSystemGovernanceAndQualityStandards";
import {
  SPARK_ESTATE_LIFECYCLE_JOURNEY_HEADLINE,
  verifySparkEstateUserJourneyAndMemberLifecycle,
} from "./sparkEstateUserJourneyAndMemberLifecycleArchitecture";
import { verifySparkEstateRoomIntelligenceArchitecture } from "./sparkEstateRoomIntelligenceArchitecture";
import { verifySparkEstateProductionReadiness } from "./sparkEstateProductionReadinessChecklist";

export const SPARK_ESTATE_MASTER_OPERATING_PURPOSE =
  "Protect the original vision while allowing the ecosystem to grow.";

export const SPARK_ESTATE_MASTER_OPERATING_VISION =
  "A place where people bring ideas, challenges, goals, and projects — the system helps them understand, create, complete, and grow.";

export const SPARK_ESTATE_IDENTITY_CAPABILITIES = [
  "organize ideas",
  "create meaningful work",
  "make decisions",
  "build projects",
  "learn",
  "complete goals",
  "recognize progress",
] as const;

export const SPARK_ESTATE_CORE_PROMISE = {
  from: "I have ideas, problems, and things I want to do.",
  to: "I know my next step and I can move forward.",
} as const;

export const SPARK_ESTATE_COMPANION_MODEL = [
  "One companion.",
  "Many rooms.",
  "Specialized expertise.",
  "Shared memory.",
  "One consistent journey.",
] as const;

export const SPARK_ESTATE_SPARK_RELATIONSHIP = {
  companionFeels: [
    "warm",
    "encouraging",
    "practical",
    "patient",
    "helpful",
    "step-by-step",
  ] as const,
  memberFeels: "Spark understands me.",
} as const;

export const SPARK_ESTATE_OPERATING_ROOM_MODEL = [
  {
    id: "chamber",
    label: "Chamber of Momentum™",
    helps: ["create clarity", "find next steps", "overcome blockers", "maintain progress"],
  },
  {
    id: "marketing",
    label: "Marketing Room",
    helps: ["develop messaging", "create campaigns", "build funnels"],
  },
  {
    id: "content",
    label: "Content Room",
    helps: ["create", "edit", "organize content"],
  },
  {
    id: "research",
    label: "Research Room",
    helps: ["understand information", "analyze options", "learn"],
  },
] as const;

export const SPARK_ESTATE_OPERATING_CREATION_JOURNEY =
  SPARK_ESTATE_CREATION_STEPS.map((step) => step.id);

export const SPARK_ESTATE_OPERATING_INTELLIGENCE_LAYERS = [
  { id: "companion", label: "Companion Layer", role: "The Shari voice." },
  { id: "member-context", label: "Member Context Layer", role: "Understanding the individual." },
  { id: "routing", label: "Routing Layer", role: "Choosing the right support." },
  { id: "room-intelligence", label: "Room Intelligence Layer", role: "Providing expertise." },
  { id: "knowledge", label: "Knowledge Layer", role: "Providing resources." },
  { id: "memory", label: "Memory Layer", role: "Learning what works." },
] as const;

export const SPARK_ESTATE_PERSONALIZATION_PHILOSOPHY = {
  principle: "Spark does not force people into categories.",
  learns: ["preferences", "patterns", "successful approaches", "goals", "progress"],
  purpose: "Reduce friction.",
} as const;

export const SPARK_ESTATE_MEMORY_PHILOSOPHY = {
  remember: ["active projects", "important goals", "successful strategies", "meaningful wins"],
  avoid: "unnecessary information",
} as const;

export const SPARK_ESTATE_CARD_PHILOSOPHY = {
  principle: "Cards are helpful moments — not notifications.",
  examples: ["Spark Card™", "Momentum Card™", "Knowledge Card™", "Win Card™"],
  purpose: "Each card exists to help the member move forward.",
} as const;

export const SPARK_ESTATE_MEMBER_JOURNEY_HEADLINE = SPARK_ESTATE_LIFECYCLE_JOURNEY_HEADLINE;

export const SPARK_ESTATE_COMPLETION_PHILOSOPHY = [
  "review",
  "improvement",
  "finalization",
  "saving",
  "sharing",
  "future use",
] as const;

export const SPARK_ESTATE_GROWTH_RULES = [
  "Add expertise — do not add disconnected systems.",
  "Add value — do not add complexity.",
] as const;

export const SPARK_ESTATE_QUALITY_STANDARD = [
  "Does this help the member?",
  "Does this fit the Spark journey?",
  "Does this sound like Spark?",
  "Does this reduce friction?",
] as const;

export type SparkEstateOperatingAdditionProposal = {
  label: string;
  helpsMember: string;
  fitsJourney: string;
  soundsLikeSpark: string;
  reducesFriction: string;
};

export type SparkEstateOperatingAdditionEvaluation = {
  approved: boolean;
  checklist: Array<{ question: string; answer: string; passed: boolean }>;
  issues: string[];
};

export function evaluateSparkEstateOperatingAddition(
  proposal: SparkEstateOperatingAdditionProposal,
): SparkEstateOperatingAdditionEvaluation {
  const answers = [
    proposal.helpsMember,
    proposal.fitsJourney,
    proposal.soundsLikeSpark,
    proposal.reducesFriction,
  ];
  const checklist = SPARK_ESTATE_QUALITY_STANDARD.map((question, index) => {
    const answer = answers[index]?.trim() ?? "";
    return {
      question,
      answer: answer || "Not specified",
      passed: answer.length > 0,
    };
  });
  const issues = checklist.filter((entry) => !entry.passed).map((entry) => entry.question);
  return {
    approved: issues.length === 0,
    checklist,
    issues,
  };
}

export function assessSparkEstateMasterOperatingDocumentCompliance(): {
  identityReady: boolean;
  companionModelReady: boolean;
  creationJourneyReady: boolean;
  intelligenceLayersReady: boolean;
  personalizationReady: boolean;
  memoryPhilosophyReady: boolean;
  cardPhilosophyReady: boolean;
  memberJourneyReady: boolean;
  completionPhilosophyReady: boolean;
  growthRulesReady: boolean;
  qualityStandardReady: boolean;
  conversationAligned: boolean;
  governanceAligned: boolean;
  productionReadinessMapped: boolean;
} {
  const creation = verifySparkEstateCreationJourney();
  const completion = verifySparkEstateCompletionSystem();
  const conversation = verifySparkEstateConversationEngine();
  const lifecycle = verifySparkEstateUserJourneyAndMemberLifecycle();
  const intelligence = verifySparkEstateAiPromptAndIntelligenceLayerArchitecture();
  const cards = verifySparkEstateCardEcosystem();
  const data = verifySparkEstateFileAndDataArchitecture();
  const governance = verifySparkEstateSystemGovernanceAndQualityStandards();
  const rooms = verifySparkEstateRoomIntelligenceArchitecture();
  const production = verifySparkEstateProductionReadiness();

  return {
    identityReady: SPARK_ESTATE_IDENTITY_CAPABILITIES.length === 7,
    companionModelReady: SPARK_ESTATE_COMPANION_MODEL.length === 5,
    creationJourneyReady:
      creation.stepCount === 8 &&
      SPARK_ESTATE_OPERATING_CREATION_JOURNEY.length === 8,
    intelligenceLayersReady:
      SPARK_ESTATE_OPERATING_INTELLIGENCE_LAYERS.length === 6 &&
      intelligence.intelligenceLayerReady,
    personalizationReady:
      SPARK_ESTATE_PERSONALIZATION_PHILOSOPHY.learns.length === 5 &&
      lifecycle.lifecycleResolutionReady,
    memoryPhilosophyReady:
      SPARK_ESTATE_MEMORY_PHILOSOPHY.remember.length === 4 && data.oneSourceOfTruth,
    cardPhilosophyReady:
      SPARK_ESTATE_CARD_PHILOSOPHY.examples.length === 4 && cards.selectionWorks,
    memberJourneyReady:
      SPARK_ESTATE_MEMBER_JOURNEY_HEADLINE.includes("Discover") &&
      lifecycle.lifecycleResolutionReady,
    completionPhilosophyReady:
      SPARK_ESTATE_COMPLETION_PHILOSOPHY.length === 6 && completion.hasRememberStep,
    growthRulesReady: SPARK_ESTATE_GROWTH_RULES.length === 2 && governance.governanceReady,
    qualityStandardReady: SPARK_ESTATE_QUALITY_STANDARD.length === 4,
    conversationAligned: conversation.voiceConsistent,
    governanceAligned: governance.governanceReady,
    productionReadinessMapped: production.checklistRuns && rooms.sharedFoundationReady,
  };
}

export function verifySparkEstateMasterOperatingDocument(): {
  sections: number;
  operatingDocumentReady: boolean;
  qualityStandardEvaluationReady: boolean;
  corePromiseReady: boolean;
} {
  const sample = evaluateSparkEstateOperatingAddition({
    label: "Momentum guidance on workshop launch",
    helpsMember: "Helps the member choose the next small step on an active project",
    fitsJourney: "Supports Create → Progress in the member journey",
    soundsLikeSpark: "Warm, practical, one question at a time",
    reducesFriction: "Surfaces one next action instead of a full task list",
  });

  const compliance = assessSparkEstateMasterOperatingDocumentCompliance();
  const operatingDocumentReady = Object.values(compliance).every(Boolean);

  return {
    sections: SPARK_ESTATE_OPERATING_INTELLIGENCE_LAYERS.length + 6,
    operatingDocumentReady,
    qualityStandardEvaluationReady: sample.approved,
    corePromiseReady:
      SPARK_ESTATE_CORE_PROMISE.from.length > 0 &&
      SPARK_ESTATE_CORE_PROMISE.to.length > 0,
  };
}

export function sparkEstateMasterOperatingDocumentCompanionHint(input?: {
  text?: string;
}): string | null {
  const text = input?.text?.trim().toLowerCase() ?? "";
  if (
    text &&
    /master operating|what is spark estate|spark vision|core promise|how spark thinks|operating document/.test(
      text,
    )
  ) {
    return (
      `SPARK ESTATE OPERATING MODEL: ${SPARK_ESTATE_COMPANION_MODEL.join(" ")} ` +
      `Promise: ${SPARK_ESTATE_CORE_PROMISE.from} → ${SPARK_ESTATE_CORE_PROMISE.to} ` +
      `Quality: ${SPARK_ESTATE_QUALITY_STANDARD.join(" ")}`
    );
  }
  return null;
}

export function formatSparkEstateMasterOperatingDocumentReport(
  verification: ReturnType<typeof verifySparkEstateMasterOperatingDocument> = verifySparkEstateMasterOperatingDocument(),
  compliance: ReturnType<typeof assessSparkEstateMasterOperatingDocumentCompliance> = assessSparkEstateMasterOperatingDocumentCompliance(),
): string {
  const lines: string[] = [
    `Spark Estate™ master operating document: ${verification.operatingDocumentReady ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_MASTER_OPERATING_PURPOSE,
    SPARK_ESTATE_MASTER_OPERATING_VISION,
    "",
    "Identity — Spark Estate helps members:",
  ];

  for (const capability of SPARK_ESTATE_IDENTITY_CAPABILITIES) {
    lines.push(`  • ${capability}`);
  }

  lines.push(
    "",
    "Core promise:",
    `  From: ${SPARK_ESTATE_CORE_PROMISE.from}`,
    `  To: ${SPARK_ESTATE_CORE_PROMISE.to}`,
    "",
    "Companion model:",
  );
  for (const pillar of SPARK_ESTATE_COMPANION_MODEL) {
    lines.push(`  ${pillar}`);
  }

  lines.push("", "Room model:");
  for (const room of SPARK_ESTATE_OPERATING_ROOM_MODEL) {
    lines.push(`  ${room.label}: ${room.helps.join(", ")}`);
  }

  lines.push("", "Universal creation journey:");
  lines.push(`  ${SPARK_ESTATE_OPERATING_CREATION_JOURNEY.join(" → ")}`);

  lines.push("", "Intelligence architecture:");
  for (const layer of SPARK_ESTATE_OPERATING_INTELLIGENCE_LAYERS) {
    lines.push(`  ${layer.label}: ${layer.role}`);
  }

  lines.push("", "Personalization philosophy:");
  lines.push(`  ${SPARK_ESTATE_PERSONALIZATION_PHILOSOPHY.principle}`);
  lines.push(`  Learns: ${SPARK_ESTATE_PERSONALIZATION_PHILOSOPHY.learns.join(", ")}`);

  lines.push("", "Memory philosophy:");
  lines.push(`  Remember: ${SPARK_ESTATE_MEMORY_PHILOSOPHY.remember.join(", ")}`);
  lines.push(`  Avoid: ${SPARK_ESTATE_MEMORY_PHILOSOPHY.avoid}`);

  lines.push("", "Card philosophy:");
  lines.push(`  ${SPARK_ESTATE_CARD_PHILOSOPHY.principle}`);
  lines.push(`  Examples: ${SPARK_ESTATE_CARD_PHILOSOPHY.examples.join(", ")}`);

  lines.push("", "Member journey:");
  lines.push(`  ${SPARK_ESTATE_MEMBER_JOURNEY_HEADLINE}`);

  lines.push("", "Completion philosophy:");
  for (const item of SPARK_ESTATE_COMPLETION_PHILOSOPHY) {
    lines.push(`  • ${item}`);
  }

  lines.push("", "Growth rules:");
  for (const rule of SPARK_ESTATE_GROWTH_RULES) {
    lines.push(`  • ${rule}`);
  }

  lines.push("", "Quality standard:");
  for (const question of SPARK_ESTATE_QUALITY_STANDARD) {
    lines.push(`  ? ${question}`);
  }

  lines.push("", "Compliance checks:");
  lines.push(`  Identity: ${compliance.identityReady ? "pass" : "fail"}`);
  lines.push(`  Companion model: ${compliance.companionModelReady ? "pass" : "fail"}`);
  lines.push(`  Creation journey: ${compliance.creationJourneyReady ? "pass" : "fail"}`);
  lines.push(`  Intelligence layers: ${compliance.intelligenceLayersReady ? "pass" : "fail"}`);
  lines.push(`  Member journey: ${compliance.memberJourneyReady ? "pass" : "fail"}`);
  lines.push(`  Completion philosophy: ${compliance.completionPhilosophyReady ? "pass" : "fail"}`);
  lines.push(`  Governance aligned: ${compliance.governanceAligned ? "pass" : "fail"}`);
  lines.push(
    `  Quality standard evaluation: ${verification.qualityStandardEvaluationReady ? "pass" : "fail"}`,
  );

  return lines.join("\n");
}
