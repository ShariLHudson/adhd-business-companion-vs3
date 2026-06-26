import type { CompanionPlaceId } from "@/lib/companionUniverse/types";

/** How long the relationship has been growing — voice gets quieter over time. */
export type ShariRelationshipStage =
  | "day_one"
  | "early"
  | "month"
  | "trusted"
  | "deep"
  | "kin";

export type ShariTimeOfDay =
  | "morning"
  | "midday"
  | "afternoon"
  | "evening"
  | "late_night";

export type ShariSeason =
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  | "holiday";

export type ShariEmotionalTag =
  | "celebrating"
  | "discouraged"
  | "overwhelmed"
  | "quiet"
  | "excited"
  | "creative"
  | "exhausted"
  | "neutral"
  | "grief"
  | "good_news"
  | "difficult_news";

export type ShariVoiceCategory =
  | "morning"
  | "midday"
  | "afternoon"
  | "evening"
  | "late_night"
  | "rainy_day"
  | "snowy_iowa_day"
  | "sunny_summer_day"
  | "first_visit"
  | "second_visit"
  | "return_one_day"
  | "return_one_week"
  | "return_one_month"
  | "return_six_months"
  | "return_long_absence"
  | "from_planning_table"
  | "from_clear_my_mind"
  | "from_reading_nook"
  | "from_creative_studio"
  | "celebrating"
  | "discouraged"
  | "overwhelmed"
  | "quiet"
  | "excited"
  | "creative"
  | "exhausted"
  | "business_win"
  | "launch_week"
  | "big_decision"
  | "birthday"
  | "holiday_season"
  | "monday_morning"
  | "friday_evening"
  | "weekend"
  | "vacation_return"
  | "after_completing"
  | "after_doing_nothing"
  | "after_grief"
  | "after_good_news"
  | "after_difficult_news"
  | "after_meetings"
  | "after_creative_session"
  | "after_hard_week"
  | "after_productive_day"
  | "after_avoiding_app"
  | "variable_question"
  | "echo"
  | "placeholder"
  | "walking"
  | "continuity";

export type ShariVoiceKind =
  | "greeting"
  | "question"
  | "observation"
  | "echo"
  | "placeholder"
  | "walking"
  | "invitation";

export type ShariVoiceLine = {
  id: string;
  text: string;
  category: ShariVoiceCategory;
  kind: ShariVoiceKind;
  relationshipStages?: ShariRelationshipStage[];
  timeOfDay?: ShariTimeOfDay[];
  seasons?: ShariSeason[];
  emotionalTags?: ShariEmotionalTag[];
  rooms?: CompanionPlaceId[];
  frequencyWeight?: number;
  followUpQuestionId?: string;
  tags?: string[];
  /** Override default kind cooldown (visits). */
  cooldownVisits?: number;
  /** When true, greeting may stand alone — no forced question. */
  standsAlone?: boolean;
};

export type ShariVoiceContext = {
  now?: Date;
  sessionVisitIndex: number;
  relationshipStage: ShariRelationshipStage;
  timeOfDay: ShariTimeOfDay;
  season?: ShariSeason;
  weather?: "clear" | "rain" | "snow" | "cloudy";
  isWeekend?: boolean;
  isMonday?: boolean;
  isFriday?: boolean;
  isFirstMeeting?: boolean;
  isSecondVisit?: boolean;
  returnIntervalHours?: number | null;
  returnIntervalDays?: number | null;
  birthdayToday?: boolean;
  holidaySeason?: boolean;
  emotionalTag?: ShariEmotionalTag;
  lastRoom?: CompanionPlaceId | null;
  previousTopic?: string | null;
  projectRecentlyCompleted?: boolean;
  vacationDaysAway?: number | null;
  lowEnergy?: boolean;
  recoveryGentle?: boolean;
  firstName?: string | null;
  visitCategory?: ShariVoiceCategory | null;
};

export type ShariVoiceSelection = {
  line: ShariVoiceLine;
  text: string;
};

export type ShariLivingRoomOpening = {
  greeting: string;
  question: string | null;
  greetingLineId: string;
  questionLineId: string | null;
  chatPlaceholder: string;
};

export const VOICE_COOLDOWN_DEFAULTS = {
  greeting: 30,
  question: 20,
  observation: 45,
  echo: 20,
  openingComposite: 60,
} as const;
