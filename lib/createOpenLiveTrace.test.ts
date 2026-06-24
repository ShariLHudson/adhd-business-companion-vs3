import { describe, expect, it } from "vitest";
import {
  buildCreateOpenLiveSnapshot,
  nextCreateOpenTraceId,
} from "./createOpenLiveTrace";
import { CREATE_PANEL_SECTION } from "./openCreateWorkspace";

describe("createOpenLiveTrace", () => {
  it("builds snapshot with rightPanelVisible when create panel active", () => {
    const snap = buildCreateOpenLiveSnapshot({
      traceId: nextCreateOpenTraceId("open create"),
      stage: "after_patch_workspace_panel",
      command: "open create",
      workspacePanel: CREATE_PANEL_SECTION,
      chatLayoutMode: "split",
      workspaceActive: true,
      activeSection: "home",
      activeNav: "other",
    });
    expect(snap.rightPanelVisible).toBe(true);
    expect(snap.createPanelMounted).toBe(true);
    expect(snap.contentGeneratorMounted).toBe(true);
  });

  it("rightPanelVisible false when panel null", () => {
    const snap = buildCreateOpenLiveSnapshot({
      traceId: "co-test",
      stage: "after_react_settle_500ms",
      workspacePanel: null,
      chatLayoutMode: "workspace-focus",
      workspaceActive: false,
      activeSection: "home",
      activeNav: "chat",
    });
    expect(snap.rightPanelVisible).toBe(false);
    expect(snap.createPanelMounted).toBe(false);
  });
});
