/** @vitest-environment jsdom */
import { describe, expect, it, beforeEach } from "vitest";
import { EMPTY_CREATE_WORKFLOW } from "@/lib/createWorkflow";
import { clearActiveWorkspaceRegistryForTests } from "@/lib/activeWorkspaceRegistry";
import { clearRuntimeCreationRecordsForTests } from "@/lib/currentFocus/creationRecord";
import { duplicateCreationWorkspace } from "./duplicateCreationWorkspace";
import { dispatchCreateWorkCommand } from "./dispatchCreateWorkCommand";
import { resolveCreateWorkCommands } from "./resolveCreateWorkCommands";
import {
  listActiveContinueProjection,
  upsertActiveWorkspace,
} from "@/lib/activeWorkspaceRegistry";

describe("084 Create work commands", () => {
  beforeEach(() => {
    clearActiveWorkspaceRegistryForTests();
    clearRuntimeCreationRecordsForTests();
  });

  it("resolves toolbar commands with draft gates for print/export/share", () => {
    const cmds = resolveCreateWorkCommands({
      workflow: {
        ...EMPTY_CREATE_WORKFLOW,
        sessionId: "ws-1",
        selectedTemplateName: "Retreat Plan",
      },
      hasDraftText: false,
    });
    expect(cmds.find((c) => c.id === "save")?.enabled).toBe(true);
    expect(cmds.find((c) => c.id === "print")?.enabled).toBe(false);
    expect(
      resolveCreateWorkCommands({
        workflow: { ...EMPTY_CREATE_WORKFLOW, sessionId: "ws-1" },
        hasDraftText: true,
      }).find((c) => c.id === "export")?.enabled,
    ).toBe(true);
  });

  it("duplicate creates a new Work ID and keeps content", () => {
    const original = {
      ...EMPTY_CREATE_WORKFLOW,
      sessionId: "ws-original",
      selectedTemplateName: "Fall Retreat",
      selectedTypeLabel: "Retreat",
      sectionContent: { purpose: "Rest and clarity" },
      workspaceFirst: true,
    };
    const copy = duplicateCreationWorkspace(original);
    expect(copy.sessionId).not.toBe("ws-original");
    expect(copy.sessionId).toMatch(/^ws-/);
    expect(copy.sectionContent?.purpose).toBe("Rest and clarity");
    expect(copy.selectedTemplateName).toMatch(/copy/i);
  });

  it("dispatcher archives through registry and completes section via lifecycle", () => {
    upsertActiveWorkspace({
      workspaceId: "ws-cmd",
      creationType: "Event Plan",
      title: "Command test",
      currentFocusTitle: null,
      currentFocusId: null,
      progressLabel: "",
      lastActivityAt: new Date().toISOString(),
      draftState: "none",
      hasDraft: false,
      resumeTarget: "estate-create",
      runtimeCreationRecordId: "ws-cmd",
      eventRecordId: null,
      projectHomeId: null,
      sessionId: "ws-cmd",
      status: "active",
      createdAt: new Date().toISOString(),
    });
    const archived = dispatchCreateWorkCommand({
      commandId: "archive",
      workflow: { ...EMPTY_CREATE_WORKFLOW, sessionId: "ws-cmd" },
      workId: "ws-cmd",
    });
    expect(archived.ok).toBe(true);
    expect(listActiveContinueProjection().map((e) => e.workspaceId)).not.toContain(
      "ws-cmd",
    );

    const completed = dispatchCreateWorkCommand({
      commandId: "complete_for_now",
      workflow: {
        ...EMPTY_CREATE_WORKFLOW,
        sessionId: "ws-cmd",
        sectionContent: { purpose: "Lead with calm" },
      },
      sectionId: "purpose",
    });
    expect(completed.ok).toBe(true);
    expect(completed.workflow.completedSectionIds).toContain("purpose");
  });
});
