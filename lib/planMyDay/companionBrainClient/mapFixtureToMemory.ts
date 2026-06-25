/**
 * Plan My Day™ → Companion Brain™ adapter.
 * The brain never imports this module.
 */

import type { CompanionJudgmentFixture } from "@/lib/planMyDay/dailyCompanionCycle/fixtures/types";
import {
  createDefaultCompanionBrainState,
  type CompanionCandidate,
  type CompanionMemorySnapshot,
} from "@/lib/companionBrain";

function baseCandidates(fixture: CompanionJudgmentFixture): CompanionCandidate[] {
  const candidates: CompanionCandidate[] = [
    {
      id: "liability-check",
      label: "Clarify payment-link liability",
      source: "capture",
      themes: ["unlock", "admin"],
      estimatedMinutes: 30,
      unlockScore: 0.9,
      fitScore: 0.8,
    },
    {
      id: "newsletter-draft",
      label: "Newsletter draft",
      source: "project",
      themes: ["marketing"],
      estimatedMinutes: 90,
      unlockScore: 0.4,
      fitScore: 0.5,
    },
    {
      id: "launch-page-review",
      label: "Launch page final review",
      source: "project",
      themes: ["unlock", "launch"],
      estimatedMinutes: 90,
      unlockScore: 0.85,
      fitScore: 0.7,
    },
    {
      id: "client-call-prep",
      label: "Client call prep",
      source: "calendar",
      themes: ["courtesy"],
      estimatedMinutes: 20,
      unlockScore: 0.6,
      fitScore: 0.8,
    },
    {
      id: "reschedule-client",
      label: "Reschedule client call",
      source: "calendar",
      themes: ["courtesy"],
      estimatedMinutes: 10,
      unlockScore: 0.7,
      fitScore: 0.9,
    },
    {
      id: "doctor-appointment",
      label: "Doctor appointment",
      source: "calendar",
      themes: ["health"],
      estimatedMinutes: 60,
      unlockScore: 0.9,
      fitScore: 0.95,
    },
    {
      id: "exploration-block",
      label: "Exploration block — cluster ideas",
      source: "capture",
      themes: ["explore", "creative"],
      estimatedMinutes: 45,
      unlockScore: 0.5,
      fitScore: 0.85,
    },
    {
      id: "personal-note",
      label: "Personal note to early supporter",
      source: "relationship",
      themes: ["confidence"],
      estimatedMinutes: 15,
      unlockScore: 0.3,
      fitScore: 0.7,
    },
  ];

  if (fixture.id === "high-energy-launch") {
    return candidates.filter((c) =>
      ["launch-page-review", "personal-note", "newsletter-draft"].includes(c.id),
    );
  }
  if (fixture.id === "health") {
    return candidates.filter((c) => c.themes.includes("health") || c.id === "liability-check");
  }
  if (fixture.id === "family-first") {
    return candidates.filter((c) =>
      ["reschedule-client", "liability-check", "newsletter-draft"].includes(c.id),
    );
  }
  if (fixture.id === "creative") {
    return candidates.filter((c) => c.themes.includes("explore") || c.themes.includes("marketing"));
  }
  if (fixture.id === "overwhelm") {
    return candidates.slice(0, 3);
  }

  return candidates;
}

export function mapFixtureToCompanionMemory(
  fixture: CompanionJudgmentFixture,
): CompanionMemorySnapshot {
  const { input } = fixture;
  const brain = createDefaultCompanionBrainState(input.dayKey);
  if (input.brainPredictionAccuracyEwma != null) {
    brain.calibration.predictionAccuracyEwma = input.brainPredictionAccuracyEwma;
  }

  return {
    dayKey: input.dayKey,
    capacity: {
      energy: input.adaptMyDay.energy,
      motivation: input.adaptMyDay.motivation,
      vibe: input.adaptMyDay.vibe,
      healthNote:
        input.adaptMyDay.healthNote ??
        (fixture.id === "health" ? "migraine" : undefined),
      fresh: input.adaptMyDay.fresh,
    },
    brainState: brain,
    candidates: baseCandidates(fixture),
    exclusions: [
      "website rebuild",
      "full newsletter draft",
      "extra outreach batch",
      ...(fixture.id === "high-energy-launch"
        ? ["funnel emails", "affiliate outreach", "social scheduling"]
        : []),
    ],
    suppressTopics: input.mustNotSurface,
    captureLoad: {
      thoughtCount: input.cmmThoughtCount,
      recentCaptures: input.cmmRecentCaptures,
    },
    sessionFlags: {
      hyperfocusActive: input.hyperfocusSessionActive,
      hyperfocusMinutes: input.hyperfocusMinutes,
      userDeclaredSurvival: fixture.id === "low-energy",
    },
    yesterdaySummary: input.yesterdayOutcome,
    calendarHighlights: input.calendarHighlights,
    focusAreas: input.projectFocus,
    activeCooldowns: input.activeCooldowns,
    milestoneEvidence:
      fixture.id === "celebration"
        ? ["launch-completion-yesterday"]
        : undefined,
  };
}
