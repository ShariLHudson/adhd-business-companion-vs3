/** Executive Strategy Center — visual thinking environment (no AI). */

export type StrategyToolId =
  | "whiteboard"
  | "mind-map"
  | "sticky-notes"
  | "decision-canvas"
  | "pros-cons"
  | "swot"
  | "opportunity-matrix"
  | "priority-matrix";

export type StrategyTool = {
  id: StrategyToolId;
  label: string;
  description: string;
};

export type StrategyCardColor =
  | "teal"
  | "aqua"
  | "gold"
  | "bronze"
  | "purple"
  | "neutral";

export type StrategyIdeaCard = {
  id: string;
  title: string;
  body: string;
  category?: string;
  color: StrategyCardColor;
  x: number;
  y: number;
};

export type StrategyPerspective = {
  id: string;
  role: string;
  keyQuestion: string;
  insight: string;
  initials: string;
};

export type StrategyBoardMember = {
  id: string;
  role: string;
  expertise: string;
  currentFocus: string;
  availability: "available" | "in-session" | "reserved";
  initials: string;
};

export type StrategyDecisionStatus =
  | "exploring"
  | "weighing"
  | "nearly-ready"
  | "decided"
  | "parked";

export type StrategyDecisionSummary = {
  currentDecision: string;
  pros: string[];
  concerns: string[];
  unknowns: string[];
  recommendedNextStep: string;
  status: StrategyDecisionStatus;
};

export type StrategyMeetingNotes = {
  richText: string;
  bullets: string[];
  quickNotes: string;
  actionItems: string[];
  decisionNotes: string;
};

export type EstateThinkingPlace = {
  id: string;
  label: string;
  href: string;
  feeling: string;
};

export type StrategySessionMeta = {
  id: string;
  title: string;
  updatedAt: string;
  archived: boolean;
};

export type StrategySession = {
  id: string;
  title: string;
  executiveQuestion: string;
  activeToolId: StrategyToolId;
  ideaCards: StrategyIdeaCard[];
  decision: StrategyDecisionSummary;
  notes: StrategyMeetingNotes;
  updatedAt: string;
  archived: boolean;
};

export type StrategyCenterBootstrap = {
  defaultSession: StrategySession;
  tools: StrategyTool[];
  perspectives: StrategyPerspective[];
  boardMembers: StrategyBoardMember[];
  estatePlaces: EstateThinkingPlace[];
  savedSessions: StrategySessionMeta[];
};
