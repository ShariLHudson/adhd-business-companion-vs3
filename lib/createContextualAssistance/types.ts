/**
 * Section-scoped Create assistance packet (077 / 082).
 * Shared for all Work Types — no Event-only forks.
 */

export type CreateAssistanceActionId =
  | "help_me_think"
  | "give_me_ideas"
  | "im_not_sure"
  | "show_examples"
  | "review_this";

export type CreateAssistancePacket = {
  workId: string;
  workTypeId: string | null;
  workTypeLabel: string;
  sectionId: string;
  sectionTitle: string;
  sectionContent: string;
  workMetadata: {
    title: string | null;
    knownFacts: string[];
    constraints: string[];
  };
  actionId: CreateAssistanceActionId;
};

export type CreateAssistanceResult = {
  packet: CreateAssistancePacket;
  /** Member-facing guidance opener — section-specific, not generic. */
  guidance: string;
  responseType:
    | "help_think"
    | "ideas"
    | "unsure"
    | "examples"
    | "review";
};
