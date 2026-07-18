/**
 * Package 207 — Shared Conversation Design Pattern Library.
 */

export type CdpPatternId =
  | "CDP-GROUNDED-OPENING"
  | "CDP-CLARIFY-REQUEST"
  | "CDP-ACKNOWLEDGE-ADVANCE"
  | "CDP-DIRECT-ANSWER"
  | "CDP-REFLECTIVE-EXPLORE"
  | "CDP-REPAIR-PLAINLY"
  | "CDP-ACCEPT-CORRECTION"
  | "CDP-SEPARATE-CONCERNS"
  | "CDP-SUMMARIZE-CLARITY"
  | "CDP-TRANSITION-PERMISSION"
  | "CDP-NATURAL-COMPLETION";

export type CdpExperience =
  | "shari"
  | "talk-it-out"
  | "chamber"
  | "board"
  | "create"
  | "projects"
  | "onboarding"
  | "other";

export type ConversationDesignPattern = {
  id: CdpPatternId;
  name: string;
  owner: "platform";
  version: string;
  applicableExperiences: CdpExperience[];
  whenToUse: string;
  whenNotToUse: string;
  requiredInputs: string[];
  expectedOutputShape: string;
  prohibitedLanguage: string[];
  requiredValidators: string[];
  example: string;
  certificationStatus: "certified" | "draft";
};
