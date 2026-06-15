import type { ShariImageState } from "@/lib/shariImageState";
import type { MessageCategory } from "./messageLibrary";

/** How visibly the app celebrates — user-controlled in Settings > Celebrations. */
export type CelebrationMode = "full" | "simple" | "off";

/**
 * Recognition event types.
 * A good friend remembers — never guilt, streaks, or re-engagement pressure.
 */
export type RecognitionEventType =
  | "birthday"
  | "anniversary"
  | "vacation_countdown"
  | "membership_anniversary"
  | "conversation_milestone"
  | "project_milestone"
  | "business_milestone"
  | "custom_event";

/**
 * Future celebration effects (foundation only — not rendered yet).
 * Full mode will optionally surface these when implemented.
 */
export type RecognitionPlannedEffect =
  | "confetti"
  | "fireworks"
  | "birthday_cake"
  | "balloons"
  | "celebration_banner";

export type PersonalDateKind =
  | "birthday"
  | "anniversary"
  | "vacation"
  | "milestone"
  | "launch"
  | "workshop"
  | "speaking"
  | "due_date"
  | "custom";

export type PersonalDateCategory =
  | "personal"
  | "family"
  | "business"
  | "travel"
  | "health"
  | "custom";

/** User-chosen personal dates (birthday, vacation, celebrations, etc.). */
export type PersonalDate = {
  id: string;
  label: string;
  month: number;
  day: number;
  /** Optional year — for one-time events or countdowns with a fixed date. */
  year?: number;
  kind: PersonalDateKind;
  category?: PersonalDateCategory;
  /** ISO date — vacation start, due date, launch day for countdown messaging. */
  targetDate?: string;
};

export type MembershipMilestoneKey =
  | "membership_30d"
  | "membership_90d"
  | "membership_6mo"
  | "membership_1y"
  | "membership_2y"
  | "membership_3y_plus";

export type BusinessMilestoneKey =
  | "first_project"
  | "first_project_completed"
  | "first_content_created"
  | "first_launch"
  | "first_client_milestone"
  | "revenue_milestone";

export type ConversationMilestoneKey =
  | "first_conversation"
  | "conversation_25"
  | "conversation_50"
  | "conversation_100";

export type RecognitionMilestoneKey =
  | MembershipMilestoneKey
  | BusinessMilestoneKey
  | ConversationMilestoneKey
  | string;

/**
 * A single recognition event candidate for today.
 * Collected by the queue, then at most one is shown per day.
 */
export type RecognitionEvent = {
  id: string;
  type: RecognitionEventType;
  milestoneKey: RecognitionMilestoneKey;
  priority: number;
  shariState: ShariImageState;
  /** Reserved for future full-mode visuals — not rendered yet. */
  plannedEffect: RecognitionPlannedEffect | null;
  messageCategory: MessageCategory;
  messageVars?: Record<string, string>;
};

/** Active recognition moment shown to the user (max one per day). */
export type RecognitionMoment = {
  id: string;
  type: RecognitionEventType;
  milestoneKey: RecognitionMilestoneKey;
  title: string;
  message: string;
  shariState: ShariImageState;
  plannedEffect: RecognitionPlannedEffect | null;
  celebrationMode: CelebrationMode;
};

/** @deprecated Use RecognitionEvent — kept for internal migration. */
export type RecognitionCandidate = RecognitionEvent;

export type RecognitionContext = {
  now?: Date;
  celebrationMode?: CelebrationMode;
  userName?: string;
  birthday?: { month: number; day: number } | null;
  personalDates?: PersonalDate[];
  memberSinceIso?: string | null;
  conversationCount?: number;
  projectCount?: number;
  completedProjectCount?: number;
  hasCreatedContent?: boolean;
  businessMilestones?: Partial<Record<BusinessMilestoneKey, string>>;
};
