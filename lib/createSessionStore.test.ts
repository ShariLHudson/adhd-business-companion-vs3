import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  clearCreateSession,
  hasActiveCreateSession,
  loadCreateSession,
  saveCreateSession,
} from "./createSessionStore";
import { toCreationContext } from "./workspaceCreation";
import { isCreateResumeRequest } from "./workspaceIntent";

describe("createSessionStore", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", globalThis);
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => {
        mem.set(k, v);
      },
      removeItem: (k: string) => {
        mem.delete(k);
      },
    });
    clearCreateSession();
  });

  it("persists and loads create session with draft", () => {
    const ctx = toCreationContext("content-generator", {
      itemType: "Post",
      title: "LinkedIn post",
      draftContent: "Hook line one",
      stage: "editing draft",
    });
    saveCreateSession({
      genSeed: { type: "Post", topic: "LinkedIn", draft: "Hook line one" },
      creationContext: ctx,
      workspaceDetail: { view: "create", stage: "Editing draft" },
    });
    expect(hasActiveCreateSession()).toBe(true);
    const loaded = loadCreateSession();
    expect(loaded?.genSeed.draft).toBe("Hook line one");
    expect(loaded?.creationContext.itemType).toBe("Post");
  });

  it("clears session", () => {
    saveCreateSession({
      genSeed: { type: "Plan", draft: "Day 1" },
      creationContext: toCreationContext("content-generator", {
        itemType: "Plan",
        title: "Plan",
        draftContent: "Day 1",
      }),
      workspaceDetail: null,
    });
    clearCreateSession();
    expect(hasActiveCreateSession()).toBe(false);
  });
});

describe("create resume phrases", () => {
  it.each([
    "open create",
    "open content builder",
    "show my draft",
    "where is my draft",
    "continue working on this",
  ])("detects resume request: %s", (phrase) => {
    expect(isCreateResumeRequest(phrase)).toBe(true);
  });
});
