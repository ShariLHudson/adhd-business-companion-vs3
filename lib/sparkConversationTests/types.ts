/**
 * Conversation Validation™ (Spec 119).
 * Architecture FROZEN — validate companion behavior; break the engine.
 *
 * Answer key: Spec 116 — docs/conversation-gold-standards/
 * Freeze: docs/SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md
 *
 * @see docs/SPARK_CONVERSATION_TESTS_FRAMEWORK.md
 * @see docs/conversation-tests/
 */

export const CONVERSATION_TESTS_SPEC_ID = 119 as const;

export const CONVERSATION_ARCHITECTURE_FROZEN = true as const;

export const CONVERSATION_TEST_BREAK_IT_MANDATE =
  "Your job is not to prove Spark works. Your job is to break the Conversation Engine — find failures, explain why, rewrite that turn, reference nearest Gold Standard. Never declare Passed." as const;

export const CONVERSATION_TEST_FINAL_QUESTION =
  "Would this member feel they spent time with a thoughtful business companion — not an application?" as const;

/** Mandatory — Gate 8 */
export const CONVERSATION_TEST_SHARI_OVER_SHOULDER_QUESTION =
  "If Shari were watching over your shoulder, what would she tell you to do differently in this conversation?" as const;

export const CONVERSATION_TEST_SHARI_MANDATE =
  "Would Shari actually say this? — warmth, pace, trust, clarity, permission, ADHD friendliness — not technical correctness." as const;

/** Gate 7 */
export const CONVERSATION_TEST_SPARK_QUESTION =
  "At any point, did Spark stop feeling like Shari and start feeling like software?" as const;

export const HIDDEN_WORK_PERMISSION_BOUNDARY =
  "Prepare freely. Act only with permission." as const;

/** Eight QA gates — all mandatory */
export type ConversationTestQAGate =
  | "conversation_quality"
  | "hospitality"
  | "cognitive_load"
  | "iceberg"
  | "relief"
  | "future_me"
  | "spark_question"
  | "shari_over_shoulder";

export const CONVERSATION_TEST_QA_GATES: readonly {
  gate: ConversationTestQAGate;
  title: string;
  order: number;
}[] = [
  { gate: "conversation_quality", title: "Gate 1 — Conversation Quality (1–10)", order: 1 },
  { gate: "hospitality", title: "Gate 2 — Hospitality™ (Spec 111)", order: 2 },
  { gate: "cognitive_load", title: "Gate 3 — Cognitive Load Audit™", order: 3 },
  { gate: "iceberg", title: "Gate 4 — Iceberg Audit™ (Spec 118)", order: 4 },
  { gate: "relief", title: "Gate 5 — Relief Test™", order: 5 },
  { gate: "future_me", title: "Gate 6 — Future Me Test™", order: 6 },
  { gate: "spark_question", title: "Gate 7 — The Spark Question™", order: 7 },
  { gate: "shari_over_shoulder", title: "Gate 8 — Shari Over-the-Shoulder Review™", order: 8 },
] as const;

/** Gate 1 — Conversation Quality */
export type ConversationTestScorecardCategory =
  | "understood_intent"
  | "thoughtful_questions"
  | "stayed_on_topic"
  | "avoided_assumptions"
  | "research_timing"
  | "creation_timing"
  | "permission_before_acting"
  | "environment_handling"
  | "completion"
  | "felt_like_trusted_companion";

export const CONVERSATION_TEST_SCORECARD_CATEGORIES: readonly {
  id: ConversationTestScorecardCategory;
  label: string;
}[] = [
  { id: "understood_intent", label: "Understood intent" },
  { id: "thoughtful_questions", label: "Thoughtful questions" },
  { id: "stayed_on_topic", label: "Stayed on topic" },
  { id: "avoided_assumptions", label: "Avoided assumptions" },
  { id: "research_timing", label: "Research timing" },
  { id: "creation_timing", label: "Creation timing" },
  { id: "permission_before_acting", label: "Permission before acting" },
  { id: "environment_handling", label: "Environment handling" },
  { id: "completion", label: "Completion" },
  { id: "felt_like_trusted_companion", label: "Felt like trusted companion" },
] as const;

/** Gate 2 — Hospitality */
export type ConversationTestHospitalityCheckId =
  | "understood_before_solving"
  | "reduced_stress"
  | "felt_capable"
  | "trusted_companion_not_software"
  | "hope_and_clarity";

export const CONVERSATION_TEST_HOSPITALITY_CHECKS: readonly {
  id: ConversationTestHospitalityCheckId;
  prompt: string;
}[] = [
  { id: "understood_before_solving", prompt: "Understood before solving?" },
  { id: "reduced_stress", prompt: "Reduced stress?" },
  { id: "felt_capable", prompt: "Helped member feel capable?" },
  { id: "trusted_companion_not_software", prompt: "Trusted companion — not software?" },
  { id: "hope_and_clarity", prompt: "Hope and clarity at end?" },
] as const;

