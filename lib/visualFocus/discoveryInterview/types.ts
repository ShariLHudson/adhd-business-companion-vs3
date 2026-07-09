export type VisualFocusDiscoveryAnswer = {
  questionId: string;
  question: string;
  answer: string;
};

export type VisualFocusDiscoveryInterview = {
  mapKind: "mind-map";
  answers: VisualFocusDiscoveryAnswer[];
  completedAt: string;
};
