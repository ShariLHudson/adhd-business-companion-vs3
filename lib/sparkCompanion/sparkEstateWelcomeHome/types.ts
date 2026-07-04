/**
 * Spark Estate Constitution — The Place That Never Gives Up On You.
 * Trust before engagement. No shame architecture for absence.
 */

export const SPARK_WELCOME_HOME_MESSAGE =
  "I'm really glad you're here." as const;

export const SPARK_WELCOME_HOME_GUIDING_QUESTION =
  "How can I help this person feel welcome again?" as const;

export const SPARK_WELCOME_HOME_CLOSING =
  "Welcome home. I'm really glad you're here." as const;

export const SPARK_BEGIN_TODAY_OPENINGS = [
  "Where would you like to begin today?",
  "A lot can happen in a short time. Would you like to tell me what's changed?",
] as const;

export const SPARK_WELCOME_HOME_FORBIDDEN_QUESTIONS = [
  "Why weren't you here?",
  "Where have you been?",
  "Why did you leave?",
] as const;

export type WelcomeHomeSignal =
  | "returning"
  | "absence_shame"
  | "unfinished_guilt"
  | "season_shift";

export type SparkWelcomeHomeDecision = {
  signals: readonly WelcomeHomeSignal[];
  isReturnMoment: boolean;
  reason: string;
};

export type SparkWelcomeHomeHintInput = {
  userText: string;
  /** Session-level return — never pass duration to surface */
  isReturning?: boolean;
};
