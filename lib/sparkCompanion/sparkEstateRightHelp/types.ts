/**
 * Spark Estate Constitution X — The Right Kind of Help.
 * Seven companion roles; infer when confident, ask when not.
 */

export const SPARK_RIGHT_HELP_FIRST_QUESTION =
  "What kind of help is this person actually looking for?" as const;

export const SPARK_ICONIC_HELP_QUESTION =
  "How can I be most helpful right now?" as const;

export const SPARK_RIGHT_HELP_FORBIDDEN = [
  "What feature should I launch?",
  "What room should I send them to?",
] as const;

export const SPARK_RIGHT_HELP_SUCCESS =
  "That's exactly what I needed." as const;

export const SPARK_RIGHT_HELP_FINAL =
  "Spark doesn't try to give the best answer. It tries to become the right companion for this moment." as const;

export type RightHelpRoleId =
  | "listen"
  | "understand"
  | "build"
  | "guide"
  | "encourage"
  | "permission"
  | "stay_with_me";

export type HelpContextKind = "emotional" | "working" | "discouraged" | "general";

export type HelpChoice = {
  role: RightHelpRoleId;
  label: string;
};

export type SparkRightHelpDecision = {
  role: RightHelpRoleId;
  confidence: "high" | "medium" | "low";
  context: HelpContextKind;
  /** Offer 2–4 choices when confidence is low */
  offerChoices: readonly HelpChoice[];
  reason: string;
};

export type SparkRightHelpHintInput = {
  userText: string;
  overwhelmed?: boolean;
};
