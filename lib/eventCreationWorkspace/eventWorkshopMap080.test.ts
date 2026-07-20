/** @vitest-environment jsdom */
/**
 * Event configures the shared Event Plan schema; behavior is shared Create infra.
 */
import { describe, expect, it, beforeEach } from "vitest";
import { processEventsIntelligenceTurn } from "@/lib/eventsIntelligence";
import {
  EVENT_080_WORKSHOP_MAP_IDS,
  createEmptyEventSections,
  ensureEventSectionsComplete,
} from "@/lib/eventsIntelligence/eventSections";
import { applyEventWorkspaceToCreateWorkflow } from "./applyWorkspaceToCreateWorkflow";
import { EMPTY_CREATE_WORKFLOW } from "@/lib/createWorkflow";
import { resolveFocusForCreationDestination } from "@/lib/currentFocus/resolveCanonicalFocus";
import {
  EVENT_PLAN_MAP_SECTIONS,
  openWorkshopMapSection,
  workshopMapIds,
} from "@/lib/workTypeSchema";
import { upsertEventRecord, getEventRecord } from "@/lib/eventsIntelligence/eventRecordStore";

describe("Event Plan configures shared Workshop Map", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("Event section list is the shared Event Plan schema", () => {
    expect(EVENT_080_WORKSHOP_MAP_IDS).toEqual([
      ...workshopMapIds(EVENT_PLAN_MAP_SECTIONS),
    ]);
  });

  it("empty Event Record uses shared ensure on Event Plan map", () => {
    const sections = createEmptyEventSections();
    expect(sections.map((s) => s.id)).toEqual([...EVENT_080_WORKSHOP_MAP_IDS]);
  });

  it("opening a map row uses shared openWorkshopMapSection → Current Focus", () => {
    const start = processEventsIntelligenceTurn({
      userText: "Create a Fall Leadership Retreat",
    });
    const record = start.record!;
    let workflow = applyEventWorkspaceToCreateWorkflow(
      {
        ...EMPTY_CREATE_WORKFLOW,
        sessionId: record.id,
        originalRequest: "Create a Fall Leadership Retreat",
        workingIntent: "Create Retreat",
        selectedTypeLabel: "Retreat",
      },
      record,
    );
    expect(workflow.showAllWorkspaceSections).toBe(true);

    workflow = openWorkshopMapSection(workflow, "audience");
    const focus = resolveFocusForCreationDestination(workflow);
    expect(focus.sectionId).toBe("audience");
    expect(focus.title).toMatch(/Audience/i);
  });

  it("later sections open without Event-specific locks", () => {
    const start = processEventsIntelligenceTurn({
      userText: "Help me plan a workshop event",
    });
    const record = start.record!;
    let workflow = applyEventWorkspaceToCreateWorkflow(
      {
        ...EMPTY_CREATE_WORKFLOW,
        sessionId: record.id,
        selectedTypeLabel: "Workshop",
      },
      record,
    );
    workflow = openWorkshopMapSection(workflow, "run_of_show");
    const focus = resolveFocusForCreationDestination(workflow);
    expect(focus.sectionId).toBe("run_of_show");
  });

  it("ensureEventSectionsComplete delegates to shared map merge", () => {
    const partial = createEmptyEventSections({ purpose: "Lead well" }).filter(
      (s) => s.id !== "final_review",
    );
    const restored = ensureEventSectionsComplete(partial);
    expect(restored.find((s) => s.id === "purpose")?.content).toBe("Lead well");
    expect(restored.find((s) => s.id === "final_review")).toBeTruthy();
  });

  it("getEventRecord hydrates via shared ensure", () => {
    const start = processEventsIntelligenceTurn({
      userText: "Create a community meetup event",
    });
    const record = start.record!;
    upsertEventRecord({
      ...record,
      sections: record.sections.filter((s) => s.id !== "day_of_operations"),
    });
    const loaded = getEventRecord(record.id);
    expect(loaded?.sections.some((s) => s.id === "day_of_operations")).toBe(
      true,
    );
  });
});