/** Gate 3 — Cognitive Load */
export type ConversationTestCognitiveLoadQuestionId =
  | "too_many_questions"
  | "too_many_choices"
  | "unnecessary_decisions"
  | "unnecessary_explanations"
  | "what_am_i_supposed_to_do"
  | "simplified_thinking";

export const CONVERSATION_TEST_COGNITIVE_LOAD_QUESTIONS: readonly {
  id: ConversationTestCognitiveLoadQuestionId;
  prompt: string;
}[] = [
  { id: "too_many_questions", prompt: "Too many questions?" },
  { id: "too_many_choices", prompt: "Too many choices?" },
  { id: "unnecessary_decisions", prompt: "Unnecessary decisions?" },
  { id: "unnecessary_explanations", prompt: "Unnecessary explanations?" },
  {
    id: "what_am_i_supposed_to_do",
    prompt: '"What do I do now?" moments?',
  },
  { id: "simplified_thinking", prompt: "Simplified thinking?" },
] as const;

export type ConversationTestCognitiveLoadRating = "low" | "moderate" | "high";

export const CONVERSATION_TEST_COGNITIVE_LOAD_LABELS: Record<
  ConversationTestCognitiveLoadRating,
  string
> = {
  low: "🟢 Low Cognitive Load",
  moderate: "🟡 Moderate Cognitive Load",
  high: "🔴 High Cognitive Load",
};

/** Gate 4 — Iceberg */
export type ConversationTestIcebergItemId =
  | "brain_retrieval"
  | "asset_connections"
  | "research_prep"
  | "draft_prep"
  | "related_conversations"
  | "memory_updates_proposed"
  | "opportunity_detection"
  | "spark_card_opportunity"
  | "hidden_intent_hypothesis";

export const CONVERSATION_TEST_ICEBERG_CHECKLIST: readonly {
  id: ConversationTestIcebergItemId;
  label: string;
}[] = [
  { id: "brain_retrieval", label: "Business Brain™ retrieval" },
  { id: "asset_connections", label: "Business Assets™ connections" },
  { id: "research_prep", label: "Research preparation" },
  { id: "draft_prep", label: "Draft preparation" },
  { id: "related_conversations", label: "Related conversations linked" },
  { id: "memory_updates_proposed", label: "Memory updates (proposed)" },
  { id: "opportunity_detection", label: "Opportunity detection" },
  { id: "spark_card_opportunity", label: "Spark Card™ opportunities" },
  { id: "hidden_intent_hypothesis", label: "Hidden intent hypothesis (CT-11)" },
] as const;

/** Gate 5 — Relief */
export type ConversationTestReliefRating = "increased" | "no_change" | "decreased";

export const CONVERSATION_TEST_RELIEF_LABELS: Record<ConversationTestReliefRating, string> = {
  increased: "🟢 Relief Increased",
  no_change: "🟡 No Change",
  decreased: "🔴 Relief Decreased",
};

export const CONVERSATION_TEST_RELIEF_QUESTIONS = [
  "Member felt less overwhelmed?",
  "Knew the next step?",
  "Felt supported?",
  "Trust Spark more?",
] as const;

/** Gate 6 — Future Me */
export const CONVERSATION_TEST_FUTURE_ME_QUESTIONS = [
  "Remembered something useful?",
  "Organized something?",
  "Connected ideas?",
  "Reduced future work?",
  "Improved retrieval?",
  "Prevented forgetting?",
] as const;

export type ConversationTestSparkQuestionResult =
  | { feltLikeSoftware: false }
  | {
      feltLikeSoftware: true;
      turn: number;
      why: string;
      rewriteResponse: string;
    };

export type ConversationTestFullScorecard = {
  testId: ConversationTestId;
  gatesCompleted: ConversationTestQAGate[];
  conversationQuality: Record<
    ConversationTestScorecardCategory,
    { score: number; notes: string }
  >;
  hospitality: Record<ConversationTestHospitalityCheckId, { pass: boolean; notes: string }>;
  cognitiveLoad: {
    answers: Record<
      ConversationTestCognitiveLoadQuestionId,
      { yes: boolean; turn?: number; notes: string }
    >;
    rating: ConversationTestCognitiveLoadRating;
  };
  iceberg: {
    items: Record<
      ConversationTestIcebergItemId,
      { status: "done" | "missed" | "not_applicable"; notes: string }
    >;
    preparedFreely: boolean;
    actedWithoutPermission: boolean;
    missingWork: string[];
  };
  relief: {
    answers: Record<string, { yes: boolean; notes: string }>;
    rating: ConversationTestReliefRating;
  };
  futureMe: Record<string, { yes: boolean; notes: string }>;
  sparkQuestion: ConversationTestSparkQuestionResult;
  shariOverShoulder: string;
  finalCompanionQuestion: boolean;
  failuresFound: ConversationTestFailure[];
  completedAt: string;
};

