/**
 * Spark Estate — system governance and quality standards (Phase 21).
 * Rules that keep the ecosystem organized, consistent, and scalable as it grows.
 *
 * @see docs/protocols/SPARK_ESTATE_SYSTEM_GOVERNANCE_AND_QUALITY_STANDARDS_SPECIFICATION_PHASE21.md
 */

import { verifySparkEstateCreationJourney } from "@/lib/universalCreation/sparkEstateCreationJourney";
import { verifySparkEstateCompletionSystem } from "@/lib/universalCreation/sparkEstateCompletionSystem";
import { verifySparkEstateCardEcosystem } from "./sparkEstateCardEcosystem";
import { verifySparkEstateConversationEngine } from "./sparkEstateConversationEngine";
import {
  SPARK_ESTATE_DATA_QUALITY_QUESTIONS,
  SPARK_ESTATE_PERMANENT_DATA,
  verifySparkEstateFileAndDataArchitecture,
} from "./sparkEstateFileAndDataArchitectureMap";
import { verifySparkEstateIntelligenceRouting } from "./sparkEstateIntelligenceRoutingMap";
import { verifySparkEstateRoomBlueprintTemplate } from "./sparkEstateRoomBlueprintTemplate";
import { verifySparkEstateRoomIntelligenceArchitecture } from "./sparkEstateRoomIntelligenceArchitecture";

export const SPARK_ESTATE_GOVERNANCE_PRINCIPLE =
  "Spark Estate is one ecosystem — every part supports one companion, one journey, one creation process, one memory system, and one consistent experience.";

export const SPARK_ESTATE_GOVERNANCE_VISION =
  "One trusted companion. Many helpful capabilities. Growth creates more value, not more confusion.";

export const SPARK_ESTATE_GOVERNANCE_PILLARS = [
  "one companion relationship",
  "one member journey",
  "one creation process",
  "one memory system",
  "one consistent experience",
] as const;

export const SPARK_ESTATE_SOURCE_OF_TRUTH_AVOID = [
  "duplicate definitions",
  "competing workflows",
  "multiple versions of the same intelligence",
] as const;

export type SparkEstateSourceOfTruthOwner = {
  concept: string;
  owner: string;
  location: string;
  notOwnedBy: string;
};

export const SPARK_ESTATE_SOURCE_OF_TRUTH_OWNERS: readonly SparkEstateSourceOfTruthOwner[] = [
  {
    concept: "Universal creation process",
    owner: "Universal Creation Journey",
    location: "lib/universalCreation/sparkEstateCreationJourney.ts",
    notOwnedBy: "individual rooms",
  },
  {
    concept: "Completion and output",
    owner: "Universal Completion System",
    location: "lib/universalCreation/sparkEstateCompletionSystem.ts",
    notOwnedBy: "room-specific save flows",
  },
  {
    concept: "Member profile and personalization",
    owner: "Member Profile Engine",
    location: "lib/estate/sparkEstateMemberProfileEngine.ts",
    notOwnedBy: "per-room profile stores",
  },
  {
    concept: "Intelligence routing",
    owner: "Intelligence Routing Map",
    location: "lib/estate/sparkEstateIntelligenceRoutingMap.ts",
    notOwnedBy: "room-local routing copies",
  },
  {
    concept: "Card selection and lifecycle",
    owner: "Card Ecosystem",
    location: "lib/estate/sparkEstateCardEcosystem.ts",
    notOwnedBy: "ad-hoc card widgets",
  },
  {
    concept: "Shari voice and conversation flow",
    owner: "Conversation Engine",
    location: "lib/estate/sparkEstateConversationEngine.ts",
    notOwnedBy: "room-specific chat personalities",
  },
  {
    concept: "Knowledge and asset retrieval",
    owner: "Knowledge and Asset Library",
    location: "lib/estate/sparkEstateKnowledgeAndAssetLibraryArchitecture.ts",
    notOwnedBy: "scattered template lookups",
  },
  {
    concept: "File and data ownership",
    owner: "File and Data Architecture Map",
    location: "lib/estate/sparkEstateFileAndDataArchitectureMap.ts",
    notOwnedBy: "duplicate storage keys",
  },
];

export const SPARK_ESTATE_NAMING_STANDARDS = [
  "Names must be clear and meaningful.",
  "Names must be member-friendly.",
  "Names must stay consistent across navigation, rooms, and cards.",
  "Avoid similar names for different functions.",
  "Avoid technical names shown to members.",
  "Avoid confusing internal labels in member-facing copy.",
] as const;

