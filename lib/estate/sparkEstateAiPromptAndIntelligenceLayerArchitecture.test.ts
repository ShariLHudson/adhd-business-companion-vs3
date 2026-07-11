import { describe, expect, it } from "vitest";

import {
  assessSparkEstateAiPromptAndIntelligenceLayerCompliance,
  buildSparkEstateIntelligenceLayerStack,
  evaluateSparkEstateIntelligencePrompt,
  formatSparkEstateAiPromptAndIntelligenceLayerReport,
  SPARK_ESTATE_AI_QUALITY_TEST,
  SPARK_ESTATE_CONVERSATION_PRIORITY,
  SPARK_ESTATE_INTELLIGENCE_AVOID,
  SPARK_ESTATE_INTELLIGENCE_LAYERS,
  SPARK_ESTATE_PROMPT_RULES,
  SPARK_ESTATE_PROMPT_STRUCTURE_FIELDS,
  verifySparkEstateAiPromptAndIntelligenceLayerArchitecture,
} from "./sparkEstateAiPromptAndIntelligenceLayerArchitecture";

describe("sparkEstateAiPromptAndIntelligenceLayerArchitecture", () => {
  it("defines seven intelligence layers and prompt structure", () => {
    const verification = verifySparkEstateAiPromptAndIntelligenceLayerArchitecture();
    expect(SPARK_ESTATE_INTELLIGENCE_LAYERS).toHaveLength(7);
    expect(SPARK_ESTATE_PROMPT_STRUCTURE_FIELDS).toHaveLength(6);
    expect(SPARK_ESTATE_CONVERSATION_PRIORITY).toHaveLength(6);
    expect(verification.layers).toBe(7);
    expect(verification.intelligenceLayerReady).toBe(true);
  });

  it("keeps companion identity and member context layers always active", () => {
    const stack = buildSparkEstateIntelligenceLayerStack();
    expect(stack.layers[0]?.id).toBe("companion-identity");
    expect(stack.layers[0]?.active).toBe(true);
    expect(stack.layers[1]?.id).toBe("member-context");
    expect(stack.layers[1]?.active).toBe(true);
  });

  it("activates routing, workflow, and room layers from member intent", () => {
    const stack = buildSparkEstateIntelligenceLayerStack({
      text: "Help me create a launch plan for my workshop",
      section: "chamber-of-momentum",
    });
    const active = stack.layers.filter((layer) => layer.active).map((layer) => layer.id);
    expect(active).toContain("routing");
    expect(active).toContain("workflow");
    expect(stack.routedIntelligence).toBeTruthy();
  });

  it("evaluates intelligence prompt definitions against quality test", () => {
    const evaluation = evaluateSparkEstateIntelligencePrompt({
      identity: "Spark — one trusted companion voice",
      purpose: "Help members move forward with clarity",
      knowledge: "progress, clarity, next steps",
      behavior: "Ask one useful question at a time",
      boundaries: "Do not become a separate personality",
      connections: "Momentum Builder, Knowledge Cards",
    });
    expect(evaluation.approved).toBe(true);
    expect(evaluation.issues).toHaveLength(0);
    expect(evaluation.qualityTest).toHaveLength(SPARK_ESTATE_AI_QUALITY_TEST.length);
  });

  it("rejects prompts missing required structure fields", () => {
    const evaluation = evaluateSparkEstateIntelligencePrompt({
      identity: "Spark",
      purpose: "",
      knowledge: "clarity",
      behavior: "guide gently",
      boundaries: "no duplicate workflows",
    });
    expect(evaluation.approved).toBe(false);
    expect(evaluation.issues.some((issue) => issue.includes("purpose"))).toBe(true);
  });

  it("defines prompt rules and intelligence avoid list", () => {
    const compliance = assessSparkEstateAiPromptAndIntelligenceLayerCompliance();
    expect(SPARK_ESTATE_PROMPT_RULES.length).toBeGreaterThanOrEqual(5);
    expect(SPARK_ESTATE_INTELLIGENCE_AVOID).toContain("disconnected memory");
    expect(compliance.promptRulesReady).toBe(true);
    expect(compliance.avoidListReady).toBe(true);
  });

  it("formats a readable intelligence layer report", () => {
    const report = formatSparkEstateAiPromptAndIntelligenceLayerReport();
    expect(report).toContain("Intelligence layers");
    expect(report).toContain("Conversation priority");
    expect(report).toContain("AI quality test");
    expect(report).toContain("Compliance checks");
  });
});
