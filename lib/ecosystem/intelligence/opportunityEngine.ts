// Founder Ecosystem — Phase 4 Opportunity Engine.
// Tracks ideas / growth opportunities surfaced across chat, brain dumps,
// Clear My Mind, projects, and Create. Explainable + status-tracked.

import type { FounderEvent } from "../events";
import type {
  FounderOpportunity,
  OpportunitySource,
  OpportunityStatus,
} from "./intelligenceTypes";
import { asStr } from "./signals";

function sourceFrom(e: FounderEvent): OpportunitySource {
  switch (e.refs?.workspace) {
    case "clear-my-mind":
      return "clear-my-mind";
    case "create":
      return "create";
    case "projects":
      return "project";
    default:
      return "chat";
  }
}

const STATUS_MAP: Record<string, OpportunityStatus> = {
  new: "idea",
  idea: "idea",
  exploring: "exploring",
  pursuing: "active",
  active: "active",
  parked: "parked",
  won: "completed",
  completed: "completed",
  lost: "parked",
};

export function detectOpportunities(
  events: FounderEvent[],
): FounderOpportunity[] {
  return events
    .filter((e) => e.type === "opportunity.created" && e.refs?.opportunityId)
    .map((e) => {
      const oid = e.refs!.opportunityId!;
      const updates = events.filter(
        (x) => x.type === "opportunity.updated" && x.refs?.opportunityId === oid,
      );
      const latest = updates.sort((a, b) => (a.ts < b.ts ? 1 : -1))[0];
      const rawStatus = asStr(latest?.data?.status) || "idea";
      return {
        id: `opp-${oid}`,
        text: asStr(e.data?.text) || "Captured idea",
        source: sourceFrom(e),
        relatedProjectId: e.refs?.projectId,
        status: STATUS_MAP[rawStatus] ?? "idea",
        sourceEventIds: [e.id, ...updates.map((u) => u.id)],
      } satisfies FounderOpportunity;
    });
}
