/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { detectOverwhelmTodayRoute } from "@/lib/overwhelmTodayRouting";
import {
  buildSavedPatternsPromptHint,
  canNoticeNewPatterns,
  canUseSavedPatterns,
  findConflictingSavedPatterns,
  findSimilarSavedPatterns,
  getPatternAwarenessControlPrefs,
  listActiveUsablePatterns,
  listSavedPatterns,
  PATTERN_AWARENESS_PREFS_KEY,
  pauseSavedPattern,
  prefersBrainDumpBeforePlanning,
  prefersSmallFirstSteps,
  resolvePlanMyDayPriorityCap,
  resumeSavedPattern,
  retireSavedPattern,
  saveNewPattern,
  savePatternAwarenessControlPrefs,
  saveSparkSuggestedPattern,
  SAVED_PATTERNS_KEY,
  deleteSavedPattern,
} from "@/lib/patternAwareness";

beforeEach(() => {
  localStorage.clear();
});

describe("Pattern Awareness control prefs", () => {
  it("defaults to noticing and using patterns", () => {
    const prefs = getPatternAwarenessControlPrefs();
    expect(prefs.noticeNewPatterns).toBe(true);
    expect(prefs.useSavedPatterns).toBe(true);
  });

  it("persists Notice New Patterns and Use My Saved Patterns separately", () => {
    savePatternAwarenessControlPrefs({
      noticeNewPatterns: false,
      useSavedPatterns: true,
    });
    expect(canNoticeNewPatterns()).toBe(false);
    expect(canUseSavedPatterns()).toBe(true);

    const raw = localStorage.getItem(PATTERN_AWARENESS_PREFS_KEY);
    expect(raw).toBeTruthy();
    localStorage.setItem(PATTERN_AWARENESS_PREFS_KEY, raw!);
    expect(getPatternAwarenessControlPrefs().noticeNewPatterns).toBe(false);
    expect(getPatternAwarenessControlPrefs().useSavedPatterns).toBe(true);
  });

  it("rejects stale version writes", () => {
    const first = savePatternAwarenessControlPrefs({
      noticeNewPatterns: false,
    });
    const rejected = savePatternAwarenessControlPrefs({
      noticeNewPatterns: true,
      version: first.version - 1,
    });
    expect(rejected.noticeNewPatterns).toBe(false);
    expect(rejected.version).toBe(first.version);
  });
});

