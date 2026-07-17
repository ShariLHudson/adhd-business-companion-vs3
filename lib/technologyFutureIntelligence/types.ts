/** Thin Technology & Future Director chapter references — never dump full docs. */

export type TechFutureChapterId =
  | "TF-001"
  | "TF-002"
  | "TF-003"
  | "TF-004"
  | "TF-005"
  | "TF-006"
  | "TF-007"
  | "TF-008"
  | "TF-009"
  | "TF-010"
  | "TF-011"
  | "TF-012"
  | "TF-013"
  | "TF-014"
  | "TF-AI-001"
  | "TF-AI-002"
  | "TF-AI-004"
  | "TF-AI-008"
  | "TF-AUTO-001"
  | "TF-AUTO-012"
  | "TF-KM-001"
  | "TF-KM-014";

export type TechFutureTopicKind =
  | "shiny_object"
  | "tool_count"
  | "build_vs_buy"
  | "ai_time"
  | "crm"
  | "switch_replace"
  | "choose_software"
  | "integrations"
  | "source_of_truth"
  | "automation_ready"
  | "manual_smarter"
  | "knowledge_home"
  | "tech_overwhelm"
  | "right_problem";

export type TechFutureChapter = {
  id: TechFutureChapterId;
  title: string;
  topic: TechFutureTopicKind;
  /** One-line coaching posture for the model — not a chapter dump. */
  offerHint: string;
};
