import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  dismissPlanMyDayForSession,
  dismissTodayResume,
  findTodayResumeItem,
  isPlanMyDayDismissedForSession,
} from "./todayPanelDismiss";
import { findLatestHomeResumeItem } from "./homeResumeItem";
import { clearCreateSession } from "./createSessionStore";

function stubStorage() {
  const sessionMem = new Map<string, string>();
  const localMem = new Map<string, string>();
  const sessionStorage = {
    getItem: (k: string) => sessionMem.get(k) ?? null,
    setItem: (k: string, v: string) => sessionMem.set(k, v),
    removeItem: (k: string) => sessionMem.delete(k),
    clear: () => sessionMem.clear(),
  };
  const localStorage = {
    getItem: (k: string) => localMem.get(k) ?? null,
    setItem: (k: string, v: string) => localMem.set(k, v),
    removeItem: (k: string) => localMem.delete(k),
    clear: () => localMem.clear(),
  };
  vi.stubGlobal("sessionStorage", sessionStorage);
  vi.stubGlobal("localStorage", localStorage);
  vi.stubGlobal("window", { localStorage, sessionStorage });
}

function recentIso(hoursAgo = 2): string {
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
}

describe("todayPanelDismiss", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    stubStorage();
    clearCreateSession();
  });

  it("hides plan my day for the session without deleting resume data", () => {
    expect(isPlanMyDayDismissedForSession()).toBe(false);
    dismissPlanMyDayForSession();
    expect(isPlanMyDayDismissedForSession()).toBe(true);
  });

  it("hides resume on Today while keeping underlying resume item", () => {
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
          title: "Workshop Outline",
          draftContent:
            "This is a meaningful draft with enough characters to count as real work.",
        },
        workspaceDetail: null,
        updatedAt: recentIso(1),
      }),
    );

    const item = findLatestHomeResumeItem();
    expect(item).not.toBeNull();

    dismissTodayResume(item!);
    expect(findTodayResumeItem()).toBeNull();
    expect(findLatestHomeResumeItem()?.title).toBe("Workshop Outline");
  });
});
