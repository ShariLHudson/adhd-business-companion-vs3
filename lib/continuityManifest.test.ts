import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  buildContinuityManifest,
  findLatestContinuityItem,
  HOME_RESUME_CONTINUITY_TYPES,
} from "./continuityManifest";
import {
  findLatestHomeResumeItem,
  listHomeResumeCandidates,
} from "./homeResumeItem";
import {
  clearWorkspaceSession,
  loadWorkspaceSessionMeta,
  saveWorkspaceSession,
} from "./workspaceSessionStore";
import { createWorkspaceSession } from "./workspaceSop";
import {
  recoveryMessageAfterPanelHide,
} from "./continuityRecovery";
import {
  shouldClearPersistenceOnPanelClose,
  shouldClearWorkspaceSessionOnPanelClose,
} from "./continuityPanelClose";

function stubStorage() {
  const localMem = new Map<string, string>();
  const sessionMem = new Map<string, string>();
  const localStorage = {
    getItem: (k: string) => localMem.get(k) ?? null,
    setItem: (k: string, v: string) => localMem.set(k, v),
    removeItem: (k: string) => localMem.delete(k),
    clear: () => localMem.clear(),
  };
  const sessionStorage = {
    getItem: (k: string) => sessionMem.get(k) ?? null,
    setItem: (k: string, v: string) => sessionMem.set(k, v),
    removeItem: (k: string) => sessionMem.delete(k),
    clear: () => sessionMem.clear(),
  };
  vi.stubGlobal("localStorage", localStorage);
  vi.stubGlobal("sessionStorage", sessionStorage);
  vi.stubGlobal("window", { localStorage, sessionStorage });
  return localStorage;
}

describe("continuityManifest", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    stubStorage();
  });

  it("aggregates create, project, workspace SOP, and saved work", () => {
    localStorage.setItem(
      "companion-projects-v1",
      JSON.stringify([
        {
          id: "p1",
          name: "VIP Offer",
          goal: "",
          goals: [],
          horizon: "now",
          status: "in-progress",
          nextAction: "Outline pricing",
          color: "#1e4f4f",
          createdAt: "2026-06-01T12:00:00.000Z",
          updatedAt: "2026-06-08T12:00:00.000Z",
        },
      ]),
    );

    localStorage.setItem(
      "companion-create-session-v1",
      JSON.stringify({
        genSeed: { type: "LinkedIn Post", draft: "Hello" },
        creationContext: {
          section: "content-generator",
          itemType: "LinkedIn Post",
          title: "My post",
          draftContent: "Hello",
        },
        workspaceDetail: null,
        updatedAt: "2026-06-10T12:00:00.000Z",
      }),
    );

    const manifest = buildContinuityManifest();
    expect(manifest.items.length).toBeGreaterThanOrEqual(2);
    expect(manifest.items.some((i) => i.type === "create-draft")).toBe(true);
    expect(manifest.items.some((i) => i.type === "project")).toBe(true);
  });

  it("home resume picks the most recent eligible work", () => {
    localStorage.setItem(
      "companion-create-session-v1",
      JSON.stringify({
        genSeed: {
          type: "LinkedIn Post",
          draft:
            "This is a meaningful draft with enough characters to count as real work.",
        },
        creationContext: {
          section: "content-generator",
          itemType: "LinkedIn Post",
          title: "My post",
          draftContent:
            "This is a meaningful draft with enough characters to count as real work.",
        },
        workspaceDetail: null,
        updatedAt: "2026-06-12T12:00:00.000Z",
      }),
    );

    localStorage.setItem(
      "companion-projects-v1",
      JSON.stringify([
        {
          id: "p-old",
          name: "Old Project",
          goal: "",
          goals: [],
          horizon: "now",
          status: "in-progress",
          nextAction: "Step",
          color: "#1e4f4f",
          createdAt: "2026-06-01T12:00:00.000Z",
          updatedAt: "2026-06-01T12:00:00.000Z",
        },
        {
          id: "p-new",
          name: "New Project",
          goal: "",
          goals: [],
          horizon: "now",
          status: "in-progress",
          nextAction: "Step",
          color: "#1e4f4f",
          createdAt: "2026-06-01T12:00:00.000Z",
          updatedAt: "2026-06-12T12:00:00.000Z",
        },
      ]),
    );
    localStorage.setItem(
      "companion-project-items-v1",
      JSON.stringify([
        {
          id: "t1",
          projectId: "p-old",
          title: "Old task",
          kind: "task",
          done: false,
          createdAt: "2026-06-01T12:00:00.000Z",
          updatedAt: "2026-06-01T12:00:00.000Z",
        },
      ]),
    );

    const session = createWorkspaceSession("projects", "Workshop", "medium");
    saveWorkspaceSession(session);
    const raw = localStorage.getItem("companion-workspace-session-v1");
    const snap = JSON.parse(raw!);
    snap.lastTouchedAt = "2026-06-02T12:00:00.000Z";
    localStorage.setItem("companion-workspace-session-v1", JSON.stringify(snap));

    const latest = findLatestContinuityItem(HOME_RESUME_CONTINUITY_TYPES);
    expect(latest?.title).toBe("My post");

    const home = findLatestHomeResumeItem();
    expect(home?.title).toBe("My post");
    expect(listHomeResumeCandidates()).toHaveLength(1);
    expect(listHomeResumeCandidates()[0]?.title).toBe("My post");
  });

  it("never resurfaces an archived (soft-removed) Project Home", () => {
    localStorage.setItem(
      "companion-projects-v1",
      JSON.stringify([
        {
          id: "p-archived",
          name: "Archived Project",
          goal: "",
          goals: [],
          horizon: "now",
          status: "in-progress",
          nextAction: "Step",
          color: "#1e4f4f",
          archived: true,
          createdAt: "2026-06-01T12:00:00.000Z",
          updatedAt: "2026-06-12T12:00:00.000Z",
        },
        {
          id: "p-active",
          name: "Active Project",
          goal: "",
          goals: [],
          horizon: "now",
          status: "in-progress",
          nextAction: "Step",
          color: "#1e4f4f",
          createdAt: "2026-06-01T12:00:00.000Z",
          updatedAt: "2026-06-11T12:00:00.000Z",
        },
      ]),
    );

    const manifest = buildContinuityManifest();
    const projectItems = manifest.items.filter((i) => i.type === "project");
    expect(projectItems.map((i) => i.title)).toEqual(["Active Project"]);
    expect(projectItems.some((i) => i.title === "Archived Project")).toBe(
      false,
    );
  });

  it("home resume ignores navigation-only projects", () => {
    localStorage.setItem(
      "companion-projects-v1",
      JSON.stringify([
        {
          id: "p1",
          name: "Launch Plan",
          goal: "",
          goals: [],
          horizon: "now",
          status: "in-progress",
          nextAction: "Ship landing page",
          color: "#1e4f4f",
          createdAt: "2026-06-01T12:00:00.000Z",
          updatedAt: "2026-06-12T12:00:00.000Z",
        },
      ]),
    );

    const manifest = buildContinuityManifest();
    const home = findLatestHomeResumeItem();
    expect(manifest.latest?.title).toBe("Launch Plan");
    expect(home).toBeNull();
  });
});

