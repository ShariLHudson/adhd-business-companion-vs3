/**
 * Spec 132 — Experience Perfection and Momentum Protection Standard.
 *
 * Binding rule IDs, Ten-Second Rule, momentum-loss metrics, and 12/10 cert questions.
 *
 * @see docs/constitution/132_EXPERIENCE_PERFECTION_AND_MOMENTUM_PROTECTION_STANDARD.md
 */

/** Twelve constitutional momentum / perfection rules */
export type SparkMomentumProtectionRuleId =
  | "protect_momentum_above_everything"
  | "intentional_navigation"
  | "protect_in_progress_thinking"
  | "one_navigation_path"
  | "interface_truthfulness"
  | "never_create_hidden_anxiety"
  | "progressive_disclosure_stays_calm"
  | "momentum_recovery"
  | "every_interaction_builds_trust"
  | "interface_polish_matters"
  | "measure_momentum_loss"
  | "final_12_10_certification";

export const SPARK_MOMENTUM_PROTECTION_RULES: readonly SparkMomentumProtectionRuleId[] =
  [
    "protect_momentum_above_everything",
    "intentional_navigation",
    "protect_in_progress_thinking",
    "one_navigation_path",
    "interface_truthfulness",
    "never_create_hidden_anxiety",
    "progressive_disclosure_stays_calm",
    "momentum_recovery",
    "every_interaction_builds_trust",
    "interface_polish_matters",
    "measure_momentum_loss",
    "final_12_10_certification",
  ] as const;

export const SPARK_MOMENTUM_PROTECTION_RULE_LABELS: Record<
  SparkMomentumProtectionRuleId,
  string
> = {
  protect_momentum_above_everything: "Protect Momentum Above Everything",
  intentional_navigation: "Every Navigation Event Must Be Intentional",
  protect_in_progress_thinking: "Protect In-Progress Thinking",
  one_navigation_path: "One Navigation Path",
  interface_truthfulness: "Interface Truthfulness",
  never_create_hidden_anxiety: "Never Create Hidden Anxiety",
  progressive_disclosure_stays_calm: "Progressive Disclosure Must Stay Progressive",
  momentum_recovery: "Momentum Recovery",
  every_interaction_builds_trust: "Every Interaction Must Build Trust",
  interface_polish_matters: "Interface Polish Matters",
  measure_momentum_loss: "Measure Momentum Loss",
  final_12_10_certification: "Final 12/10 Certification",
};

/**
 * Ten-Second Rule™ — permanent release gate.
 * First-time user must understand what to do within ten seconds without docs/teaching.
 */
export const SPARK_TEN_SECOND_RULE = {
  id: "ten_second_rule",
  seconds: 10,
  shipWhenFails: false,
} as const;

export const SPARK_TEN_SECOND_RULE_QUESTION =
  "Can a first-time user understand what to do within ten seconds without reading documentation or being taught?" as const;

export type SparkMomentumLossMetricId =
  | "hesitation"
  | "unexpected_navigation"
  | "wrong_assumption"
  | "recovery"
  | "repeated_click"
  | "backtracking"
  | "searching"
  | "abandoned_work";

export const SPARK_MOMENTUM_LOSS_METRICS: readonly SparkMomentumLossMetricId[] = [
  "hesitation",
  "unexpected_navigation",
  "wrong_assumption",
  "recovery",
  "repeated_click",
  "backtracking",
  "searching",
  "abandoned_work",
] as const;

export const SPARK_MOMENTUM_LOSS_METRIC_LABELS: Record<
  SparkMomentumLossMetricId,
  string
> = {
  hesitation: "Times user hesitated",
  unexpected_navigation: "Unexpected navigation",
  wrong_assumption: "Wrong assumptions",
  recovery: "Recoveries",
  repeated_click: "Repeated clicks",
  backtracking: "Backtracking",
  searching: "Searching",
  abandoned_work: "Abandoned work",
};

/** Final 12/10 certification — six independent-reviewer questions (Rule 12) */
export type SparkMomentumProtectionCertificationQuestionId =
  | "interrupted_thinking"
  | "surprised"
  | "wondered_what_to_do"
  | "lost_confidence"
  | "felt_lost"
  | "thought_about_software";

export const SPARK_MOMENTUM_PROTECTION_CERTIFICATION_QUESTIONS: readonly SparkMomentumProtectionCertificationQuestionId[] =
  [
    "interrupted_thinking",
    "surprised",
    "wondered_what_to_do",
    "lost_confidence",
    "felt_lost",
    "thought_about_software",
  ] as const;

export const SPARK_MOMENTUM_PROTECTION_CERTIFICATION_QUESTION_TEXT: Record<
  SparkMomentumProtectionCertificationQuestionId,
  string
> = {
  interrupted_thinking: "Did anything interrupt your thinking?",
  surprised: "Did anything surprise you?",
  wondered_what_to_do: "Did you ever wonder what to do?",
  lost_confidence: "Did you ever lose confidence?",
  felt_lost: "Did you ever feel lost?",
  thought_about_software:
    "Did you stop thinking about your work and start thinking about the software?",
};

/** Pass language — any certification answer "yes" means keep refining */
export const SPARK_MOMENTUM_PROTECTION_CERT_PASS_WHEN =
  "all_reviewer_answers_no" as const;

export const SPARK_MOMENTUM_ULTIMATE_PASS = "I just kept working." as const;

export const SPARK_MOMENTUM_ULTIMATE_FAIL = "I figured out the app." as const;

/** Soft leave copy for Create / working sessions (Rule 3 · Rule 8) */
export const SPARK_MOMENTUM_SOFT_LEAVE_CONFIRM =
  "You're still working on this. Leave without finishing for now?" as const;
