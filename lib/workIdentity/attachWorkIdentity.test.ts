/**
 * attachWorkIdentityAtCreation — unit tests (Slice 1B).
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

describe("attachWorkIdentityAtCreation — flag on", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_WORK_IDENTITY_V1", "true");
  });

  it("mints a WorkId for a clear, unhedged commitment", () => {
    const id = attachWorkIdentityAtCreation("I want to create a workshop.");
    expect(id).toBeTruthy();
    expect(typeof id).toBe("string");
  });

  it("returns undefined for exploratory language", () => {
    expect(attachWorkIdentityAtCreation("I might create a workshop someday.")).toBeUndefined();
  });

  it("returns undefined for overwhelm-flavored text — recomputes the Support Gate tier internally and honors PAUSE", () => {
    expect(
      attachWorkIdentityAtCreation(
        "I'm overwhelmed about creating a workshop for ADHD entrepreneurs.",
      ),
    ).toBeUndefined();
  });

  it("returns undefined for naming without volition", () => {
    expect(attachWorkIdentityAtCreation("I have an idea for a workshop.")).toBeUndefined();
  });

  it("two calls for two different pieces of work mint two different ids", () => {
    const first = attachWorkIdentityAtCreation("I want to create a workshop.");
    const second = attachWorkIdentityAtCreation("I want to create a newsletter.");
    expect(first).not.toBe(second);
  });
});
