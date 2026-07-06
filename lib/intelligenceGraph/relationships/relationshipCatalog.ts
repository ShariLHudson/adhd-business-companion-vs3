import type { GraphRelationshipKind } from "../types";

export const GRAPH_RELATIONSHIP_KIND_LABELS: Record<GraphRelationshipKind, string> = {
  supports: "Supports",
  created_from: "Created From",
  inspired_by: "Inspired By",
  answers: "Answers",
  solves: "Solves",
  improves: "Improves",
  blocks: "Blocks",
  duplicates: "Duplicates",
  extends: "Extends",
  references: "References",
  belongs_to: "Belongs To",
  generated: "Generated",
  requires: "Requires",
  launched_with: "Launched With",
  marketed_by: "Marketed By",
  validated_by: "Validated By",
  contradicted_by: "Contradicted By",
  superseded_by: "Superseded By",
  learned_from: "Learned From",
  remembered_from: "Remembered From",
  linked_to: "Linked To",
  related_to: "Related To",
};

export const ALL_RELATIONSHIP_KINDS = Object.keys(
  GRAPH_RELATIONSHIP_KIND_LABELS,
) as GraphRelationshipKind[];
