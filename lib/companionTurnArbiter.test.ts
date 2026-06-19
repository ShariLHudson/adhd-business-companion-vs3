import { describe, expect, it } from "vitest";

import {
  arbitrateCompanionTurn,
  isExplicitCreateRequest,
  needsDiscoveryBeforeCreate,
} from "./companionTurnArbiter";
import { resolveIntent } from "./intentStabilizer";
import type { WorkspaceOpenSnapshot } from "./workspaceExecution";

function snap(panel: WorkspaceOpenSnapshot["panel"]): WorkspaceOpenSnapshot {
  return { panel, activeSection: "home", revealSeq: 1 };
}

function arbitrate(
  userText: string,
  opts: Partial<Parameters<typeof arbitrateCompanionTurn>[0]> = {},
) {
  const overwhelmed = /\boverwhelm/i.test(userText);
  const askingHow = /^\s*(how|what|why)\b/i.test(userText);
  const resolved = resolveIntent(userText, { overwhelmed, askingHow });
  return arbitrateCompanionTurn({
    userText,
    workspacePanel: opts.workspacePanel ?? null,
    workspaceSnap: opts.workspaceSnap ?? snap(opts.workspacePanel ?? null),
    resolvedIntent: resolved,
    overwhelmed,
    askingHow,
    ...opts,
  });
}

describe("companionTurnArbiter", () => {
  // Test 1 — Overwhelm / Clear My Mind
  it("triage on overwhelm without auto-open", () => {
    const r = arbitrate("I'm overwhelmed.");
    expect(r.decision).toBe("triage");
    expect(r.blockAutoRouteAsset).toBe(true);
    expect(r.blockIntentMake).toBe(true);
  });

  // Test 2 — LinkedIn profile conversation first
  it("discovery before create for LinkedIn profile redo", () => {
    const r = arbitrate("I need to redo my LinkedIn profile.");
    expect(r.decision).toBe("discovery");
    expect(r.blockIntentMake).toBe(true);
    expect(r.blockAutoRouteAsset).toBe(true);
    expect(isExplicitCreateRequest("I need to redo my LinkedIn profile.")).toBe(
      false,
    );
    expect(needsDiscoveryBeforeCreate("I need to redo my LinkedIn profile.")).toBe(
      true,
    );
  });

  it("explicit create allows make path", () => {
    const r = arbitrate("Open Create and draft my LinkedIn post now.");
    expect(r.decision).toBe("explicit_create");
    expect(r.blockIntentMake).toBe(false);
  });

  // Test 3 — Strategies open + procrastination
  it("workspace_first when Strategies open and user asks about procrastination", () => {
    const r = arbitrate("What strategy would help procrastination?", {
      workspacePanel: "playbook",
      workspaceSnap: snap("playbook"),
    });
    expect(r.decision).toBe("workspace_first");
    expect(r.workspaceLocked).toBe(true);
    expect(r.blockIntentMake).toBe(true);
    expect(r.blockAutoRouteAsset).toBe(true);
    expect(r.hintForChat).toMatch(/STRATEGIES LOCK/i);
  });

  // Test 4 — Projects open
  it("workspace_first when Projects open", () => {
    const r = arbitrate("What should I focus on for this project?", {
      workspacePanel: "projects",
      workspaceSnap: snap("projects"),
    });
    expect(r.decision).toBe("workspace_first");
    expect(r.workspaceLocked).toBe(true);
    expect(r.hintForChat).toMatch(/PROJECTS LOCK/i);
  });

  // Test 5 — Create workflow active
  it("active_workflow when create builder is active", () => {
    const r = arbitrate("My audience is coaches", {
      workspacePanel: "content-generator",
      workspaceSnap: snap("content-generator"),
      createBuilderActive: true,
    });
    expect(r.decision).toBe("active_workflow");
    expect(r.activeWorkflow).toBe("create_builder");
  });

  // Test 6 — Adaptive (not worksheet) — discovery/conversation not forced make
  it("discovery when user explains procrastination fear without explicit create", () => {
    const r = arbitrate(
      "Procrastinating on the proposal because I'm afraid it'll sound too salesy.",
    );
    expect(["discovery", "conversation", "triage"]).toContain(r.decision);
    expect(r.blockIntentMake).toBe(true);
  });

  it("Clear My Mind panel adds capture hint", () => {
    const r = arbitrate("call accountant and fix website", {
      workspacePanel: "brain-dump",
      workspaceSnap: snap("brain-dump"),
    });
    expect(r.decision).toBe("workspace_first");
    expect(r.hintForChat).toMatch(/Clear My Mind panel/i);
  });

  it("workspaceBesideChat follows snapshot when workspacePanel state lags", () => {
    const r = arbitrate("What should I focus on?", {
      workspacePanel: null,
      workspaceSnap: snap("projects"),
    });
    expect(r.workspaceBesideChat).toBe(true);
  });
});