export const SPARK_ESTATE_ROOM_CREATION_REQUIREMENTS = [
  { id: "purpose", question: "What problem does this room solve?" },
  { id: "audience", question: "Who benefits from it?" },
  { id: "intelligence", question: "What expertise does it provide?" },
  { id: "connection", question: "How does it work with existing rooms?" },
  { id: "member-value", question: "Why would someone return?" },
] as const;

export const SPARK_ESTATE_INTELLIGENCE_OWNERSHIP_FIELDS = [
  "identity",
  "knowledge",
  "frameworks",
  "workflows",
  "boundaries",
] as const;

export const SPARK_ESTATE_DUPLICATE_INTELLIGENCE_MAP = [
  {
    capability: "planning",
    useExisting: "creation and project systems",
    owner: "Universal Creation Journey + Goals & Projects",
  },
  {
    capability: "learning",
    useExisting: "knowledge architecture",
    owner: "Knowledge and Asset Library + Momentum Institute",
  },
  {
    capability: "progress",
    useExisting: "Momentum systems",
    owner: "Chamber of Momentum + Momentum Card",
  },
  {
    capability: "conversation voice",
    useExisting: "Shari conversation engine",
    owner: "Conversation Engine",
  },
  {
    capability: "daily arrival",
    useExisting: "daily companion experience",
    owner: "Daily Companion Experience",
  },
] as const;

export const SPARK_ESTATE_CARD_GOVERNANCE_FIELDS = [
  "purpose",
  "data source",
  "audience",
  "trigger",
  "action",
  "memory impact",
] as const;

export const SPARK_ESTATE_CONVERSATION_GOVERNANCE_STANDARDS = [
  "Maintain Shari voice.",
  "Ask one question at a time.",
  "Offer helpful guidance.",
  "Provide practical next steps.",
  "Include encouragement.",
] as const;

export const SPARK_ESTATE_DATA_GOVERNANCE_RULES = [
  "Member data must have clear ownership.",
  "Every store must have a defined purpose.",
  "Storage must use the approved architecture map.",
  "Respect privacy — avoid unnecessary collection.",
  ...SPARK_ESTATE_DATA_QUALITY_QUESTIONS.map(
    (question) => `Ask: ${question}`,
  ),
] as const;

export const SPARK_ESTATE_QUALITY_REVIEW_DIMENSIONS = [
  { id: "experience", label: "Experience", question: "Does it feel like Spark?" },
  { id: "journey", label: "Journey", question: "Does it fit the universal process?" },
  { id: "memory", label: "Memory", question: "Does it improve future support?" },
  { id: "navigation", label: "Navigation", question: "Is it easy to find?" },
  { id: "value", label: "Value", question: "Does it help members move forward?" },
] as const;

export const SPARK_ESTATE_NEW_FEATURE_CHECKLIST = [
  "What problem does this solve?",
  "Who needs it?",
  "Does it already exist?",
  "Where does it belong?",
  "What intelligence powers it?",
  "What memory does it create?",
  "How does it complete the journey?",
] as const;

export const SPARK_ESTATE_SCALABILITY_RULES = [
  "Add expertise — not disconnected systems.",
  "Add helpful experiences — not feature clutter.",
  "Extend existing owners before creating new ones.",
  "Route through universal creation and completion when building.",
  "Keep one companion relationship across every new room.",
] as const;

export type SparkEstateNewFeatureProposal = {
  problem: string;
  audience: string;
  capability?: string;
  proposedOwner?: string;
  proposedLocation?: string;
  memoryImpact?: string;
  completionPath?: string;
};

export type SparkEstateNewFeatureEvaluation = {
  approved: boolean;
  checklist: Array<{ question: string; answer: string; passed: boolean }>;
  duplicateRisk: string | null;
  recommendedOwner: string | null;
  issues: string[];
};

