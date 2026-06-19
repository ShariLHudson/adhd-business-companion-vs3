import { describe, expect, it } from "vitest";

import { coGuideActiveFromArbitration } from "./companionTurnArbiter";
import {
  buildWorkspaceChatHints,
  buildWorkspaceContext,
  workspaceContextForSnapshot,
} from "./workspaceAwareness";
import {
  coGuideActiveFromSnapshot,
  workspaceVerificationHint,
  type WorkspaceOpenSnapshot,
} from "./workspaceExecution";

const projectsOpen: WorkspaceOpenSnapshot = {
  panel: "projects",
  activeSection: "home",
  revealSeq: 2,
};

const projectsCtx = buildWorkspaceContext("projects", {
  selectedItemName: "Workshop launch",
});

describe("workspace visibility alignment", () => {
  it("coGuideActiveFromSnapshot matches workspaceVerificationHint when panel is open", () => {
    expect(coGuideActiveFromSnapshot(projectsOpen)).toBe(true);
    expect(workspaceVerificationHint(projectsOpen)).toMatch(/verified open/i);
  });

  it("arbitration co-guide prefers live snapshot over stale panel state", () => {
    const stale = coGuideActiveFromArbitration(
      {
        decision: "conversation",
        activeWorkflow: null,
        workspacePanel: null,
        workspaceLocked: false,
        workspaceBesideChat: false,
        blockAutoOpenDocument: true,
        blockAutoRouteAsset: true,
        blockIntentMake: true,
        blockIntentStabilize: true,
        blockIntentEditDraft: true,
      },
      projectsOpen,
    );
    expect(stale).toBe(true);
  });

  it("buildWorkspaceChatHints uses openSnapshot over stale coGuideActive false", () => {
    const hints = buildWorkspaceChatHints(projectsCtx, {
      coGuideActive: false,
      energy: "medium",
      openSnapshot: projectsOpen,
    });
    expect(hints).toBeDefined();
    expect(hints).toMatch(/CURRENT WORKSPACE/i);
    expect(hints).not.toMatch(/WORKSPACE NOT VISIBLE/i);
  });

  it("workspaceContextForSnapshot rebuilds context when React state lags refs", () => {
    const ctx = workspaceContextForSnapshot(
      projectsOpen,
      null,
      () => ({ selectedItemName: "Lag project" }),
    );
    expect(ctx?.section).toBe("projects");
    expect(ctx?.selectedItemName).toBe("Lag project");
  });

  it("does not claim visible when revealSeq is zero", () => {
    const loading: WorkspaceOpenSnapshot = {
      panel: "projects",
      activeSection: "home",
      revealSeq: 0,
    };
    expect(coGuideActiveFromSnapshot(loading)).toBe(false);
    const hints = buildWorkspaceChatHints(projectsCtx, {
      coGuideActive: true,
      energy: "medium",
      openSnapshot: loading,
    });
    expect(hints).toMatch(/WORKSPACE NOT VISIBLE/i);
  });
});
