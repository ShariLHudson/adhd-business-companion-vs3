/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";

import { HELPFUL_LESSON_REGISTRY, getHelpfulLessonById } from "./registry";
import {
  offerNextHelpfulLesson,
  __resetHelpfulLessonSessionForTests,
} from "./resolveHelpfulLesson";
import { clearHelpfulLessonHistoryForTests } from "./history";
import type { HelpfulDiscoverySignals } from "./discoverySignals";

const ENRICHED_IDS = [
  "business-estate",
  "working-style",
  "people-i-help",
  "conversation-style",
  "clear-my-mind",
  "park-it",
  "plan-my-day",
  "projects",
  "evidence-vault",
  "decision-compass",
  "chamber",
];

const REQUIRED_CATEGORIES = [
  "profile",
  "client-profile",
  "personalization",
  "capture",
  "planning",
  "work",
  "recognition",
  "decision",
  "room",
];

const MARKETING_WORDS =
  /\b(amazing|revolutionary|game[- ]?chang|supercharge|unlock|best[- ]in[- ]class|world[- ]class|cutting[- ]edge|effortless|instantly|powerful|transform your)\b/i;

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

describe("Show Me Something Helpful — initial guided-discovery content", () => {
  beforeEach(() => {
    clearHelpfulLessonHistoryForTests();
    __resetHelpfulLessonSessionForTests();
    localStorage.clear();
  });

  it("covers every required discovery category", () => {
    const categories = new Set(
      HELPFUL_LESSON_REGISTRY.map((l) => l.category).filter(Boolean),
    );
    for (const required of REQUIRED_CATEGORIES) {
      expect(categories.has(required as never)).toBe(true);
    }
  });

  it("gives each enriched lesson a full, calm, non-marketing card", () => {
    for (const id of ENRICHED_IDS) {
      const lesson = getHelpfulLessonById(id);
      expect(lesson, `missing lesson ${id}`).toBeTruthy();
      expect(lesson!.category, `${id} category`).toBeTruthy();
      // Explanation is 2+ sentences.
      const explanation = lesson!.explanation ?? "";
      expect(
        explanation.split(/[.!?]/).filter((s) => s.trim()).length,
        `${id} explanation sentences`,
      ).toBeGreaterThanOrEqual(2);
      expect(lesson!.whyNow?.trim(), `${id} whyNow`).toBeTruthy();
      expect(lesson!.primaryActionLabel?.trim(), `${id} action`).toBeTruthy();
      const more = lesson!.tellMeMore;
      expect(more?.whatItDoes, `${id} tellMeMore.whatItDoes`).toBeTruthy();
      expect(more?.howItHelps, `${id} tellMeMore.howItHelps`).toBeTruthy();
      // Calm, plain language — no marketing hype.
      const prose = `${explanation} ${lesson!.whyNow} ${more?.whatItDoes} ${more?.howItHelps} ${more?.whatToExpect}`;
      expect(MARKETING_WORDS.test(prose), `${id} marketing words`).toBe(false);
      expect(prose.includes("!"), `${id} exclamation`).toBe(false);
    }
  });

  it("maps profile/settings lessons to their completion areas", () => {
    expect(getHelpfulLessonById("business-estate")?.completionArea).toBe("business");
    expect(getHelpfulLessonById("people-i-help")?.completionArea).toBe("people-i-help");
    expect(getHelpfulLessonById("conversation-style")?.completionArea).toBe("settings");
  });

  it("surfaces suggestions spanning at least three categories over five picks", () => {
    const s = signals();
    const cats: (string | undefined)[] = [];
    for (let i = 0; i < 5; i++) {
      cats.push(offerNextHelpfulLesson({ signals: s })?.lesson.category);
    }
    const distinct = new Set(cats.filter(Boolean));
    expect(distinct.size).toBeGreaterThanOrEqual(3);
  });

  it("reframes the Business Profile lesson as resumable with a real remaining count", () => {
    const offer = offerNextHelpfulLesson({
      signals: signals({
        completion: { business: { status: "started", remaining: 2 } },
      }),
    });
    expect(offer?.lesson.id).toBe("business-estate");
    expect(offer?.lesson.resumable).toBe(true);
    expect(offer?.lesson.primaryActionLabel).toMatch(/^Continue/i);
    expect(offer?.lesson.whyNow).toContain("2 parts left");
  });

  it("never forces 'finish' wording on Settings (unknown completion)", () => {
    const offer = offerNextHelpfulLesson({
      // Only the settings-area lesson eligible path: settings stays unknown.
      signals: signals(),
      excludeIds: HELPFUL_LESSON_REGISTRY.filter(
        (l) => l.id !== "conversation-style",
      ).map((l) => l.id),
    });
    expect(offer?.lesson.id).toBe("conversation-style");
    expect(offer?.lesson.resumable ?? false).toBe(false);
    expect(offer?.lesson.whyNow ?? "").not.toMatch(/finish|already started/i);
  });
});
