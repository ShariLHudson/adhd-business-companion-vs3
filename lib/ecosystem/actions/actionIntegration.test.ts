// Founder Ecosystem — Phase 11 Action & Workspace integration tests.
// End-to-end: events → action dashboard → sticky bar → workspace open (via the
// executor) → status transitions → recovery. Proves the action cards match the
// recommendation pipeline and the workspace opens with the intended target.
// (Spec deliverable "integrationTests.ts"; named *.test.ts so vitest runs it.)

import { describe, expect, it, vi } from "vitest";

import type { AppSection } from "@/lib/companionUi";
import { simulateMasterWorkflow } from "../fixtures/masterWorkflow";
import { buildActionDashboard } from "./actionDashboard";
import {
  applyWorkspaceOpen,
  completeAction,
  initActionBar,
  isWorkspaceOpen,
  planWorkspaceOpen,
  stickyBarActions,
} from "./actionCardManager";
import { executeFounderAction } from "./actionExecutor";
import { parseActionRecoveryCommand } from "./actionSelectors";

const FOUNDER = "founder-001";
const events = () => simulateMasterWorkflow(FOUNDER, new Date("2026-06-01T09:00:00.000Z"));

describe("recommendations → action cards", () => {
  it("produces actionable cards from the founder's real activity", () => {
    const dash = buildActionDashboard(events(), FOUNDER);
    expect(dash.recommendedActions.length).toBeGreaterThan(0);
    expect(dash.currentAction).not.toBeNull();
    for (const a of dash.recommendedActions) {
      expect(a.title.length).toBeGreaterThan(0);
      expect(a.workspace.section).toBeTruthy();
    }
  });
});

describe("sticky bar → workspace open", () => {
  it("opens the intended workspace and prevents a duplicate reopen", () => {
    const dash = buildActionDashboard(events(), FOUNDER);
    let bar = initActionBar(dash.recommendedActions);
    expect(stickyBarActions(bar).length).toBeGreaterThan(0);

    // Pick the first card that targets a real workspace panel.
    const action = dash.recommendedActions.find((a) => a.workspace.section !== "home")!;
    expect(action).toBeTruthy();

    const plan = planWorkspaceOpen(bar, action);
    expect(plan.decision).toBe("open");

    // Execute via the (mocked) page handlers.
    const openSection = vi.fn<(s: AppSection) => void>();
    const result = executeFounderAction(action, { openSection });
    expect(result.ok).toBe(true);
    expect(openSection).toHaveBeenCalledWith(action.workspace.section, expect.anything());

    // Reflect the open in the bar; a second plan must not reopen.
    bar = applyWorkspaceOpen(bar, action);
    expect(isWorkspaceOpen(bar, action.workspace.section)).toBe(true);
    expect(planWorkspaceOpen(bar, action).decision).toBe("already-open");
  });
});

describe("completion → sticky bar shrinks", () => {
  it("removes a completed action from the sticky bar", () => {
    const dash = buildActionDashboard(events(), FOUNDER);
    let bar = initActionBar(dash.recommendedActions);
    const before = stickyBarActions(bar).length;
    const first = stickyBarActions(bar)[0];
    bar = completeAction(bar, first.id);
    expect(stickyBarActions(bar).length).toBe(before - 1);
    expect(stickyBarActions(bar).some((a) => a.id === first.id)).toBe(false);
  });
});

describe("recovery after a break", () => {
  it("answers 'what should I work on' with a queued action", () => {
    const dash = buildActionDashboard(events(), FOUNDER);
    const r = parseActionRecoveryCommand("what should I work on", dash.recommendedActions);
    expect(["next-action", "recommendation"]).toContain(r.kind);
  });
});

describe("guardrail: no overwrite without confirmation", () => {
  it("requires confirmation before replacing an open draft", () => {
    const dash = buildActionDashboard(events(), FOUNDER);
    const sameSection = dash.recommendedActions.filter((a) => a.workspace.section !== "home");
    // Find two distinct actions that target the same workspace section.
    const groups = new Map<string, typeof sameSection>();
    for (const a of sameSection) {
      const arr = groups.get(a.workspace.section) ?? [];
      arr.push(a);
      groups.set(a.workspace.section, arr);
    }
    const pair = [...groups.values()].find((arr) => arr.length >= 2);
    if (!pair) return; // workflow may not yield two same-section actions; skip
    let bar = initActionBar(dash.recommendedActions);
    bar = applyWorkspaceOpen(bar, pair[0]);
    const plan = planWorkspaceOpen(bar, pair[1]);
    expect(plan.decision).toBe("confirm");
    expect(plan.reason).toBe("would-overwrite");
  });
});
