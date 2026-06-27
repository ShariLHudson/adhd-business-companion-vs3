/**
 * Carry Forward — every new day begins with hope.
 * @see docs/companion-homestead/CARRY_FORWARD.md
 */

export const YESTERDAY_CLOSE_TONES = [
  "ended_well",
  "ended_unfinished",
  "ended_overwhelmed",
  "ended_with_win",
  "ended_frustration",
  "ended_quiet",
  "unknown",
] as const;

export type YesterdayCloseTone = (typeof YESTERDAY_CLOSE_TONES)[number];

export type CarryForwardGreetingEntry = {
  id: string;
  tone: YesterdayCloseTone | "morning_universal";
  line: string;
  /** Optional second sentence */
  followUp?: string;
  cooldownDays: number;
};

export type CarryForwardInput = {
  now?: Date;
  sessionVisitIndex?: number;
  isFirstMeeting?: boolean;
  isFirstVisitOfDay?: boolean;
  yesterdayTone?: YesterdayCloseTone;
  projectRecentlyCompleted?: boolean;
  recoveryGentle?: boolean;
  lowEnergy?: boolean;
  /** Once the guest speaks, Carry Forward ends — Honor Their Intent */
  userText?: string | null;
  birthdayToday?: boolean;
  celebrationActive?: boolean;
};

export type CarryForwardVerdict = {
  active: boolean;
  greeting: string | null;
  followUp: string | null;
  yesterdayTone: YesterdayCloseTone;
  entryId: string | null;
  suppressedReason: string | null;
  constitutionalPrinciple: typeof CARRY_FORWARD_PRINCIPLE;
};

export const CARRY_FORWARD_PRINCIPLE =
  "We carry encouragement forward — never shame." as const;

export const CARRY_FORWARD_QUESTION =
  "What is the healthiest thing to bring into today?" as const;
