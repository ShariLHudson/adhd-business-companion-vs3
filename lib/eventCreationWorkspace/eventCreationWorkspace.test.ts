/**
 * @vitest-environment jsdom
 * Event Creation Workspace — purpose-built event surface (not generic pieces).
 */

import { beforeEach, describe, expect, it } from "vitest";
import { initializeWorkspaceV2Workflow } from "@/lib/createWorkspaceV2";
import {
  processEventsIntelligenceTurn,
  getActiveEventRecord,
} from "@/lib/eventsIntelligence";
import {
  applyEventWorkspaceToCreateWorkflow,
  buildEventCreationWorkspace,
  focusSectionIdsForEventType,
} from "./index";
import { shouldDivertEventCreateToWorkspace } from "@/lib/projects/projectPieces190";

describe("Event Creation Workspace", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("auto-builds the complete section map for a retreat", () => {
    const start = processEventsIntelligenceTurn({
      userText: "I need help creating a retreat weekend event.",
    });
    expect(start.record).toBeTruthy();
    const snap = buildEventCreationWorkspace(start.record!);
    expect(snap.workspaceLabel).toMatch(/Retreat Creation Workspace/i);
    expect(snap.sections.length).toBeGreaterThanOrEqual(25);
    expect(snap.focusSectionIds).toContain("outcomes");
    expect(snap.focusSectionIds).toContain("venue");
    expect(snap.focusSectionIds).toContain("registration");
    expect(snap.sections.some((s) => s.visibility === "later")).toBe(true);
    // 052A — dynamic registry panels, not hardcoded asset dumps
    expect(snap.sectionAssetPanels.length).toBe(snap.focusSectionIds.length);
    expect(snap.sectionRuntimePanels.length).toBe(snap.focusSectionIds.length);
    expect(snap.sectionRuntimePanels.every((p) => p.supportsAddAsset)).toBe(true);
    expect(snap.focusedAssetRecommendations.length).toBeGreaterThan(0);
    expect(snap.focusedAssetRecommendations.length).toBeLessThanOrEqual(12);
    const reg = snap.sections.find((s) => s.id === "registration");
    expect(reg?.registryAssetTypeIds?.length).toBeGreaterThan(0);
  });

  it("conversation opens human work language — not pieces interview or technical workspace labels", () => {
    const start = processEventsIntelligenceTurn({
      userText: "I need help creating a retreat weekend event.",
    });
    const reply = start.reply.toLowerCase();
    // 073 — never lead with "Creation Workspace" as the identity
    expect(reply).not.toMatch(/creation workspace|event creation workspace/);
    expect(reply).not.toMatch(/pieces you can already see/);
    expect(reply).not.toMatch(/what's actually on your mind/);
    expect(reply).toMatch(/retreat|outcome|leave this retreat/);
  });

  it("acknowledges established facts before the next decision", () => {
    processEventsIntelligenceTurn({
      userText: "I need help creating a retreat weekend event.",
    });
    const next = processEventsIntelligenceTurn({
      userText: "People leave rested and clear on their next season.",
    });
    expect(next.reply.toLowerCase()).toMatch(/outcome|rested|so far|noted/);
    expect(next.reply).not.toMatch(/pieces you can already see/i);
    expect(next.record?.outcomes).toMatch(/rested/i);
  });

  it("applies workspace onto Create workflow with focus ids", () => {
    processEventsIntelligenceTurn({
      userText: "Help me plan a workshop event.",
    });
    const record = getActiveEventRecord();
    expect(record).toBeTruthy();
    const wf = applyEventWorkspaceToCreateWorkflow(
      initializeWorkspaceV2Workflow("Event Plan"),
      record!,
    );
    expect(wf.creationWorkspaceKind).toBe("event");
    expect(wf.eventRecordId).toBe(record!.id);
    expect(wf.templateSections?.length).toBeGreaterThanOrEqual(25);
    expect(wf.focusSectionIds?.length).toBeGreaterThan(5);
    expect(wf.showAllWorkspaceSections).toBe(true);
  });

  it("Event classification chain — Retreat survives Event bind with Retreat title", () => {
    processEventsIntelligenceTurn({
      userText: "I need help creating a leadership retreat weekend.",
    });
    const record = getActiveEventRecord();
    expect(record).toBeTruthy();
    expect(record!.eventTypeLabel).toMatch(/retreat/i);

    const retreatShell = {
      ...initializeWorkspaceV2Workflow("Event Plan"),
      workingIntent: "Create Retreat",
      selectedTypeLabel: "Retreat",
      selectedTemplateName: "Leadership Retreat",
      originalRequest: "I need help creating a leadership retreat weekend.",
      creationWorkspaceKind: null as const,
    };
    const after = applyEventWorkspaceToCreateWorkflow(retreatShell, record!);
    expect(after.selectedTypeLabel).toBe("Retreat");
    expect(after.workingIntent).toBe("Create Retreat");
    expect(after.creationWorkspaceKind).toBe("event");
    expect(after.selectedTemplateId).toBe("event-creation-workspace");
    expect(after.templateSections?.length).toBeGreaterThanOrEqual(25);
    expect(after.sectionContent?.event_type).toBe("Retreat");
    expect(after.selectedTemplateName.toLowerCase()).toMatch(/retreat|leadership/);
    expect(after.selectedTemplateName).not.toMatch(/workshop/i);
    expect(after.selectedTemplateName).not.toMatch(/creation workspace/i);
  });

  it("Document Classification sole authority — never replaces Checklist with Event/Workshop", () => {
    processEventsIntelligenceTurn({
      userText: "Help me plan a workshop event.",
    });
    const record = getActiveEventRecord();
    expect(record).toBeTruthy();
    const checklist = {
      // Freeform document type (no registered Work Type package yet).
      ...initializeWorkspaceV2Workflow("Email"),
      workingIntent: "Create Checklist",
      selectedTypeLabel: "Checklist",
      selectedTemplateName: "Client Onboarding Checklist",
      creationWorkspaceKind: null as const,
    };
    const after = applyEventWorkspaceToCreateWorkflow(checklist, record!);
    expect(after).toBe(checklist);
    expect(after.selectedTypeLabel).toBe("Checklist");
    expect(after.selectedTemplateId).not.toBe("event-creation-workspace");
    expect(after.selectedTemplateName).toBe("Client Onboarding Checklist");
    expect(after.creationWorkspaceKind).toBeNull();
    expect(after.selectedTemplateName).not.toMatch(/workshop/i);
  });

  it("retreat focus includes hospitality and volunteers; webinar includes technology", () => {
    expect(focusSectionIdsForEventType("retreat")).toContain("hospitality");
    expect(focusSectionIdsForEventType("webinar")).toContain("technology");
    expect(focusSectionIdsForEventType("webinar")).not.toContain("volunteers");
  });

  it("Project Homes event flavor diverts away from pieces wizard", () => {
    expect(shouldDivertEventCreateToWorkspace("event")).toBe(true);
    expect(shouldDivertEventCreateToWorkspace("general")).toBe(false);
  });
});
