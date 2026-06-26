/**
 * Companion Relationship™ — rhythm adapts; Shari never changes.
 * @see docs/companion-homestead/COMPANION_RELATIONSHIP.md
 */

export const COMPANION_RELATIONSHIP_STYLES = [
  "quiet-companion",
  "balanced-companion",
  "front-porch-companion",
] as const;

export type CompanionRelationshipStyle = (typeof COMPANION_RELATIONSHIP_STYLES)[number];

export const VISIT_INTENTS = ["work_now", "linger", "neutral"] as const;

export type VisitIntent = (typeof VISIT_INTENTS)[number];

export type GreetingLength = "brief" | "warm" | "rich";

export type StorytellingDensity = "minimal" | "occasional" | "frequent";

export type PersonalStoryFrequency = "rare" | "occasional" | "frequent";

export type SpeedToWork = "immediate" | "fast" | "gentle";

export type CheckInFrequency = "low" | "normal" | "high";

export type ConversationLinger = "short" | "medium" | "long";

/** Adjustable rhythm knobs — never personality variants */
export type CompanionRelationshipRhythm = {
  greetingLength: GreetingLength;
  askReconnectionQuestion: boolean;
  environmentalStorytelling: StorytellingDensity;
  /** Higher = less frequent Memory Triggers™ */
  memoryTriggerVisitModulo: number;
  /** Higher = less frequent Everyday Life moments */
  everydayLifeVisitModulo: number;
  personalStories: PersonalStoryFrequency;
  speedToWork: SpeedToWork;
  checkInFrequency: CheckInFrequency;
  conversationLinger: ConversationLinger;
  /** When true, route to workspace without conversational delay */
  prioritizeWorkRouting: boolean;
  /** When true, remain in Living Room — conversation before tools */
  preferLivingRoomLinger: boolean;
};

export type CompanionRelationshipStyleMeta = {
  id: CompanionRelationshipStyle;
  label: string;
  emoji: string;
  tagline: string;
  description: string;
  rhythm: CompanionRelationshipRhythm;
};

export type CompanionRelationshipLearningState = {
  quickWorkVisitCount: number;
  lingerVisitCount: number;
  /** One-time learning offer already shown */
  offerShownFor: "suggest-quiet" | "suggest-front-porch" | null;
  totalVisitsObserved: number;
};

export type CompanionRelationshipPreference = {
  style: CompanionRelationshipStyle;
  updatedAt: string;
};

export type CompanionRelationshipInput = {
  now?: Date;
  sessionVisitIndex?: number;
  /** User's chosen style — defaults to balanced */
  style?: CompanionRelationshipStyle;
  /** Today's message or arrival signal */
  userText?: string | null;
  /** Explicit overwhelm without a task */
  overwhelmed?: boolean;
  /** Record visit pattern for learning */
  recordVisitPattern?: "quick_work" | "linger" | null;
};

export type CompanionRelationshipVerdict = {
  style: CompanionRelationshipStyle;
  visitIntent: VisitIntent;
  rhythm: CompanionRelationshipRhythm;
  /** One-time style suggestion — never repeated */
  learningOffer: string | null;
  constitutionalRule: typeof COMPANION_RELATIONSHIP_CONSTITUTIONAL_RULE;
};

export const COMPANION_RELATIONSHIP_CONSTITUTIONAL_RULE =
  "Shari remains Shari — only the rhythm changes." as const;

export const DEFAULT_COMPANION_RELATIONSHIP_STYLE: CompanionRelationshipStyle =
  "balanced-companion";
