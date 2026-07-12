import type { AdvisoryMemberId } from "@/lib/advisory/types";

/** How the board was assembled. */
export type BoardAssemblyMode = "assemble-best" | "choose-members";

/** Discussion depth / facilitation style. */
export type BoardDiscussionStyle =
  | "quick-review"
  | "full-discussion"
  | "challenge-thinking";

export type BoardroomView =
  | "home"
  | "meet-directors"
  | "past"
  | "past-detail"
  | "how-to"
  | "board-director-intake"
  | "new-situation"
  | "new-assembly"
  | "new-members"
  | "new-style"
  | "discussion"
  | "brief";

/** Structured decision brief — Your Decision stays empty until the member records it. */
export type BoardDecisionBrief = {
  situation: string;
  optionsConsidered: string[];
  potentialBenefits: string[];
  potentialDrawbacks: string[];
  risksAndUnknowns: string[];
  areasOfAgreement: string[];
  differentPerspectives: string[];
  questionsStillToAnswer: string[];
  possibleNextSteps: string[];
  /** Never auto-filled — member owns this. */
  yourDecision: string;
};

export type BoardMemberTurn = {
  memberId: AdvisoryMemberId;
  memberName: string;
  memberRole: string;
  /** Distinct lens for this turn */
  perspective: string;
  pros: string[];
  cons: string[];
  risks: string[];
  opportunities: string[];
  tradeOffs: string[];
  unknowns: string[];
  questions: string[];
  possibleOptions: string[];
  fitNotes: string[];
};

export type BoardModeratorNote = {
  kind:
    | "restate"
    | "agreement"
    | "disagreement"
    | "missing-info"
    | "invite"
    | "pause"
    | "close";
  text: string;
};

export type BoardDiscussionTurn =
  | { id: string; role: "moderator"; note: BoardModeratorNote }
  | { id: string; role: "member"; turn: BoardMemberTurn }
  | { id: string; role: "member-context"; text: string };

export type BoardroomDiscussionRecord = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  situation: string;
  assemblyMode: BoardAssemblyMode;
  memberIds: AdvisoryMemberId[];
  style: BoardDiscussionStyle;
  turns: BoardDiscussionTurn[];
  brief: BoardDecisionBrief;
  /** Member-recorded decision text */
  recordedDecision: string | null;
  revisitAt: string | null;
  outcomeNotes: string | null;
  status: "in-progress" | "paused" | "ended";
};

export type BoardroomStoreSnapshot = {
  version: 1;
  discussions: BoardroomDiscussionRecord[];
};
