/**
 * ADR-012 Phase 4b — canonical Support Style ids are the only supported
 * runtime/wire values. Proves the two alphabets are correctly resolved to
 * ONE canonical value, and can no longer typecheck against the same field
 * (the type-level guarantee lives in lib/companionStore.ts's narrowed
 * `SupportStyle` type; these tests prove the runtime resolution it enables).
 */
import { describe, expect, it } from "vitest";
import { resolveCompanionDeliveryPreferences } from "./companionDeliveryContract";
import type { SupportStyleId } from "./supportStyle/types";

describe("resolveCompanionDeliveryPreferences — canonical vs. legacy alphabet", () => {
  const CANONICAL_IDS: SupportStyleId[] = [
    "gentle-first",
    "practical-first",
    "talk-it-through",
    "step-by-step",
    "give-me-choices",
    "adaptive",
    "custom",
  ];

  it.each(CANONICAL_IDS)(
    "canonical id %s survives unchanged when sent alone",
    (id) => {
      const resolved = resolveCompanionDeliveryPreferences({ supportStyleId: id });
      expect(resolved.supportStyleId).toBe(id);
      expect(resolved.sentCanonicalSupportStyleId).toBe(true);
    },
  );

  it.each([
    ["solutions", "practical-first"],
    ["understand", "gentle-first"],
    ["sos", "gentle-first"],
    ["listen", "talk-it-through"],
    ["balanced", "adaptive"],
  ] as const)(
    "legacy value %s normalizes once to canonical %s when no canonical id is sent",
    (legacy, expectedCanonical) => {
      const resolved = resolveCompanionDeliveryPreferences({ supportStyle: legacy });
      expect(resolved.supportStyleId).toBe(expectedCanonical);
      expect(resolved.sentCanonicalSupportStyleId).toBe(false);
    },
  );

  it("a canonical id wins over a legacy mirror sent in the same request", () => {
    const resolved = resolveCompanionDeliveryPreferences({
      supportStyleId: "talk-it-through",
      supportStyle: "solutions", // stale/unrelated legacy mirror — ignored
    });
    expect(resolved.supportStyleId).toBe("talk-it-through");
    expect(resolved.sentCanonicalSupportStyleId).toBe(true);
  });

  it("an unrecognized string in either field normalizes to the adaptive default, never passes through raw", () => {
    const resolved = resolveCompanionDeliveryPreferences({
      supportStyleId: "not-a-real-style",
      supportStyle: "also-not-real",
    });
    expect(resolved.supportStyleId).toBe("adaptive");
  });

  it("legacy normalization is idempotent — resolving twice gives the same canonical id", () => {
    const once = resolveCompanionDeliveryPreferences({ supportStyle: "understand" });
    const twice = resolveCompanionDeliveryPreferences({
      supportStyle: once.supportStyleLegacy,
    });
    expect(twice.supportStyleId).toBe(once.supportStyleId);
  });

  it("legacyListenOnly is true only for a legacy-only 'listen' request", () => {
    expect(
      resolveCompanionDeliveryPreferences({ supportStyle: "listen" }).legacyListenOnly,
    ).toBe(true);
    expect(
      resolveCompanionDeliveryPreferences({
        supportStyleId: "talk-it-through",
        supportStyle: "listen",
      }).legacyListenOnly,
    ).toBe(false);
  });
});
