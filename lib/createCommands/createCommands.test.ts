import { describe, expect, it, beforeEach } from "vitest";
import { EMPTY_CREATE_WORKFLOW } from "@/lib/createWorkflow";
import { clearActiveWorkspaceRegistryForTests } from "@/lib/activeWorkspaceRegistry";
import { clearRuntimeCreationRecordsForTests } from "@/lib/currentFocus/creationRecord";
import { duplicateCreationWorkspace } from "./duplicateCreationWorkspace";
import { resolveCreateWorkCommands } from "./resolveCreateWorkCommands";

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
});
