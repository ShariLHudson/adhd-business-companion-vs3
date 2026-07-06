import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  applyConversationSessionPatch,
  clearConversationSession,
  getOrCreateConversationSession,
  mergeConversationSessionPatch,
  resetConversationSessionMemoryForTests,
} from "./store";
import {
  hasDiscoveryBasics,
  isQuestionAnswered,
  mayAskQuestion,
} from "./questionGuard";
import { pauseActiveArtifact, resumeArtifact, setActiveArtifact } from "./pauseResume";
import { syncUniversalCreationToSession } from "./adapters/universalCreationAdapter";
import { sessionAwareFollowUpLine } from "./adapters/createExperienceAdapter";
import type { UniversalCreationSession } from "@/lib/universalCreation/types";
import { CONVERSATION_SESSION_STORAGE_KEY } from "./types";

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  resetConversationSessionMemoryForTests();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => {
      storage.set(k, v);
    },
    removeItem: (k: string) => {
      storage.delete(k);
    },
  });
  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
  });
  vi.stubGlobal("crypto", { randomUUID: () => "test-uuid" });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("mergeConversationSessionPatch", () => {
  it("preserves answeredQuestions when patch omits them", () => {
    const base = getOrCreateConversationSession();
    const withAnswer = applyConversationSessionPatch({
      answeredQuestions: [
        { slot: "what", answer: "Launch email", answeredAt: "2026-01-01T00:00:00.000Z" },
      ],
    });
    const merged = mergeConversationSessionPatch(withAnswer, {
      currentRoom: "creative-studio",
    });
    expect(merged.answeredQuestions).toHaveLength(1);
    expect(merged.currentRoom).toBe("creative-studio");
  });
});

describe("questionGuard", () => {
  it("blocks re-interview when slot is already answered", () => {
    const session = applyConversationSessionPatch({
      answeredQuestions: [
        { slot: "who", answer: "Newsletter subscribers", answeredAt: "2026-01-01T00:00:00.000Z" },
      ],
    });
    expect(mayAskQuestion(session, "who")).toBe(false);
    expect(isQuestionAnswered(session, "audience")).toBe(true);
  });

  it("reports discovery basics from session", () => {
    const session = applyConversationSessionPatch({
      answeredQuestions: [
        { slot: "what", answer: "Product launch", answeredAt: "2026-01-01T00:00:00.000Z" },
        { slot: "who", answer: "Customers", answeredAt: "2026-01-01T00:00:00.000Z" },
        { slot: "success", answer: "More signups", answeredAt: "2026-01-01T00:00:00.000Z" },
      ],
    });
    expect(hasDiscoveryBasics(session)).toEqual({
      purpose: true,
      audience: true,
      goal: true,
    });
  });
});

describe("universalCreationAdapter dual-write", () => {
  it("mirrors UC answers into ConversationSession", () => {
    const uc: UniversalCreationSession = {
      documentType: "email",
      phase: "discovery",
      confidence: { what: true, who: true, why: false, success: false, score: 50 },
      answers: {
        "email-recipient": "New members",
        "email-purpose": "Welcome sequence",
        "email-context": "They signed up yesterday",
      },
      questionIndex: 2,
      originalUserText: "write an email",
      startedAtTurn: 1,
      preparationReady: false,
      pendingEnhancements: [],
    };

    syncUniversalCreationToSession(uc);
    const raw = storage.get(CONVERSATION_SESSION_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as { answeredQuestions: { slot: string }[] };
    expect(parsed.answeredQuestions.some((q) => q.slot === "what")).toBe(true);
    expect(parsed.answeredQuestions.some((q) => q.slot === "who")).toBe(true);
    expect(parsed.answeredQuestions.some((q) => q.slot === "why")).toBe(true);
    expect(parsed.studioReadinessLevel).toBeGreaterThanOrEqual(2);
  });
});

describe("sessionAwareFollowUpLine", () => {
  it("returns continuation ack instead of re-interview when basics known", () => {
    const session = applyConversationSessionPatch({
      answeredQuestions: [
        { slot: "what", answer: "Launch", answeredAt: "2026-01-01T00:00:00.000Z" },
        { slot: "who", answer: "Members", answeredAt: "2026-01-01T00:00:00.000Z" },
      ],
    });
    const line = sessionAwareFollowUpLine("Email", session);
    expect(line).toContain("pick up right where we left off");
  });
});

describe("pause / resume artifact stack", () => {
  it("pauses active artifact and resumes later without losing draft", () => {
    setActiveArtifact({
      itemType: "Proposal",
      title: "Client proposal",
      draftContent: "Outline here",
    });
    pauseActiveArtifact("member switched to decision map");
    let session = getOrCreateConversationSession();
    expect(session.activeArtifact).toBeNull();
    expect(session.artifactStack[0]?.status).toBe("paused");

    const id = session.artifactStack[0]!.id;
    resumeArtifact(id);
    session = getOrCreateConversationSession();
    expect(session.activeArtifact?.draftContent).toBe("Outline here");
  });
});

describe("room change preserves session memory", () => {
  it("only patches currentRoom", () => {
    applyConversationSessionPatch({
      draftContent: "Draft body",
      answeredQuestions: [
        { slot: "what", answer: "SOP", answeredAt: "2026-01-01T00:00:00.000Z" },
      ],
    });
    applyConversationSessionPatch({ currentRoom: "library" });
    const session = getOrCreateConversationSession();
    expect(session.currentRoom).toBe("library");
    expect(session.draftContent).toBe("Draft body");
    expect(session.answeredQuestions).toHaveLength(1);
  });
});

describe("clearConversationSession", () => {
  it("removes storage key", () => {
    getOrCreateConversationSession();
    clearConversationSession();
    expect(storage.has(CONVERSATION_SESSION_STORAGE_KEY)).toBe(false);
  });
});