export function evaluateSparkEstateNewFeatureProposal(
  proposal: SparkEstateNewFeatureProposal,
): SparkEstateNewFeatureEvaluation {
  const issues: string[] = [];
  const capability = proposal.capability?.trim().toLowerCase() ?? "";

  const duplicate = SPARK_ESTATE_DUPLICATE_INTELLIGENCE_MAP.find(
    (entry) => capability && entry.capability === capability,
  );

  const duplicateRisk = duplicate
    ? `${duplicate.capability} already belongs to ${duplicate.owner} — use ${duplicate.useExisting}.`
    : null;

  if (duplicate) {
    issues.push(duplicateRisk!);
  }

  if (!proposal.problem.trim()) {
    issues.push("missing problem statement");
  }
  if (!proposal.audience.trim()) {
    issues.push("missing audience");
  }
  if (!proposal.memoryImpact?.trim()) {
    issues.push("memory impact not defined");
  }
  if (!proposal.completionPath?.trim()) {
    issues.push("completion path not defined");
  }

  const recommendedOwner =
    duplicate?.owner ??
    proposal.proposedOwner ??
    (capability ? null : "Define the single source-of-truth owner first.");

  const checklist = SPARK_ESTATE_NEW_FEATURE_CHECKLIST.map((question, index) => {
    const answers = [
      proposal.problem,
      proposal.audience,
      duplicate ? `Yes — ${duplicate.useExisting}` : "No duplicate found",
      proposal.proposedLocation ?? "Not specified",
      proposal.proposedOwner ?? duplicate?.owner ?? "Not specified",
      proposal.memoryImpact ?? "Not specified",
      proposal.completionPath ?? "Not specified",
    ];
    const answer = answers[index] ?? "";
    const passed = answer.trim().length > 0 && !/^not specified$/i.test(answer);
    return { question, answer, passed };
  });

  const approved =
    issues.length === 0 && checklist.every((entry) => entry.passed) && !duplicate;

  return {
    approved,
    checklist,
    duplicateRisk,
    recommendedOwner,
    issues,
  };
}

export function assessSparkEstateGovernanceCompliance(): {
  sourceOfTruthReady: boolean;
  namingStandardsReady: boolean;
  roomCreationReady: boolean;
  intelligenceOwnershipReady: boolean;
  duplicatePreventionReady: boolean;
  cardGovernanceReady: boolean;
  conversationGovernanceReady: boolean;
  dataGovernanceReady: boolean;
  qualityReviewReady: boolean;
  scalabilityReady: boolean;
} {
  const creation = verifySparkEstateCreationJourney();
  const completion = verifySparkEstateCompletionSystem();
  const cards = verifySparkEstateCardEcosystem();
  const conversation = verifySparkEstateConversationEngine();
  const data = verifySparkEstateFileAndDataArchitecture();
  const routing = verifySparkEstateIntelligenceRouting();
  const blueprints = verifySparkEstateRoomBlueprintTemplate();
  const roomIntelligence = verifySparkEstateRoomIntelligenceArchitecture();

  return {
    sourceOfTruthReady:
      SPARK_ESTATE_SOURCE_OF_TRUTH_OWNERS.length >= 8 &&
      creation.stepCount === 8 &&
      completion.hasRememberStep,
    namingStandardsReady: SPARK_ESTATE_NAMING_STANDARDS.length >= 5,
    roomCreationReady:
      SPARK_ESTATE_ROOM_CREATION_REQUIREMENTS.length === 5 &&
      blueprints.allBlueprintsValid,
    intelligenceOwnershipReady:
      SPARK_ESTATE_INTELLIGENCE_OWNERSHIP_FIELDS.length === 5 &&
      roomIntelligence.expertiseGroups === 6,
    duplicatePreventionReady:
      SPARK_ESTATE_DUPLICATE_INTELLIGENCE_MAP.length >= 5 && routing.routesResolve,
    cardGovernanceReady:
      SPARK_ESTATE_CARD_GOVERNANCE_FIELDS.length === 6 && cards.selectionWorks,
    conversationGovernanceReady:
      SPARK_ESTATE_CONVERSATION_GOVERNANCE_STANDARDS.length === 5 &&
      conversation.voiceConsistent,
    dataGovernanceReady:
      SPARK_ESTATE_DATA_GOVERNANCE_RULES.length >= 5 &&
      data.oneSourceOfTruth &&
      SPARK_ESTATE_PERMANENT_DATA.length >= 5,
    qualityReviewReady: SPARK_ESTATE_QUALITY_REVIEW_DIMENSIONS.length === 5,
    scalabilityReady: SPARK_ESTATE_SCALABILITY_RULES.length >= 4,
  };
}

