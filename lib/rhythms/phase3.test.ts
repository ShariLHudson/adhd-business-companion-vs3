/**
 * Adaptive Rhythms Phase 3 —
 * Context Awareness & Adaptive Intelligence Foundation
 * (Daily Context Engine)
 *
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  buildCompanionAwarenessAdvice,
  buildDailyContext,
  evaluateDiscoveryKeyAwareness,
  formatDailyContextCompanionBlock,
  getDailyContext,
  shouldSuppressDiscoveryKey,
} from "@/lib/dailyContextEngine";
import { buildCompanionSystemPrompt } from "@/lib/companionPrompt";
import {
  appendRhythmHistory,
  assessRhythmHealth,
  createMemberRhythm,
  filterDeliverables,
  getMemberRhythm,
  LOAD_MANAGER_MAY_CHANGE_SCHEDULES,
  listPatternObservations,
  listRhythmHealthReports,
  observePatternsFromHistory,
  PATTERN_OBSERVATION_MAY_CHANGE_SCHEDULES,
  pauseRhythm,
  RHYTHM_HEALTH_MAY_CHANGE_SCHEDULES,
  saveRhythmPrefs,
  shouldDeliverOptionalPrompt,
  updateMemberRhythm,
} from "@/lib/rhythms";
import { saveReminder, getReminders } from "@/lib/reminderStore";

beforeEach(() => {
  localStorage.clear();
  saveRhythmPrefs({
    quietHoursStart: "21:00",
    quietHoursEnd: "08:00",
    notificationLevel: "active",
    dailyFrequencyCap: "none",
    promptedCountToday: 0,
    promptedCountDate: "2026-07-12",
    dayCondition: null,
  });
});

describe("Daily Context Engine creation", () => {
  it("builds an extensible daily context snapshot", () => {
    const ctx = buildDailyContext({
      now: new Date("2026-07-12T14:00:00"),
      quietHoursActive: false,
      dayCondition: "low_energy",
      energy: "low",
      reminderDueCount: 2,
      rhythmDueCount: 1,
      meetingLoad: "light",
      extensions: { customSignal: "trial" },
    });

    expect(ctx.dateKey).toBe("2026-07-12");
    expect(ctx.date).toBe("2026-07-12");
    expect(ctx.timezone).toBeTruthy();
    expect(ctx.generatedAt).toBe(ctx.builtAt);
    expect(ctx.dayCondition).toBe("low_energy");
    expect(ctx.energy).toBe("low");
    expect(ctx.energyLevel).toBe("low");
    expect(ctx.loads.reminderDueCount).toBe(2);
    expect(ctx.reminderLoad).toBe(2);
    expect(ctx.loads.rhythmDueCount).toBe(1);
    expect(ctx.rhythmLoad).toBe(1);
    expect(ctx.interruptibility).toBe("cautious");
    expect(ctx.optionalPromptAllowance).toBe(false);
    expect(ctx.extensions.customSignal).toBe("trial");
    expect(ctx.availableWorkMinutes).toBeNull();
    expect(ctx.availableTime).toBeNull();
    expect(
      ctx.sourceSignals.some(
        (s) => s.key === "energyLevel" && s.provenance === "user_provided",
      ),
    ).toBe(true);
  });

  it("distinguishes missing energy from low energy", () => {
    const unknown = buildDailyContext({
      now: new Date("2026-07-12T14:00:00"),
      quietHoursActive: false,
      dayCondition: null,
      energy: "unknown",
      meetingLoad: "none",
      reminderDueCount: 0,
      rhythmDueCount: 0,
    });
    expect(unknown.energy).toBe("unknown");
    expect(unknown.energyLevel).toBe("unknown");
    expect(unknown.interruptibility).toBe("open");
    expect(unknown.optionalPromptAllowance).toBe(true);
    expect(
      unknown.sourceSignals.find((s) => s.key === "energyLevel")?.provenance,
    ).toBe("unknown");
    expect(shouldDeliverOptionalPrompt("companion_prompt", unknown)).toBe(true);
  });

  it("shares the same getDailyContext alias", () => {
    const a = getDailyContext({
      now: new Date("2026-07-12T14:00:00"),
      quietHoursActive: false,
      energy: "medium",
    });
    const b = buildDailyContext({
      now: new Date("2026-07-12T14:00:00"),
      quietHoursActive: false,
      energy: "medium",
    });
    expect(a.dateKey).toBe(b.dateKey);
    expect(a.energy).toBe(b.energy);
    expect(a.timezone).toBe(b.timezone);
  });
});

describe("Context sharing across modules", () => {
  it("Load Manager and companion advice both read the same context object", () => {
    const ctx = buildDailyContext({
      now: new Date("2026-07-12T14:00:00"),
      quietHoursActive: false,
      dayCondition: "overwhelmed",
      energy: "low",
      reminderDueCount: 4,
      rhythmDueCount: 2,
      meetingLoad: "heavy",
    });

    const advice = buildCompanionAwarenessAdvice(ctx);
    expect(advice.signals).toContain("overwhelmed day");
    expect(advice.suggestionFrequency).toBe("minimal");

    const remCritical = saveReminder({
      title: "Critical call",
      message: "Critical call",
      reminderType: "one_time",
      scheduledAt: new Date("2026-07-12T10:00:00").toISOString(),
      source: "chat",
      priority: "critical",
    });
    const remOptional = saveReminder({
      title: "Optional tidy",
      message: "Optional tidy",
      reminderType: "one_time",
      scheduledAt: new Date("2026-07-12T10:00:00").toISOString(),
      source: "chat",
      priority: "optional",
    });

    const due = filterDeliverables([], [remCritical, remOptional], {
      now: new Date("2026-07-12T14:00:00"),
      dailyContext: ctx,
    });
    expect(due.map((d) => d.id)).toContain(remCritical.id);
    expect(due.map((d) => d.id)).not.toContain(remOptional.id);
  });
});

describe("Companion awareness", () => {
  it("formats awareness for the companion prompt without schedule mutation rights", () => {
    const ctx = buildDailyContext({
      now: new Date("2026-07-12T14:00:00"),
      quietHoursActive: false,
      activeFocusSession: true,
      energy: "low",
      reminderDueCount: 3,
    });
    const advice = buildCompanionAwarenessAdvice(ctx);
    expect(advice.mayChangeSchedules).toBe(false);
    expect(advice.signals).toContain("focus session active");
    expect(advice.promptBlock).toContain("Do NOT change reminders");

    const prompt = buildCompanionSystemPrompt("today", "text", {
      dailyContextHint: formatDailyContextCompanionBlock(ctx),
    });
    expect(prompt).toContain("DAILY CONTEXT AWARENESS");
    expect(prompt).toContain("focus session");
  });
});

describe("Load Manager decisions", () => {
  it("keeps critical reminders highest priority under load", () => {
    const ctx = buildDailyContext({
      now: new Date("2026-07-12T14:00:00"),
      quietHoursActive: false,
      dayCondition: "quiet",
      energy: "medium",
      reminderDueCount: 3,
    });
    const critical = saveReminder({
      title: "Pay tax",
      message: "Pay tax",
      reminderType: "one_time",
      scheduledAt: new Date("2026-07-12T09:00:00").toISOString(),
      source: "chat",
      priority: "critical",
    });
    const supportive = saveReminder({
      title: "Water plants",
      message: "Water plants",
      reminderType: "one_time",
      scheduledAt: new Date("2026-07-12T09:00:00").toISOString(),
      source: "chat",
      priority: "supportive",
    });
    const due = filterDeliverables([], [critical, supportive], {
      now: new Date("2026-07-12T14:00:00"),
      dailyContext: ctx,
    });
    expect(due[0]?.id).toBe(critical.id);
    expect(due.every((d) => d.priority === "critical" || d.priority === "important")).toBe(
      true,
    );
  });

  it("gates optional companion / discovery prompts via Daily Context", () => {
    const open = buildDailyContext({
      now: new Date("2026-07-12T14:00:00"),
      quietHoursActive: false,
      energy: "medium",
      dayCondition: "normal",
      reminderDueCount: 0,
      rhythmDueCount: 0,
      meetingLoad: "none",
    });
    expect(shouldDeliverOptionalPrompt("companion_prompt", open)).toBe(true);
    expect(shouldDeliverOptionalPrompt("discovery_key", open)).toBe(true);

    const focus = buildDailyContext({
      now: new Date("2026-07-12T14:00:00"),
      quietHoursActive: false,
      activeFocusSession: true,
      energy: "medium",
    });
    expect(shouldDeliverOptionalPrompt("discovery_key", focus)).toBe(false);
    expect(shouldDeliverOptionalPrompt("future_suggestion", focus)).toBe(false);
    expect(LOAD_MANAGER_MAY_CHANGE_SCHEDULES).toBe(false);
  });
});

describe("Discovery Key suppression rules", () => {
  it("suppresses for quiet hours, low energy, overwhelm, quiet day, and focus", () => {
    expect(
      shouldSuppressDiscoveryKey(
        buildDailyContext({ quietHoursActive: true, energy: "medium" }),
      ),
    ).toBe(true);
    expect(
      shouldSuppressDiscoveryKey(
        buildDailyContext({
          quietHoursActive: false,
          energy: "low",
          dayCondition: "low_energy",
        }),
      ),
    ).toBe(true);
    expect(
      evaluateDiscoveryKeyAwareness(
        buildDailyContext({
          quietHoursActive: false,
          dayCondition: "overwhelmed",
          energy: "medium",
        }),
      ).reasons,
    ).toContain("overwhelm");
    expect(
      evaluateDiscoveryKeyAwareness(
        buildDailyContext({
          quietHoursActive: false,
          dayCondition: "quiet",
          energy: "medium",
        }),
      ).reasons,
    ).toContain("quiet day");
    expect(
      shouldSuppressDiscoveryKey(
        buildDailyContext({
          quietHoursActive: false,
          activeFocusSession: true,
          energy: "medium",
        }),
      ),
    ).toBe(true);
  });

  it("allows Discovery Key on a calm open day", () => {
    const decision = evaluateDiscoveryKeyAwareness(
      buildDailyContext({
        quietHoursActive: false,
        activeFocusSession: false,
        dayCondition: "normal",
        energy: "medium",
        reminderDueCount: 0,
        rhythmDueCount: 0,
        meetingLoad: "none",
      }),
    );
    expect(decision.allow).toBe(true);
    expect(decision.optional).toBe(true);
  });
});

describe("Snooze protection", () => {
  it("signals after three snoozes, dismisses without changing schedules", async () => {
    const {
      createMemberRhythm,
      noteSnoozePattern,
      shouldOfferSnoozeProtection,
      dismissSnoozeProtection,
      collectAdaptiveHints,
      SNOOZE_PROTECTION_MAY_CHANGE_SCHEDULES,
      getMemberRhythm,
    } = await import("@/lib/rhythms");

    const rhythm = createMemberRhythm({
      title: "Inbox glance",
      cadence: "daily",
      schedule: { cadence: "daily", exactTime: "09:00" },
      window: "exact",
    });
    const before = getMemberRhythm(rhythm.id)!;

    noteSnoozePattern(rhythm.id);
    noteSnoozePattern(rhythm.id);
    expect(shouldOfferSnoozeProtection(rhythm.id)).toBe(false);
    noteSnoozePattern(rhythm.id);
    expect(shouldOfferSnoozeProtection(rhythm.id)).toBe(true);

    const hints = collectAdaptiveHints();
    expect(hints.some((h) => h.kind === "snooze_protection")).toBe(true);
    expect(SNOOZE_PROTECTION_MAY_CHANGE_SCHEDULES).toBe(false);

    dismissSnoozeProtection(rhythm.id, "leave_as_is");
    expect(shouldOfferSnoozeProtection(rhythm.id)).toBe(false);

    const after = getMemberRhythm(rhythm.id)!;
    expect(after.schedule).toEqual(before.schedule);
    expect(after.nextDueAt).toBe(before.nextDueAt);
  });
});

describe("Companion awareness quiet days", () => {
  it("does not narrate on a calm open day", () => {
    const ctx = buildDailyContext({
      now: new Date("2026-07-12T14:00:00"),
      quietHoursActive: false,
      dayCondition: "normal",
      energy: "medium",
      meetingLoad: "none",
      reminderDueCount: 0,
      rhythmDueCount: 0,
    });
    expect(formatDailyContextCompanionBlock(ctx)).toBe("");
    expect(shouldDeliverOptionalPrompt("companion_prompt", ctx)).toBe(true);
  });

  it("suppresses optional companion prompts on quiet day", () => {
    const quiet = buildDailyContext({
      now: new Date("2026-07-12T14:00:00"),
      quietHoursActive: false,
      dayCondition: "quiet",
      energy: "medium",
    });
    expect(shouldDeliverOptionalPrompt("companion_prompt", quiet)).toBe(false);
    expect(shouldDeliverOptionalPrompt("discovery_key", quiet)).toBe(false);
    expect(formatDailyContextCompanionBlock(quiet)).toContain("Quiet day");
  });
});

describe("Rhythm Health tracking", () => {
  it("reports informational health states without mutating rhythms", () => {
    const rhythm = createMemberRhythm({
      title: "Weekly review",
      cadence: "weekly",
      schedule: { cadence: "weekly", weekdays: ["friday"], exactTime: "09:00" },
      window: "exact",
    });
    const before = getMemberRhythm(rhythm.id)!;

    for (let i = 0; i < 3; i++) {
      appendRhythmHistory({
        rhythmId: rhythm.id,
        action: "snoozed",
        note: "later",
      });
    }

    const report = assessRhythmHealth(rhythm);
    expect(report.state).toBe("frequently_snoozed");
    expect(report.informationalOnly).toBe(true);
    expect(RHYTHM_HEALTH_MAY_CHANGE_SCHEDULES).toBe(false);

    const after = getMemberRhythm(rhythm.id)!;
    expect(after.schedule).toEqual(before.schedule);
    expect(after.nextDueAt).toBe(before.nextDueAt);

    pauseRhythm(rhythm.id);
    const paused = assessRhythmHealth(getMemberRhythm(rhythm.id)!);
    expect(paused.state).toBe("paused");

    const all = listRhythmHealthReports();
    expect(all.some((r) => r.rhythmId === rhythm.id)).toBe(true);
  });
});

describe("Pattern observation", () => {
  it("stores observations only — no automatic schedule changes", () => {
    const rhythm = createMemberRhythm({
      title: "Morning writing",
      cadence: "daily",
      schedule: { cadence: "daily", exactTime: "09:00" },
      window: "exact",
    });
    const originalNext = getMemberRhythm(rhythm.id)?.nextDueAt;

    for (let i = 0; i < 3; i++) {
      appendRhythmHistory({ rhythmId: rhythm.id, action: "skipped" });
    }
    for (let i = 0; i < 4; i++) {
      appendRhythmHistory({
        rhythmId: rhythm.id,
        action: "completed",
        note: "Morning writing",
      });
      // Force completion timestamps into afternoon for late/preferred patterns
      const histKey = "companion-rhythm-history-v1";
      const raw = localStorage.getItem(histKey);
      if (raw) {
        const entries = JSON.parse(raw) as Array<{ at: string; action: string }>;
        if (entries[0]) {
          entries[0].at = new Date("2026-07-12T15:00:00").toISOString();
          localStorage.setItem(histKey, JSON.stringify(entries));
        }
      }
    }

    const observed = observePatternsFromHistory();
    expect(observed.length).toBeGreaterThan(0);
    const skipped = listPatternObservations().find(
      (o) => o.kind === "repeatedly_skipped",
    );
    expect(skipped).toBeTruthy();
    expect(skipped!.supportingEventCount).toBeGreaterThanOrEqual(3);
    expect(skipped!.confidence).toMatch(/medium|high/);
    expect(skipped!.dateRange.from).toBeTruthy();
    expect(PATTERN_OBSERVATION_MAY_CHANGE_SCHEDULES).toBe(false);

    const after = getMemberRhythm(rhythm.id)!;
    expect(after.nextDueAt).toBe(originalNext);
    expect(after.schedule.exactTime).toBe("09:00");
  });

  it("does not store strong observations from insufficient history", () => {
    const rhythm = createMemberRhythm({
      title: "Sparse",
      cadence: "daily",
      schedule: { cadence: "daily", exactTime: "08:00" },
      window: "exact",
    });
    appendRhythmHistory({ rhythmId: rhythm.id, action: "skipped" });
    observePatternsFromHistory();
    expect(
      listPatternObservations().filter((o) => o.subjectId === rhythm.id),
    ).toHaveLength(0);
  });
});

describe("No automatic schedule changes (Phase 3 contract)", () => {
  it("exposes immutable flags across Load Manager, patterns, and health", () => {
    expect(LOAD_MANAGER_MAY_CHANGE_SCHEDULES).toBe(false);
    expect(PATTERN_OBSERVATION_MAY_CHANGE_SCHEDULES).toBe(false);
    expect(RHYTHM_HEALTH_MAY_CHANGE_SCHEDULES).toBe(false);
  });

  it("does not rewrite schedule when context is rebuilt", () => {
    const rhythm = createMemberRhythm({
      title: "Stay put",
      cadence: "daily",
      schedule: { cadence: "daily", exactTime: "10:30" },
      window: "exact",
    });
    updateMemberRhythm(rhythm.id, {
      nextDueAt: new Date("2026-07-13T10:30:00").toISOString(),
    });
    const before = getMemberRhythm(rhythm.id)!;

    buildDailyContext({ dayCondition: "overwhelmed", energy: "low" });
    observePatternsFromHistory();
    assessRhythmHealth(before);
    filterDeliverables([before], [], {
      now: new Date("2026-07-12T14:00:00"),
      dailyContext: buildDailyContext({
        quietHoursActive: false,
        dayCondition: "overwhelmed",
      }),
    });

    const after = getMemberRhythm(rhythm.id)!;
    expect(after.schedule).toEqual(before.schedule);
    expect(after.nextDueAt).toBe(before.nextDueAt);
  });
});

describe("Existing reminder + rhythm compatibility", () => {
  it("still delivers legacy reminders through Load Manager", () => {
    const rem = saveReminder({
      title: "Call Mary",
      message: "Call Mary",
      reminderType: "one_time",
      scheduledAt: new Date("2026-07-12T09:00:00").toISOString(),
      source: "chat",
      priority: "important",
    });
    expect(getReminders().some((r) => r.id === rem.id)).toBe(true);

    const due = filterDeliverables([], [rem], {
      now: new Date("2026-07-12T10:00:00"),
      dailyContext: buildDailyContext({
        now: new Date("2026-07-12T10:00:00"),
        quietHoursActive: false,
        dayCondition: "normal",
        energy: "medium",
      }),
    });
    expect(due).toHaveLength(1);
    expect(due[0]!.kind).toBe("reminder");
  });

  it("still creates and lists rhythms after Phase 3 modules load", () => {
    const rhythm = createMemberRhythm({
      title: "Friday finance",
      cadence: "weekly",
      schedule: { cadence: "weekly", weekdays: ["friday"] },
      window: "morning",
    });
    expect(getMemberRhythm(rhythm.id)?.title).toBe("Friday finance");
  });
});
