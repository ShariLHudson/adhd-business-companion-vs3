import type { WelcomeMood } from "@/lib/welcomePresenceIntelligence/types";

export type GreetingSeason =
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  | "holiday";

export type GreetingIntelligenceInput = {
  now?: Date;
  homeState: "FIRST_VISIT" | "QUIET_PRESENCE";
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  season?: GreetingSeason;
  isWeekend?: boolean;
  sessionVisitIndex: number;
  returnIntervalHours: number | null;
  returnIntervalDays: number | null;
  isFirstMeeting: boolean;
  firstName?: string | null;
  birthdayToday?: boolean;
  celebrationActive?: boolean;
  recoveryGentle?: boolean;
  lowEnergy?: boolean;
  vacationDaysAway?: number | null;
  projectRecentlyCompleted?: boolean;
  previousTopic?: string | null;
  recentAccomplishment?: string | null;
  emotionalNote?: string | null;
  prefersConversation?: boolean;
  weather?: "clear" | "rain" | "snow" | "cloudy";
  /** Presence Intelligence™ — room speaks; skip forced question. */
  presencePreferSilence?: boolean;
  /** Companion Relationship™ — adjusts greeting rhythm */
  companionRelationship?: import("@/lib/companionRelationship").CompanionRelationshipVerdict;
};

export type GreetingIntelligence = {
  greeting: string;
  /** First reconnection question — null means silence (valid hospitality). */
  reconnectionQuestion: string | null;
  invite: string | null;
  chatPlaceholder: string;
  mood: WelcomeMood;
  greetingCategory: string;
};

export type RelationshipEchoInput = {
  rawNote: string;
  tone: import("@/lib/arrivalExperience/types").RealityEmotionalTone;
};
