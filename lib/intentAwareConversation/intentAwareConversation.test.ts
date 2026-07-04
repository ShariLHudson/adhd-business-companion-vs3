/**
 * Intent-Aware Conversation Framework tests
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectConversationDepth,
  detectConversationPurpose,
  evaluateIntentAwareConversation,
  intentAwareConversationHintForChat,
  saveIntentAwareSession,
  TASK_FORBIDDEN_QUESTIONS,
} from "./index";

describe("intentAwareConversation", () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => storage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete storage[key];
      }),
    });
    saveIntentAwareSession({
      version: 1,
      sessionPurpose: null,
      sessionDepth: null,
      startedAtTurn: null,
    });
  });

  it("detects create purpose as task depth", () => {
    expect(detectConversationPurpose("Help me create a newsletter")).toBe(
      "create",
    );
    expect(
      detectConversationDepth({ userText: "Help me create a newsletter" }),
    ).toBe("task");
  });

  it("detects guidance depth for stuck signals", () => {
    expect(
      detectConversationDepth({ userText: "I'm stuck and don't know where to start" }),
    ).toBe("guidance");
  });

  it("detects reflection depth for overwhelm", () => {
    expect(
      detectConversationDepth({
        userText: "I'm overwhelmed and feel discouraged",
        overwhelmed: true,
      }),
    ).toBe("reflection");
  });

  it("detects exploration depth for journal invitation", () => {
    expect(
      detectConversationDepth({ userText: "I just want to journal and talk" }),
    ).toBe("exploration");
  });

  it("honors task focus — forbids coaching detours", () => {
    const eval_ = evaluateIntentAwareConversation({
      userText: "Help me write an email",
      currentTurn: 5,
    });
    expect(eval_.honorTaskFocus).toBe(true);
    expect(eval_.maxQuestions).toBe(1);
    expect(eval_.forbiddenQuestionPatterns).toEqual(
      expect.arrayContaining([...TASK_FORBIDDEN_QUESTIONS]),
    );
  });

  it("remembers session purpose across turns", () => {
    evaluateIntentAwareConversation({
      userText: "Help me create an SOP",
      currentTurn: 3,
    });
    const eval2 = evaluateIntentAwareConversation({
      userText: "The audience is new VAs",
      currentTurn: 4,
    });
    expect(eval2.sessionPurpose).toBe("create");
    expect(eval2.honorTaskFocus).toBe(true);
  });

  it("emits mandatory hint with internal check", () => {
    const eval_ = evaluateIntentAwareConversation({
      userText: "Help me create a newsletter",
      currentTurn: 2,
    });
    const hint = intentAwareConversationHintForChat(eval_);
    expect(hint).toMatch(/INTENT-AWARE CONVERSATION/i);
    expect(hint).toMatch(/TASK MODE/i);
    expect(hint).toMatch(/Am I helping — or distracting/i);
    expect(hint).toMatch(/NEVER:.*How are you feeling today/i);
  });
});
