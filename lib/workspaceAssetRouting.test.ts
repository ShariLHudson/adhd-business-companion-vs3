import { describe, expect, it } from "vitest";
import {
  detectAssistantWorkspaceLaunch,
  isBareCatalogPick,
  resolveAssetRoute,
  shouldAutoRouteAssetRequest,
} from "./workspaceAssetRouting";

describe("workspaceAssetRouting", () => {
  it("routes client avatar to client-avatars workspace", () => {
    const route = resolveAssetRoute("I need to build a client avatar");
    expect(route?.section).toBe("client-avatars");
  });

  it("routes workshop to projects with bootstrap", () => {
    const route = resolveAssetRoute("I need a workshop plan for my launch");
    expect(route?.section).toBe("projects");
    expect(route?.bootstrapProjects).toBe(true);
  });

  it("routes proposal to create with blank scaffold", () => {
    const route = resolveAssetRoute("I need a proposal for a new client");
    expect(route?.section).toBe("content-generator");
    expect(route?.itemType).toBe("Proposal");
    expect(route?.draftContent).toContain("Prepared For");
  });

  it("detects auto-route asset requests", () => {
    expect(shouldAutoRouteAssetRequest("help me write an SOP")).toBe(true);
    expect(shouldAutoRouteAssetRequest("what is an SOP")).toBe(false);
  });

  it("auto-routes bare catalog picks like client avatar", () => {
    expect(isBareCatalogPick("client avatar")).toBe(true);
    expect(shouldAutoRouteAssetRequest("client avatar")).toBe(true);
    const route = resolveAssetRoute("client avatar");
    expect(route?.section).toBe("client-avatars");
  });

  it("detects assistant opening a catalog workspace from user pick", () => {
    const route = detectAssistantWorkspaceLaunch(
      "Let's open **Create** to build your client avatar. What would you like to title it?",
      "client avatar",
    );
    expect(route?.section).toBe("client-avatars");
  });
});
