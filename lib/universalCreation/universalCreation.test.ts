import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectUniversalDocumentType,
  shouldEnterUniversalCreation,
  startUniversalCreationTurn,
  advanceUniversalCreation,
  clearUniversalCreationSession,
  formatReviewMenu,
  parseReviewChoice,
  pluginById,
} from "./index";

describe("Universal Creation Framework", () => {
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
    clearUniversalCreationSession();
  });

  it("detects document types from natural language", () => {
    expect(detectUniversalDocumentType("help me write an email")).toBe("email");
    expect(detectUniversalDocumentType("Help me create an SOP")).toBe("sop");
    expect(detectUniversalDocumentType("draft a newsletter")).toBe("newsletter");
    expect(detectUniversalDocumentType("write a blog post")).toBe("blog");
  });

  it("enters universal creation instead of immediate open for SOP", () => {
    expect(shouldEnterUniversalCreation("Help me create an SOP")).toBe(true);
    const turn = startUniversalCreationTurn("Help me create an SOP", 1);
    expect(turn?.kind).toBe("question");
    expect(turn && "question" in turn && turn.question).toMatch(
      /own business|client/i,
    );
  });

  it("enters universal creation for email", () => {
    expect(shouldEnterUniversalCreation("help me write an email")).toBe(true);
    const turn = startUniversalCreationTurn("help me write an email", 1);
    expect(turn?.kind).toBe("question");
  });

  it("completes SOP discovery and prepares before Create", () => {
    let session = startUniversalCreationTurn("Help me create an SOP", 1)!.session;
    const answers = [
      "For my own business",
      "Starting from scratch",
      "My VA team will use it",
    ];
    let result = null;
    for (const answer of answers) {
      result = advanceUniversalCreation(session, answer);
      if (result?.kind === "ready") break;
      if (result?.kind === "question") session = result.session;
    }
    expect(result?.kind).toBe("ready");
    expect(result?.preparationLine).toMatch(/SOP|checklist/i);
    expect(result?.guidedCreationHint).toMatch(/Guided Creation/i);
  });

  it("handles uncertainty without stopping the flow", () => {
    const start = startUniversalCreationTurn("help me write an email", 1)!;
    const uncertain = advanceUniversalCreation(
      start.session,
      "I'm not sure who it's for",
    );
    expect(uncertain?.kind).toBe("uncertainty");
    expect(uncertain?.message).toMatch(/recommend|examples|teach/i);
  });

  it("registers enhancements per document plugin", () => {
    const sop = pluginById("sop");
    expect(sop?.enhancements.map((e) => e.id)).toContain("checklist");
    const newsletter = pluginById("newsletter");
    expect(newsletter?.enhancements.map((e) => e.id)).toContain("social-posts");
  });

  it("provides review phase menu", () => {
    expect(formatReviewMenu()).toMatch(/draft ready/i);
    expect(parseReviewChoice("2")).toBe("section_by_section");
  });
});
