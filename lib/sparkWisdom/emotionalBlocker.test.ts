import { describe, expect, it } from "vitest";
import {
  assessEmotionalBlockerDepth,
  recommendEmotionalBlocker,
} from "./emotionalBlocker";

describe("emotionalBlocker", () => {
  it("explores procrastination on taxes", () => {
    const cue = recommendEmotionalBlocker(
      "I've been procrastinating on my taxes.",
    );
    expect(cue?.depth).toBe("explore");
    expect(cue?.guidance).toMatch(/lighter before productive/i);
  });

  it("detects can't get started patterns", () => {
    expect(assessEmotionalBlockerDepth("I can't get started.")).toBe("explore");
    expect(
      assessEmotionalBlockerDepth("I know what I need to do, but I'm avoiding it."),
    ).toBe("explore");
  });

  it("honors explicit timer requests without deep excavation", () => {
    const cue = recommendEmotionalBlocker("Start a 25 minute timer for writing.");
    expect(cue).toBeNull();
    expect(
      assessEmotionalBlockerDepth(
        "I've been procrastinating — can you start a timer for me?",
      ),
    ).toBe("honor_practical");
  });

  it("does not therapize vent-only messages", () => {
    expect(
      recommendEmotionalBlocker("Just venting — don't need advice right now."),
    ).toBeNull();
  });

  it("does not block print requests", () => {
    expect(recommendEmotionalBlocker("Can you print this for me?")).toBeNull();
  });
});
