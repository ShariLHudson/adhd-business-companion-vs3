/**
 * Package 210 — One owner per conversation responsibility.
 * Duplicate conversation logic must not be introduced.
 */

export type ConversationResponsibilityId =
  | "reflective_intelligence"
  | "conversational_intelligence"
  | "repair_clarification"
  | "conversation_quality_rhythm"
  | "grounded_acknowledgement"
  | "no_hidden_meaning"
  | "topic_anchor"
  | "gold_standard_library"
  | "conversation_intelligence_engine"
  | "runtime_state"
  | "decision_pipeline"
  | "cie_validation"
  | "gold_runtime_integration"
  | "talk_it_out_product"
  | "tio_strategy"
  | "tio_mode_boundaries"
  | "tio_question_intelligence"
  | "tio_completion"
  | "tio_personalization"
  | "conversation_design_patterns"
  | "shari_natural_conversation"
  | "human_conversation_validator";

export type ConversationOwnershipRecord = {
  id: ConversationResponsibilityId;
  packageIds: readonly number[];
  ownerModule: string;
  owns: string;
  mustNotDuplicateIn: readonly string[];
};

/**
 * Canonical ownership map — single source of truth for package 210.
 */
export const CONVERSATION_OWNERSHIP: readonly ConversationOwnershipRecord[] = [
  {
    id: "reflective_intelligence",
    packageIds: [182],
    ownerModule: "lib/reflectiveConversationIntelligence",
    owns: "Reflective draft banks and ThinkingMap for Talk It Out",
    mustNotDuplicateIn: ["lib/createBuilderChat.ts", "lib/chamber"],
  },
  {
    id: "conversational_intelligence",
    packageIds: [183],
    ownerModule: "lib/conversationalIntelligence",
    owns: "Shared delivery polish (CI expression)",
    mustNotDuplicateIn: [],
  },
  {
    id: "repair_clarification",
    packageIds: [184],
    ownerModule: "lib/conversationRepairClarificationIntelligence",
    owns: "Clarification / repair detection",
    mustNotDuplicateIn: [],
  },
  {
    id: "conversation_quality_rhythm",
    packageIds: [186],
    ownerModule: "lib/conversationQualityRhythmIntelligence",
    owns: "Rhythm, length, observation vs question",
    mustNotDuplicateIn: [],
  },
  {
    id: "grounded_acknowledgement",
    packageIds: [191],
    ownerModule: "lib/conversationalIntelligence/groundedAcknowledgement.ts",
    owns: "Grounded acknowledgement certification",
    mustNotDuplicateIn: [],
  },
  {
    id: "no_hidden_meaning",
    packageIds: [192],
    ownerModule: "lib/reflectiveConversationIntelligence/noHiddenMeaning.ts",
    owns: "Hidden-meaning ban + correction repair",
    mustNotDuplicateIn: [],
  },
  {
    id: "topic_anchor",
    packageIds: [193, 208],
    ownerModule: "lib/topicContinuityAnchorIntelligence",
    owns: "Topic Anchor lifecycle + continuity gate",
    mustNotDuplicateIn: ["lib/sparkCoreIntelligence/conversationEngine"],
  },
  {
    id: "gold_standard_library",
    packageIds: [194, 199, 213],
    ownerModule: "lib/goldStandardConversationLibrary",
    owns: "Certified conversation corpus + retrieval",
    mustNotDuplicateIn: [],
  },
  {
    id: "conversation_intelligence_engine",
    packageIds: [195, 197],
    ownerModule: "lib/conversationIntelligenceEngine",
    owns: "Shared CIE orchestration (processConversationTurn)",
    mustNotDuplicateIn: ["lib/sparkCoreIntelligence/conversationEngine"],
  },
  {
    id: "runtime_state",
    packageIds: [196],
    ownerModule: "lib/conversationIntelligenceEngine/state.ts",
    owns: "ConversationRuntimeState",
    mustNotDuplicateIn: [],
  },
  {
    id: "decision_pipeline",
    packageIds: [197],
    ownerModule: "lib/conversationIntelligenceEngine/planning.ts",
    owns: "Priority / mode / plan",
    mustNotDuplicateIn: [],
  },
  {
    id: "cie_validation",
    packageIds: [198],
    ownerModule: "lib/conversationIntelligenceEngine/validation.ts",
    owns: "CIE technical validation",
    mustNotDuplicateIn: [],
  },
  {
    id: "gold_runtime_integration",
    packageIds: [199],
    ownerModule: "lib/conversationIntelligenceEngine/retrieval.ts",
    owns: "Gold retrieval inside CIE",
    mustNotDuplicateIn: [],
  },
  {
    id: "talk_it_out_product",
    packageIds: [200],
    ownerModule: "lib/talkItOut",
    owns: "Talk It Out experience surface",
    mustNotDuplicateIn: [],
  },
  {
    id: "tio_strategy",
    packageIds: [201],
    ownerModule: "lib/talkItOut/strategyLibrary.ts",
    owns: "TIO strategy moves",
    mustNotDuplicateIn: [],
  },
  {
    id: "tio_mode_boundaries",
    packageIds: [202],
    ownerModule: "lib/talkItOut/modeBoundaries.ts",
    owns: "TIO mode permission boundaries",
    mustNotDuplicateIn: [],
  },
  {
    id: "tio_question_intelligence",
    packageIds: [203],
    ownerModule: "lib/talkItOut/questionIntelligence.ts",
    owns: "TIO question quality",
    mustNotDuplicateIn: [],
  },
  {
    id: "tio_completion",
    packageIds: [204],
    ownerModule: "lib/talkItOut/completionIntelligence.ts",
    owns: "TIO completion / summary",
    mustNotDuplicateIn: [],
  },
  {
    id: "tio_personalization",
    packageIds: [205],
    ownerModule: "lib/talkItOut/personalization.ts",
    owns: "TIO prefs + re-entry",
    mustNotDuplicateIn: [],
  },
  {
    id: "conversation_design_patterns",
    packageIds: [207],
    ownerModule: "lib/conversationDesignPatterns",
    owns: "Shared CDP pattern registry",
    mustNotDuplicateIn: [],
  },
  {
    id: "shari_natural_conversation",
    packageIds: [208],
    ownerModule: "lib/shariNaturalConversation",
    owns: "Natural voice + topic discipline helpers",
    mustNotDuplicateIn: [],
  },
  {
    id: "human_conversation_validator",
    packageIds: [209],
    ownerModule: "lib/humanConversationValidator",
    owns: "Pre-delivery HCV gate + regeneration",
    mustNotDuplicateIn: [],
  },
] as const;

/** Fail if two records claim the same ownerModule for different ids incorrectly — modules may share package families. */
export function findDuplicateOwnershipIds(): string[] {
  const seen = new Map<string, string>();
  const dupes: string[] = [];
  for (const row of CONVERSATION_OWNERSHIP) {
    if (seen.has(row.id)) dupes.push(row.id);
    seen.set(row.id, row.ownerModule);
  }
  return dupes;
}

export function getOwner(id: ConversationResponsibilityId): ConversationOwnershipRecord {
  const row = CONVERSATION_OWNERSHIP.find((r) => r.id === id);
  if (!row) throw new Error(`Unknown responsibility: ${id}`);
  return row;
}
