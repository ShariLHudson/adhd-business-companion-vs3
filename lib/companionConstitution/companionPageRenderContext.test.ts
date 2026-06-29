import { describe, expect, it, vi } from "vitest";
import {
  assertConstitutionalPlaceAuthority,
  buildCompanionPageRenderContext,
  sceneForContext,
  sectionToSceneWorkspaceId,
} from "./companionPageRenderContext";
import { resolveCompanionRenderContext } from "./pipeline";

describe("companionPageRenderContext", () => {
  it("CompanionPageClient can obtain render context from constitutional pipeline", () => {
    const context = buildCompanionPageRenderContext({
      activeSection: "brain-dump",
      workspacePanel: null,
      workspaceBesideChat: false,
      displayEmotion: "overwhelmed",
      messageCount: 0,
    });

    expect(context.globalBackground).toEqual({
      scenePage: "recovery",
      sceneSeed: "brain-dump",
      clearMyMind: true,
      suppress: true,
    });
    expect(context.environment.dataAttributes["data-environment-intelligence"]).toBe(
      "1",
    );
    expect(context.presence.dataAttributes["data-presence-intelligence"]).toBe(
      "1",
    );
  });

  it("resolveCompanionRenderContext returns layers in constitutional order", () => {
    const context = resolveCompanionRenderContext({
      conversation: { activeSection: "focus", messageCount: 2 },
      orchestration: { emotionalState: "stuck", overwhelmed: true },
      scene: { workspaceId: "focus-category", focusCategoryId: "stuck" },
    });

    expect(context.conversation.dataAttributes["data-conversation-intelligence"]).toBe(
      "1",
    );
    expect(context.orchestration.dataAttributes["data-companion-intelligence"]).toBe(
      "1",
    );
    expect(context.environment.placeId).toBe("garden-path");
    expect(context.presence.state).toBeTruthy();
    expect(context.companion).toBeDefined();
  });

  it("sceneForContext preserves legacy section and emotion mapping", () => {
    expect(sceneForContext("overwhelmed", "home")).toBe("recovery");
    expect(sceneForContext("unclear", "focus-timer")).toBe("focus");
    expect(sceneForContext("building", "playbook")).toBe("business");
  });

  it("sectionToSceneWorkspaceId maps workspace panels without inventing place", () => {
    expect(sectionToSceneWorkspaceId("home", "plan-my-day")).toBe("plan-my-day");
    expect(sectionToSceneWorkspaceId("brain-dump")).toBe("clear-my-mind");
    expect(sectionToSceneWorkspaceId("settings")).toBeUndefined();
  });

  it("suppresses legacy wallpaper when Clear My Mind opens beside chat on home", () => {
    const context = buildCompanionPageRenderContext({
      activeSection: "home",
      workspacePanel: "brain-dump",
      workspaceBesideChat: true,
      displayEmotion: "unclear",
      messageCount: 2,
    });

    expect(context.globalBackground).toEqual({
      scenePage: "recovery",
      sceneSeed: "brain-dump",
      clearMyMind: true,
      suppress: true,
    });
  });

  it("suppresses legacy wallpaper when Growth hub is open", () => {
    const context = buildCompanionPageRenderContext({
      activeSection: "home",
      workspacePanel: "growth",
      workspaceBesideChat: true,
      displayEmotion: "unclear",
      messageCount: 1,
    });

    expect(context.globalBackground).toEqual({
      scenePage: "progress",
      sceneSeed: "growth",
      clearMyMind: false,
      suppress: true,
    });
  });

  it("flags lower-layer place overrides in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    const context = buildCompanionPageRenderContext({
      activeSection: "focus",
      workspacePanel: null,
      workspaceBesideChat: false,
      displayEmotion: "focused",
      messageCount: 1,
    });

    assertConstitutionalPlaceAuthority(context, "planning-table");

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("Lower layer attempted place"),
    );
    process.env.NODE_ENV = previousEnv;
    warn.mockRestore();
  });
});
