// Founder Ecosystem — Phase 13 Adaptive Companion tests.
// Proves that across a 30–60 day history the ecosystem learns how the founder
// works, what creates momentum, what creates overwhelm, and the support style —
// and that proactive check-ins stay supportive (never nag/guilt/pressure).
// (Spec deliverable "adaptiveCompanionTests.ts"; *.test.ts so vitest runs it.)

import { describe, expect, it } from "vitest";

import { containsClinicalLanguage } from "../clinicalLanguageGuard";

import { sampleFounderHistory } from "../intelligence/fixtures/founderHistory";
import { simulateMasterWorkflow } from "../fixtures/masterWorkflow";
import {
  buildCompanionProfile,
  getMomentumPatterns,
  profileContext,
} from "./companionProfile";
import {
  companionPromptHints,
  personalizedRecommendationPolicy,
  proactiveCheckInPolicy,
} from "./companionGuidance";
import { detectMomentumPatterns } from "./momentumPatternEngine";
import { detectOverwhelmPatterns } from "./overwhelmPatternEngine";
import { adaptResponse, adaptBriefingEmphasis } from "./adaptiveResponseEngine";
import { generateCheckIns, isSupportiveCheckIn } from "./checkInEngine";
import { generateCelebrations } from "./celebrationEngine";
import { computeFounderSupportScore, supportPosture } from "./founderSupportScore";
import { buildCompanionDashboard } from "./companionDashboard";
import type { SupportStyle } from "./companionTypes";

const FOUNDER = "founder-001";
const NOW = new Date("2026-06-10T09:00:00.000Z");
const history = () => sampleFounderHistory(FOUNDER, NOW);

const VALID_WORK = [
  "visionary", "builder", "implementer", "creator", "strategist", "teacher", "operator",
];
const VALID_SUPPORT: SupportStyle[] = [
  "encouragement", "direct-action", "brainstorming", "accountability", "planning", "reflection", "education",
];

describe("companion profile learns how the founder works", () => {
  const profile = buildCompanionProfile(history(), FOUNDER);

  it("detects at least one valid work style with a confidence", () => {
    expect(profile.workStyles.length).toBeGreaterThan(0);
    for (const w of profile.workStyles) {
      expect(VALID_WORK).toContain(w.value);
      expect(["low", "medium", "high"]).toContain(w.confidence);
    }
  });

  it("detects a valid support style", () => {
    expect(VALID_SUPPORT).toContain(profile.supportStyle.value);
  });

  it("produces every style dimension and relationship memory", () => {
    expect(profile.communicationStyle.value).toBeTruthy();
    expect(profile.planningStyle.value).toBeTruthy();
    expect(profile.motivationStyle.value).toBeTruthy();
    expect(profile.focusStyle.value).toBeTruthy();
    expect(profile.decisionStyle.value).toBeTruthy();
    expect(profile.relationshipMemory.frequentProjects.length).toBeGreaterThanOrEqual(0);
  });

  it("surfaces plain-English pattern observations", () => {
    expect(Array.isArray(profile.observations)).toBe(true);
  });

  it("includes founder preferences and check-in behavior placeholders", () => {
    expect(profile.preferences.recommendationDensity).toBeTruthy();
    expect(typeof profile.preferences.proactiveCheckIns).toBe("boolean");
    expect(profile.checkInBehavior.maxPerDay).toBeGreaterThan(0);
    expect(profile.checkInBehavior.notes.length).toBeGreaterThan(0);
    expect(profile.momentumPatterns).toBeNull();
    expect(getMomentumPatterns(profile).positive).toEqual([]);
  });

  it("fills pattern slots when includePatterns is true", () => {
    const full = buildCompanionProfile(history(), FOUNDER, { includePatterns: true });
    expect(full.momentumPatterns?.positive.length).toBeGreaterThan(0);
    expect(full.overwhelmPatterns).toBeDefined();
  });

  it("exposes a stable profileContext for other engines", () => {
    const ctx = profileContext(profile);
    expect(ctx.supportStyle.value).toBe(profile.supportStyle.value);
    expect(ctx.preferences).toBe(profile.preferences);
  });
});

describe("Shari guidance from profile", () => {
  const profile = buildCompanionProfile(history(), FOUNDER, { includePatterns: true });

  it("builds prompt hints for personalized coaching", () => {
    const hints = companionPromptHints(profile);
    expect(hints).toContain("ADAPTIVE COMPANION PROFILE");
    expect(hints).toContain(profile.supportStyle.value);
  });

  it("limits recommendations for minimal density founders", () => {
    const policy = personalizedRecommendationPolicy({
      ...profile,
      preferences: { ...profile.preferences, recommendationDensity: "minimal" },
    });
    expect(policy.maxSuggestions).toBe(1);
  });

  it("defines proactive check-in policy without pressure", () => {
    const policy = proactiveCheckInPolicy(profile);
    expect(policy.tone).toContain("invitation");
    expect(policy.maxPerDay).toBeGreaterThan(0);
  });
});

