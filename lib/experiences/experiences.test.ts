import { describe, expect, it } from "vitest";

import {
  ALL_EXPERIENCE_IDS,
  EXPERIENCE_FRAMEWORK_PRINCIPLE,
  EXPERIENCE_RULES,
  composeExperience,
  detectExperienceIntent,
  experienceService,
  listExperiences,
  routeExperienceFromPhrase,
} from "./index";

describe("Executive Experience Framework", () => {
  it("defines eight experience types — not software modules", () => {
    expect(ALL_EXPERIENCE_IDS.length).toBe(8);
    expect(EXPERIENCE_FRAMEWORK_PRINCIPLE).toContain("experiences");
    expect(EXPERIENCE_RULES.length).toBe(5);
  });

  it("lists experiences with purpose and emotional tone", () => {
    const catalog = listExperiences();
    expect(catalog.some((e) => e.id === "quiet_work")).toBe(true);
    expect(catalog.every((e) => e.purpose.length > 0)).toBe(true);
    expect(catalog.every((e) => e.emotionalTone.length > 0)).toBe(true);
  });

  it("detects intent from natural language", () => {
    const decide = detectExperienceIntent("Help me decide which launch path");
    expect(decide.experienceId).toBe("help_me_decide");
    expect(decide.confidence).not.toBe("low");

    const quiet = detectExperienceIntent("I need quiet focus time");
    expect(quiet.experienceId).toBe("quiet_work");
  });

  it("routes phrase to composed experience context", () => {
    const routed = routeExperienceFromPhrase("Research the listening rooms market", "listening-rooms");
    expect(routed.experience.id).toBe("research_for_me");
    expect(routed.experience.whyAmIHere.length).toBeGreaterThan(0);
    expect(routed.experience.composedFrom.length).toBeGreaterThan(0);
  });

  it("each experience answers the five experience rules", () => {
    for (const id of ALL_EXPERIENCE_IDS) {
      const view = composeExperience({ experienceId: id, missionId: "listening-rooms" });
      expect(view.experience.goal.length).toBeGreaterThan(0);
      expect(view.experience.nextStep.length).toBeGreaterThan(0);
      expect(view.experience.canWait.length).toBeGreaterThan(0);
      expect(view.experience.founderPrepares.length).toBeGreaterThan(0);
      expect(view.experience.flow.primaryAction.length).toBeGreaterThan(0);
    }
  });

  it("composes from existing systems without duplicating intelligence", () => {
    const build = composeExperience({ experienceId: "build_something", missionId: "listening-rooms" });
    expect(build.experience.composedFrom).toContain("command_center");
    expect(build.composed.desk).toBeTruthy();

    const company = composeExperience({ experienceId: "review_my_company", missionId: "listening-rooms" });
    expect(company.experience.composedFrom).toContain("executive_os");
    expect(company.composed.company).toBeTruthy();
  });

  it("leads with one primary recommendation per experience", () => {
    const view = composeExperience({ experienceId: "think_with_me", missionId: "listening-rooms" });
    const primary = view.experience.recommendations.filter((r) => r.tier === "primary");
    expect(primary.length).toBeGreaterThanOrEqual(1);
    expect(view.outcome.label).toBe(view.experience.primaryOutcome);
  });

  it("public API surfaces through experienceService", () => {
    expect(experienceService.sampleRepository().experienceIds().length).toBe(8);
    expect(experienceService.list().length).toBe(8);
    expect(experienceService.compose({ experienceId: "teach_me" }).experience.name).toBe("Teach Me");
  });
});
