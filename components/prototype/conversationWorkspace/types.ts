export type ConversationPhase =
  | "breathing"
  | "greeting"
  | "work-question"
  | "chatting"
  | "notebook-emerging"
  | "notebook-active"
  | "stuck-offer"
  | "proactive-offer"
  | "researching"
  | "research-done"
  | "complete";

export type StuckChoice =
  | "easier"
  | "research"
  | "examples"
  | "skip"
  | null;

export type ProactiveChoice = "yes" | "not-yet" | "more" | null;

export type CompletionChoice =
  | "refine"
  | "review"
  | "generate"
  | "save"
  | "export"
  | null;
