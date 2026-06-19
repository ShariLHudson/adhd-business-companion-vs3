import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  dismissHomeResumeForSession,
  findLatestHomeResumeItem,
  homeResumeItemFromActivityId,
  isHomeResumeDismissedForSession,
} from "./homeResumeItem";

describe("homeResumeItem", () => {
  beforeEach(() => {
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
  });

  it("returns null when nothing unfinished exists", () => {
    expect(findLatestHomeResumeItem()).toBeNull();
  });

  it("ignores chat-style recent work entries", () => {
    localStorage.setItem(
      "companion-recent-work-v1",
      JSON.stringify([
        {
          id: "chat:membership launch",
          kind: "chat",
          title: "Membership Launch",
          ts: "2026-06-12T12:00:00.000Z",
        },
      ]),
    );
    expect(findLatestHomeResumeItem()).toBeNull();
  });

  it("prefers the most recently updated project with real work", () => {
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
        {
          id: "p2",
          name: "ADHD Workshop",
          goal: "",
          goals: [],
          horizon: "now",
          status: "in-progress",
          nextAction: "Draft module 1",
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
          projectId: "p1",
          title: "Pricing outline",
          kind: "task",
          done: false,
          createdAt: "2026-06-01T12:00:00.000Z",
          updatedAt: "2026-06-08T12:00:00.000Z",
        },
        {
          id: "t2",
          projectId: "p2",
          title: "Module draft",
          kind: "task",
          done: false,
          createdAt: "2026-06-01T12:00:00.000Z",
          updatedAt: "2026-06-12T12:00:00.000Z",
        },
      ]),
    );

    const item = findLatestHomeResumeItem();
    expect(item?.kind).toBe("project");
    expect(item?.title).toBe("ADHD Workshop");
    expect(item?.nextStep).toBe("Draft module 1");
  });

  it("ignores projects that were only opened", () => {
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
          nextAction: "Step",
          color: "#1e4f4f",
          createdAt: "2026-06-01T12:00:00.000Z",
          updatedAt: "2026-06-12T12:00:00.000Z",
        },
      ]),
    );
    expect(findLatestHomeResumeItem()).toBeNull();
  });

  it("builds decision compass resume metadata", () => {
    const item = homeResumeItemFromActivityId(
      "decision-compass",
      "2026-06-12T12:00:00.000Z",
    );
    expect(item?.kind).toBe("decision-compass");
    expect(item?.title).toMatch(/Decision Compass/i);
    expect(item?.nextStep).toMatch(/Decision Compass/i);
  });

  it("builds quick two-option resume metadata separately", () => {
    const item = homeResumeItemFromActivityId(
      "two-option",
      "2026-06-12T12:00:00.000Z",
    );
    expect(item?.kind).toBe("quick-two-option");
    expect(item?.title).toMatch(/Quick Two Option Choice/i);
    expect(item?.nextStep).toMatch(/quick two-option/i);
  });

  it("tracks session dismiss without deleting resume data", () => {
    expect(isHomeResumeDismissedForSession("project:p1")).toBe(false);
    dismissHomeResumeForSession("project:p1");
    expect(isHomeResumeDismissedForSession("project:p1")).toBe(true);
    expect(isHomeResumeDismissedForSession("project:p2")).toBe(false);
  });
});