export function verifySparkEstateSystemGovernanceAndQualityStandards(): {
  pillars: number;
  sourceOfTruthOwners: number;
  newFeatureChecklist: number;
  governanceReady: boolean;
  sampleFeatureEvaluationReady: boolean;
} {
  const sample = evaluateSparkEstateNewFeatureProposal({
    problem: "Help members plan a launch timeline",
    audience: "Members preparing a product or event launch",
    capability: "planning",
    proposedOwner: "New planning module",
    proposedLocation: "lib/planning/duplicatePlanner.ts",
    memoryImpact: "timeline preferences",
    completionPath: "save plan and connect to project",
  });

  const compliance = assessSparkEstateGovernanceCompliance();
  const governanceReady = Object.values(compliance).every(Boolean);

  return {
    pillars: SPARK_ESTATE_GOVERNANCE_PILLARS.length,
    sourceOfTruthOwners: SPARK_ESTATE_SOURCE_OF_TRUTH_OWNERS.length,
    newFeatureChecklist: SPARK_ESTATE_NEW_FEATURE_CHECKLIST.length,
    governanceReady,
    sampleFeatureEvaluationReady: !sample.approved && Boolean(sample.duplicateRisk),
  };
}

export function sparkEstateGovernanceCompanionHint(input?: {
  text?: string;
}): string | null {
  const text = input?.text?.trim().toLowerCase() ?? "";
  if (
    text &&
    /new feature|add capability|build a new|duplicate|governance|quality standard/.test(
      text,
    )
  ) {
    return (
      `SPARK ESTATE GOVERNANCE: ${SPARK_ESTATE_GOVERNANCE_PRINCIPLE} ` +
      `Before adding anything, ask: ${SPARK_ESTATE_NEW_FEATURE_CHECKLIST.join(" ")} ` +
      `Do not duplicate planning, learning, progress, voice, or daily arrival systems.`
    );
  }
  return null;
}

export function formatSparkEstateSystemGovernanceReport(
  verification: ReturnType<typeof verifySparkEstateSystemGovernanceAndQualityStandards> = verifySparkEstateSystemGovernanceAndQualityStandards(),
  compliance: ReturnType<typeof assessSparkEstateGovernanceCompliance> = assessSparkEstateGovernanceCompliance(),
): string {
  const lines: string[] = [
    `Spark Estate governance: ${verification.governanceReady ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_GOVERNANCE_PRINCIPLE,
    SPARK_ESTATE_GOVERNANCE_VISION,
    "",
    "Governance pillars:",
  ];

  for (const pillar of SPARK_ESTATE_GOVERNANCE_PILLARS) {
    lines.push(`  • ${pillar}`);
  }

  lines.push("", "Source of truth owners:");
  for (const owner of SPARK_ESTATE_SOURCE_OF_TRUTH_OWNERS) {
    lines.push(
      `  ${owner.concept} → ${owner.owner}`,
      `    Location: ${owner.location}`,
      `    Not owned by: ${owner.notOwnedBy}`,
    );
  }

  lines.push("", "Duplicate intelligence map:");
  for (const entry of SPARK_ESTATE_DUPLICATE_INTELLIGENCE_MAP) {
    lines.push(`  ${entry.capability}: use ${entry.useExisting} (${entry.owner})`);
  }

  lines.push("", "New feature checklist:");
  for (const item of SPARK_ESTATE_NEW_FEATURE_CHECKLIST) {
    lines.push(`  ${item}`);
  }

  lines.push("", "Quality review dimensions:");
  for (const dimension of SPARK_ESTATE_QUALITY_REVIEW_DIMENSIONS) {
    lines.push(`  ${dimension.label}: ${dimension.question}`);
  }

  lines.push("", "Scalability rules:");
  for (const rule of SPARK_ESTATE_SCALABILITY_RULES) {
    lines.push(`  • ${rule}`);
  }

  lines.push("", "Compliance checks:");
  lines.push(`  Source of truth: ${compliance.sourceOfTruthReady ? "pass" : "fail"}`);
  lines.push(`  Room creation: ${compliance.roomCreationReady ? "pass" : "fail"}`);
  lines.push(`  Duplicate prevention: ${compliance.duplicatePreventionReady ? "pass" : "fail"}`);
  lines.push(`  Card governance: ${compliance.cardGovernanceReady ? "pass" : "fail"}`);
  lines.push(`  Conversation governance: ${compliance.conversationGovernanceReady ? "pass" : "fail"}`);
  lines.push(`  Data governance: ${compliance.dataGovernanceReady ? "pass" : "fail"}`);
  lines.push(`  Quality review: ${compliance.qualityReviewReady ? "pass" : "fail"}`);
  lines.push(`  Scalability: ${compliance.scalabilityReady ? "pass" : "fail"}`);
  lines.push(
    `  Sample duplicate rejection: ${verification.sampleFeatureEvaluationReady ? "pass" : "fail"}`,
  );

  return lines.join("\n");
}
