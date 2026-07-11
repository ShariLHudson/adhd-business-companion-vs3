import { describe, expect, it, beforeEach } from "vitest";

import {
  assessSparkCardVisualDesignCompliance,
  buildSparkCardDailyLifecycleView,
  buildSparkCardPersonalSettingsFingerprint,
  formatSparkCardVisualDesignReport,
  requestNewDailySparkCard,
  resetSparkCardPersonalSettingsForTests,
  resolveDailySparkCard,
  resolveSparkCardPersonalReflectionTone,
  shouldRegenerateSparkCard,
  SPARK_CARD_ACTIONS,
  SPARK_CARD_DAILY_GENERATION_RULE,
  SPARK_CARD_DESIGN_PRINCIPLE,
  SPARK_CARD_PERSONAL_REFLECTION_TONES,
  SPARK_CARD_QUALITY_TEST,
  SPARK_CARD_REGENERATION_EXCEPTIONS,
  verifySparkCardVisualDesignAndDailyGeneration,
} from "./sparkCardVisualDesignAndDailyGeneration";
import { resetSparkNoteStoreForTests } from "./persistence";

describe("sparkCardVisualDesignAndDailyGeneration", () => {
  beforeEach(() => {
    resetSparkNoteStoreForTests();
    resetSparkCardPersonalSettingsForTests();
  });

  it("defines companion design principle and daily generation rule", () => {
    expect(SPARK_CARD_DESIGN_PRINCIPLE).toContain("daily moment");
    expect(SPARK_CARD_DAILY_GENERATION_RULE).toContain("One Spark Card");
    expect(SPARK_CARD_PERSONAL_REFLECTION_TONES).toHaveLength(4);
    expect(SPARK_CARD_ACTIONS).toHaveLength(3);
    expect(SPARK_CARD_REGENERATION_EXCEPTIONS).toHaveLength(3);
    expect(SPARK_CARD_QUALITY_TEST.shouldNotFeel).toContain("notification");
  });

  it("keeps the same card stable throughout the day", () => {
    const now = new Date("2026-04-10T10:00:00");
    const first = resolveDailySparkCard({ now, forceRefresh: true });
    const second = resolveDailySparkCard({ now });
    expect(second.card.id).toBe(first.card.id);

    const view = buildSparkCardDailyLifecycleView({ now });
    expect(view.stableForDay).toBe(true);
    expect(view.dayKey).toBe("2026-04-10");
  });

  it("adapts personal reflection tone for birthdays", () => {
    const { card } = resolveDailySparkCard({
      now: new Date("2026-03-15T12:00:00"),
      firstName: "Alex",
      birthday: { month: 3, day: 15 },
      forceRefresh: true,
    });
    expect(resolveSparkCardPersonalReflectionTone(card)).toBe(
      "Celebration and appreciation",
    );
  });

  it("allows regeneration on member request and setting changes", () => {
    const now = new Date("2026-04-10T10:00:00");
    resolveDailySparkCard({
      now,
      firstName: "Alex",
      forceRefresh: true,
    });
    expect(shouldRegenerateSparkCard({ forceRefresh: true })).toBe(true);

    const refreshed = requestNewDailySparkCard({ now });
    expect(refreshed.card.title).toBeTruthy();

    resolveDailySparkCard({
      now,
      firstName: "Jordan",
      forceRefresh: true,
    });
    expect(
      shouldRegenerateSparkCard({
        now,
        personalSettingsFingerprint: buildSparkCardPersonalSettingsFingerprint({
          firstName: "Sam",
        }),
      }),
    ).toBe(true);
  });

  it("verifies visual design compliance across spark note bridges", () => {
    const compliance = assessSparkCardVisualDesignCompliance();
    expect(compliance.visualRequirementsReady).toBe(true);
    expect(compliance.actionsReady).toBe(true);
    expect(compliance.dailyEngineBridgeReady).toBe(true);
    expect(compliance.cardEcosystemBridgeReady).toBe(true);
    expect(compliance.delightReactionsBridgeReady).toBe(true);
  });

  it("verifies daily generation readiness and formats a readable report", () => {
    const verification = verifySparkCardVisualDesignAndDailyGeneration();
    expect(verification.dailyGenerationReady).toBe(true);
    expect(verification.sameDayStabilityReady).toBe(true);
    expect(verification.personalAdaptationReady).toBe(true);

    const report = formatSparkCardVisualDesignReport();
    expect(report).toContain("Personal reflection tones");
    expect(report).toContain("Regeneration exceptions");
    expect(report).toContain("Compliance checks");
  });
});
