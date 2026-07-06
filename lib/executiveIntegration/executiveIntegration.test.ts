import { describe, expect, it } from "vitest";

import {
  composeIntegrationCenterView,
  composeIntegrationSearch,
  getExecutiveIntegrationBootstrap,
  INTEGRATION_CENTER_PRINCIPLE,
} from "./index";

describe("Executive Integration Center™", () => {
  it("exposes one office principle", () => {
    expect(INTEGRATION_CENTER_PRINCIPLE).toContain("orchestrates");
  });

  it("composeIntegrationCenterView includes all integration groups", () => {
    const view = composeIntegrationCenterView();
    expect(view.groups.length).toBeGreaterThan(7);
    const names = view.groups.flatMap((g) => g.integrations.map((i) => i.name));
    expect(names).toContain("PostCraft™");
    expect(names).toContain("Google Mail");
    expect(names).toContain("GitHub");
  });

  it("integrations expose status and quick actions", () => {
    const view = composeIntegrationCenterView();
    const postcraft = view.groups
      .flatMap((g) => g.integrations)
      .find((i) => i.id === "postcraft");
    expect(postcraft?.status).toBe("needs-configuration");
    expect(postcraft?.capabilities.length).toBe(3);
    expect(postcraft?.quickActions.length).toBe(3);
    expect(postcraft?.highlights.length).toBeGreaterThan(0);
  });

  it("composeIntegrationSearch finds company assets", () => {
    const results = composeIntegrationSearch("Listening Rooms");
    expect(results.results.length).toBeGreaterThan(0);
    expect(results.results[0]!.title.toLowerCase()).toContain("listening");
  });

  it("getExecutiveIntegrationBootstrap counts connected systems", () => {
    const bootstrap = getExecutiveIntegrationBootstrap();
    expect(bootstrap.connectedCount).toBeGreaterThan(8);
    expect(bootstrap.oneOfficeMessage).toContain("today");
  });
});
