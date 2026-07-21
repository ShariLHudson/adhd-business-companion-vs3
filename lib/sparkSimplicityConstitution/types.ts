/**
 * Spec 128 — Spark Estate Simplicity & Cognitive Load Constitution.
 *
 * Binding release gates and audit checklist IDs.
 *
 * @see docs/constitution/128_SPARK_ESTATE_SIMPLICITY_AND_COGNITIVE_LOAD_CONSTITUTION.md
 */

/** Fifteen constitutional simplicity rules */
export type SparkSimplicityRuleId =
  | "hide_complexity"
  | "one_screen_one_question"
  | "remove_decisions"
  | "progressive_disclosure"
  | "never_expose_architecture"
  | "one_thing_at_a_time"
  | "never_punish_exploration"
  | "protect_momentum"
  | "recommend_before_asking"
  | "feel_recoverable"
  | "navigation_disappears"
  | "reduce_anxiety"
  | "reduce_ef_load"
  | "companion_before_interface"
  | "ultimate_it_just_knows_test";

export const SPARK_SIMPLICITY_RULES: readonly SparkSimplicityRuleId[] = [
  "hide_complexity",
  "one_screen_one_question",
  "remove_decisions",
  "progressive_disclosure",
  "never_expose_architecture",
  "one_thing_at_a_time",
  "never_punish_exploration",
  "protect_momentum",
  "recommend_before_asking",
  "feel_recoverable",
  "navigation_disappears",
  "reduce_anxiety",
  "reduce_ef_load",
  "companion_before_interface",
  "ultimate_it_just_knows_test",
] as const;

export const SPARK_SIMPLICITY_RULE_LABELS: Record<SparkSimplicityRuleId, string> =
  {
    hide_complexity: "Hide Complexity",
    one_screen_one_question: "Every Screen Answers One Question",
    remove_decisions: "Remove Decisions",
    progressive_disclosure: "Progressive Disclosure",
    never_expose_architecture: "Never Expose Architecture",
    one_thing_at_a_time: "One Thing At A Time",
    never_punish_exploration: "Never Punish Exploration",
    protect_momentum: "Always Protect Momentum",
    recommend_before_asking: "Recommend Before Asking",
    feel_recoverable: "Everything Should Feel Recoverable",
    navigation_disappears: "Navigation Should Disappear",
    reduce_anxiety: "Every Feature Must Reduce Anxiety",
    reduce_ef_load: "Every Feature Must Reduce EF Load",
    companion_before_interface: "Companion Before Interface",
    ultimate_it_just_knows_test: "Ultimate Test — It Just Knows",
  };

/** Mandatory Simplicity Audit — ten questions before release */
export type SparkSimplicityAuditQuestionId =
  | "decision_removed"
  | "complexity_hidden"
  | "cognitive_load_reduced"
  | "anxiety_eliminated"
  | "first_time_success"
  | "requires_learning_system"
  | "interrupts_momentum"
  | "exposes_architecture"
  | "creates_dead_end"
  | "feels_like_spark";

export const SPARK_SIMPLICITY_AUDIT_QUESTIONS: readonly SparkSimplicityAuditQuestionId[] =
  [
    "decision_removed",
    "complexity_hidden",
    "cognitive_load_reduced",
    "anxiety_eliminated",
    "first_time_success",
    "requires_learning_system",
    "interrupts_momentum",
    "exposes_architecture",
    "creates_dead_end",
    "feels_like_spark",
  ] as const;

export const SPARK_SIMPLICITY_AUDIT_QUESTION_TEXT: Record<
  SparkSimplicityAuditQuestionId,
  string
> = {
  decision_removed: "What decision did we remove?",
  complexity_hidden: "What complexity did we hide?",
  cognitive_load_reduced: "What cognitive load did we reduce?",
  anxiety_eliminated: "What anxiety did we eliminate?",
  first_time_success: "Can a first-time user succeed immediately?",
  requires_learning_system: "Does this require learning the system?",
  interrupts_momentum: "Does this interrupt momentum?",
  exposes_architecture: "Does this expose architecture?",
  creates_dead_end: "Does this create a dead end?",
  feels_like_spark: "Does this feel like Spark — calm, guided, intelligent?",
};

/** Release certification gates — all required; no complete without simplicity/ADHD */
export type SparkReleaseCertificationGateId =
  | "functional"
  | "accessibility"
  | "performance"
  | "conversation"
  | "simplicity"
  | "cognitive_load"
  | "adhd_experience";

export const SPARK_RELEASE_CERTIFICATION_GATES: readonly SparkReleaseCertificationGateId[] =
  [
    "functional",
    "accessibility",
    "performance",
    "conversation",
    "simplicity",
    "cognitive_load",
    "adhd_experience",
  ] as const;

/** EF load dimensions Spark must reduce (Rule 13) */
export type SparkEfLoadDimension =
  | "memory"
  | "planning"
  | "decision_making"
  | "organization"
  | "task_switching"
  | "initiation";

export const SPARK_EF_LOAD_DIMENSIONS: readonly SparkEfLoadDimension[] = [
  "memory",
  "planning",
  "decision_making",
  "organization",
  "task_switching",
  "initiation",
] as const;

export const SPARK_SIMPLICITY_ULTIMATE_PASS =
  "It just knows what I need." as const;

export const SPARK_SIMPLICITY_ULTIMATE_FAIL =
  "I had to figure out the platform." as const;
