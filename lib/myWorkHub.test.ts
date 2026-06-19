import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildMyWorkHub,
  dedupeHubItems,
  relativeDateLabel,
  searchMyWorkHub,
} from "./myWorkHub";
import { createSavedWork } from "./savedWorkStore";
import {
  logMomentum,
  saveAvatar,
  saveProject,
  saveProjectItem,
  toggleProjectItemDone,
} from "./companionStore";
import { upsertDocumentMetadata } from "./documentMetadataStore";
import { saveProjectExecutionLink } from "./projectExecutionLinks";
import { saveUserStrategy } from "./userStrategies";
import {
  saveDecisionCompassSession,
  type PersistedDecisionCompassSession,
} from "./decisionCompassSessionStore";

function seedLocalStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
    localStorage: storage,
  });
  vi.stubGlobal("CustomEvent", class CustomEvent {
    type: string;
    detail?: unknown;
    constructor(type: string, init?: { detail?: unknown }) {
      this.type = type;
      this.detail = init?.detail;
    }
  });
  for (const key of [
    "companion-projects-v1",
    "companion-project-items-v1",
    "companion-saved-work-v1",
    "companion-document-metadata",
    "companion-project-execution-links-v1",
    "companion-user-strategies-v1",
    "companion-decision-compass-session-v1",
    "companion-ideal-clients-v1",
    "companion-brain-dumps-v1",
    "companion-create-workflow-record-v1",
    "companion-strategy-apply-v1",
    "companion-momentum-v1",
  ]) {
    localStorage.removeItem(key);
  }
}

