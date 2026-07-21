import { describe, expect, it } from "vitest";
import { detectEstateIntent } from "./intentCategories";
import { resolveIntentFirstRoute } from "./routeIntentFirstNavigation";
import {
  resolveEstateIntelligenceRoute,
  resolveEstateIntelligenceImmediateAction,
} from "./routeEstateIntelligence";

describe("Intent-First Estate Navigation", () => {
  it("detects create intent from natural language", () => {
    const intent = detectEstateIntent("Help me write an SOP");
    expect(intent?.category).toBe("create");
  });

  it("routes SOP to Create Studio + Estate Create section", () => {
    const route = resolveIntentFirstRoute("Help me write an SOP");
    expect(route?.intentCategory).toBe("create");
    expect(route?.environmentId).toBe("create-studio");
    expect(route?.environmentName).toBe("Create Studio");
    expect(route?.capabilityId).toBe("create.sop");
    expect(route?.spaceId).toBe("creative-studio");
    expect(route?.toolId).toBe("create");
    expect(route?.immediateNavigate).toBe(true);
  });

  it("routes too many ideas to Visual Thinking Studio + Mind Map", () => {
    const route = resolveIntentFirstRoute("I have too many ideas");
    expect(route?.intentCategory).toBe("visual_thinking");
    expect(route?.environmentId).toBe("visual-thinking-studio");
    expect(route?.capabilityId).toBe("create.mindmap");
    expect(route?.toolId).toBe("visual-focus");

    const action = resolveEstateIntelligenceImmediateAction("I have too many ideas");
    expect(action?.kind).toBe("visual");
  });

  it("routes marketing strategy to Momentum", () => {
    const route = resolveIntentFirstRoute(
      "I need to build my marketing strategy",
    );
    expect(route?.intentCategory).toBe("plan");
    expect(route?.environmentId).toBe("momentum");
    expect(route?.capabilityId).toBe("momentum.marketing");
    expect(route?.spaceId).toBe("goals-projects");
  });

  it("routes competitor research to Study Hall", () => {
    const route = resolveIntentFirstRoute(
      "Research the newest AI accounting software",
    );
    expect(route?.intentCategory).toBe("learn");
    expect(route?.environmentId).toBe("study-hall");
    expect(route?.category).toBe("research");
    expect(route?.spaceId).toBe("study-hall");
  });

  it("routes calm down to Sunroom restore environment", () => {
    const route = resolveIntentFirstRoute("I need to calm down");
    expect(route?.intentCategory).toBe("restore");
    expect(route?.environmentId).toBe("sunroom");
    expect(route?.spaceId).toBe("sunroom");
  });

  it("keeps explain SWOT in conversation via intelligence router", () => {
    const route = resolveEstateIntelligenceRoute("Explain SWOT analysis");
    expect(route?.answerInConversation).toBe(true);
    expect(route?.immediateNavigate).toBe(false);
  });

  it("offers environment choices when write intent is vague", () => {
    const route = resolveIntentFirstRoute("Help me write something");
    expect(route?.alternativeEnvironments?.length).toBeGreaterThanOrEqual(2);
    expect(route?.immediateNavigate).toBe(false);
    expect(route?.followUpLine).toContain("couple of ways");
  });
});
