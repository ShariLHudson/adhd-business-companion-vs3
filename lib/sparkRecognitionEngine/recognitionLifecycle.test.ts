import { beforeEach, describe, expect, it, vi } from "vitest";
import { classifyPrimaryConversationTurn } from "@/lib/conversation/primaryTurnClassifier";
import {
  advanceRecognitionLifecycle,
  evaluateRecognitionLifecycleTurn,
  isDiscoveryLanguageNotCreate,
  isExplicitCreateRequestForRecognition,
  preserveDiscoveryFromConversation,
  resetRecognitionRoomStateForTests,
  resetRecognitionStoreForTests,
  shouldBlockCreateForRecognitionTurn,
  shouldBlockCreateRouting,
  detectRecognitionTriggers,
  listRediscoveryCandidates,
  markRecordRevisited,
} from "./index";

function stubStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => mem.set(k, v),
    removeItem: (k: string) => mem.delete(k),
    clear: () => mem.clear(),
  };
  vi.stubGlobal("sessionStorage", storage);
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { dispatchEvent: vi.fn() });
}

describe("recognition lifecycle pipeline", () => {
  beforeEach(() => {
    stubStorage();
    resetRecognitionRoomStateForTests();
    resetRecognitionStoreForTests();
  });

  it("owns discovery turns and offers Evidence Vault preserve-first", () => {
    const turn = evaluateRecognitionLifecycleTurn({
      userText:
        "I discovered how to create an amazing app for ADHD business people.",
    });
    expect(turn.ownsTurn).toBe(true);
    expect(turn.allowCreate).toBe(false);
    expect(turn.offer?.stage).toBe("evidence_vault");
    expect(turn.offer?.options).toContain("preserve_it");
    expect(turn.offer?.blockCreate).toBe(true);
  });

  it("does not route discoveries to Create", () => {
    const text =
      "I figured out how to help my VA create Loom videos.";
    expect(isDiscoveryLanguageNotCreate(text)).toBe(true);
    expect(isExplicitCreateRequestForRecognition(text)).toBe(false);
    expect(shouldBlockCreateForRecognitionTurn(text)).toBe(true);

    const primary = classifyPrimaryConversationTurn({ userText: text });
    expect(primary.type).toBe("RECOGNITION");
    expect(primary.owner).toBe("recognition:lifecycle");
  });

  it("allows Create when explicitly requested", () => {
    const text = "help me write a newsletter about my launch";
    expect(isExplicitCreateRequestForRecognition(text)).toBe(true);
    expect(shouldBlockCreateForRecognitionTurn(text)).toBe(false);
  });

  it("advances Conversation → Vault → Celebration → Legacy → Hall", () => {
    const preserved = preserveDiscoveryFromConversation({
      userText: "I learned something important about my sales process.",
    });
    expect(preserved.ok).toBe(true);
    expect(preserved.stage).toBe("evidence_vault");
    expect(preserved.lifecycleStatus).toBe("preserved");
    expect(preserved.record?.id).toBeTruthy();

    const celebrated = advanceRecognitionLifecycle({
      choice: "quiet_moment",
      recordId: preserved.record!.id,
      tone: "grateful",
    });
    expect(celebrated.ok).toBe(true);
    expect(celebrated.stage).toBe("celebration");
    expect(celebrated.lifecycleStatus).toBe("celebrated_quiet");
    expect(celebrated.suggestedRoomId).toBe("gardens");
    expect(celebrated.options).toContain("tell_the_story");

    const legacy = advanceRecognitionLifecycle({
      choice: "tell_the_story",
      recordId: preserved.record!.id,
    });
    expect(legacy.ok).toBe(true);
    expect(legacy.stage).toBe("legacy_studio");
    expect(legacy.lifecycleStatus).toBe("chronicled");
    expect(legacy.options).toContain("mark_hall_candidate");

    const hall = advanceRecognitionLifecycle({
      choice: "mark_hall_candidate",
      recordId: preserved.record!.id,
    });
    expect(hall.ok).toBe(true);
    expect(hall.lifecycleStatus).toBe("hall_candidate");

    const inducted = advanceRecognitionLifecycle({
      choice: "induct_into_hall",
      recordId: preserved.record!.id,
    });
    expect(inducted.ok).toBe(true);
    expect(inducted.lifecycleStatus).toBe("hall_exhibit");
    expect(inducted.memberPrompt).toMatch(/Hall of Accomplishments/i);
  });

  it("never auto-inducts without explicit choice", () => {
    const preserved = preserveDiscoveryFromConversation({
      userText: "That changed everything for my business.",
    });
    const trigger = detectRecognitionTriggers(
      "That changed everything for my business.",
    );
    expect(trigger.suggestsHallLanguage).toBe(true);
    // Preserve still first
    expect(preserved.lifecycleStatus).toBe("preserved");
    expect(preserved.lifecycleStatus).not.toBe("hall_exhibit");
  });

  it("supports rediscovery of preserved records", () => {
    const preserved = preserveDiscoveryFromConversation({
      userText: "I solved a hard client problem today.",
    });
    const candidates = listRediscoveryCandidates();
    expect(candidates.some((c) => c.record.id === preserved.record!.id)).toBe(
      true,
    );
    const revisited = markRecordRevisited(preserved.record!.id);
    expect(revisited?.lastRevisitedAt).toBeTruthy();
  });

  it("blocks Create routing for active recognition flows", () => {
    preserveDiscoveryFromConversation({
      userText: "I made progress on my offer.",
    });
    expect(
      shouldBlockCreateRouting({
        trigger: detectRecognitionTriggers("draft a post"),
        visualRoom: "evidence-vault",
        activeFlowKind: "preserve_discovery",
      }),
    ).toBe(true);
  });
});