describe("Saved patterns library", () => {
  it("saves Spark-suggested and user-added patterns and keeps them after reload", () => {
    const spark = saveSparkSuggestedPattern({
      statement: "Too many daily priorities overwhelm me.",
      category: "planning-workload",
      confidence: "possible",
      useContexts: ["plan-my-day"],
      evidenceSummary: "Lighter days finished more.",
    });
    expect(spark.ok).toBe(true);

    const user = saveNewPattern({
      statement: "Short first steps help me begin.",
      category: "starting-focus",
      useContexts: ["starting"],
    });
    expect(user.ok).toBe(true);

    const raw = localStorage.getItem(SAVED_PATTERNS_KEY);
    expect(raw).toBeTruthy();
    localStorage.setItem(SAVED_PATTERNS_KEY, raw!);

    const listed = listSavedPatterns();
    expect(listed).toHaveLength(2);
    expect(listed.some((p) => p.source === "spark-suggested")).toBe(true);
    expect(listed.some((p) => p.source === "user-added")).toBe(true);
  });

  it("supports pause, resume, retire, and delete", () => {
    const created = saveNewPattern({
      statement: "I focus better before noon.",
      useContexts: ["everywhere"],
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    pauseSavedPattern(created.pattern.id);
    expect(listSavedPatterns()[0]?.status).toBe("paused");
    resumeSavedPattern(created.pattern.id);
    expect(listSavedPatterns()[0]?.status).toBe("active");
    retireSavedPattern(created.pattern.id);
    expect(listSavedPatterns()[0]?.status).toBe("retired");
    expect(deleteSavedPattern(created.pattern.id)).toBe(true);
    expect(listSavedPatterns()).toHaveLength(0);
  });

  it("gates similar patterns before saving", () => {
    const first = saveNewPattern({
      statement: "Small first steps help me begin.",
    });
    expect(first.ok).toBe(true);

    const similar = saveNewPattern({
      statement: "Small first steps help me get started.",
    });
    expect(similar.ok).toBe(false);
    if (similar.ok) return;
    expect(similar.reason).toBe("similar-exists");
    expect(similar.similar?.length).toBeGreaterThan(0);

    const forced = saveNewPattern({
      statement: "Small first steps help me get started.",
      force: true,
    });
    expect(forced.ok).toBe(true);
  });

  it("surfaces conflicting active patterns", () => {
    saveNewPattern({
      statement: "I work best early in the morning.",
      force: true,
    });
    saveNewPattern({
      statement: "I rarely focus well before 10 a.m.",
      force: true,
    });
    const conflicts = findConflictingSavedPatterns(listSavedPatterns());
    expect(conflicts.length).toBeGreaterThan(0);
  });
});

describe("Applying saved patterns", () => {
  it("caps Plan My Day priorities from a saved planning pattern", () => {
    saveNewPattern({
      statement: "Too many daily priorities overwhelm me.",
      useContexts: ["plan-my-day"],
    });
    expect(resolvePlanMyDayPriorityCap()).toBe(3);
  });

  it("detects small-first-step and brain-dump preferences", () => {
    saveNewPattern({
      statement: "Short first steps help me begin.",
      useContexts: ["starting"],
    });
    saveNewPattern({
      statement: "When I am overwhelmed, help me unload my thoughts first.",
      useContexts: ["overwhelm"],
      force: true,
    });
    expect(prefersSmallFirstSteps()).toBe(true);
    expect(prefersBrainDumpBeforePlanning()).toBe(true);
  });

  it("does not apply patterns when Use My Saved Patterns is off", () => {
    saveNewPattern({
      statement: "Too many daily priorities overwhelm me.",
      useContexts: ["plan-my-day"],
    });
    savePatternAwarenessControlPrefs({ useSavedPatterns: false });
    expect(listActiveUsablePatterns()).toHaveLength(0);
    expect(resolvePlanMyDayPriorityCap()).toBeNull();
    expect(buildSavedPatternsPromptHint()).toBeNull();
  });

  it("includes approved patterns in the companion prompt hint", () => {
    saveNewPattern({
      statement: "Short first steps help me begin.",
      useContexts: ["starting", "everywhere"],
    });
    const hint = buildSavedPatternsPromptHint();
    expect(hint).toContain("Short first steps help me begin");
    expect(hint).toContain("Member-approved Pattern Awareness");
  });

  it("routes overwhelm toward Clear My Mind when that pattern is saved", () => {
    saveNewPattern({
      statement: "When I am overwhelmed, help me unload my thoughts first.",
      useContexts: ["overwhelm"],
    });
    expect(
      detectOverwhelmTodayRoute(
        "I'm overwhelmed and not sure where to start today.",
      ),
    ).toBe("brain_dump_primary");
  });

  it("keeps default overwhelm-today plan routing without that pattern", () => {
    expect(
      detectOverwhelmTodayRoute(
        "I'm overwhelmed and not sure where to start today.",
      ),
    ).toBe("plan_primary");
  });
});

describe("similarity helpers", () => {
  it("finds similar statements by token overlap", () => {
    const existing = [
      {
        id: "1",
        statement: "Small first steps help me begin.",
        category: "starting-focus" as const,
        source: "user-added" as const,
        status: "active" as const,
        useContexts: ["starting" as const],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      },
    ];
    const hits = findSimilarSavedPatterns(
      "Small first steps help me get started",
      existing,
    );
    expect(hits).toHaveLength(1);
  });
});
