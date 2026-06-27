export type LifeExperienceLetterId =
  | "lessons-sooner"
  | "life-unplanned"
  | "adhd-later"
  | "losing-someone"
  | "starting-over"
  | "finding-purpose"
  | "small-wins"
  | "fear-louder"
  | "business-steps"
  | "younger-self"
  | "kinsey"
  | "best-advice";

export type LifeExperienceLetter = {
  id: LifeExperienceLetterId;
  title: string;
  invitation: string;
  paragraphs: readonly string[];
  reflectionQuestions: readonly string[];
};
