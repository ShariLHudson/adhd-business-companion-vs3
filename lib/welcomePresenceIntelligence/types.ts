export type WelcomeGreetingCategory =
  | "day_one"
  | "morning"
  | "afternoon"
  | "evening"
  | "late_night"
  | "birthday"
  | "celebration"
  | "recovery"
  | "vacation"
  | "low_energy"
  | "relationship_month"
  | "relationship_six_months"
  | "relationship_years"
  | "ordinary";

export type WelcomeMood =
  | "warm"
  | "gentle"
  | "quiet"
  | "celebratory"
  | "honest";

export type WelcomeRelationshipTier =
  | "day_one"
  | "early"
  | "month"
  | "six_months"
  | "years";

export type WelcomePresenceIntelligence = {
  greeting: string;
  invite: string;
  openingSentence: string;
  mood: WelcomeMood;
  animationProfile: "living" | "still";
  greetingCategory: WelcomeGreetingCategory;
  chatPlaceholder: string;
};

export type WelcomePresenceInput = {
  now?: Date;
  homeState: "FIRST_VISIT" | "QUIET_PRESENCE";
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
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
};
