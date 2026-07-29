/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";

import {
  offerNextHelpfulLesson,
  offerNextHelpfulLessonExcluding,
  listEligibleHelpfulLessons,
  __resetHelpfulLessonSessionForTests,
} from "./resolveHelpfulLesson";
import {
  clearHelpfulLessonHistoryForTests,
  recordHelpfulLessonShown,
  markHelpfulLessonDismissed,
} from "./history";
import { resolveSettingsCompletion } from "./settingsCompletionSignal";
import type { HelpfulDiscoverySignals } from "./discoverySignals";

function signals(
  overrides: Partial<HelpfulDiscoverySignals> & {
    completion?: Partial<HelpfulDiscoverySignals["completion"]>;
  } = {},
): HelpfulDiscoverySignals {
  return {
    completion: {
      business: { status: "unknown", remaining: null },
      "people-i-help": { status: "unknown", remaining: null },
      settings: { status: "unknown", remaining: null },
      ...overrides.completion,
    },
    visitCounts: overrides.visitCounts ?? {},
    lastUnfinishedRoomId: overrides.lastUnfinishedRoomId ?? null,
    lifecycleWindow: overrides.lifecycleWindow ?? "unknown",
    currentActivityDestinationId: overrides.currentActivityDestinationId ?? null,
  };
}

describe("Show Me Something Helpful — guided selection", () => {
  beforeEach(() => {
    clearHelpfulLessonHistoryForTests();
    __resetHelpfulLessonSessionForTests();
    localStorage.clear();
  });

  it("never blindly defaults to the first registry item (pool[0])", () => {
    // People I Help is the only completion-tagged lesson → tier 1 when incomplete.
    const offer = offerNextHelpfulLesson({
      signals: signals({ completion: { "people-i-help": { status: "empty", remaining: null } } }),
    });
    expect(offer?.lesson.id).toBe("people-i-help");
    expect(offer?.lesson.id).not.toBe("park-it");
  });

  it("prioritizes important incomplete profile work over a generic item", () => {
    const offer = offerNextHelpfulLesson({
      signals: signals({ completion: { "people-i-help": { status: "started", remaining: null } } }),
    });
    expect(offer?.lesson.id).toBe("people-i-help");
  });

  it("frames started profile work as resumable (Continue …), only on real progress", () => {
    const offer = offerNextHelpfulLesson({
      signals: signals({ completion: { "people-i-help": { status: "started", remaining: null } } }),
    });
    expect(offer?.lesson.resumable).toBe(true);
    expect(offer?.lesson.primaryActionLabel).toMatch(/^Continue/i);
    expect(offer?.lesson.whyNow).toMatch(/already started/i);
  });

  it("suppresses completed profile areas", () => {
    const s = signals({ completion: { "people-i-help": { status: "complete", remaining: 0 } } });
    expect(listEligibleHelpfulLessons({ signals: s }).map((l) => l.id)).not.toContain(
      "people-i-help",
    );
    const offer = offerNextHelpfulLesson({ signals: s });
    expect(offer?.lesson.id).not.toBe("people-i-help");
  });

  it("never treats unknown Settings completion as incomplete or forces 'finish' wording", () => {
    expect(resolveSettingsCompletion().status).toBe("unknown");
    // With every area unknown, nothing is tier-1 incomplete, and no offer is
    // resume-framed (no false 'Continue' / 'already started').
    const offer = offerNextHelpfulLesson({ signals: signals() });
    expect(offer).not.toBeNull();
    expect(offer?.lesson.resumable ?? false).toBe(false);
    expect(offer?.lesson.whyNow ?? "").not.toMatch(/already started/i);
  });

  it("Something else returns a different eligible lesson", () => {
    const s = signals();
    const first = offerNextHelpfulLesson({ signals: s });
    const second = offerNextHelpfulLessonExcluding(first!.lesson.id, { signals: s });
    expect(second).not.toBeNull();
    expect(second!.lesson.id).not.toBe(first!.lesson.id);
  });

  it("five consecutive suggestions are distinct when enough eligible items exist", () => {
    const s = signals();
    const ids: string[] = [];
    for (let i = 0; i < 5; i++) {
      const offer = offerNextHelpfulLesson({ signals: s });
      expect(offer).not.toBeNull();
      ids.push(offer!.lesson.id);
    }
    expect(new Set(ids).size).toBe(5);
  });

  it("cools down an intentionally dismissed lesson", () => {
    recordHelpfulLessonShown("people-i-help");
    markHelpfulLessonDismissed("people-i-help");
    // Even when the signal would make it tier-1, a fresh dismissal removes it.
    const offer = offerNextHelpfulLesson({
      signals: signals({ completion: { "people-i-help": { status: "empty", remaining: null } } }),
    });
    expect(offer?.lesson.id).not.toBe("people-i-help");
  });

  it("preserves session variety when localStorage is unavailable", () => {
    const original = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("storage disabled");
      },
    });
    try {
      const s = signals();
      const ids: string[] = [];
      for (let i = 0; i < 5; i++) {
        const offer = offerNextHelpfulLesson({ signals: s });
        expect(offer).not.toBeNull();
        ids.push(offer!.lesson.id);
      }
      // In-memory session ring keeps them distinct despite no persistence.
      expect(new Set(ids).size).toBe(5);
    } finally {
      if (original) Object.defineProperty(window, "localStorage", original);
    }
  });

  it("no defined category repeats three times in a row across consecutive picks", () => {
    const s = signals();
    const cats: (string | undefined)[] = [];
    for (let i = 0; i < 6; i++) {
      cats.push(offerNextHelpfulLesson({ signals: s })?.lesson.category);
    }
    for (let i = 0; i + 2 < cats.length; i++) {
      const trio = [cats[i], cats[i + 1], cats[i + 2]];
      const allSameDefined = trio[0] && trio[0] === trio[1] && trio[1] === trio[2];
      expect(allSameDefined).toBeFalsy();
    }
  });
});
