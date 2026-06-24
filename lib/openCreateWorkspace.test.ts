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

  it("resolveHardNavigationCommand(open create) targets content-generator", () => {
    const cmd = resolveHardNavigationCommand("open create");
    expect(cmd?.target).toEqual({
      kind: "workspace",
      section: CREATE_PANEL_SECTION,
      nav: "other",
    });
  });

  it("user-initiated open create sets workspacePanel and split layout", () => {
    const next = applyOpenCreateWorkspaceState(chatOnly, { userInitiated: true });
    expect(next.workspacePanel).toBe("content-generator");
    expect(next.activeSection).toBe("home");
    expect(next.chatLayoutMode).toBe("split");
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

  it("hard nav open create expects visible create panel state", () => {
    const cmd = resolveHardNavigationCommand("open create");
    expect(cmd).not.toBeNull();
    const after = applyOpenCreateWorkspaceState(chatOnly, { userInitiated: true });
    expect(after.workspacePanel).toBe(CREATE_PANEL_SECTION);
    expect(isChatOnlyLayout(after)).toBe(false);
    expect(isRightPanelVisible(after)).toBe(true);
  });
});
