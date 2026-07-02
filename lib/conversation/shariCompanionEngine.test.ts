import { describe, expect, it } from "vitest";

import {
  buildDifficultClientCallOpeningReply,
  buildShariErrorRecoveryResponse,
  detectShariBannedPhrases,
  isDifficultClientCallRequest,
  shariCompanionHintForChat,
  SHARI_BANNED_PHRASE_LABELS,
  SHARI_ERROR_RECOVERY_LINE,
} from "./shariCompanionEngine";

describe("Shari Companion Engine™", () => {
  it("flags generic AI banned phrases", () => {
    expect(detectShariBannedPhrases("Let's break this down step by step")).not.toEqual(
      [],
    );
    expect(detectShariBannedPhrases("That sounds tough.")).not.toEqual([]);
    expect(
      detectShariBannedPhrases("I can see why you don't want to make that call."),
    ).toEqual([]);
  });

  it("detects difficult client call requests", () => {
    expect(
      isDifficultClientCallRequest(
        "I need to make a call to a difficult client but I don't want to do it.",
      ),
    ).toBe(true);
  });

  it("hints emotion-before-script for difficult client call", () => {
    const hint = shariCompanionHintForChat({
      userText:
        "I need to make a call to a difficult client but I don't want to do it.",
    });
    expect(hint).toMatch(/DIFFICULT CLIENT CALL/i);
    expect(hint).toMatch(/practice/i);
    expect(hint).not.toMatch(/break this down/i);
    expect(hint).toMatch(/Reflect/i);
  });

  it("uses conflict memory when provided", () => {
    const hint = shariCompanionHintForChat({
      userText: "I'm scared of this conflict conversation",
      memberDislikesConflict: true,
    });
    expect(hint).toMatch(/conflict feels especially hard/i);
  });

  it("error recovery sounds like Shari not software", () => {
    const msg = buildShariErrorRecoveryResponse();
    expect(msg).toContain(SHARI_ERROR_RECOVERY_LINE);
    expect(msg).not.toMatch(/error|failed|try again later/i);
  });

  it("difficult client call opening matches rewrite gold standard", () => {
    const reply = buildDifficultClientCallOpeningReply();
    expect(reply).toMatch(/don't want to make that call/i);
    expect(reply).toMatch(/boundary conversation/i);
    expect(reply).toMatch(/practice/i);
    expect(detectShariBannedPhrases(reply)).toEqual([]);
  });

  it("documents banned phrase list for QA", () => {
    expect(SHARI_BANNED_PHRASE_LABELS).toContain("Let's break it down");
    expect(SHARI_BANNED_PHRASE_LABELS.length).toBeGreaterThanOrEqual(8);
  });
});
