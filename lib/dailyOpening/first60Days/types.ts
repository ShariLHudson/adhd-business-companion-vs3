/**
 * First 60 Days Welcome Experience — types.
 * Extends Global Daily Companion Opening; not a parallel Welcome OS.
 */

export const FIRST_60_DAYS_GUIDED_LENGTH = 60;

export type WelcomeExperiencePhase = "guided" | "adaptive";

/** Usefulness-ordered discovery catalog entries for Welcome Home. */
export type First60DiscoveryId =
  | "plan-my-day"
  | "rhythms"
  | "business-profile"
  | "people-i-help"
  | "create"
  | "projects"
  | "focus"
  | "journal-gazebo"
  | "chamber"
  | "boardroom"
  | "estate-library"
  | "celebration-garden"
  | "evidence-vault";

export type First60DiscoveryDefinition = {
  id: First60DiscoveryId;
  /** Member-facing title. */
  title: string;
  /** One-sentence why this helps. */
  why: string;
  /** Soft reason this may fit today (guided) or adaptive hook. */
  whyToday: string;
  /** Navigable destination id (section / place). */
  destinationId: string;
  /** Soft visit-memory room keys used for frequency signals. */
  visitRoomIds?: readonly string[];
  /** Usefulness rank — lower = earlier in guided sequence. */
  usefulnessRank: number;
};

export type First60WelcomeLine = {
  id: string;
  /** Presence / welcome body — never the greeting title alone. */
  text: string;
};

export type First60Encouragement = {
  id: string;
  text: string;
};

export type First60ProgressState = {
  version: 1;
  /** Discovery ids the member explored (Explore). */
  exploredIds: string[];
  /** Discovery ids skipped (Skip) — never guilt; avoid re-suggest soon. */
  skippedIds: string[];
  /** Recent welcome line ids — prevent exact repeat. */
  recentWelcomeIds: string[];
  /** Recent encouragement ids. */
  recentEncouragementIds: string[];
  /** Last calendar day a discovery was offered (YYYY-MM-DD). */
  lastDiscoveryOfferDay: string | null;
  /** Last discovery id offered that day. */
  lastDiscoveryOfferId: string | null;
  /** Calendar day the pinned welcome line applies to. */
  lastWelcomeDay: string | null;
  /** Welcome line id pinned for lastWelcomeDay. */
  lastWelcomeId: string | null;
  /** Calendar day the pinned encouragement applies to. */
  lastEncouragementDay: string | null;
  /** Encouragement id pinned for lastEncouragementDay. */
  lastEncouragementId: string | null;
};

export type ResolveWelcomeDayIndexResult = {
  /** 1-based day of relationship (Day 1 = first calendar day). */
  dayIndex: number;
  /** 0-based days since relationship start (existing signal). */
  daysSinceStart: number;
  phase: WelcomeExperiencePhase;
};

export type ResolvedFirst60Discovery = {
  id: First60DiscoveryId;
  title: string;
  why: string;
  whyToday: string;
  destinationId: string;
  phase: WelcomeExperiencePhase;
};
