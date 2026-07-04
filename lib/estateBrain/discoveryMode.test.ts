import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  detectDiscoveryTopic,
  shouldEnterDiscoveryMode,
  startDiscoveryTurn,
  advanceDiscoverySession,
  formatDiscoveryQuestion,
  saveDiscoverySession,
  clearDiscoverySession,
  loadDiscoverySession,
} from "./discoveryMode";
import { computeDiscoveryConfidence } from "./discoveryTypes";
import { shouldEnterUniversalCreation } from "@/lib/universalCreation";

describe("Discovery Mode", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    const storage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    };
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", { localStorage: storage });
    clearDiscoverySession();
  });

  it("detects SOP and focus discovery topics", () => {
    expect(detectDiscoveryTopic("Help me create an SOP")).toBe("create_sop");
    expect(detectDiscoveryTopic("I need to focus")).toBe("focus");
    expect(detectDiscoveryTopic("Research AI tools for accountants")).toBe(
      "research",
    );
  });

  it("does not enter estate discovery when universal creation handles SOP", () => {
    expect(shouldEnterDiscoveryMode("Help me create an SOP")).toBe(false);
    expect(shouldEnterUniversalCreation("Help me create an SOP")).toBe(true);
  });

  it("asks focus obstacle before coaching menu", () => {
    const turn = startDiscoveryTurn("I need to focus", 1);
    expect(turn?.kind).toBe("question");
    expect(formatDiscoveryQuestion(turn!)).toMatch(
      /making it hardest to focus/i,
    );
  });

  it("builds confidence and completes SOP discovery after three answers", () => {
    let session = startDiscoveryTurn("Help me create an SOP", 1)!.session;
    const answers = [
      "For my own business",
      "Starting from scratch",
      "My VA team will use it",
    ];
    let result = null;
    for (const answer of answers) {
      result = advanceDiscoverySession(session, answer);
      if (result?.kind === "ready") break;
      if (result?.kind === "question") {
        session = result.session;
      }
    }
    expect(result?.kind).toBe("ready");
    expect(result?.action.kind).toBe("create_open");
    expect(result?.message).toMatch(/SOP builder/i);
  });

  it("completes focus discovery with obstacle then coaching menu", () => {
    const start = startDiscoveryTurn("I need to focus", 1)!;
    const ready = advanceDiscoverySession(
      start.session,
      "Too many thoughts in my head",
    );
    expect(ready?.kind).toBe("ready");
    expect(ready?.action.kind).toBe("coaching_menu");
    expect(ready?.message).toMatch(/ideas that might help/i);
    expect(ready?.message).toMatch(/Get everything out of your head first/);
  });

  it("confidence scoring matches spec weights", () => {
    const confidence = computeDiscoveryConfidence({
      goal: true,
      obstacle: true,
      outcome: true,
      context: false,
    });
    expect(confidence.score).toBe(90);
  });

  it("persists session across turns", () => {
    const turn = startDiscoveryTurn("Help me create an SOP", 1)!;
    saveDiscoverySession(turn.session);
    expect(loadDiscoverySession()?.topic).toBe("create_sop");
  });
});
