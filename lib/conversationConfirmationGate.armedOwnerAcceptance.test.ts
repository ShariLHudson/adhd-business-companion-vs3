/**
 * MA-04 Phase 2a — isShortAcceptanceOfArmedOwner unit matrix.
 *
 * The predicate answers ONE question: "does this reply look like a short
 * acceptance of the already-armed owner?" It is pure, deterministic, owner-aware,
 * conservative, and cannot arm/resume/decide anything. It must never treat
 * generic agreement as acceptance when no owner is armed.
 */

import { describe, expect, it } from "vitest";
import {
  isBareShortAcceptanceText,
  isShortAcceptanceOfArmedOwner,
  isConfirmationAcceptance,
  isActiveQuestionAcceptance,
} from "./conversationConfirmationGate";
import { isBareGenericAcceptance } from "./pendingAcceptanceAuthority";

const ARMED = { status: "awaiting_user" } as const;

describe("isShortAcceptanceOfArmedOwner — positives with an armed owner", () => {
  const POSITIVES = [
    "yes",
    "yes please",
    "okay",
    "ok",
    "sure",
    "go ahead",
    "do it",
    "let's do it",
    "sounds good",
    "that works",
    "please",
    "absolutely",
  ];
  it.each(POSITIVES)("accepts %j when an owner is armed", (text) => {
    expect(isShortAcceptanceOfArmedOwner(text, ARMED)).toBe(true);
  });
});

describe("isShortAcceptanceOfArmedOwner — negatives (even with an armed owner)", () => {
  const NEGATIVES = [
    "no",
    "not yet",
    "maybe",
    "I'm not sure",
    "what do you mean?",
    "why?",
    "yes, but I want to talk about pricing instead",
    "okay, I'm overwhelmed",
    "sure, cancel that",
    "yes, never mind",
    "go ahead with the other thing",
    "they need to know",
    "sounds good to me generally",
  ];
  it.each(NEGATIVES)("rejects %j", (text) => {
    expect(isShortAcceptanceOfArmedOwner(text, ARMED)).toBe(false);
  });
});

describe("owner-awareness (context)", () => {
  it("same reply with NO armed owner → false", () => {
    expect(isShortAcceptanceOfArmedOwner("yes", null)).toBe(false);
    expect(isShortAcceptanceOfArmedOwner("yes", undefined)).toBe(false);
    expect(isShortAcceptanceOfArmedOwner("yes", false)).toBe(false);
  });
  it("armed owner expired/cleared → false", () => {
    expect(isShortAcceptanceOfArmedOwner("yes", { status: "completed" })).toBe(false);
    expect(isShortAcceptanceOfArmedOwner("yes", { active: false })).toBe(false);
  });
  it("owner awaiting_user → eligible", () => {
    expect(isShortAcceptanceOfArmedOwner("yes", { status: "awaiting_user" })).toBe(true);
  });
  it("owner not awaiting_user → false", () => {
    expect(isShortAcceptanceOfArmedOwner("yes", { status: "active" })).toBe(false);
    expect(isShortAcceptanceOfArmedOwner("yes", { status: "paused" })).toBe(false);
  });
  it("legacy active flag and bare boolean are honored", () => {
    expect(isShortAcceptanceOfArmedOwner("yes", { active: true })).toBe(true);
    expect(isShortAcceptanceOfArmedOwner("yes", true)).toBe(true);
  });
});

describe("conservatism (disqualifiers beat acceptance)", () => {
  it("explicit cancellation beats acceptance", () => {
    expect(isShortAcceptanceOfArmedOwner("sure, cancel that", ARMED)).toBe(false);
    expect(isShortAcceptanceOfArmedOwner("yes, never mind", ARMED)).toBe(false);
  });
  it("explicit topic switch beats acceptance", () => {
    expect(
      isShortAcceptanceOfArmedOwner("go ahead with the other thing", ARMED),
    ).toBe(false);
    expect(
      isShortAcceptanceOfArmedOwner("yes, but talk about pricing instead", ARMED),
    ).toBe(false);
  });
  it("clarification beats acceptance", () => {
    expect(isShortAcceptanceOfArmedOwner("what do you mean?", ARMED)).toBe(false);
    expect(isShortAcceptanceOfArmedOwner("why?", ARMED)).toBe(false);
  });
  it("emotional interruption is not consumed as acceptance", () => {
    expect(isShortAcceptanceOfArmedOwner("okay, I'm overwhelmed", ARMED)).toBe(false);
  });
});

describe("normalization & robustness", () => {
  it("punctuation / capitalization / whitespace", () => {
    expect(isShortAcceptanceOfArmedOwner("  YES!!  ", ARMED)).toBe(true);
    expect(isShortAcceptanceOfArmedOwner("Okay.", ARMED)).toBe(true);
    expect(isShortAcceptanceOfArmedOwner("SURE", ARMED)).toBe(true);
  });
  it("contractions and apostrophe variants", () => {
    expect(isShortAcceptanceOfArmedOwner("let’s do it", ARMED)).toBe(true); // curly '
    expect(isShortAcceptanceOfArmedOwner("lets do it", ARMED)).toBe(true); // no apostrophe
  });
  it("no substring false positives", () => {
    for (const t of ["yesterday", "eyes", "please note the pricing", "notice"]) {
      expect(isShortAcceptanceOfArmedOwner(t, ARMED)).toBe(false);
    }
  });
  it("empty / whitespace → false", () => {
    expect(isShortAcceptanceOfArmedOwner("", ARMED)).toBe(false);
    expect(isShortAcceptanceOfArmedOwner("   ", ARMED)).toBe(false);
  });
});

describe("pure text core mirrors the owner-gated predicate under an armed owner", () => {
  it("isBareShortAcceptanceText is owner-free but same vocabulary", () => {
    expect(isBareShortAcceptanceText("do it")).toBe(true);
    expect(isBareShortAcceptanceText("absolutely")).toBe(true);
    expect(isBareShortAcceptanceText("sure, cancel that")).toBe(false);
    // owner-free core says true; the owner-gated predicate says false w/o owner
    expect(isBareShortAcceptanceText("yes")).toBe(true);
    expect(isShortAcceptanceOfArmedOwner("yes", null)).toBe(false);
  });
});

describe("existing authority predicates are unchanged (re-point preserved behavior)", () => {
  it("isBareGenericAcceptance keeps its vocabulary", () => {
    expect(isBareGenericAcceptance("perfect")).toBe(true); // base token, not in the new supplement
    expect(isBareGenericAcceptance("count me in")).toBe(true);
    expect(isBareGenericAcceptance("do it")).toBe(false); // base never covered bare "do it"
  });
  it("isConfirmationAcceptance keeps its start-anchored behavior", () => {
    expect(isConfirmationAcceptance("yes")).toBe(true);
    expect(isConfirmationAcceptance("do it")).toBe(true);
  });
  it("isActiveQuestionAcceptance keeps continue/next/that one", () => {
    expect(isActiveQuestionAcceptance("continue")).toBe(true);
    expect(isActiveQuestionAcceptance("that one")).toBe(true);
  });
});
