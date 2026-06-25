import { describe, expect, it } from "vitest";
import {
  evaluateClearMyMindPresence,
  resolveClearMyMindPresencePhase,
} from "./clearMyMindPresence";

describe("resolveClearMyMindPresencePhase", () => {
  it("listens before share", () => {
    expect(
      resolveClearMyMindPresencePhase({
        stage: "permission",
        shareConfirming: false,
        holdAck: null,
        showingPatterns: false,
      }),
    ).toBe("listening");
  });

  it("thinks immediately after share", () => {
    expect(
      resolveClearMyMindPresencePhase({
        stage: "release",
        shareConfirming: true,
        holdAck: null,
        showingPatterns: false,
      }),
    ).toBe("thinking");
  });

  it("receives after acknowledgment during release", () => {
    expect(
      resolveClearMyMindPresencePhase({
        stage: "release",
        shareConfirming: false,
        holdAck: "Thank you for sharing that.",
        showingPatterns: false,
      }),
    ).toBe("receiving");
  });

  it("returns to listening when patterns appear", () => {
    expect(
      resolveClearMyMindPresencePhase({
        stage: "understanding",
        shareConfirming: false,
        holdAck: null,
        showingPatterns: true,
      }),
    ).toBe("listening");
  });

  it("supports during choice", () => {
    expect(
      resolveClearMyMindPresencePhase({
        stage: "choice",
        shareConfirming: false,
        holdAck: null,
        showingPatterns: true,
      }),
    ).toBe("supporting");
  });

  it("thinks during reflecting unfold", () => {
    expect(
      resolveClearMyMindPresencePhase({
        stage: "release",
        shareConfirming: false,
        holdAck: "I've got it.",
        showingPatterns: false,
        unfoldStep: "reflecting",
      }),
    ).toBe("thinking");
  });

  it("supports at possibility unfold", () => {
    expect(
      resolveClearMyMindPresencePhase({
        stage: "release",
        shareConfirming: false,
        holdAck: "I've got it.",
        showingPatterns: true,
        unfoldStep: "possibility",
      }),
    ).toBe("supporting");
  });
});

describe("evaluateClearMyMindPresence", () => {
  it("uses listening expression before input", () => {
    const result = evaluateClearMyMindPresence("listening");
    expect(result.expression).toBe("listening");
    expect(result.animationState).toBe("listening");
    expect(result.thinkingMessage).toBeTruthy();
  });

  it("uses thinking expression after share", () => {
    const result = evaluateClearMyMindPresence("thinking");
    expect(result.animationState).toBe("thinking");
    expect(result.thinkingMessage).toMatch(/moment|thinking|sit with/i);
  });
});
