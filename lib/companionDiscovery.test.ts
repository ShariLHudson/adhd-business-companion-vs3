import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  completeFirstVisit,
  discoveryProgressSummary,
  getDiscoveryStore,
  nextFirstVisitQuestion,
  nextProgressiveQuestion,
  recordDiscoveryAnswer,
  restartDiscovery,
  skipDiscoveryQuestion,
  writeDiscoveryStore,
} from "./companionDiscovery";
import { getPrefs } from "./companionStore";
import { getSupportStylePreference } from "./supportStyle";

describe("companionDiscovery", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    const storage = {
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
    };
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
      // lib/supportStyle/prefs.ts reads/writes window.localStorage
      // specifically (not just the global) — same backing store as below.
      localStorage: storage,
    });
    vi.stubGlobal("localStorage", storage);
    restartDiscovery();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-12T10:00:00Z"));
  });

  it("shows first-visit questions in order", () => {
    expect(nextFirstVisitQuestion()?.id).toBe("why-here");
    recordDiscoveryAnswer("why-here", "Focus");
    expect(nextFirstVisitQuestion()?.id).toBe("describes-you");
  });

  it("completes first visit when all three are answered or skipped", () => {
    skipDiscoveryQuestion("why-here");
    recordDiscoveryAnswer("describes-you", "Coach");
    skipDiscoveryQuestion("remember-things");
    expect(getDiscoveryStore().firstVisitComplete).toBe(true);
    expect(nextFirstVisitQuestion()).toBeNull();
  });

  it("limits progressive questions to one per session after meaningful usage", () => {
    completeFirstVisit();
    writeDiscoveryStore({ firstVisitComplete: true, welcomeSeen: true, lastAskedSession: null });
    const q1 = nextProgressiveQuestion({ hasMeaningfulUsage: true });
    expect(q1?.id).toBe("business-name");
    recordDiscoveryAnswer("business-name", "Visual Spark");
    const q2 = nextProgressiveQuestion({ hasMeaningfulUsage: true });
    expect(q2).toBeNull();
  });

  it("does not show progressive questions before meaningful usage", () => {
    writeDiscoveryStore({ firstVisitComplete: true, welcomeSeen: true });
    expect(nextProgressiveQuestion({ hasMeaningfulUsage: false })).toBeNull();
  });

  it("reports discoveries made without counting skips", () => {
    recordDiscoveryAnswer("why-here", "Planning");
    skipDiscoveryQuestion("describes-you");
    expect(discoveryProgressSummary()).toEqual({
      discoveriesMade: 1,
      label: "1 discovery made",
    });
  });

  it("ADR-012 Phase 4b — an overwhelm answer updates the CANONICAL Support Style store, not just the legacy mirror", () => {
    // Before Phase 4b this wrote only Prefs.supportStyle = "sos" via savePrefs,
    // never touching the canonical store every chat surface actually reads —
    // so the onboarding signal never reached a real turn. It now goes through
    // saveSupportStylePreference, which updates both in one place.
    recordDiscoveryAnswer("why-here", "I feel so overwhelmed by everything");
    expect(getSupportStylePreference().styleId).toBe("gentle-first");
    // Legacy mirror stays in sync — "understand", not the old "sos" — and
    // "sos"/"understand" both resolve to gentle-first, so routing/delivery
    // guidance built from either value is unchanged.
    expect(getPrefs().supportStyle).toBe("understand");
  });
});
