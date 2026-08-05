/**
 * ADR-012 Phase 4b — the explicit legacy migration boundary in getPrefs().
 *
 * Prefs.supportStyle is now typed to the narrowed legacy alphabet only
 * (solutions | understand | balanced | sos | listen). This proves getPrefs()
 * normalizes whatever was actually persisted — including values that predate
 * the narrowing — back to a guaranteed-valid legacy value, and that the
 * round trip is idempotent.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPrefs } from "./companionStore";

const PREFS_KEY = "companion-prefs-v1";

function stubStoredPrefs(supportStyle: string) {
  const mem = new Map<string, string>([
    [PREFS_KEY, JSON.stringify({ supportStyle })],
  ]);
  vi.stubGlobal("window", { dispatchEvent: vi.fn() });
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
    clear: () => {
      mem.clear();
    },
  });
}

describe("getPrefs() — Support Style legacy migration boundary", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(["solutions", "understand", "balanced", "listen"])(
    "already-valid, round-trip-stable legacy value %s passes through unchanged",
    (value) => {
      stubStoredPrefs(value);
      expect(getPrefs().supportStyle).toBe(value);
    },
  );

  it("'sos' — a legacy value only ever WRITTEN, never produced by legacySupportStyleFromId — normalizes to its stable equivalent 'understand'", () => {
    // Both "sos" and "understand" map to the same canonical style
    // (gentle-first), so this is a stable, behavior-preserving normalization,
    // not data loss — it just collapses the alphabet to values the round
    // trip can reproduce.
    stubStoredPrefs("sos");
    expect(getPrefs().supportStyle).toBe("understand");
  });

  it("a canonical id written before Phase 4b's narrowing normalizes to a valid legacy value on read", () => {
    stubStoredPrefs("gentle-first");
    // legacySupportStyleFromId(supportStyleIdFromLegacy("gentle-first")) → "understand"
    expect(getPrefs().supportStyle).toBe("understand");
  });

  it("garbage in storage normalizes to the adaptive-equivalent legacy default instead of passing through raw", () => {
    stubStoredPrefs("not-a-real-value");
    expect(getPrefs().supportStyle).toBe("balanced");
  });

  it("normalization is idempotent — reading twice is stable", () => {
    stubStoredPrefs("sos");
    const first = getPrefs().supportStyle;
    stubStoredPrefs(first);
    const second = getPrefs().supportStyle;
    expect(second).toBe(first);
  });
});
