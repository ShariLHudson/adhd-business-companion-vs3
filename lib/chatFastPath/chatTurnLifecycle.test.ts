import { describe, expect, it, vi } from "vitest";
import {
  createChatTurnState,
  finalizeChatTurn,
  guaranteeChatTurnCompletion,
  markAssistantReplied,
  markChatTurnLoading,
  markChatTurnStarted,
  needsFailSafeAssistantReply,
} from "./chatTurnLifecycle";
import { buildFailSafeChatReply } from "./chatTurnGuarantee";

describe("chat turn lifecycle", () => {
  it("1. normal chat — finalize runs once", () => {
    const state = createChatTurnState();
    markChatTurnStarted(state);
    markChatTurnLoading(state);
    markAssistantReplied(state);

    const finish = vi.fn();
    guaranteeChatTurnCompletion({
      state,
      ensureVisibleReply: vi.fn(),
      finish,
    });

    expect(finish).toHaveBeenCalledTimes(1);
    expect(needsFailSafeAssistantReply(state)).toBe(false);
  });

  it("2. estate navigation — loading not started skips fail-safe copy", () => {
    const state = createChatTurnState();
    markChatTurnStarted(state);
    const ensureVisibleReply = vi.fn();
    const finish = vi.fn();

    guaranteeChatTurnCompletion({ state, ensureVisibleReply, finish });

    expect(ensureVisibleReply).not.toHaveBeenCalled();
    expect(finish).toHaveBeenCalledTimes(1);
  });

  it("3. fast path — loading started without reply triggers fail-safe", () => {
    const state = createChatTurnState();
    markChatTurnStarted(state);
    markChatTurnLoading(state);

    let appended = "";
    guaranteeChatTurnCompletion({
      state,
      ensureVisibleReply: () => {
        appended = buildFailSafeChatReply("hello");
        markAssistantReplied(state);
      },
      finish: () => finalizeChatTurn(state, () => {}),
    });

    expect(appended.length).toBeGreaterThan(5);
    expect(state.finalized).toBe(true);
  });

  it("4. error mid-flow — guarantee still finalizes", () => {
    const state = createChatTurnState();
    markChatTurnStarted(state);
    markChatTurnLoading(state);

    const finish = vi.fn();
    guaranteeChatTurnCompletion({
      state,
      ensureVisibleReply: () => markAssistantReplied(state),
      finish,
    });

    expect(finish).toHaveBeenCalledTimes(1);
  });

  it("5. early return branch — only one finalization allowed", () => {
    const state = createChatTurnState();
    markChatTurnStarted(state);
    const finish = vi.fn();

    finalizeChatTurn(state, finish);
    finalizeChatTurn(state, finish);
    guaranteeChatTurnCompletion({
      state,
      ensureVisibleReply: vi.fn(),
      finish,
    });

    expect(finish).toHaveBeenCalledTimes(1);
  });
});
