import { describe, expect, it } from "vitest";
import {
  buildCanonicalEmotionalLocalReply,
  evaluateEmotionalFirstActionSecond,
} from "./evaluateEmotionalFirstActionSecond";
import { emotionalFirstActionSecondHintForChat } from "./emotionalFirstActionSecondHintForChat";
import { EMOTIONAL_FIRST_GOVERNING_QUESTION } from "./types";

describe("emotionalFirstActionSecond", () => {
  it("uses task-first depth for create newsletter", () => {
    const d = evaluateEmotionalFirstActionSecond({
      userText: "Help me create a newsletter",
    });
    expect(d.depth).toBe("task_first");
    const hint = emotionalFirstActionSecondHintForChat({
      userText: "Help me create a newsletter",
    });
    expect(hint).toContain("Task-first");
    expect(hint).not.toContain("Pomodoro");
  });

  it("uses emotional-first for can't get anything done", () => {
    const d = evaluateEmotionalFirstActionSecond({
      userText: "I can't get anything done.",
    });
    expect(d.depth).toBe("emotional_first");
    expect(buildCanonicalEmotionalLocalReply("I can't get anything done.")).toContain(
      "carrying too much",
    );
  });

  it("includes governing question in hint", () => {
    const hint = emotionalFirstActionSecondHintForChat({
      userText: "I wasted another day.",
    });
    expect(hint).toContain(EMOTIONAL_FIRST_GOVERNING_QUESTION);
    expect(hint).toContain("curious instead of critical");
  });

  it("handles I just can't without pushing action", () => {
    const reply = buildCanonicalEmotionalLocalReply("I just can't.");
    expect(reply).toContain("tomorrow");
  });

  it("flags help me focus for diagnose-first", () => {
    const hint = emotionalFirstActionSecondHintForChat({
      userText: "Help me focus",
    });
    expect(hint).toMatch(/Diagnose|overwhelmed|ashamed/i);
  });
});
