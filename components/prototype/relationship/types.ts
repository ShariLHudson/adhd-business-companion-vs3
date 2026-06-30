export type RelationshipPhase =
  | "room-waiting"
  | "greeting"
  | "workshop-question"
  | "awaiting-first-answer"
  | "uncertainty-offer"
  | "research"
  | "post-research"
  | "second-question"
  | "awaiting-second-answer"
  | "draft-offer"
  | "draft-visible"
  | "save-offer"
  | "complete";

export type UncertaintyChoice = "question" | "examples" | "research" | null;

export type SaveChoice = "yes" | "not-yet" | "continue" | null;
