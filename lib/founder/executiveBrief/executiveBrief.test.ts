import { describe, expect, it } from "vitest";

import {
  buildExecutiveExplanation,
  buildExecutiveLearning,
  comparePriority,
  executiveBriefService,
  getExecutiveBrief,
  getFounderAlerts,
  getIfIWereRunningSection,
  IF_I_WERE_RUNNING_HEADLINE,
  isPlainEnglish,
  labelForPriority,
  learningSectionsForItem,
  listExpandableEvidence,
  priorityFromScore,
  readabilityScore,
  SAMPLE_EXECUTIVE_BRIEF,
  stripExecutiveJargon,
} from "./index";

describe("Executive Brief Experience", () => {
  it("sample brief greets Shari in plain English", () => {
    expect(SAMPLE_EXECUTIVE_BRIEF.greeting).toContain("Shari");
    expect(SAMPLE_EXECUTIVE_BRIEF.summary.stats.itemsReviewed).toBe(124);
    expect(SAMPLE_EXECUTIVE_BRIEF.calmClose).toBeTruthy();
  });

  it("executive explanation builder follows what / why / do format", () => {
    const explanation = buildExecutiveExplanation({
      title: "Test",
      whatHappened: "Members returned overwhelmed after absence.",
      whyItMatters: "Restart is the emotional door.",
      recommendedAction: "Continue Listening Rooms today.",
      actionKind: "build-now",
      connections: ["companion", "member-experience"],
      sparkEffect: "Estate feels like home.",
      businessEffect: "Retention improves.",
    });
    expect(explanation.whatHappened).toMatch(/overwhelmed/i);
    expect(explanation.whyShouldICare).toMatch(/Retention/i);
    expect(explanation.whatShouldWeDo).toMatch(/Listening Rooms/i);
    expect(explanation.connections).toContain("companion");
  });

  it("priority assignment maps scores to executive labels", () => {
    expect(priorityFromScore(94).label).toBe("critical");
    expect(priorityFromScore(80).label).toBe("high");
    expect(priorityFromScore(50).label).toBe("low");
    expect(priorityFromScore(60).label).toBe("medium");
    expect(labelForPriority("watch")).toBe("Watch");
    expect(comparePriority(priorityFromScore(90), priorityFromScore(40))).toBeLessThan(0);
  });

  it("founder alerts appear first and cover member-success domains", () => {
    const alerts = getFounderAlerts();
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts.every((a) => a.appearsFirst)).toBe(true);
    expect(alerts[0].domains).toContain("member-success");
    expect(alerts[0].explanation.whatHappened.length).toBeGreaterThan(10);
  });

  it("if I were running section provides top three advisor recommendations", () => {
    const section = getIfIWereRunningSection();
    expect(section.headline).toBe(IF_I_WERE_RUNNING_HEADLINE);
    expect(section.recommendations).toHaveLength(3);
    expect(section.recommendations[0].why).toBeTruthy();
    expect(section.recommendations[0].suggestedNextStep).toBeTruthy();
    expect(section.recommendations[0].missionRelationship).toBeTruthy();
  });

  it("learning sections and evidence expansion are presentation layers", () => {
    const item = SAMPLE_EXECUTIVE_BRIEF.opportunities[0];
    const learning = learningSectionsForItem(item);
    expect(learning.explainSimply).toBeTruthy();
    expect(learning.howSparkCouldUseThis).toBeTruthy();

    const evidence = listExpandableEvidence(item.evidence);
    expect(evidence.length).toBeGreaterThan(0);

    const custom = buildExecutiveLearning({
      title: "T",
      simple: "Simple",
      detail: "Detail",
      why: "Why",
      sparkUse: "Use",
      problem: "Problem",
    });
    expect(custom.teachWhyItMatters).toBe("Why");
  });

  it("readability helpers strip jargon and score plain English", () => {
    const cleaned = stripExecutiveJargon("We should leverage LLM agents to orchestrate KPIs.");
    expect(cleaned.toLowerCase()).not.toContain("llm");
    expect(isPlainEnglish("Members need a calm place to return.")).toBe(true);
    expect(readabilityScore("Short clear sentence.")).toBeGreaterThan(70);
  });

  it("public API composes brief with founder alerts first and readability report", () => {
    const brief = getExecutiveBrief();
    expect(brief.founderAlerts.length).toBeGreaterThan(0);
    expect(brief.ifIWereRunning.recommendations).toHaveLength(3);

    const report = executiveBriefService.readabilityReport(brief);
    expect(report.passes).toBe(true);
    expect(report.average).toBeGreaterThanOrEqual(70);
  });
});
