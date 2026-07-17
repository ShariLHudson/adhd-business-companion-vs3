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

export type HelpfulLesson = {
  id: string;
  title: string;
  shortExplanation: string;
  /** Canonical place / section id when Show Me can navigate. */
  destinationId?: string;
  actionLabel: string;
  eligibility?: LessonEligibility;
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
