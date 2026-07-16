/**
 * Pattern Awareness — member-controlled patterns.
 * Spark may notice; the member decides what is saved and used.
 */

export type PatternCategory =
  | "energy-time"
  | "starting-focus"
  | "planning-workload"
  | "motivation"
  | "overwhelm-recovery"
  | "communication-learning"
  | "custom";

export type PatternUseContext =
  | "plan-my-day"
  | "starting"
  | "reminders-rhythms"
  | "overwhelm"
  | "projects"
  | "everywhere"
  | "reference-only";

export type PatternConfidence = "early" | "possible" | "strong";

export type PatternStatus = "active" | "paused" | "retired";

export type SavedPattern = {
  id: string;
  /** Concise user-approved statement — never a raw transcript. */
  statement: string;
  category: PatternCategory;
  source: "user-added" | "spark-suggested";
  status: PatternStatus;
  useContexts: PatternUseContext[];
  evidenceSummary?: string;
  confidence?: PatternConfidence;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type PatternAwarenessControlPrefs = {
  /** Spark may offer new pattern suggestions. */
  noticeNewPatterns: boolean;
  /** Active saved patterns may influence guidance. */
  useSavedPatterns: boolean;
  updatedAt: string;
  version: number;
};

export type PatternSuggestionDraft = {
  statement: string;
  category: PatternCategory;
  evidenceSummary?: string;
  confidence?: PatternConfidence;
  useContexts?: PatternUseContext[];
};

export const PATTERN_AWARENESS_PREFS_KEY =
  "spark:pattern-awareness-prefs:v1" as const;
export const SAVED_PATTERNS_KEY = "spark:saved-patterns:v1" as const;
export const PATTERN_AWARENESS_CHANGE_EVENT =
  "spark:pattern-awareness-change" as const;

export const PATTERN_CATEGORY_LABELS: Record<PatternCategory, string> = {
  "energy-time": "Energy and Time",
  "starting-focus": "Starting and Focus",
  "planning-workload": "Planning and Workload",
  motivation: "Motivation",
  "overwhelm-recovery": "Overwhelm and Recovery",
  "communication-learning": "Communication and Learning",
  custom: "Custom",
};

export const PATTERN_USE_CONTEXT_LABELS: Record<PatternUseContext, string> = {
  "plan-my-day": "Use it when planning my day",
  starting: "Use it when helping me start",
  "reminders-rhythms": "Use it for reminders and rhythms",
  overwhelm: "Use it when I feel overwhelmed",
  projects: "Use it for project suggestions",
  everywhere: "Use it everywhere it fits",
  "reference-only": "Save it for reference only",
};

export const PATTERN_CONFIDENCE_LABELS: Record<PatternConfidence, string> = {
  early: "Early observation",
  possible: "Possible pattern",
  strong: "Strong pattern",
};
