import { describe, expect, it } from "vitest";
import { resolveHardNavigationCommand } from "./hardNavigationCommands";
import {
  applyOpenCreateWorkspaceState,
  CREATE_PANEL_SECTION,
  isChatOnlyLayout,
  isCreatePanelOpen,
  isRightPanelVisible,
} from "./openCreateWorkspace";

describe("openCreateWorkspace integration", () => {
  const chatOnly = {
    workspacePanel: null as const,
    activeSection: "home" as const,
    chatLayoutMode: "workspace-focus" as const,
  };

  it("resolveHardNavigationCommand(open create) targets estate Create (066)", () => {
    const cmd = resolveHardNavigationCommand("open create");
    expect(cmd?.target).toEqual({
      kind: "workspace",
      section: "create",
      nav: "create",
    });
  });

  it("user-initiated open create sets workspacePanel and workspace-focus (066)", () => {
    const next = applyOpenCreateWorkspaceState(chatOnly, { userInitiated: true });
    expect(next.workspacePanel).toBe("content-generator");
    expect(next.activeSection).toBe("home");
    expect(next.chatLayoutMode).toBe("workspace-focus");
    expect(isCreatePanelOpen(next)).toBe(true);
    expect(isRightPanelVisible(next)).toBe(true);
    expect(isChatOnlyLayout(next)).toBe(false);
  });

  it("auto open during Phase 1 stays chat-only without userInitiated", () => {
    const next = applyOpenCreateWorkspaceState(chatOnly, { userInitiated: false });
    expect(next).toEqual(chatOnly);
    expect(isChatOnlyLayout(next)).toBe(true);
    expect(isRightPanelVisible(next)).toBe(false);
  });

  it("legacy Create panel state model still opens content-generator workspace-focus", () => {
    const after = applyOpenCreateWorkspaceState(chatOnly, { userInitiated: true });
    expect(after.workspacePanel).toBe(CREATE_PANEL_SECTION);
    expect(after.chatLayoutMode).toBe("workspace-focus");
    expect(isChatOnlyLayout(after)).toBe(false);
    expect(isRightPanelVisible(after)).toBe(true);
  });
});
