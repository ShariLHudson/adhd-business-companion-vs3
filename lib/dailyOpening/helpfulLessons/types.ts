/**
 * Show Me Something Helpful — curated estate capability lessons (not Help Me Choose).
 */

export type LessonEligibility = {
  /** Skip when feature is not live / navigable. */
  requiresLivePlace?: boolean;
  /** Skip for text-only preference when lesson is voice-only. */
  voiceOnly?: boolean;
  /** Soft topic tags for future relevance filtering. */
  tags?: string[];
};

/** Broad discovery grouping — used later for category-variety in selection. */
export type HelpfulLessonCategory =
  | "profile"
  | "client-profile"
  | "personalization"
  | "capture"
  | "planning"
  | "work"
  | "decision"
  | "recognition"
  | "room"
  | "tip";

/**
 * Optional deeper "Tell me more" content. Display-only: expanding it must never
 * save, navigate, or create anything.
 */
export type HelpfulLessonTellMeMore = {
  /** What the feature does. */
  whatItDoes?: string;
  /** How it helps. */
  howItHelps?: string;
  /** What the user can expect next. */
  whatToExpect?: string;
  /** Whether the next step is optional. */
  optional?: boolean;
  /** Rough time the next step may take (e.g. "5 minutes"). */
  timeEstimate?: string;
};

/**
 * Soft lifecycle relevance. Never a hard day-number clock — the selector derives
 * the current window from an existing account-age signal when one is available.
 */
export type HelpfulLessonLifecycleWindow =
  | "days-1-14"
  | "days-15-30"
  | "days-31-60"
  | "days-61-90"
  | "day-90-plus";

/** Completion-signal area a lesson maps to (for prioritise-incomplete / suppress-complete). */
export type HelpfulLessonCompletionArea =
  | "business"
  | "people-i-help"
  | "settings";

export type HelpfulLesson = {
  id: string;
  title: string;
  /**
   * Short one-line label / fallback body. Prefer `explanation` for the card
   * body; this remains for back-compat and for the navigation cue.
   */
  shortExplanation: string;
  /** Canonical place / section id when the primary action can navigate. */
  destinationId?: string;
  actionLabel: string;
  eligibility?: LessonEligibility;
  // --- Guided-discovery enrichment (all optional; back-compatible) ---
  /** Broad grouping for category-variety in selection. */
  category?: HelpfulLessonCategory;
  /** 2–4 sentence explanation: what this is and why it helps. */
  explanation?: string;
  /** Why this may help right now (may reference started/unfinished work). */
  whyNow?: string;
  /** Primary action label — e.g. "Continue profile", "Open", "Start". */
  primaryActionLabel?: string;
  /** In-place "Tell me more" expansion content. */
  tellMeMore?: HelpfulLessonTellMeMore;
  /** Soft lifecycle relevance (consumed later by the selector). */
  lifecycleWindows?: readonly HelpfulLessonLifecycleWindow[];
  /** Links this lesson to a profile/setup completion area. */
  completionArea?: HelpfulLessonCompletionArea;
  /** True when the primary action resumes started work ("Continue" vs "Start"). */
  resumable?: boolean;
};

export type HelpfulLessonHistory = {
  lessonId: string;
  shownAt: string;
  opened: boolean;
  dismissed: boolean;
};

export type HelpfulLessonOffer = {
  lesson: HelpfulLesson;
  /** Remaining rotate candidates after this one (for Something Else). */
  remainingIds: string[];
};
