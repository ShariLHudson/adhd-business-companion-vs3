/**
 * Daily Adaptation check-in — temporary day context for Adapt My Day.
 * Separate from Working Style Study, Return Plan, and long-term preferences.
 */

export type DailyAdaptationEnergyLevel =
  | "very-low"
  | "low"
  | "steady"
  | "good"
  | "high"
  | "variable"
  | "unsure";

export type DailyAdaptationMotivationLevel =
  | "none"
  | "a-little"
  | "enough-to-start"
  | "motivated"
  | "very-motivated"
  | "task-dependent"
  | "unsure";

export type DailyAdaptationChangeReason =
  | "less-time"
  | "more-time"
  | "energy-changed"
  | "motivation-changed"
  | "new-priority"
  | "unexpected"
  | "overwhelmed"
  | "stuck"
  | "something-else";

export type DailyAdaptationCheckIn = {
  date: string;
  capturedAt: string;
  energyLevel: DailyAdaptationEnergyLevel;
  motivationLevel: DailyAdaptationMotivationLevel;
  changeReason?: DailyAdaptationChangeReason;
  note?: string;
};

export type PlanOrAdaptChoiceId = "plan-my-day" | "adapt-my-day";

export type PlanOrAdaptChoiceCard = {
  id: PlanOrAdaptChoiceId;
  title: string;
  explanation: string;
  buttonLabel: string;
  recommended: boolean;
};

export type AdaptedPlanBucket =
  | "start-with-this"
  | "keep-today"
  | "make-smaller"
  | "move-later"
  | "delegate-or-ask"
  | "remove"
  | "add-a-break";

export type AdaptedPlanItem = {
  itemId: string;
  title: string;
  bucket: AdaptedPlanBucket;
  note?: string;
};

export type AdaptedDayProposal = {
  guidance: string;
  posture:
    | "low-energy-low-motivation"
    | "low-energy-high-motivation"
    | "high-energy-low-motivation"
    | "steady"
    | "high-energy-high-motivation"
    | "mixed";
  items: AdaptedPlanItem[];
  recoveryBreakMinutes: number;
  startWithTitle: string | null;
};

export type AdaptRecheckChoiceId =
  | "update-energy-motivation"
  | "time-changed"
  | "new-priority"
  | "overwhelmed"
  | "keep-current-plan";

export const DAILY_ADAPTATION_ENERGY_OPTIONS: {
  id: DailyAdaptationEnergyLevel;
  label: string;
}[] = [
  { id: "very-low", label: "Very Low" },
  { id: "low", label: "Low" },
  { id: "steady", label: "Steady" },
  { id: "good", label: "Good" },
  { id: "high", label: "High" },
  { id: "variable", label: "It Keeps Changing" },
  { id: "unsure", label: "I'm Not Sure" },
];

export const DAILY_ADAPTATION_MOTIVATION_OPTIONS: {
  id: DailyAdaptationMotivationLevel;
  label: string;
}[] = [
  { id: "none", label: "None Right Now" },
  { id: "a-little", label: "A Little" },
  { id: "enough-to-start", label: "Enough to Start" },
  { id: "motivated", label: "Motivated" },
  { id: "very-motivated", label: "Very Motivated" },
  { id: "task-dependent", label: "It Depends on the Task" },
  { id: "unsure", label: "I'm Not Sure" },
];

export const DAILY_ADAPTATION_CHANGE_OPTIONS: {
  id: DailyAdaptationChangeReason;
  label: string;
}[] = [
  { id: "less-time", label: "I have less time" },
  { id: "more-time", label: "I have more time" },
  { id: "energy-changed", label: "My energy changed" },
  { id: "motivation-changed", label: "My motivation changed" },
  { id: "new-priority", label: "A new priority came up" },
  { id: "unexpected", label: "Something unexpected happened" },
  { id: "overwhelmed", label: "I am overwhelmed" },
  { id: "stuck", label: "I am stuck" },
  { id: "something-else", label: "Something else" },
];

export const ADAPT_RECHECK_OPTIONS: {
  id: AdaptRecheckChoiceId;
  label: string;
}[] = [
  { id: "update-energy-motivation", label: "Update My Energy and Motivation" },
  { id: "time-changed", label: "My Available Time Changed" },
  { id: "new-priority", label: "A New Priority Came Up" },
  { id: "overwhelmed", label: "I'm Overwhelmed" },
  { id: "keep-current-plan", label: "Keep My Current Plan" },
];

export const DAILY_ADAPTATION_STORAGE_KEY =
  "spark-daily-adaptation-check-in-v1";
