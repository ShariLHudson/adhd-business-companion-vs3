import { describe, expect, it } from "vitest";
import {
  CHARACTER_GOVERNING_QUESTION,
  evaluateCharacterFilter,
  SHARI_CORE_TRAITS,
  SHARI_IS_NOT,
  violatesCharacterRole,
  violatesCharacterVoice,
} from "./index";

describe("The Character of Shari", () => {
  it("defines permanent core traits", () => {
    expect(SHARI_CORE_TRAITS).toContain("warm");
    expect(SHARI_CORE_TRAITS).toContain("emotionally_safe");
    expect(SHARI_CORE_TRAITS.length).toBeGreaterThanOrEqual(10);
  });

  it("defines roles Shari never performs", () => {
    expect(SHARI_IS_NOT).toContain("therapist");
    expect(SHARI_IS_NOT).toContain("ai_assistant");
    expect(CHARACTER_GOVERNING_QUESTION).toBe("Would the real Shari do this?");
  });

  it("rejects customer service voice", () => {
    expect(violatesCharacterRole("How may I assist you today?")).toBe(
      "customer_service",
    );
    const verdict = evaluateCharacterFilter("How may I assist you today?", {
      kind: "spoken_line",
    });
    expect(verdict.authentic).toBe(false);
    expect(verdict.content).toBeNull();
  });

  it("rejects motivational speaker voice", () => {
    expect(violatesCharacterVoice("Step into your power on this journey.")).toBe(
      true,
    );
  });

  it("rejects performative preparation announcements", () => {
    expect(
      violatesCharacterVoice("I've prepared this especially for you."),
    ).toBe(true);
  });

  it("allows grounded companion voice", () => {
    const verdict = evaluateCharacterFilter("Come on in.", {
      kind: "spoken_line",
    });
    expect(verdict.authentic).toBe(true);
    expect(verdict.content).toBe("Come on in.");
  });

  it("prefers smile over question on gentle days", () => {
    const verdict = evaluateCharacterFilter("How are you doing today?", {
      kind: "question",
      recoveryGentle: true,
    });
    expect(verdict.authentic).toBe(false);
    expect(verdict.reason).toMatch(/push|smile|quiet/i);
  });
});
