import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearOutcomeThread,
  consumePendingInvitation,
  getOutcomeThread,
  outcomeThreadHintForChat,
  patchOutcomeThread,
  registerPendingOffer,
  threadAwareAcceptanceFallback,
  topicChangeClearsThread,
} from "./companionOutcomeThread";

describe("companionOutcomeThread", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    clearOutcomeThread();
  });

  it("persists problem and pending offer", () => {
    registerPendingOffer({
      offerSummary: "Open Clear My Mind",
      section: "brain-dump",
      workflowKind: "open_clear_my_mind",
      pendingQuestion: "Stay in chat or open Clear My Mind?",
    });
    const thread = getOutcomeThread();
    expect(thread?.pendingAction).toMatch(/Clear My Mind/i);
    expect(thread?.activeFeature).toBe("brain-dump");
  });

  it("hint forbids generic reset", () => {
    const hint = outcomeThreadHintForChat(
      patchOutcomeThread({
        currentProblem: "too much on my mind",
        pendingAction: "Open Clear My Mind",
      }),
    );
    expect(hint).toMatch(/FORBIDDEN/i);
    expect(hint).toMatch(/What would you like help with/i);
  });

  it("fallback continues thread instead of resetting", () => {
    const msg = threadAwareAcceptanceFallback(
      patchOutcomeThread({ pendingAction: "Open Decision Compass" }),
    );
    expect(msg).not.toMatch(/what would you like help with next/i);
    expect(msg).toMatch(/Decision Compass/i);
  });

  it("consumes pending invitation after resolution", () => {
    registerPendingOffer({
      offerSummary: "Choose one focus task",
      pendingQuestion: "Would you like to choose one small task?",
    });
    consumePendingInvitation();
    const thread = getOutcomeThread();
    expect(thread?.pendingQuestion).toBeUndefined();
    expect(thread?.pendingAction).toBeUndefined();
  });

  it("fallback advances yes/no question without echoing current problem", () => {
    const msg = threadAwareAcceptanceFallback(
      patchOutcomeThread({
        pendingQuestion: "Would you like to choose one small task?",
        currentProblem: "Picking up its only 9:30 am",
      }),
    );
    expect(msg).toMatch(/one thing/i);
    expect(msg).not.toMatch(/9:30/i);
  });

  it("detects topic change", () => {
    expect(topicChangeClearsThread("actually let's talk about pricing")).toBe(
      true,
    );
    expect(topicChangeClearsThread("yes")).toBe(false);
  });
});
