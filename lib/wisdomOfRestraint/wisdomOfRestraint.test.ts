import { describe, expect, it } from "vitest";
import {
  evaluateRestraintFilter,
  userExpressedRoomNeed,
  violatesRestraintVoice,
} from "./index";

describe("Wisdom of Restraint", () => {
  it("suppresses performance and surveillance voice", () => {
    const verdict = evaluateRestraintFilter("I've prepared seven suggestions for you.", {
      kind: "spoken_line",
    });
    expect(verdict.allowed).toBe(false);
    expect(verdict.content).toBeNull();
    expect(violatesRestraintVoice("I've prepared seven suggestions for you.")).toBe(
      true,
    );
  });

  it("suppresses questions after long absence that ask why", () => {
    const verdict = evaluateRestraintFilter("Where have you been?", {
      kind: "question",
      returnIntervalDays: 45,
    });
    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toMatch(/welcome/i);
  });

  it("allows earned wonder questions", () => {
    const verdict = evaluateRestraintFilter(
      "I've been wondering how things have been going.",
      { kind: "question", returnIntervalDays: 2 },
    );
    expect(verdict.allowed).toBe(true);
  });

  it("suppresses room recommendations without expressed need", () => {
    const verdict = evaluateRestraintFilter("The window seat might help.", {
      kind: "room_recommendation",
      tone: "flooded",
      userExpressedNeed: false,
    });
    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toMatch(/stay/i);
  });

  it("allows room recommendations when guest expressed need", () => {
    const verdict = evaluateRestraintFilter("The planning table's open.", {
      kind: "room_recommendation",
      tone: "okay",
      userExpressedNeed: true,
    });
    expect(verdict.allowed).toBe(true);
  });

  it("detects expressed room need from language", () => {
    expect(userExpressedRoomNeed("ready to plan")).toBe(true);
    expect(userExpressedRoomNeed("I am completely overwhelmed")).toBe(false);
    expect(
      userExpressedRoomNeed("I'm overwhelmed and need to clear my mind"),
    ).toBe(true);
    expect(userExpressedRoomNeed("fine")).toBe(false);
  });

  it("prefers silence when presence requests it", () => {
    const verdict = evaluateRestraintFilter("How are you doing today?", {
      kind: "question",
      presencePreferSilence: true,
    });
    expect(verdict.allowed).toBe(false);
  });
});
