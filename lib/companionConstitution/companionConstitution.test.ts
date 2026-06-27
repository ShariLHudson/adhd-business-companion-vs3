import { describe, expect, it } from "vitest";
import {
  CONSTITUTIONAL_HIERARCHY,
  createCompanionState,
  ELEVATE_LIFE_EXPERIENCE_RULE,
  resolveCompanionIntelligence,
  resolveCompanionRenderContext,
  resolveConversationIntelligence,
  resolveEnvironment,
  resolvePlace,
  resolvePresence,
  roomRegistryEntry,
  SPECIALIZED_INTELLIGENCE_REGISTRY,
  validateSpecializedIntelligenceRegistry,
} from "./index";

describe("Companion Constitution", () => {
  it("declares elevate the life experience constitutional rule", () => {
    expect(ELEVATE_LIFE_EXPERIENCE_RULE).toMatch(/internal experience/i);
    expect(ELEVATE_LIFE_EXPERIENCE_RULE).toMatch(/false positivity/i);
  });

  it("declares full intelligence hierarchy", () => {
    expect(CONSTITUTIONAL_HIERARCHY[0]).toBe("conversation-intelligence");
    expect(CONSTITUTIONAL_HIERARCHY[1]).toBe("companion-intelligence");
    expect(CONSTITUTIONAL_HIERARCHY[2]).toBe("specialized-intelligence-layer");
    expect(CONSTITUTIONAL_HIERARCHY).toContain("environment-intelligence");
    expect(CONSTITUTIONAL_HIERARCHY).toContain("scene-render-contract");
  });

  it("specialized registry has no duplicate responsibilities", () => {
    expect(validateSpecializedIntelligenceRegistry()).toEqual([]);
    expect(SPECIALIZED_INTELLIGENCE_REGISTRY.length).toBeGreaterThanOrEqual(18);
  });

  it("conversation intelligence understands mode without routing alone", () => {
    const verdict = resolveConversationIntelligence({
      activeSection: "home",
      messageCount: 3,
    });
    expect(verdict.state.mode).toBe("chat");
    expect(verdict.dataAttributes["data-conversation-intelligence"]).toBe("1");
  });

  it("companion intelligence orchestrates specialized layer silently", () => {
    const conversation = resolveConversationIntelligence({
      activeSection: "focus",
      userText: "I am stuck and cannot start",
    });
    const orchestration = resolveCompanionIntelligence({
      conversation,
      emotionalState: "stuck",
      overwhelmed: true,
    });
    expect(orchestration.activeIntelligences).toContain("focus-intelligence");
    expect(orchestration.activeIntelligences).toContain("memory-intelligence");
    expect(orchestration.silentIntelligences).not.toContain("focus-intelligence");
    expect(orchestration.dataAttributes["data-companion-intelligence"]).toBe("1");
  });

  it("resolveEnvironment is sole authority for focus category place", () => {
    const env = resolveEnvironment({
      workspaceId: "focus-category",
      focusCategoryId: "stuck",
    });
    expect(env.placeId).toBe("garden-path");
    expect(env.focusLandscapeSpaceId).toBe("garden-path");
    expect(env.motionProfile.livingBorderPlaceId).toBe("garden-path");
  });

  it("resolveEnvironment is sole authority for clear my mind place", () => {
    expect(resolvePlace({ workspaceId: "clear-my-mind" })).toBe("greenhouse");
  });

  it("placeForSection delegates through resolvePlace", () => {
    expect(resolvePlace({ section: "focus" })).toBe("sunroom-over-pond");
    expect(resolvePlace({ section: "plan-my-day" })).toBe("planning-table");
  });

  it("resolvePresence is sole authority for Shari visibility", () => {
    const presence = resolvePresence({
      workspaceId: "plan-my-day",
      placeId: "planning-table",
    });
    expect(presence.dataAttributes["data-presence-intelligence"]).toBe("1");
    expect(presence.dataAttributes["data-sharis-presence"]).toBeTruthy();
  });

  it("full pipeline orders layers without lower overrides", () => {
    const context = resolveCompanionRenderContext({
      scene: {
        workspaceId: "focus-category",
        focusCategoryId: "stuck",
      },
      conversation: { activeSection: "focus" },
      orchestration: { overwhelmed: true },
    });

    expect(context.conversation.state.mode).toBe("standalone-workspace");
    expect(context.orchestration.activeIntelligences).toContain("focus-intelligence");
    expect(context.environment.placeId).toBe("garden-path");
    expect(context.presence.state).toBe("listening");
    expect(context.environment.dataAttributes["data-environment-intelligence"]).toBe(
      "1",
    );
  });

  it("room registry has one definition per place", () => {
    const entry = roomRegistryEntry("greenhouse");
    expect(entry.name).toContain("Greenhouse");
    expect(entry.supportedWorkspaces).toContain("clear-my-mind");
  });
});