describe("My Work Hub V1", () => {
  beforeEach(() => {
    seedLocalStorage();
  });

  it("continue working aggregation from continuity manifest", () => {
    createSavedWork({
      title: "Marketing Plan",
      artifactType: "Marketing Plan",
      body: "Plan",
      sourceWorkspace: "create",
      status: "draft",
    });
    const hub = buildMyWorkHub();
    expect(hub.continueWorking.length).toBeGreaterThan(0);
    expect(hub.continueItems).toEqual(hub.continueWorking);
  });

  it("projects aggregation with task counts and completion", () => {
    const [p] = saveProject({
      name: "Website Launch",
      goal: "Launch",
      goals: [],
      nextAction: "Homepage",
      status: "in-progress",
      horizon: "now",
    });
    const created = saveProjectItem({
      projectId: p!.id,
      kind: "task",
      title: "Task A",
      sortOrder: 0,
    });
    const taskA = created.find((t) => t.title === "Task A");
    if (taskA) toggleProjectItemDone(taskA.id);
    saveProjectItem({
      projectId: p!.id,
      kind: "task",
      title: "Task B",
      done: false,
      sortOrder: 1,
    });
    const hub = buildMyWorkHub();
    const row = hub.projects.find((r) => r.id === p!.id);
    expect(row?.openTasks).toBe(1);
    expect(row?.totalTasks).toBe(2);
    expect(row?.completionPercent).toBe(50);
    expect(hub.activeProjects.inProgress.length).toBe(1);
  });

  it("saved work display in hub", () => {
    createSavedWork({
      title: "Workshop SOP",
      artifactType: "SOP",
      body: "Steps",
      sourceWorkspace: "create",
    });
    const hub = buildMyWorkHub();
    expect(hub.savedWork.some((i) => /Workshop SOP/i.test(i.title))).toBe(true);
  });

  it("unified file display", () => {
    upsertDocumentMetadata({
      title: "Plan Doc",
      type: "Plan",
      googleUrl: "https://docs.google.com/document/d/abc",
      googleFileId: "abc",
      googleKind: "doc",
      projectId: "p1",
    });
    const hub = buildMyWorkHub();
    expect(hub.files.some((f) => /Plan Doc/i.test(f.title))).toBe(true);
    expect(hub.files[0]?.openTarget.kind).toBe("url");
  });

  it("brain dump aggregation in ideas waiting", () => {
    localStorage.setItem(
      "companion-brain-dumps-v1",
      JSON.stringify([
        {
          id: "bd-1",
          text: "Summit idea",
          createdAt: new Date().toISOString(),
        },
        {
          id: "bd-2",
          text: "Linked thought",
          createdAt: new Date().toISOString(),
          projectId: "p1",
        },
        {
          id: "bd-3",
          text: "Sorted thought",
          createdAt: new Date().toISOString(),
          sorted: true,
        },
      ]),
    );
    const hub = buildMyWorkHub();
    expect(hub.ideasWaiting.total).toBe(3);
    expect(hub.ideasWaiting.unsorted).toBe(2);
    expect(hub.ideasWaiting.linkedToProjects).toBe(1);
    expect(hub.ideasWaiting.needingReview).toBe(1);
  });

  it("avatar aggregation", () => {
    saveAvatar({
      name: "ADHD Coach",
      tagline: "Primary",
      who: "Coaches",
      painPoints: "Overwhelm",
      goals: "Revenue",
      currentBehavior: "Scattered",
      solution: "Systems",
      isPrimary: true,
    });
    const hub = buildMyWorkHub();
    expect(hub.avatars.some((a) => a.name === "ADHD Coach")).toBe(true);
    expect(hub.avatars.find((a) => a.isPrimary)?.name).toBe("ADHD Coach");
  });

  it("strategy aggregation", () => {
    saveUserStrategy({
      title: "Morning Block",
      type: "personal",
      category: "focus",
      source: "user_generated",
      description: "Focus",
      whenToUse: "Mornings",
      steps: ["Pick one task"],
      whyItWorks: "Clarity",
    });
    const hub = buildMyWorkHub();
    expect(hub.strategies.some((s) => /Morning Block/i.test(s.title))).toBe(
      true,
    );
  });

  it("momentum counts from week events", () => {
    logMomentum("complete", "Finished outline");
    logMomentum("capture", "Brain dump");
    logMomentum("move", "Project step");
    const hub = buildMyWorkHub();
    expect(hub.momentum.length).toBeGreaterThan(0);
    expect(hub.momentum.some((m) => m.count > 0)).toBe(true);
  });

  it("search results across sources", () => {
    createSavedWork({
      title: "Zebra Marketing Plan",
      artifactType: "Marketing Plan",
      body: "x",
      sourceWorkspace: "create",
    });
    saveUserStrategy({
      title: "Zebra Focus",
      type: "business",
      category: "focus",
      source: "user_generated",
      description: "d",
      whenToUse: "w",
      steps: ["s"],
      whyItWorks: "y",
    });
    const groups = searchMyWorkHub("zebra");
    expect(groups.flatMap((g) => g.items).length).toBeGreaterThanOrEqual(2);
  });

  it("sorting by updated date in recent work", () => {
    const older = createSavedWork({
      title: "Older Plan",
      artifactType: "Plan",
      body: "a",
      sourceWorkspace: "create",
    });
    const newer = createSavedWork({
      title: "Newer Plan",
      artifactType: "Plan",
      body: "b",
      sourceWorkspace: "create",
    });
    localStorage.setItem(
      "companion-saved-work-v1",
      JSON.stringify([
        { ...older, updatedAt: "2026-01-01T00:00:00.000Z" },
        { ...newer, updatedAt: "2026-06-10T00:00:00.000Z" },
      ]),
    );
    const hub = buildMyWorkHub();
    const flat = hub.recentWork.flatMap((g) => g.items);
    const newerIdx = flat.findIndex((i) => i.title === "Newer Plan");
    const olderIdx = flat.findIndex((i) => i.title === "Older Plan");
    expect(newerIdx).toBeGreaterThanOrEqual(0);
    expect(newerIdx).toBeLessThan(olderIdx);
  });

  it("empty-state handling", () => {
    const hub = buildMyWorkHub();
    expect(hub.continueWorking).toEqual([]);
    expect(hub.activeProjects.inProgress).toEqual([]);
    expect(hub.files).toEqual([]);
    expect(hub.avatars).toEqual([]);
  });

  it("no duplicate records in recent work", () => {
    createSavedWork({
      title: "Unique Workshop",
      artifactType: "Workshop",
      body: "b",
      sourceWorkspace: "create",
    });
    const hub = buildMyWorkHub();
    const flat = hub.recentWork.flatMap((g) => g.items);
    const deduped = dedupeHubItems(flat);
    expect(deduped.filter((i) => i.title === "Unique Workshop")).toHaveLength(1);
  });

  it("resume links use continuity open targets", () => {
    createSavedWork({
      title: "Draft Plan",
      artifactType: "Plan",
      body: "d",
      sourceWorkspace: "create",
      status: "draft",
    });
    const hub = buildMyWorkHub();
    const item = hub.continueWorking[0];
    expect(item?.openTarget).toBeDefined();
    expect(
      item?.openTarget.kind === "saved-work" ||
        item?.openTarget.kind === "resume",
    ).toBe(true);
  });

  it("file links open with url target", () => {
    saveProjectExecutionLink({
      projectId: "proj-x",
      kind: "sheet",
      label: "Tracker",
      url: "https://docs.google.com/spreadsheets/d/x",
      fileId: "x",
    });
    const hub = buildMyWorkHub();
    const file = hub.files.find((f) => f.url?.includes("spreadsheets"));
    expect(file?.openTarget).toEqual({
      kind: "url",
      url: "https://docs.google.com/spreadsheets/d/x",
    });
  });

  it("hub loads with mixed data sources", () => {
    const session: PersistedDecisionCompassSession = {
      sessionId: "dc-mix",
      decision: "Hire or DIY?",
      optionA: "Hire",
      optionB: "DIY",
      decisionType: "strategic",
      currentStepId: "decision",
      completedSteps: [],
      answers: {},
      stepIndex: 0,
      showMap: false,
      complete: true,
      draft: false,
      lastTouchedAt: new Date().toISOString(),
      recommendation: {
        type: "strategic",
        headline: "Hire",
        choice: "Hire",
        summary: "Growth",
      },
    };
    saveDecisionCompassSession(session);
    createSavedWork({
      title: "Mixed Plan",
      artifactType: "Plan",
      body: "p",
      sourceWorkspace: "create",
    });
    saveProject({
      name: "Mixed Project",
      goal: "g",
      goals: [],
      nextAction: "Go",
      status: "active-focus",
      horizon: "now",
    });
    const hub = buildMyWorkHub();
    expect(hub.savedWork.length).toBeGreaterThan(0);
    expect(hub.activeProjects.activeFocus.length).toBeGreaterThan(0);
    expect(hub.trust.savedWorkCount).toBeGreaterThan(0);
  });

  it("relative date labels", () => {
    const today = new Date().toISOString();
    expect(relativeDateLabel(today)).toBe("Today");
  });
});
