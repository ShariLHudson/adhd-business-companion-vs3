/**
 * @vitest-environment jsdom
 *
 * MA-05 Phase 1 — the first-60-day welcome + encouragement selection must be
 * pinned and STABLE for the whole local calendar day: identical across repeated
 * renders, remounts, sign-out/sign-in, and interleaved resolution. Only a new
 * local date rotates. Selections take explicit dayKey/dayIndex so these tests are
 * deterministic and independent of the relationship clock.
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  resolveFirst60Encouragement,
  resolveFirst60WelcomeLine,
} from "./resolveWelcomeCopy";
import {
  clearFirst60ProgressForTests,
  FIRST_60_PROGRESS_STORAGE_KEY,
  loadFirst60Progress,
  writeFirst60Progress,
} from "./progressStore";
import {
  FIRST_60_ENCOURAGEMENTS,
  FIRST_60_WELCOME_LINES,
} from "./catalogs";
import type { First60ProgressState } from "./types";

const DAY = "2026-07-28";
const NEXT_DAY = "2026-07-29";
const IDX = 5;
const NEXT_IDX = 6;
const REAL_WELCOME_ID = FIRST_60_WELCOME_LINES[0]!.id;
const REAL_ENCOURAGEMENT_ID = FIRST_60_ENCOURAGEMENTS[0]!.id;

function seed(partial: Partial<First60ProgressState>): void {
  writeFirst60Progress({
    version: 1,
    exploredIds: [],
    skippedIds: [],
    recentWelcomeIds: [],
    recentEncouragementIds: [],
    lastDiscoveryOfferDay: null,
    lastDiscoveryOfferId: null,
    lastWelcomeDay: null,
    lastWelcomeId: null,
    lastEncouragementDay: null,
    lastEncouragementId: null,
    ...partial,
  });
}

beforeEach(() => {
  localStorage.clear();
  clearFirst60ProgressForTests();
});

describe("MA-05 P1 — repeated same-day resolution", () => {
  it("returns identical welcome + encouragement IDs on repeat", () => {
    const w = resolveFirst60WelcomeLine({ dayIndex: IDX, dayKey: DAY });
    const e = resolveFirst60Encouragement({ dayIndex: IDX, dayKey: DAY });
    for (let i = 0; i < 5; i++) {
      expect(resolveFirst60WelcomeLine({ dayIndex: IDX, dayKey: DAY }).id).toBe(w.id);
      expect(resolveFirst60Encouragement({ dayIndex: IDX, dayKey: DAY }).id).toBe(e.id);
    }
  });
});

describe("MA-05 P1 — sign-out / sign-in (resolver reinit)", () => {
  it("same storage + same local date returns identical IDs after simulated remount", () => {
    const w = resolveFirst60WelcomeLine({ dayIndex: IDX, dayKey: DAY });
    const e = resolveFirst60Encouragement({ dayIndex: IDX, dayKey: DAY });
    // Resolvers hold no module state; re-reading persisted localStorage IS the
    // remount / sign-out+sign-in. Same date must yield the same pinned values.
    const p = loadFirst60Progress();
    expect(p.lastWelcomeDay).toBe(DAY);
    expect(p.lastEncouragementDay).toBe(DAY);
    expect(resolveFirst60WelcomeLine({ dayIndex: IDX, dayKey: DAY }).id).toBe(w.id);
    expect(resolveFirst60Encouragement({ dayIndex: IDX, dayKey: DAY }).id).toBe(e.id);
  });
});

describe("MA-05 P1 — interleaved resolution never clobbers a pin", () => {
  it("encouragement then welcome: both pinned, neither rotates", () => {
    const e = resolveFirst60Encouragement({ dayIndex: IDX, dayKey: DAY });
    const w = resolveFirst60WelcomeLine({ dayIndex: IDX, dayKey: DAY });
    const p = loadFirst60Progress();
    expect(p.lastWelcomeId).toBe(w.id);
    expect(p.lastEncouragementId).toBe(e.id);
    expect(p.lastWelcomeDay).toBe(DAY);
    expect(p.lastEncouragementDay).toBe(DAY);
    expect(resolveFirst60WelcomeLine({ dayIndex: IDX, dayKey: DAY }).id).toBe(w.id);
    expect(resolveFirst60Encouragement({ dayIndex: IDX, dayKey: DAY }).id).toBe(e.id);
  });

  it("welcome then encouragement: both pinned, neither rotates", () => {
    const w = resolveFirst60WelcomeLine({ dayIndex: IDX, dayKey: DAY });
    const e = resolveFirst60Encouragement({ dayIndex: IDX, dayKey: DAY });
    const p = loadFirst60Progress();
    expect(p.lastWelcomeId).toBe(w.id);
    expect(p.lastEncouragementId).toBe(e.id);
    expect(resolveFirst60Encouragement({ dayIndex: IDX, dayKey: DAY }).id).toBe(e.id);
    expect(resolveFirst60WelcomeLine({ dayIndex: IDX, dayKey: DAY }).id).toBe(w.id);
  });
});

describe("MA-05 P1 — new local date starts a new stable selection", () => {
  it("the second date pins new values that then stay stable", () => {
    resolveFirst60WelcomeLine({ dayIndex: IDX, dayKey: DAY });
    resolveFirst60Encouragement({ dayIndex: IDX, dayKey: DAY });

    const w2 = resolveFirst60WelcomeLine({ dayIndex: NEXT_IDX, dayKey: NEXT_DAY });
    const e2 = resolveFirst60Encouragement({ dayIndex: NEXT_IDX, dayKey: NEXT_DAY });
    const p = loadFirst60Progress();
    expect(p.lastWelcomeDay).toBe(NEXT_DAY);
    expect(p.lastEncouragementDay).toBe(NEXT_DAY);
    // stable within the new date
    expect(resolveFirst60WelcomeLine({ dayIndex: NEXT_IDX, dayKey: NEXT_DAY }).id).toBe(w2.id);
    expect(resolveFirst60Encouragement({ dayIndex: NEXT_IDX, dayKey: NEXT_DAY }).id).toBe(e2.id);
  });
});

describe("MA-05 P1 — partially populated progress is repaired, not lost", () => {
  it("only a welcome pin present: welcome preserved, encouragement filled, unrelated kept", () => {
    seed({
      lastWelcomeDay: DAY,
      lastWelcomeId: REAL_WELCOME_ID,
      recentWelcomeIds: [REAL_WELCOME_ID],
      exploredIds: ["plan-my-day"],
      skippedIds: ["rhythms"],
      lastDiscoveryOfferDay: DAY,
      lastDiscoveryOfferId: "plan-my-day",
    });
    expect(resolveFirst60WelcomeLine({ dayIndex: IDX, dayKey: DAY }).id).toBe(REAL_WELCOME_ID);
    const e = resolveFirst60Encouragement({ dayIndex: IDX, dayKey: DAY });
    const p = loadFirst60Progress();
    expect(p.lastWelcomeId).toBe(REAL_WELCOME_ID); // existing same-day pin preserved
    expect(p.lastEncouragementId).toBe(e.id); // missing field repaired
    expect(p.lastEncouragementDay).toBe(DAY);
    expect(p.exploredIds).toContain("plan-my-day");
    expect(p.skippedIds).toContain("rhythms");
    expect(p.lastDiscoveryOfferId).toBe("plan-my-day");
  });

  it("only an encouragement pin present: encouragement preserved, welcome filled", () => {
    seed({
      lastEncouragementDay: DAY,
      lastEncouragementId: REAL_ENCOURAGEMENT_ID,
      recentEncouragementIds: [REAL_ENCOURAGEMENT_ID],
    });
    expect(resolveFirst60Encouragement({ dayIndex: IDX, dayKey: DAY }).id).toBe(
      REAL_ENCOURAGEMENT_ID,
    );
    const w = resolveFirst60WelcomeLine({ dayIndex: IDX, dayKey: DAY });
    const p = loadFirst60Progress();
    expect(p.lastEncouragementId).toBe(REAL_ENCOURAGEMENT_ID);
    expect(p.lastWelcomeId).toBe(w.id);
    expect(p.lastWelcomeDay).toBe(DAY);
  });

  it("older blob missing the daily-pin fields is repaired without losing unrelated state", () => {
    localStorage.setItem(
      FIRST_60_PROGRESS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        exploredIds: ["plan-my-day"],
        skippedIds: [],
        recentWelcomeIds: [],
        recentEncouragementIds: [],
      }),
    );
    const w = resolveFirst60WelcomeLine({ dayIndex: IDX, dayKey: DAY });
    const e = resolveFirst60Encouragement({ dayIndex: IDX, dayKey: DAY });
    const p = loadFirst60Progress();
    expect(p.lastWelcomeId).toBe(w.id);
    expect(p.lastEncouragementId).toBe(e.id);
    expect(p.exploredIds).toContain("plan-my-day");
  });
});

describe("MA-05 P1 — persist:false semantics", () => {
  it("returns the pinned IDs once a selection is pinned", () => {
    const w = resolveFirst60WelcomeLine({ dayIndex: IDX, dayKey: DAY });
    const e = resolveFirst60Encouragement({ dayIndex: IDX, dayKey: DAY });
    expect(
      resolveFirst60WelcomeLine({ dayIndex: IDX, dayKey: DAY, persist: false }).id,
    ).toBe(w.id);
    expect(
      resolveFirst60Encouragement({ dayIndex: IDX, dayKey: DAY, persist: false }).id,
    ).toBe(e.id);
  });

  it("a preview (persist:false) resolution returns a value but does not write a pin", () => {
    const w = resolveFirst60WelcomeLine({ dayIndex: IDX, dayKey: DAY, persist: false });
    expect(w.id).toBeTruthy();
    expect(loadFirst60Progress().lastWelcomeDay).toBeNull();
  });

  it("the live default (persist omitted) pins on first resolve so the resident cannot rotate", () => {
    resolveFirst60WelcomeLine({ dayIndex: IDX, dayKey: DAY });
    expect(loadFirst60Progress().lastWelcomeDay).toBe(DAY);
    expect(loadFirst60Progress().lastEncouragementDay).toBe(DAY);
  });
});

describe("MA-05 P1 — unrelated progress preserved by the atomic pin", () => {
  it("keeps explored / skipped / discovery-offer / recent fields", () => {
    seed({
      exploredIds: ["plan-my-day", "rhythms"],
      skippedIds: ["clear-my-mind"],
      lastDiscoveryOfferDay: DAY,
      lastDiscoveryOfferId: "plan-my-day",
      recentWelcomeIds: ["old-welcome"],
      recentEncouragementIds: ["old-encouragement"],
    });
    resolveFirst60WelcomeLine({ dayIndex: IDX, dayKey: DAY });
    resolveFirst60Encouragement({ dayIndex: IDX, dayKey: DAY });
    const p = loadFirst60Progress();
    expect(p.exploredIds).toEqual(["plan-my-day", "rhythms"]);
    expect(p.skippedIds).toEqual(["clear-my-mind"]);
    expect(p.lastDiscoveryOfferId).toBe("plan-my-day");
    expect(p.lastDiscoveryOfferDay).toBe(DAY);
    expect(p.recentWelcomeIds).toContain("old-welcome");
    expect(p.recentEncouragementIds).toContain("old-encouragement");
  });
});
