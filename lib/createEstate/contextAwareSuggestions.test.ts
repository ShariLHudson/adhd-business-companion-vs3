import { describe, expect, it } from "vitest";
import type { CreateCatalogCategory } from "@/lib/createCatalog";
import { EVENT_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema";
import { MARKETING_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/marketingPlanMap";
import {
  filterCatalogByWorkContext,
  inferPreferredWorkTypeIdFromActiveWork,
  isWorkTypeRelevantToContext,
  resolveSuggestionContext,
} from "./contextAwareSuggestions";
import type { ActiveCreationWorkspaceSummary } from "./listActiveCreationWorkspaces";

function ws(
  partial: Partial<ActiveCreationWorkspaceSummary> & { kindLabel: string },
): ActiveCreationWorkspaceSummary {
  return {
    id: partial.id ?? "ws-1",
    title: partial.title ?? "Work",
    kindLabel: partial.kindLabel,
    phaseLabel: "In progress",
    updatedAt: new Date().toISOString(),
    eventRecordId: "ev-1",
    creationRecordId: "cr-1",
    projectHomeId: null,
    nextAction: "",
  };
}

const SAMPLE_CATALOG: CreateCatalogCategory[] = [
  {
    id: "events",
    label: "Events",
    items: [
      { label: "Workshop", emoji: "🎯" },
      { label: "Retreat", emoji: "🌿" },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    items: [
      { label: "Media Calendar", emoji: "📅" },
      { label: "Newsletter", emoji: "✉️" },
    ],
  },
  {
    id: "documents",
    label: "Documents",
    items: [
      { label: "SOP", emoji: "📋" },
      { label: "Event Checklist", emoji: "✅" },
    ],
  },
];

describe("createEstate contextAwareSuggestions (129)", () => {
  it("infers marketing work type from recent Media Calendar work", () => {
    expect(
      inferPreferredWorkTypeIdFromActiveWork([
        ws({ kindLabel: "Media Calendar" }),
      ]),
    ).toBe(MARKETING_PLAN_WORK_TYPE_ID);
  });

  it("infers event work type from Workshop", () => {
    expect(
      inferPreferredWorkTypeIdFromActiveWork([ws({ kindLabel: "Workshop" })]),
    ).toBe(EVENT_PLAN_WORK_TYPE_ID);
  });

  it("filters out event templates when context is marketing/media", () => {
    const filtered = filterCatalogByWorkContext(SAMPLE_CATALOG, {
      workTypeId: MARKETING_PLAN_WORK_TYPE_ID,
      kindLabel: "Media Calendar",
    });
    expect(filtered.some((c) => c.id === "events")).toBe(false);
    expect(
      filtered.flatMap((c) => c.items.map((i) => i.label)),
    ).not.toContain("Event Checklist");
    expect(filtered[0]?.id).toBe("marketing");
  });

  it("keeps full catalog when no context", () => {
    const filtered = filterCatalogByWorkContext(SAMPLE_CATALOG, {});
    expect(filtered).toHaveLength(SAMPLE_CATALOG.length);
  });

  it("marks Event Plan irrelevant for marketing-only context", () => {
    const ctx = resolveSuggestionContext([
      ws({ kindLabel: "Marketing Plan" }),
    ]);
    expect(isWorkTypeRelevantToContext(EVENT_PLAN_WORK_TYPE_ID, ctx)).toBe(
      false,
    );
    expect(
      isWorkTypeRelevantToContext(MARKETING_PLAN_WORK_TYPE_ID, ctx),
    ).toBe(true);
  });
});
