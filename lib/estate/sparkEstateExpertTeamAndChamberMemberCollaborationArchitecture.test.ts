import { describe, expect, it } from "vitest";

import {
  assessSparkEstateExpertCollaborationCompliance,
  buildSparkEstateExpertCollaborationPlan,
  buildSparkEstateExpertHandoffLanguage,
  formatSparkEstateExpertCollaborationReport,
  getSparkEstateExpertCollaborationMemory,
  recordSparkEstateExpertCollaborationPreference,
  resolveSparkEstateExpertTeamActivation,
  SPARK_ESTATE_EXPERT_COLLABORATION_AVOID,
  SPARK_ESTATE_EXPERT_COLLABORATION_PRINCIPLE,
  SPARK_ESTATE_EXPERT_COLLABORATION_SUCCESS_TEST,
  SPARK_ESTATE_EXPERT_HANDOFF_LANGUAGE_AVOID,
  SPARK_ESTATE_EXPERT_TEAM_MEMBERS,
  SPARK_ESTATE_PRIMARY_COMPANION_RESPONSIBILITIES,
  verifySparkEstateExpertTeamAndChamberMemberCollaboration,
} from "./sparkEstateExpertTeamAndChamberMemberCollaborationArchitecture";

describe("sparkEstateExpertTeamAndChamberMemberCollaborationArchitecture", () => {
  it("defines six expert team members and the coordination principle", () => {
    expect(SPARK_ESTATE_EXPERT_TEAM_MEMBERS).toHaveLength(6);
    expect(SPARK_ESTATE_EXPERT_COLLABORATION_PRINCIPLE).toContain("Spark coordinates");
    expect(SPARK_ESTATE_PRIMARY_COMPANION_RESPONSIBILITIES).toContain("coordination");
    expect(SPARK_ESTATE_EXPERT_COLLABORATION_AVOID).toHaveLength(4);
  });

  it("activates a multi-expert team for sales funnel creation", () => {
    const activation = resolveSparkEstateExpertTeamActivation(
      "I need to create a sales funnel.",
    );
    expect(activation.activatedExperts).toEqual([
      "marketing",
      "content",
      "project",
      "momentum",
    ]);
    expect(activation.primaryExpert).toBe("marketing");
    expect(activation.handoffSuggestion).toContain("support would help us here");
    expect(activation.memberExperience).toContain("Spark is helping me");
  });

  it("uses the smallest helpful team for a simple momentum request", () => {
    const activation = resolveSparkEstateExpertTeamActivation(
      "I'm stuck on my next step.",
    );
    expect(activation.activatedExperts.length).toBeLessThanOrEqual(2);
    expect(activation.smallestHelpfulTeam).toBe(true);
    expect(activation.primaryExpert).toBe("momentum");
  });

  it("builds a collaboration plan with chamber recommendation and handoff language", () => {
    const plan = buildSparkEstateExpertCollaborationPlan({
      text: "I need to create a sales funnel.",
    });
    expect(plan.activatedExperts).toHaveLength(4);
    expect(plan.chamberRecommended).toBe(true);
    expect(plan.primaryCompanion).toContain("Shari voice");
    expect(plan.internalSupport.length).toBe(4);

    const handoff = buildSparkEstateExpertHandoffLanguage("marketing");
    expect(handoff).toContain("support would help us here");
    expect(handoff).not.toContain(SPARK_ESTATE_EXPERT_HANDOFF_LANGUAGE_AVOID[0]);
  });

  it("remembers helpful expert preferences without unnecessary profiles", () => {
    const memory = recordSparkEstateExpertCollaborationPreference({
      helpfulExperts: ["marketing", "project"],
      collaborationStyle: "guided",
    });
    expect(memory.helpfulExperts).toEqual(["marketing", "project"]);
    expect(getSparkEstateExpertCollaborationMemory()?.collaborationStyle).toBe(
      "guided",
    );
  });

  it("verifies collaboration compliance and formats a readable report", () => {
    const verification = verifySparkEstateExpertTeamAndChamberMemberCollaboration();
    const compliance = assessSparkEstateExpertCollaborationCompliance();
    expect(verification.experts).toBe(6);
    expect(verification.collaborationReady).toBe(true);
    expect(verification.smallestTeamReady).toBe(true);
    expect(SPARK_ESTATE_EXPERT_COLLABORATION_SUCCESS_TEST).toContain(
      "team helping me",
    );
    expect(compliance.analyticsBridgeReady).toBe(true);

    const report = formatSparkEstateExpertCollaborationReport();
    expect(report).toContain("Expert team members");
    expect(report).toContain("Sales funnel collaboration example");
    expect(report).toContain("Compliance checks");
  });
});