export type ConversationTestFailureType =
  | "assumption"
  | "wrong_question"
  | "too_fast"
  | "software_voice"
  | "felt_like_software"
  | "overwhelms_user"
  | "loses_context"
  | "missed_help_opportunity"
  | "wrong_environment"
  | "created_without_permission"
  | "emotional_miss"
  | "repeated_same_question"
  | "blocked_on_hidden_work"
  | "missing_invisible_work"
  | "permission_boundary_violation"
  | "high_cognitive_load"
  | "relief_decreased"
  | "future_me_miss"
  | "retrieval_fail"
  | "missed_hidden_intent"
  | "literal_task_rush"
  | "ai_voice_detected";

export type ConversationTestFailure = {
  turn: number;
  type: ConversationTestFailureType;
  description: string;
  why: string;
  betterResponse: string;
  goldStandardRef?: string;
};

export type ConversationTestId =
  | "marketing_plan"
  | "overwhelmed"
  | "great_idea"
  | "changing_direction"
  | "doesnt_know"
  | "celebration"
  | "environment"
  | "mid_environment"
  | "draft_review"
  | "retrieval"
  | "hidden_intent";

export const CONVERSATION_TEST_CATALOG: readonly {
  id: ConversationTestId;
  number: number;
  title: string;
  purpose: string;
  file: string;
  relatedGoldStandard?: string;
  relatedSpecs: number[];
}[] = [
  {
    id: "marketing_plan",
    number: 1,
    title: "Marketing Plan",
    purpose: "Think through marketing without assumptions — ADHD Business Ecosystem",
    file: "ct-01.md",
    relatedGoldStandard: "gs-01-marketing-app.md",
    relatedSpecs: [106, 111, 114, 118],
  },
  {
    id: "overwhelmed",
    number: 2,
    title: "Overwhelmed",
    purpose: "Emotional first — never rush productivity",
    file: "ct-02.md",
    relatedGoldStandard: "gs-02-overwhelmed.md",
    relatedSpecs: [111, 112, 114],
  },
  {
    id: "great_idea",
    number: 3,
    title: "Great Idea",
    purpose: "Capture · clarify · organize — not immediately create",
    file: "ct-03.md",
    relatedGoldStandard: "gs-03-have-an-idea.md",
    relatedSpecs: [114, 118],
  },
  {
    id: "changing_direction",
    number: 4,
    title: "Changing Direction",
    purpose: "Marketing → pricing → workshop → website — preserve context",
    file: "ct-04.md",
    relatedSpecs: [106, 111, 114, 117],
  },
  {
    id: "doesnt_know",
    number: 5,
    title: "I Don't Know",
    purpose: "Never repeat same uncertainty strategy twice",
    file: "ct-05.md",
    relatedGoldStandard: "gs-04-dont-know-what-to-do.md",
    relatedSpecs: [111, 114],
  },
  {
    id: "celebration",
    number: 6,
    title: "Celebration",
    purpose: "Celebrate · permission for Gallery/wins/save · continue naturally",
    file: "ct-06.md",
    relatedGoldStandard: "gs-07-huge-win.md",
    relatedSpecs: [110, 111, 112, 118],
  },
  {
    id: "environment",
    number: 7,
    title: "Environment Suggestion",
    purpose: "Natural environment invite after goal understood",
    file: "ct-07.md",
    relatedSpecs: [108, 111],
  },
  {
    id: "mid_environment",
    number: 8,
    title: "Mid-Conversation Environment",
    purpose: "Distraction — new environment · no context loss",
    file: "ct-08.md",
    relatedSpecs: [108, 111, 112, 117],
  },
  {
    id: "draft_review",
    number: 9,
    title: "Draft Review",
    purpose: "Permission → draft → review → revision → completion → what next?",
    file: "ct-09.md",
    relatedSpecs: [106, 109, 110, 111, 113],
  },
  {
    id: "retrieval",
    number: 10,
    title: "Retrieval",
    purpose: "Days later — find marketing plan naturally — I found it",
    file: "ct-10.md",
    relatedSpecs: [117, 118, 112],
  },
  {
    id: "hidden_intent",
    number: 11,
    title: "Hidden Intent",
    purpose: "Literal request vs underlying goal — mentor coaching, not task-bot",
    file: "ct-11.md",
    relatedGoldStandard: "gs-hidden-intent.md",
    relatedSpecs: [111, 114, 118],
  },
] as const;

export const CONVERSATION_TEST_FAILURE_TYPES_TO_HUNT: readonly ConversationTestFailureType[] =
  [
    "assumption",
    "wrong_question",
    "too_fast",
    "software_voice",
    "felt_like_software",
    "overwhelms_user",
    "loses_context",
    "missed_help_opportunity",
    "wrong_environment",
    "created_without_permission",
    "emotional_miss",
    "repeated_same_question",
    "blocked_on_hidden_work",
    "missing_invisible_work",
    "permission_boundary_violation",
    "high_cognitive_load",
    "relief_decreased",
    "future_me_miss",
    "retrieval_fail",
    "missed_hidden_intent",
    "literal_task_rush",
    "ai_voice_detected",
  ] as const;
