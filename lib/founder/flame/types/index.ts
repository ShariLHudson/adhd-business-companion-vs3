/** FLAME Executive Mentor — experience types (no AI). */

export type FlameObservationCategory =
  | "progress"
  | "focus"
  | "momentum"
  | "learning"
  | "creativity"
  | "decision-making"
  | "business";

export type FlameMentorPanelKind =
  | "perspective"
  | "question"
  | "encouragement"
  | "long-term";

export type FlameMorningMessage = {
  id: string;
  text: string;
  recordedAt: string;
};

export type FlameExecutiveObservation = {
  id: string;
  category: FlameObservationCategory;
  observation: string;
  notedAt: string;
};

export type FlameEncouragement = {
  id: string;
  text: string;
};

export type FlameChallenge = {
  id: string;
  text: string;
};

export type FlameSuggestedQuestion = {
  id: string;
  question: string;
};

export type FlameWeeklyReflection = {
  id: string;
  weekLabel: string;
  wins: string[];
  lessons: string[];
  patterns: string[];
  ideasWorthRevisiting: string[];
  futureOpportunities: string[];
};

export type FlameMentorPanel = {
  id: string;
  kind: FlameMentorPanelKind;
  title: string;
  body: string;
};

export type FlameMentorOverview = {
  morningMessage: FlameMorningMessage;
  observation: FlameExecutiveObservation;
  encouragement: FlameEncouragement;
  challenge: FlameChallenge;
  suggestedQuestion: FlameSuggestedQuestion;
  weeklyReflection: FlameWeeklyReflection;
  panels: FlameMentorPanel[];
};
