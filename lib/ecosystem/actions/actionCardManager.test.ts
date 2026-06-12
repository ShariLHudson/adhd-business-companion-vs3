// Founder Ecosystem — Phase 11 Action Card Manager unit tests.
// Covers: workspace offer (open / already-open / confirm), persistent actions
// (sticky bar persists until completed/dismissed, dedup), and recovery phrases.

import { describe, expect, it } from "vitest";

import type { AppSection } from "@/lib/companionUi";
import type { WorkspaceKind } from "../events";
import type { FounderAction } from "./actionTypes";
import {
  applyWorkspaceOpen,
  completeAction,
  dismissAction,
  enqueueAction,
  enqueueActions,
  initActionBar,
  isWorkspaceOpen,
  planWorkspaceOpen,
  postponeAction,
  setTaskDumpActive,
  stickyBarActions,
  stickyBarCount,
} from "./actionCardManager";
import {
  isActionAcceptance,
  isActionRecoveryCommand,
  parseActionRecoveryCommand,
} from "./actionSelectors";

let n = 0;
function makeAction(
  title: string,
  section: AppSection,
  ecosystemKind: WorkspaceKind,
  extra: Partial<FounderAction> = {},
): FounderAction {
  return {
    id: `a${++n}`,
    title,
    description: `${title} — do the thing`,
    actionType: "open-create",
    priority: "high",
    workspace: { section, ecosystemKind, title },
    prefill: {},
    status: "offered",
    sourceEventIds: [],
    createdAt: new Date().toISOString(),
    ...extra,
  };
}

describe("workspace offer", () => {
  it("opens a fresh workspace", () => {
    const a = makeAction("Draft a post", "content-generator", "create");
    const bar = initActionBar([a]);
    const plan = planWorkspaceOpen(bar, a);
    expect(plan.decision).toBe("open");
    expect(plan.message).toMatch(/Opening/);
  });

  it("does not reopen the same draft (no duplicate opens)", () => {
    const a = makeAction("Draft a post", "content-generator", "create");
    let bar = initActionBar([a]);
    bar = applyWorkspaceOpen(bar, a);
    expect(isWorkspaceOpen(bar, "content-generator")).toBe(true);
    expect(planWorkspaceOpen(bar, a).decision).toBe("already-open");
  });

  it("asks before overwriting a different open draft", () => {
    const a = makeAction("Draft a post", "content-generator", "create");
    const b = makeAction("Draft an email", "content-generator", "create");
    let bar = initActionBar([a, b]);
    bar = applyWorkspaceOpen(bar, a);
    const plan = planWorkspaceOpen(bar, b);
    expect(plan.decision).toBe("confirm");
    expect(plan.reason).toBe("would-overwrite");
    expect(plan.confirmPrompt).toMatch(/Replace/);
  });

  it("blocks auto-open during a task dump and asks to confirm", () => {
    const a = makeAction("Open Projects", "projects", "projects");
    const bar = setTaskDumpActive(initActionBar([a]), true);
    const plan = planWorkspaceOpen(bar, a);
    expect(plan.decision).toBe("confirm");
    expect(plan.reason).toBe("task-dump");
  });

  it("keeps home-section actions in chat", () => {
    const a = makeAction("Talk it through", "home", "create");
    expect(planWorkspaceOpen(initActionBar([a]), a).decision).toBe("chat-only");
  });
});

describe("persistent actions (sticky bar)", () => {
  it("persists actions until completed or dismissed", () => {
    const a = makeAction("Draft a post", "content-generator", "create");
    const b = makeAction("Open Projects", "projects", "projects");
    let bar = initActionBar([a, b]);
    expect(stickyBarCount(bar)).toBe(2);

    bar = completeAction(bar, a.id);
    expect(stickyBarActions(bar).map((x) => x.id)).toEqual([b.id]);

    bar = dismissAction(bar, b.id);
    expect(stickyBarCount(bar)).toBe(0);
  });

  it("keeps postponed actions visible", () => {
    const a = makeAction("Draft a post", "content-generator", "create");
    let bar = initActionBar([a]);
    bar = postponeAction(bar, a.id);
    expect(stickyBarCount(bar)).toBe(1);
  });

  it("dedupes by id and by title", () => {
    const a = makeAction("Draft a post", "content-generator", "create");
    const dupTitle = makeAction("Draft a post", "projects", "projects");
    let bar = initActionBar();
    bar = enqueueAction(bar, a);
    bar = enqueueAction(bar, a); // same id
    bar = enqueueAction(bar, dupTitle); // same title
    expect(bar.actions.length).toBe(1);
  });

  it("enqueues many while preserving dedupe", () => {
    const bar = enqueueActions(initActionBar(), [
      makeAction("One", "projects", "projects"),
      makeAction("Two", "content-generator", "create"),
      makeAction("Two", "time-block", "time-block"),
    ]);
    expect(bar.actions.length).toBe(2);
  });
});

describe("recovery phrases", () => {
  const draft = makeAction("Draft the launch email", "content-generator", "create");
  const project = makeAction("Work on Funnel", "projects", "projects", {
    relatedProject: { id: "proj-funnel", title: "Sales Funnel" },
  });

  it("recognizes recovery + acceptance phrases", () => {
    expect(isActionRecoveryCommand("where is my draft")).toBe(true);
    expect(isActionRecoveryCommand("what should I work on")).toBe(true);
    expect(isActionAcceptance("yes, open it")).toBe(true);
    expect(isActionAcceptance("not now")).toBe(false);
  });

  it("'where is my draft' points at Create", () => {
    const r = parseActionRecoveryCommand("where is my draft", [draft]);
    expect(r.kind).toBe("draft-hint");
    expect(r.message).toMatch(/Create/);
  });

  it("'show my project' points at Projects", () => {
    const r = parseActionRecoveryCommand("show my project", [project]);
    expect(r.kind).toBe("project-hint");
    expect(r.message).toMatch(/Sales Funnel|Projects/);
  });

  it("'what should I work on' returns the current action", () => {
    const r = parseActionRecoveryCommand("what should I work on", [draft, project]);
    expect(r.kind).toBe("next-action");
  });

  it("handles an empty queue gracefully", () => {
    const r = parseActionRecoveryCommand("what should I work on", []);
    expect(r.kind).toBe("none");
  });
});
