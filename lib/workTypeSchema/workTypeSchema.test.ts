/** @vitest-environment jsdom */
import { describe, expect, it, beforeEach } from "vitest";
import { EMPTY_CREATE_WORKFLOW } from "@/lib/createWorkflow";
import { resolveFocusForCreationDestination } from "@/lib/currentFocus/resolveCanonicalFocus";
import {
  applyWorkTypeMapToCreateWorkflow,
  clearWorkTypeSchemaRegistryForTests,
  ensureEventPlanSchemaRegistered,
  ensureWorkshopMapSectionsComplete,
  EVENT_PLAN_MAP_SECTIONS,
  EVENT_PLAN_SCHEMA,
  getWorkTypeSchema,
  openWorkshopMapSection,
  registerWorkTypeSchema,
  resolveWorkTypeIdFromLabel,
  workshopMapIds,
} from "@/lib/workTypeSchema";

describe("080 shared Work Type schema + Workshop Map", () => {
  beforeEach(() => {
    // Avoid clearing the shared in-memory registry — parallel vitest files share it.
    ensureEventPlanSchemaRegistered();
  });

  it("Event Plan is registered config — not a parallel framework", () => {
    expect(resolveWorkTypeIdFromLabel("Retreat")).toBe("event_plan");
    expect(getWorkTypeSchema("event_plan")?.displayName).toBe("Event Plan");
    expect(workshopMapIds(EVENT_PLAN_MAP_SECTIONS)).toContain("final_review");
    expect(workshopMapIds(EVENT_PLAN_MAP_SECTIONS)).toContain("revenue_pricing");
  });

  it("ensureWorkshopMapSectionsComplete is work-type agnostic", () => {
    const restored = ensureWorkshopMapSectionsComplete(
      EVENT_PLAN_MAP_SECTIONS,
      [{ id: "purpose", title: "Purpose", content: "Lead well", status: "drafting" }],
      "empty",
    );
    expect(restored.map((s) => s.id)).toEqual([
      ...workshopMapIds(EVENT_PLAN_MAP_SECTIONS),
    ]);
    expect(restored.find((s) => s.id === "purpose")?.content).toBe("Lead well");
  });

  it("applyWorkTypeMapToCreateWorkflow hydrates shared map fields", () => {
    const next = applyWorkTypeMapToCreateWorkflow(
      { ...EMPTY_CREATE_WORKFLOW, sessionId: "ws-1" },
      EVENT_PLAN_SCHEMA,
      { focusSectionIds: ["purpose", "audience"] },
    );
    expect(next.showAllWorkspaceSections).toBe(true);
    expect(next.workspaceFirst).toBe(true);
    expect(next.templateSections?.length).toBe(EVENT_PLAN_MAP_SECTIONS.length);
    expect(next.focusSectionIds).toEqual(["purpose", "audience"]);
  });

  it("openWorkshopMapSection sets Current Focus for any Work Type map", () => {
    let workflow = applyWorkTypeMapToCreateWorkflow(
      {
        ...EMPTY_CREATE_WORKFLOW,
        sessionId: "ws-open",
        selectedTypeLabel: "SOP",
      },
      {
        workTypeId: "sop",
        displayName: "SOP",
        sections: [
          { id: "purpose", title: "Purpose" },
          { id: "steps", title: "Steps" },
        ],
      },
    );
    registerWorkTypeSchema({
      workTypeId: "sop",
      displayName: "SOP",
      sections: [
        { id: "purpose", title: "Purpose" },
        { id: "steps", title: "Steps" },
      ],
    });
    workflow = openWorkshopMapSection(workflow, "steps");
    const focus = resolveFocusForCreationDestination(workflow);
    expect(focus.sectionId).toBe("steps");
    expect(focus.focusId).toBe("section:steps");
  });
});
