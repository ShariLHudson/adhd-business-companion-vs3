import { describe, expect, it } from "vitest";
import { memoryCueFromLastActivity } from "./homeMemoryCue";
import type { LastActivity } from "./companionStore";

describe("memoryCueFromLastActivity", () => {
  it("formats chat memory as one line", () => {
    const act: LastActivity = {
      kind: "chat",
      title: "your ADHD VIP offer",
      ts: new Date().toISOString(),
    };
    expect(memoryCueFromLastActivity(act)).toBe(
      "Last time we talked about your ADHD VIP offer.",
    );
  });

  it("uses summary when provided", () => {
    const act: LastActivity = {
      kind: "chat",
      title: "Workshop",
      summary: "I remember your workshop",
      ts: new Date().toISOString(),
    };
    expect(memoryCueFromLastActivity(act)).toBe("I remember your workshop.");
  });

  it("returns null without title", () => {
    expect(memoryCueFromLastActivity(null)).toBeNull();
  });
});
