import type { RegionCode } from "@/lib/companionLanguage";
import type { RoomObject } from "@/lib/companionEnvironmentIntelligence";
import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";

export type SparkCategory =
  | "fun_holiday"
  | "nature"
  | "season"
  | "interesting"
  | "inspiration"
  | "humor"
  | "personal";

export type SparkInterestTag =
  | "books"
  | "gardening"
  | "coffee"
  | "nature"
  | "crafting"
  | "biking"
  | "travel"
  | "cooking"
  | "photography"
  | "sports"
  | "music"
  | "technology"
  | "pets"
  | "puzzles"
  | "chocolate"
  | "tea";

export type SparkCatalogEntry = {
  id: string;
  category: SparkCategory;
  /** Higher wins when multiple candidates match. Personal milestones use 100+. */
  priority: number;
  interestTags?: SparkInterestTag[];
  /** Omit for worldwide. */
  regions?: RegionCode[];
  /** Northern-hemisphere month numbers when season-relevant. */
  months?: number[];
  /** Fixed calendar observance. */
  monthDay?: { month: number; day: number };
  /** Season bucket match (hemisphere-adjusted at runtime). */
  seasons?: WelcomeSeason[];
  timeOfDay?: Array<"morning" | "afternoon" | "evening" | "night">;
  /** Only surface when lunar phase is full (approximate). */
  requiresFullMoon?: boolean;
  /** Conversational body — never trivia phrasing. */
  bodies: readonly string[];
  environmentObjects?: RoomObject[];
  /** Days before the same spark may appear again. */
  cooldownDays?: number;
};

export type TodaysLittleSparkResult = {
  id: string;
  category: SparkCategory;
  deliveryText: string;
  environmentObjects?: RoomObject[];
  priority: number;
};

export type EvaluateTodaysLittleSparkInput = {
  now?: Date;
  region?: RegionCode;
  season: WelcomeSeason;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  isFirstVisitOfDay: boolean;
  isFirstMeeting: boolean;
  onboardingActive?: boolean;
  recoveryGentle?: boolean;
  lowEnergy?: boolean;
  presencePreferSilence?: boolean;
  birthdayToday?: boolean;
  celebrationActive?: boolean;
  greetingCategory?: string;
  firstName?: string | null;
  memberSinceIso?: string | null;
  conversationStarts?: number;
  favoriteDrink?: string | null;
  interestTags?: SparkInterestTag[];
  /** Force frequency gate open (tests). */
  forceEligible?: boolean;
  record?: boolean;
};

export type EvaluateTodaysLittleSparkOutput = {
  spark: TodaysLittleSparkResult | null;
  suppressedReason?: string;
};
