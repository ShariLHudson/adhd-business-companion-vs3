import { describe, expect, it } from "vitest";
import { getChamberMemberById } from "./chamberMemberRegistry";
import {
  chamberMemberTalkLabel,
  getChamberMemberCardDisplay,
} from "./chamberMemberCardDisplay";
import {
  CHAMBER_SHARED_RESPONSE_POLICY,
  chamberMemberHintForChat,
} from "./chamberMemberPrompt";

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
  it("keeps finance identity with answer-first Chamber policy", () => {
    const member = getChamberMemberById("finance");
    const hint = chamberMemberHintForChat(member!);
    expect(hint).toContain("Finance Intelligence");
    expect(hint).toContain("CHAMBER MEMBER ACTIVE");
    expect(hint).toContain("not ChatGPT");
    expect(hint).toContain("Shari remains the speaking voice");
    expect(hint).toContain("CHAMBER SHARED RESPONSE POLICY");
    expect(hint).toContain("Answer first");
    expect(hint).toContain("CLEAR OBJECTIVE RULE");
    expect(hint).toContain("NOT Talk It Out");
    expect(hint).toContain("I'm here — tell me what you need");
    expect(hint).toContain("Stay strictly on-topic");
    expect(hint).toContain("SILENT CHECK");
    expect(hint).toContain("DISABLED FALLBACK");
    expect(hint).toContain("Which platform matters most");
    expect(hint).not.toContain("ONE good follow-up question");
    expect(hint).not.toMatch(/You are NOT Shari/);
    expect(CHAMBER_SHARED_RESPONSE_POLICY).toContain(
      "Answer first when the objective is already clear",
    );
    expect(CHAMBER_SHARED_RESPONSE_POLICY).toContain("from THIS member");
  });
});