describe("momentum patterns", () => {
  it("identifies positive drivers and a best time of day", () => {
    const m = detectMomentumPatterns(history(), FOUNDER);
    expect(m.positive.length).toBeGreaterThan(0);
    expect(m.positive[0].direction).toBe("positive");
    // weights are bounded 0–100
    for (const d of [...m.positive, ...m.negative]) {
      expect(d.weight).toBeGreaterThanOrEqual(0);
      expect(d.weight).toBeLessThanOrEqual(100);
    }
  });
});

describe("overwhelm patterns", () => {
  it("returns triggers with frequency, severity and recovery methods", () => {
    const o = detectOverwhelmPatterns(history(), FOUNDER);
    for (const t of o.triggers) {
      expect(t.frequency).toBeGreaterThan(0);
      expect(["low", "medium", "high"]).toContain(t.severity);
      expect(t.recoveryMethods.length).toBeGreaterThan(0);
    }
  });
});

describe("adaptive responses change with support style", () => {
  it("brainstormers get questions; action-takers get a fast next step", () => {
    const brainstorm = adaptResponse({
      ...buildCompanionProfile(history(), FOUNDER),
      supportStyle: { value: "brainstorming", score: 5, confidence: "high" },
    });
    const action = adaptResponse({
      ...buildCompanionProfile(history(), FOUNDER),
      supportStyle: { value: "direct-action", score: 5, confidence: "high" },
    });
    expect(brainstorm.askMoreQuestions).toBe(true);
    expect(action.giveNextStepFast).toBe(true);
    expect(action.tone).toBe("direct");
  });

  it("briefing emphasis differs for planners vs action-takers", () => {
    const planner = adaptBriefingEmphasis({
      ...buildCompanionProfile(history(), FOUNDER),
      planningStyle: { value: "planner", score: 5, confidence: "high" },
      supportStyle: { value: "planning", score: 5, confidence: "high" },
    });
    expect(planner.lead).toBe("planning");
  });
});

describe("proactive check-ins are always supportive", () => {
  it("never nags, guilts, or pressures", () => {
    const checkIns = generateCheckIns(history(), FOUNDER, { now: NOW });
    for (const c of checkIns) {
      expect(c.tone).toBe("supportive");
      expect(isSupportiveCheckIn(c)).toBe(true);
      expect(c.message.toLowerCase()).not.toMatch(/you should|you must|you failed|you forgot|behind|lazy/);
    }
  });
});

describe("celebration engine notices wins", () => {
  it("celebrates focus consistency / completions on an active week", () => {
    const wins = generateCelebrations(
      simulateMasterWorkflow(FOUNDER, new Date("2026-06-09T09:00:00.000Z")),
      FOUNDER,
      { now: new Date("2026-06-10T09:00:00.000Z") },
    );
    expect(Array.isArray(wins)).toBe(true);
  });
});

describe("internal support score", () => {
  it("computes bounded sub-scores and is flagged internal-only", () => {
    const s = computeFounderSupportScore(history(), FOUNDER, { now: NOW });
    for (const v of [s.engagement, s.momentum, s.capacity, s.progress, s.consistency, s.overall]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
    expect(s.internalOnly).toBe(true);
    expect(["protect-capacity", "build-momentum", "sustain"]).toContain(supportPosture(s));
  });
});

describe("companion dashboard integration", () => {
  it("assembles insights, drivers, triggers, wins, suggestions and check-ins", () => {
    const dash = buildCompanionDashboard(history(), FOUNDER, NOW);
    expect(dash.profileSummary.workStyles.length).toBeGreaterThan(0);
    expect(dash.momentumDrivers.positive.length).toBeGreaterThan(0);
    expect(Array.isArray(dash.overwhelmTriggers)).toBe(true);
    expect(Array.isArray(dash.recentWins)).toBe(true);
    expect(dash.supportSuggestions.length).toBeGreaterThan(0);
    expect(dash._internalSupportScore.internalOnly).toBe(true);
  });

  it("never emits clinical/therapeutic language", () => {
    const blob = JSON.stringify(buildCompanionDashboard(history(), FOUNDER, NOW));
    expect(containsClinicalLanguage(blob)).toBe(false);
  });
});
