/**
 * @vitest-environment jsdom
 * 074 — Hard refresh must restore the same Workspace ID via Event → runtime → registry.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { initializeWorkspaceV2Workflow } from "@/lib/createWorkspaceV2";
import {
  clearAuthoritativeDurableMarksForTests,
  createMemoryCreationDurableBackend,
  hydrateCreationWorkspacesFromDurable,
  persistCreationBegin,
  persistCreationDraft,
  setCreationDurableBackendForTests,
} from "@/lib/creationDurable";
import {
  clearRuntimeCreationRecordsForTests,
  getRuntimeCreationRecord,
} from "@/lib/currentFocus/creationRecord";
import { hydrateExactBuilderSession } from "@/lib/currentFocus/exactWorkspacePersist";
import {
  clearActiveEventRecord,
  upsertEventRecord,
} from "@/lib/eventsIntelligence";
import { createEmptyEventSections } from "@/lib/eventsIntelligence/eventSections";
import type { EventRecord } from "@/lib/eventsIntelligence/types";
import {
  clearActiveWorkspaceRegistryForTests,
  getActiveWorkspace,
  hydrateActiveWorkspaceRegistryFromRuntimeRecords,
  listActiveWorkspaces,
  registerCreationDestinationWorkspace,
  verifyCreationWorkspaceDurable,
} from "./index";
import {
  clearWorkspacePersistTracesForTests,
  dumpWorkspacePersistence,
} from "./workspacePersistenceDiagnostics";

function sampleEvent(id: string): EventRecord {
  const now = new Date().toISOString();
  return {
    id,
    title: "Simple Productivity System Workshop",
    eventType: "workshop",
    eventTypeLabel: "Workshop",
    purpose: "Help founders build a weekly plan they keep",
    audience: "ADHD founders",
    outcomes: "Leave with a written weekly plan",
    format: "in_person",
    dates: "Next Thursday",
    venue: "",
    budget: "",
    lifecyclePhase: "foundation",
    runtimeState: "IN_PROGRESS",
    sections: createEmptyEventSections().map((s) =>
      s.id === "outcomes"
        ? { ...s, content: "Leave with a written weekly plan" }
        : s.id === "format"
          ? { ...s, content: "Half-day, in-person, about 12 people" }
          : s,
    ),
    tasks: [],
    milestones: [],
    decisions: [],
    dependencies: [],
    owners: [],
    nextAction: "Agenda",
    activeQuestionId: null,
    conversationContext: "",
    projectHomeId: null,
    companionProjectId: null,
    canonicalWorkId: id,
    createdAt: now,
    updatedAt: now,
  };
}

describe("074 — hard refresh persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    clearActiveWorkspaceRegistryForTests();
    clearRuntimeCreationRecordsForTests();
    clearActiveEventRecord();
    clearWorkspacePersistTracesForTests();
    clearAuthoritativeDurableMarksForTests();
    setCreationDurableBackendForTests(createMemoryCreationDurableBackend());
  });

  it("survives wipe when authoritative durable row exists", async () => {
    const workflow = initializeWorkspaceV2Workflow("Workshop");
    const withId = {
      ...workflow,
      sessionId: "ws-refresh-1",
      eventRecordId: "ws-refresh-1",
      selectedTemplateName: "Simple Productivity System Workshop",
      sectionContent: {
        outcomes: "Leave with a written weekly plan",
        format: "Half-day, in-person, about 12 people",
      },
      draftContent: "# Workshop: Building Your Simple Productivity System\n\nBody",
    };
    upsertEventRecord(sampleEvent("ws-refresh-1"));
    const entry = registerCreationDestinationWorkspace(withId);
    expect(entry.workspaceId).toBe("ws-refresh-1");
    await persistCreationBegin({ workflow: withId });
    await persistCreationDraft({
      workflow: withId,
      draftContent: withId.draftContent!,
    });
    expect(verifyCreationWorkspaceDurable("ws-refresh-1")).toBe(true);

    const dump = dumpWorkspacePersistence("ws-refresh-1");
    expect(dump.creationDurable).toBe(true);

    // Simulate hard refresh: wipe LS + memory caches; keep durable backend
    localStorage.clear();
    clearActiveWorkspaceRegistryForTests();
    clearRuntimeCreationRecordsForTests();
    clearAuthoritativeDurableMarksForTests();

    const hyd = await hydrateCreationWorkspacesFromDurable();
    expect(hyd.workspaceIds).toContain("ws-refresh-1");
    expect(listActiveWorkspaces().some((w) => w.workspaceId === "ws-refresh-1")).toBe(
      true,
    );
    expect(getActiveWorkspace("ws-refresh-1")?.title).toMatch(/Productivity/i);

    const exact = hydrateExactBuilderSession("ws-refresh-1");
    expect(exact).not.toBeNull();
    expect(exact!.workflow.sessionId).toBe("ws-refresh-1");
    expect(exact!.workflow.sectionContent.outcomes).toMatch(/weekly plan/i);
    expect(exact!.workflow.draftContent).toMatch(/Productivity/i);
  });

  it("rebuilds runtime from Event alone after total runtime wipe", () => {
    upsertEventRecord(sampleEvent("ws-event-only"));
    clearRuntimeCreationRecordsForTests();
    clearActiveWorkspaceRegistryForTests();
    expect(getRuntimeCreationRecord("ws-event-only")).toBeNull();

    hydrateActiveWorkspaceRegistryFromRuntimeRecords();
    expect(getActiveWorkspace("ws-event-only")).toBeTruthy();

    const exact = hydrateExactBuilderSession("ws-event-only");
    expect(exact).not.toBeNull();
    expect(exact!.workflow.sessionId).toBe("ws-event-only");
    expect(exact!.workflow.templateSections?.length).toBeGreaterThan(0);
    expect(getRuntimeCreationRecord("ws-event-only")).toBeTruthy();
  });
});
