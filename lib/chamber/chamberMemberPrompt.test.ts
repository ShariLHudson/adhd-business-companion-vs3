import { describe, expect, it } from "vitest";
import { getChamberMemberById } from "./chamberMemberRegistry";
import {
  chamberMemberTalkLabel,
  getChamberMemberCardDisplay,
} from "./chamberMemberCardDisplay";
import { chamberMemberHintForChat } from "./chamberMemberPrompt";

describe("chamberMemberCardDisplay", () => {
  it("returns curated finance card copy", () => {
    const member = getChamberMemberById("finance");
    expect(member).toBeDefined();
    const display = getChamberMemberCardDisplay(member!);
    expect(display.specialtyLine).toContain("financial friction");
    expect(display.purposeStatement).toContain("simple next steps");
    expect(display.specialties).toContain("Budgeting");
    expect(display.specialties.length).toBeGreaterThanOrEqual(3);
  });

  it("builds talk labels from display names", () => {
    const member = getChamberMemberById("finance");
    expect(chamberMemberTalkLabel(member!)).toBe(
      "Talk With Finance Intelligence",
    );
  });
});

describe("chamberMemberPrompt", () => {
  it("keeps finance identity and ADHD-first rules in chat hint", () => {
    const member = getChamberMemberById("finance");
    const hint = chamberMemberHintForChat(member!);
    expect(hint).toContain("Finance Intelligence");
    expect(hint).toContain("CHAMBER MEMBER ACTIVE");
    expect(hint).toContain("NOT ChatGPT");
    expect(hint).toContain("Reduce friction");
    expect(hint).toContain("ONE clear next step");
  });
});
