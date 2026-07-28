/**
 * Conversation fallback guard — the generic "Here's a practical way to
 * approach…" scaffold must not fire for bare affirmations / continuations or
 * for unresolved contextual questions. Genuine how-to / planning / explanation
 * intent still receives substantive fail-safe guidance.
 */
import { describe, expect, it } from "vitest";
import { buildAnswerFirstFailSafeReply } from "./failSafeReply";
import { isBareGenericAcceptance } from "@/lib/pendingAcceptanceAuthority";

const SCAFFOLD = "practical way to approach";

describe("buildAnswerFirstFailSafeReply — generic scaffold guard", () => {
  const protectedReplies = [
    "yes",
    "okay",
    "go ahead",
    "that one",
    "try it",
    "yes lets try it",
    "let's try it",
    "where did the strategies go",
  ];

  it("returns null for bare affirmations and unresolved contextual questions", () => {
    for (const reply of protectedReplies) {
      expect(
        buildAnswerFirstFailSafeReply(reply),
        `expected null for "${reply}"`,
      ).toBeNull();
    }
  });

  it("never emits the exact scaffold string for any protected reply", () => {
    for (const reply of protectedReplies) {
      const out = buildAnswerFirstFailSafeReply(reply) ?? "";
      expect(out, `scaffold leaked for "${reply}"`).not.toContain(SCAFFOLD);
    }
  });

  it("bare acceptance returns null regardless of pending state (expired/absent)", () => {
    // The guard takes no pending context — it fires even when no offer exists.
    expect(buildAnswerFirstFailSafeReply("yes")).toBeNull();
    expect(buildAnswerFirstFailSafeReply("try it")).toBeNull();
  });

  const genuine = [
    "how do I write an SOP?",
    "help me plan the steps for launching this",
    "explain how this works",
  ];

  it("still produces substantive guidance for genuine how-to / planning / explanation", () => {
    for (const reply of genuine) {
      const out = buildAnswerFirstFailSafeReply(reply);
      expect(out, `expected guidance for "${reply}"`).not.toBeNull();
      expect((out ?? "").length).toBeGreaterThan(40);
    }
  });
});

describe("shared acceptance vocabulary — 'try it' forms (EC pending-offer parity)", () => {
  it("recognizes the added 'try it' continuation forms", () => {
    for (const form of ["try it", "let's try it", "yes try it", "yes lets try it"]) {
      expect(isBareGenericAcceptance(form), form).toBe(true);
    }
  });

  it("does not swallow ordinary statements or questions", () => {
    expect(isBareGenericAcceptance("where did the strategies go")).toBe(false);
    expect(isBareGenericAcceptance("how do I write an SOP?")).toBe(false);
    expect(isBareGenericAcceptance("i want to try a new pricing idea")).toBe(false);
  });
});
