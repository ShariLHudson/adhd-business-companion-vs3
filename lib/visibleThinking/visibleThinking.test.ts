import { describe, expect, it } from "vitest";
import { buildVisibleThinkingContext } from "./buildContext";
import { evaluateVisibleThinking } from "./evaluateVisibleThinking";
import { isForbiddenVisibleThinkingMessage } from "./forbidden";
import {
  messagePoolsForKind,
  tierForElapsedMs,
  VISIBLE_THINKING_REVEAL_MS,
} from "./messages";

describe("Visible Thinking", () => {
  it("does not reveal before Relationship Before Speed threshold", () => {
    const msg = evaluateVisibleThinking({
      context: { kind: "general", seed: 1 },
      elapsedMs: VISIBLE_THINKING_REVEAL_MS - 1,
    });
    expect(msg).toBeNull();
  });

  it("reveals natural copy after threshold", () => {
    const msg = evaluateVisibleThinking({
      context: { kind: "general", seed: 2 },
      elapsedMs: 1200,
    });
    expect(msg).toMatch(/second|moment|shared/i);
    expect(isForbiddenVisibleThinkingMessage(msg!)).toBe(false);
  });

  it("evolves across adaptive timing tiers without repeating", () => {
    const context = { kind: "general" as const, seed: 3 };
    const used = new Set<string>();
    const early = evaluateVisibleThinking({
      context,
      elapsedMs: 1000,
      usedMessages: used,
    })!;
    used.add(early);
    const mid = evaluateVisibleThinking({
      context,
      elapsedMs: 3000,
      usedMessages: used,
    })!;
    const late = evaluateVisibleThinking({
      context,
      elapsedMs: 6000,
      usedMessages: new Set([early, mid]),
    })!;
    const extended = evaluateVisibleThinking({
      context,
      elapsedMs: 9000,
      usedMessages: new Set([early, mid, late]),
    })!;

    expect(early).not.toBe(mid);
    expect(mid).not.toBe(late);
    expect(late).not.toBe(extended);
    expect(tierForElapsedMs(1500)).toBe("early");
    expect(tierForElapsedMs(3500)).toBe("mid");
    expect(tierForElapsedMs(6500)).toBe("late");
    expect(tierForElapsedMs(9000)).toBe("extended");
  });

  it("uses research-aware copy for research requests", () => {
    const context = buildVisibleThinkingContext({
      userText: "What are the latest Pinterest trends?",
      emotionalState: "unclear",
    });
    expect(context.kind).toBe("research");
    const msg = evaluateVisibleThinking({
      context,
      elapsedMs: 1500,
    });
    expect(msg).toMatch(/latest information|current/i);
  });

  it("uses gentle copy when user is overwhelmed", () => {
    const context = buildVisibleThinkingContext({
      userText: "I can't do this anymore",
      emotionalState: "overwhelmed",
    });
    expect(context.gentle).toBe(true);
    expect(context.kind).toBe("gentle");
    const msg = evaluateVisibleThinking({
      context,
      elapsedMs: 1500,
    });
    expect(msg).toMatch(/here|breath|thoughtful|rush/i);
  });

  it("uses workspace beside copy only when promised", () => {
    const beside = evaluateVisibleThinking({
      context: {
        kind: "workspace",
        workspaceBeside: true,
        seed: 1,
      },
      elapsedMs: 1500,
    });
    const solo = evaluateVisibleThinking({
      context: {
        kind: "workspace",
        workspaceBeside: false,
        seed: 1,
      },
      elapsedMs: 1500,
    });
    expect(beside).toMatch(/workspace ready|simplest place|one thing at a time/i);
    expect(solo).toMatch(/ready for you|right space/i);
    expect(beside).not.toMatch(/beside us/i);
  });

  it("uses intelligence-aware business copy", () => {
    const context = buildVisibleThinkingContext({
      userText: "How can I grow revenue from my coaching offer?",
      emotionalState: "unclear",
    });
    expect(["business", "multiple"]).toContain(context.kind);
    const msg = evaluateVisibleThinking({
      context,
      elapsedMs: 1500,
    });
    expect(msg).toMatch(/business|pieces|useful/i);
  });

  it("never uses forbidden machine language in pools", () => {
    const kinds = [
      "general",
      "gentle",
      "relationship",
      "memory",
      "planning",
      "business",
      "decision",
      "creative",
      "research",
      "environment",
      "workspace",
      "multiple",
    ] as const;
    for (const kind of kinds) {
      const pools = messagePoolsForKind(kind, { workspaceBeside: true });
      for (const tier of Object.values(pools)) {
        for (const line of tier) {
          expect(isForbiddenVisibleThinkingMessage(line)).toBe(false);
          expect(line).not.toMatch(/^Loading/i);
          expect(line).not.toMatch(/^Processing/i);
        }
      }
    }
  });
});
