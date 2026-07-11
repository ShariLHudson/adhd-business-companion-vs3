import { describe, expect, it } from "vitest";

import {
  assessSparkEstateSparkToolsCompliance,
  buildClearMyMindExperienceSteps,
  buildSparkToolsHubView,
  formatSparkEstateSparkToolsReport,
  getSparkEstateRoomToolSuggestions,
  getSparkEstateToolMemoryPreferences,
  mapSparkToolToSection,
  recordSparkEstateToolUse,
  resolveSparkEstateToolSuggestion,
  SPARK_ESTATE_CLEAR_MY_MIND_WELCOME,
  SPARK_ESTATE_CONTEXT_TOOL_SUGGESTIONS,
  SPARK_ESTATE_FOCUS_AUDIO_CATEGORIES,
  SPARK_ESTATE_SPARK_TOOLS_DISCOVERY_CHANNELS,
  SPARK_ESTATE_SPARK_TOOLS_HUB_NAME,
  SPARK_ESTATE_SPARK_TOOLS_PRINCIPLE,
  SPARK_ESTATE_TOOL_CATEGORIES,
  suggestFocusAudioForState,
  verifySparkEstateSparkToolsDiscoveryAndIntegration,
} from "./sparkEstateSparkToolsDiscoveryAndIntegration";

describe("sparkEstateSparkToolsDiscoveryAndIntegration", () => {
  it("defines the Spark Tools hub and five tool categories", () => {
    expect(SPARK_ESTATE_SPARK_TOOLS_PRINCIPLE).toContain("experiences");
    expect(SPARK_ESTATE_SPARK_TOOLS_HUB_NAME).toBe("Spark Tools");
    expect(SPARK_ESTATE_TOOL_CATEGORIES).toHaveLength(5);
    expect(SPARK_ESTATE_FOCUS_AUDIO_CATEGORIES).toHaveLength(5);
    expect(SPARK_ESTATE_SPARK_TOOLS_DISCOVERY_CHANNELS).toHaveLength(3);
    expect(SPARK_ESTATE_CONTEXT_TOOL_SUGGESTIONS).toHaveLength(5);
  });

  it("builds the hub view and maps tools to companion sections", () => {
    const hub = buildSparkToolsHubView();
    expect(hub.categories).toHaveLength(5);
    expect(hub.menuTools.length).toBeGreaterThan(0);
    expect(mapSparkToolToSection("clear-my-mind")).toBe("brain-dump");
    expect(mapSparkToolToSection("spin-wheel")).toBe("spin-wheel");
  });

  it("models the Clear My Mind Reflection Desk experience", () => {
    const steps = buildClearMyMindExperienceSteps();
    expect(steps[0]).toContain("Treehouse Reflection Desk");
    expect(steps[1]).toBe(SPARK_ESTATE_CLEAR_MY_MIND_WELCOME);
    expect(steps[4]).toContain("create project");
  });

  it("suggests tools from conversation context and room placement", () => {
    const clearMind = resolveSparkEstateToolSuggestion({ text: "I can't think." });
    expect(clearMind?.toolId).toBe("clear-my-mind");
    expect(clearMind?.suggestion).toContain("clear your mind");

    const spin = resolveSparkEstateToolSuggestion({
      text: "I don't know where to start.",
    });
    expect(spin?.toolId).toBe("spin-wheel");

    const chamberTools = getSparkEstateRoomToolSuggestions("chamber-of-momentum");
    expect(chamberTools.map((tool) => tool.id)).toContain("spin-wheel");
  });

  it("suggests focus audio based on energy and mood", () => {
    const lowEnergy = suggestFocusAudioForState({
      text: "I have low energy and need to work.",
      energy: "low",
    });
    expect(lowEnergy.category).toBe("Focus");
    expect(lowEnergy.suggestion).toContain("Focus session");
  });

  it("records tool memory and verifies discovery compliance", () => {
    recordSparkEstateToolUse("focus-audio", "before writing");
    const memory = getSparkEstateToolMemoryPreferences();
    expect(memory?.frequentTools[0]).toBe("focus-audio");
    expect(memory?.helpfulPatterns).toContain("before writing");

    const verification = verifySparkEstateSparkToolsDiscoveryAndIntegration();
    const compliance = assessSparkEstateSparkToolsCompliance();
    expect(verification.toolCategories).toBe(5);
    expect(verification.discoveryReady).toBe(true);
    expect(verification.clearMyMindReady).toBe(true);
    expect(compliance.appFeatureBridgeReady).toBe(true);
    expect(compliance.sunroomEnvironmentReady).toBe(true);

    const report = formatSparkEstateSparkToolsReport();
    expect(report).toContain("Spark Tools");
    expect(report).toContain("Context suggestions");
    expect(report).toContain("Compliance checks");
  });
});
