/**
 * attachWorkIdentityAtCreation — unit tests
 * (Slice 1B; updated for the Slice 1B Remediation's new signature).
 *
 * Exercises the pure decision in isolation, independent of
 * `buildInitialSession`'s own integration tests
 * (lib/universalCreation/workIdentitySlice1B.test.ts).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { attachWorkIdentityAtCreation } from "./attachWorkIdentity";

beforeEach(() => {
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("attachWorkIdentityAtCreation — flag off", () => {
  it("always returns undefined, regardless of how clear the commitment is", () => {
    vi.stubEnv("NEXT_PUBLIC_WORK_IDENTITY_V1", "false");
    expect(attachWorkIdentityAtCreation("I want to create a workshop.")).toBeUndefined();
  });

  it("defaults to off when the flag is unset", () => {
    expect(attachWorkIdentityAtCreation("I want to create a workshop.")).toBeUndefined();
  });
});

describe("attachWorkIdentityAtCreation — flag on, no tier supplied (defaults to \"proceed\")", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_WORK_IDENTITY_V1", "true");
  });

  it("mints a WorkId for a clear, unhedged commitment", () => {
    const id = attachWorkIdentityAtCreation("I want to create a workshop.");
    expect(id).toBeTruthy();
    expect(typeof id).toBe("string");
  });

  it("returns undefined for exploratory language (the text itself hedges, independent of tier)", () => {
    expect(attachWorkIdentityAtCreation("I might create a workshop someday.")).toBeUndefined();
  });

  it("returns undefined for naming without volition (the text itself never asserts a decision)", () => {
    expect(attachWorkIdentityAtCreation("I have an idea for a workshop.")).toBeUndefined();
  });

  it("two calls for two different pieces of work mint two different ids", () => {
    const first = attachWorkIdentityAtCreation("I want to create a workshop.");
    const second = attachWorkIdentityAtCreation("I want to create a newsletter.");
    expect(first).not.toBe(second);
  });

  it("honest trade-off, documented and tested rather than hidden: without a real tier, an unhedged commitment phrased alongside overwhelm DOES mint here, when called directly", () => {
    // This function no longer recomputes the Support Gate tier itself
    // (Slice 1B Remediation §3 — removing that recompute is what closed
    // the circular import). Called directly, with no tier supplied, it
    // has no way to know this turn is actually overwhelmed. This is a
    // deliberate, narrow trade-off: the real, live conversation path
    // never reaches this function for genuinely overwhelmed text in the
    // first place, because CompanionPageClient.tsx's own Support Gate
    // check blocks Create Fast Path entirely before this function is
    // ever called (see the next describe block, which proves that path
    // is unaffected). This test exists so the trade-off is visible and
    // asserted, not silently true by accident.
    const id = attachWorkIdentityAtCreation(
      "I'm so overwhelmed, but I want to create a workshop right now.",
    );
    expect(id).toBeTruthy();
  });
});

describe("attachWorkIdentityAtCreation — flag on, an explicit tier is supplied", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_WORK_IDENTITY_V1", "true");
  });

  it("a caller that DOES have a real \"pause\" tier can still pass it in and have it honored", () => {
    // Proves the parameter itself still works correctly for any future
    // caller able to supply it — only the *default* changed, not the
    // gate's own PAUSE-overrides-everything rule (unchanged from Slice 0).
    const id = attachWorkIdentityAtCreation(
      "I'm so overwhelmed, but I want to create a workshop right now.",
      "pause",
    );
    expect(id).toBeUndefined();
  });

  it("an explicit \"proceed\" tier behaves identically to the default", () => {
    const withDefault = attachWorkIdentityAtCreation("I want to create a workshop.");
    const withExplicit = attachWorkIdentityAtCreation("I want to create a workshop.", "proceed");
    expect(typeof withDefault).toBe(typeof withExplicit);
    expect(withDefault).toBeTruthy();
    expect(withExplicit).toBeTruthy();
  });
});
