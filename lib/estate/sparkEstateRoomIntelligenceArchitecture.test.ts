import { describe, expect, it } from "vitest";

import {
  assessSparkEstateRoomIndependence,
  buildSparkEstateRoomIntelligenceContext,
  formatSparkEstateRoomIntelligenceArchitectureReport,
  getSparkEstateRoomEntryPrompt,
  getSparkEstateRoomExpertise,
  resolveSparkEstateCrossRoomSupport,
  resolveSparkEstateRoomExpertiseGroup,
  SPARK_ESTATE_ROOM_ARCHITECTURE_LAYERS,
  SPARK_ESTATE_ROOM_EXPERTISE,
  SPARK_ESTATE_ROOM_INDEPENDENCE_RULES,
  SPARK_ESTATE_ROOM_INTELLIGENCE_PRINCIPLE,
  SPARK_ESTATE_ROOM_INTELLIGENCE_VISION,
  SPARK_ESTATE_SHARED_DATA_FLOWS,
  SPARK_ESTATE_SHARED_FOUNDATION,
  verifySparkEstateRoomIntelligenceArchitecture,
} from "./sparkEstateRoomIntelligenceArchitecture";

describe("sparkEstateRoomIntelligenceArchitecture", () => {
  it("defines four architecture layers and six expertise groups", () => {
    const verification = verifySparkEstateRoomIntelligenceArchitecture();
    expect(SPARK_ESTATE_ROOM_ARCHITECTURE_LAYERS).toHaveLength(4);
    expect(Object.keys(SPARK_ESTATE_ROOM_EXPERTISE)).toHaveLength(6);
    expect(SPARK_ESTATE_ROOM_INTELLIGENCE_PRINCIPLE).toContain("not separate personalities");
    expect(SPARK_ESTATE_ROOM_INTELLIGENCE_VISION).toContain("One companion");
    expect(verification.architectureLayers).toBe(4);
    expect(verification.expertiseGroups).toBe(6);
    expect(verification.sharedFoundationReady).toBe(true);
    expect(verification.conversationAligned).toBe(true);
  });

  it("maps sections to room expertise and entry prompts", () => {
    expect(resolveSparkEstateRoomExpertiseGroup("content-generator")).toBe("content");
    expect(resolveSparkEstateRoomExpertiseGroup("momentum-builder")).toBe("project");
    expect(resolveSparkEstateRoomExpertiseGroup("grow-observatory")).toBe("research");

    const chamber = getSparkEstateRoomExpertise("chamber");
    expect(chamber.specialties).toContain("next steps");
    expect(getSparkEstateRoomEntryPrompt("momentum-builder")).toContain("project");
  });

  it("builds room intelligence context with routing", () => {
    const context = buildSparkEstateRoomIntelligenceContext({
      section: "content-generator",
      text: "Help me write a newsletter",
    });
    expect(context.expertiseGroup).toBe("content");
    expect(context.shariVoiceConsistent).toBe(true);
    expect(context.route?.need).toBe("create");
  });

  it("brings in momentum support without forcing a room change", () => {
    const support = resolveSparkEstateCrossRoomSupport({
      section: "content-generator",
      text: "I don't know where to start",
    });
    expect(support.currentExpertise).toBe("content");
    expect(support.supportingExpertise).toBe("chamber");
    expect(support.stayInRoom).toBe(true);
    expect(support.guidance).toContain("without forcing");
  });

  it("documents shared foundation and data flows", () => {
    expect(SPARK_ESTATE_SHARED_FOUNDATION.memberContext.fields).toHaveLength(6);
    expect(SPARK_ESTATE_SHARED_FOUNDATION.universalCreationJourney.steps).toHaveLength(8);
    expect(SPARK_ESTATE_SHARED_DATA_FLOWS.length).toBeGreaterThanOrEqual(3);
    expect(SPARK_ESTATE_ROOM_INDEPENDENCE_RULES.length).toBeGreaterThanOrEqual(4);
    expect(assessSparkEstateRoomIndependence("project").independent).toBe(true);
  });

  it("formats a readable room intelligence report", () => {
    const report = formatSparkEstateRoomIntelligenceArchitectureReport();
    expect(report).toContain("Room architecture layers");
    expect(report).toContain("Shared foundation");
    expect(report).toContain("Room expertise");
    expect(report).toContain("Integration checks");
  });
});
