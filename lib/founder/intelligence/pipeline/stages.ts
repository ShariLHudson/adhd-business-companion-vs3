import type { FounderIntelligencePipelineStageId } from "../types";

export const INTELLIGENCE_PIPELINE_STAGES: readonly {
  id: FounderIntelligencePipelineStageId;
  label: string;
  description: string;
}[] = [
  {
    id: "source",
    label: "Source",
    description: "Where information originates across the ecosystem.",
  },
  {
    id: "signal",
    label: "Signal",
    description: "Raw observations awaiting routing.",
  },
  {
    id: "finding",
    label: "Finding",
    description: "Structured facts distilled from signals.",
  },
  {
    id: "insight-candidate",
    label: "Insight Candidate",
    description: "Patterns ready for SPARK review — not conclusions.",
  },
  {
    id: "recommendation-candidate",
    label: "Recommendation Candidate",
    description: "Proposed executive actions awaiting judgment.",
  },
  {
    id: "report-candidate",
    label: "Report Candidate",
    description: "Material suitable for FIRE brief consideration.",
  },
  {
    id: "archive",
    label: "Archive",
    description: "Settled intelligence preserved for retrieval.",
  },
] as const;
