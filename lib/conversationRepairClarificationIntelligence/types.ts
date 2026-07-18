/**
 * Conversation Repair & Clarification Intelligence (CRCI).
 * Shared recovery layer — clarify before asking another reflective question.
 */

export type CrciExperienceId =
  | "talk-it-out"
  | "create"
  | "general-chat"
  | "journal-gazebo"
  | "decision-compass"
  | "board"
  | "chamber"
  | "other";

export type CrciRepairTrigger =
  | "what-do-you-mean"
  | "dont-understand"
  | "explain"
  | "doesnt-make-sense"
  | "confused"
  | "misunderstood-answer"
  | "ignored-question"
  | "other";

export type CrciMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CrciRepairInput = {
  experienceId: CrciExperienceId;
  userText: string;
  messages: readonly CrciMessage[];
  /** Last assistant turn Shari is clarifying — preferred over scanning history. */
  previousAssistantText?: string | null;
  /** Package 193 — active primary topic for topic-safe repair. */
  primaryTopic?: string | null;
};

export type CrciRepairResult = {
  needsRepair: boolean;
  trigger: CrciRepairTrigger | null;
  /** When needsRepair, plain-language repair response (no new reflective question topic). */
  assistantText: string | null;
  /** True — suppress reflective questions until understanding is restored. */
  suppressReflectiveQuestions: boolean;
  meta: {
    ownedConfusion: boolean;
    invitedCorrection: boolean;
  };
};