describe("workspaceSessionStore lastTouchedAt", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    stubStorage();
  });

  it("persists lastTouchedAt on save and does not change on read", () => {
    const session = createWorkspaceSession("projects", "Workshop", "medium");
    saveWorkspaceSession(session);
    const first = loadWorkspaceSessionMeta()?.lastTouchedAt;
    expect(first).toBeTruthy();

    const second = loadWorkspaceSessionMeta()?.lastTouchedAt;
    expect(second).toBe(first);
  });

  it("omits workspace SOP from manifest when lastTouchedAt is missing", () => {
    localStorage.setItem(
      "companion-workspace-session-v1",
      JSON.stringify({
        projectId: null,
        projectTitle: "Legacy",
        workflowType: "workshop",
        currentStep: "workshop-title",
        savedStatus: "create-flow",
        session: createWorkspaceSession("projects", "Workshop", "medium"),
      }),
    );
    const manifest = buildContinuityManifest();
    expect(manifest.items.some((i) => i.type === "workspace-sop")).toBe(false);
  });
});

describe("continuityPanelClose", () => {
  it("hide preserves persistence; discard clears", () => {
    expect(shouldClearPersistenceOnPanelClose("hide")).toBe(false);
    expect(shouldClearPersistenceOnPanelClose("discard")).toBe(true);
    expect(shouldClearWorkspaceSessionOnPanelClose("hide")).toBe(false);
    expect(shouldClearWorkspaceSessionOnPanelClose("discard")).toBe(true);
  });
});

describe("continuityRecovery", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    stubStorage();
  });

  it("recovery message after hiding create panel", () => {
    localStorage.setItem(
      "companion-create-session-v1",
      JSON.stringify({
        genSeed: { type: "post", draft: "Hi" },
        creationContext: {
          section: "content-generator",
          itemType: "post",
          title: "Post",
          draftContent: "Hi",
        },
        workspaceDetail: null,
        updatedAt: "2026-06-12T12:00:00.000Z",
      }),
    );
    const msg = recoveryMessageAfterPanelHide({ panel: "content-generator" });
    expect(msg).toMatch(/draft is still here/i);
    expect(msg).toMatch(/Resume Where You Left Off/i);
  });

  it("recovery message for save for later", () => {
    const msg = recoveryMessageAfterPanelHide({
      panel: "content-generator",
      savedForLater: true,
    });
    expect(msg).toMatch(/Saved for later/i);
  });
});

describe("panel close does not destroy resumable work", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    stubStorage();
  });

  it("clearWorkspaceSession only runs on explicit discard path", () => {
    const session = createWorkspaceSession("projects", "Workshop", "medium");
    saveWorkspaceSession(session);
    expect(loadWorkspaceSessionMeta()).not.toBeNull();

    // hide path: do not call clearWorkspaceSession
    expect(shouldClearWorkspaceSessionOnPanelClose("hide")).toBe(false);
    expect(loadWorkspaceSessionMeta()).not.toBeNull();

    clearWorkspaceSession();
    expect(loadWorkspaceSessionMeta()).toBeNull();
  });
});
