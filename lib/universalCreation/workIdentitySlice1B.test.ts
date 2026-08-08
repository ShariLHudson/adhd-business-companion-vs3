/**
 * Work Identity — Slice 1B integration tests.
 *
 * Exercises the real, exported orchestrator functions
 * (`startUniversalCreationTurn`, `advanceUniversalCreation`) — the same
 * "call the real production functions" pattern used throughout this
 * series (see lib/workStatePriority/endToEndFounderJourneys.test.ts) —
 * proving the five requirements from the Slice 1B request, plus that the
 * existing discovery experience itself is untouched.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { advanceUniversalCreation, startUniversalCreationTurn } from "./orchestrator";

function withMemoryStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => mem.set(k, v),
    removeItem: (k: string) => mem.delete(k),
    clear: () => mem.clear(),
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { localStorage: storage });
}

beforeEach(() => {
  withMemoryStorage();
  vi.unstubAllEnvs();
});

describe("Slice 1B — flag ON", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_WORK_IDENTITY_V1", "true");
  });

  it("requirement 1: a clear commitment attaches a work identity to the new session", () => {
    const result = startUniversalCreationTurn(
      "I want to create a client onboarding process.",
      1,
    );
    expect(result).not.toBeNull();
    expect(result?.session.workId).toBeTruthy();
    expect(typeof result?.session.workId).toBe("string");
  });

  it("requirement 2: exploratory language does not attach a work identity", () => {
    const result = startUniversalCreationTurn("I might create a workshop someday.", 1);
    expect(result).not.toBeNull();
    expect(result?.session.workId).toBeUndefined();
  });

  it("requirement 3: overwhelm-flavored text does not attach a work identity", () => {
    // This function's own guarantee is independent of the upstream
    // Support Gate check in CompanionPageClient.tsx (which already
    // prevents Create Fast Path from reaching this function at all for
    // genuinely overwhelmed text) — even called directly, overwhelm
    // never earns an identity on its own.
    const result = startUniversalCreationTurn(
      "I'm overwhelmed about creating a workshop for ADHD entrepreneurs.",
      1,
    );
    expect(result).not.toBeNull();
    expect(result?.session.workId).toBeUndefined();
  });

  it("requirement 5: continuing the same session across multiple turns never re-mints or loses the identity", () => {
    const first = startUniversalCreationTurn(
      "I want to create a client onboarding process.",
      1,
    );
    expect(first).not.toBeNull();
    const originalWorkId = first?.session.workId;
    expect(originalWorkId).toBeTruthy();

    let session = first!.session;
    for (let i = 0; i < 8 && session.phase === "discovery"; i++) {
      const next = advanceUniversalCreation(session, "clients who just signed up");
      if (!next || next.kind === "uncertainty") break;
      expect(next.session.workId).toBe(originalWorkId);
      session = next.session;
    }
    // Whether discovery finished or not within the loop above, the
    // identity attached at creation must be exactly what remains.
    expect(session.workId).toBe(originalWorkId);
  });

  it("two separate, unrelated pieces of work never share an identity", () => {
    const first = startUniversalCreationTurn("I want to create a workshop.", 1);
    const second = startUniversalCreationTurn("I want to create a newsletter.", 2);
    expect(first?.session.workId).toBeTruthy();
    expect(second?.session.workId).toBeTruthy();
    expect(second?.session.workId).not.toBe(first?.session.workId);
  });
});

describe("Slice 1B — flag OFF: requirement 4, existing Create flow is unchanged", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_WORK_IDENTITY_V1", "false");
  });

  it("a clear commitment still enters discovery normally, with no work identity attached", () => {
    const result = startUniversalCreationTurn(
      "I want to create a client onboarding process.",
      1,
    );
    expect(result).not.toBeNull();
    expect(result?.session.workId).toBeUndefined();
    expect(result?.session.phase).toBe("discovery");
    expect(result?.session.originalUserText).toBe(
      "I want to create a client onboarding process.",
    );
  });

  it("discovery continues to advance normally with the flag off", () => {
    const first = startUniversalCreationTurn("I want to create a workshop.", 1);
    expect(first).not.toBeNull();
    const next = advanceUniversalCreation(first!.session, "ADHD entrepreneurs");
    expect(next).not.toBeNull();
    expect(next?.session.workId).toBeUndefined();
  });
});

describe("Slice 1B — flag unset (default)", () => {
  it("defaults to off, matching the documented default in featureFlags.ts", () => {
    const result = startUniversalCreationTurn(
      "I want to create a client onboarding process.",
      1,
    );
    expect(result?.session.workId).toBeUndefined();
  });
});
