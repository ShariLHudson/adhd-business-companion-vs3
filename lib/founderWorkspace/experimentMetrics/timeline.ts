import type { FounderEvent } from "@/lib/ecosystem/events";

import type { ExperimentTimelineEvent } from "./types";

export function buildExperimentTimeline(input: {
  experimentId: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  relatedProjectId?: string;
  events: FounderEvent[];
}): ExperimentTimelineEvent[] {
  const items: ExperimentTimelineEvent[] = [
    {
      id: `${input.experimentId}-created`,
      ts: input.createdAt,
      kind: "experiment",
      label: "Experiment created",
    },
  ];

  if (input.status === "testing") {
    items.push({
      id: `${input.experimentId}-testing`,
      ts: input.updatedAt,
      kind: "status",
      label: "Moved to testing",
    });
  }
  if (input.status === "successful" || input.status === "failed") {
    items.push({
      id: `${input.experimentId}-outcome`,
      ts: input.updatedAt,
      kind: "outcome",
      label: input.status === "successful" ? "Marked successful" : "Marked failed",
    });
  }

  for (const e of input.events) {
    if (e.refs?.projectId !== input.relatedProjectId) continue;
    if (e.type === "task.completed") {
      items.push({
        id: e.id,
        ts: e.ts,
        kind: "task",
        label: "Task completed",
        detail: String(e.data?.title ?? ""),
      });
    }
    if (e.type === "document.exported") {
      items.push({
        id: e.id,
        ts: e.ts,
        kind: "google",
        label: "Google export",
        detail: String(e.data?.provider ?? ""),
      });
    }
    if (e.type === "project.updated") {
      items.push({
        id: e.id,
        ts: e.ts,
        kind: "project",
        label: "Linked project updated",
      });
    }
  }

  return items
    .sort((a, b) => (a.ts < b.ts ? 1 : -1))
    .slice(0, 12);
}
