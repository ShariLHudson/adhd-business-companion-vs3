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

  it("composeIntegrationCenterView includes all integration groups in sprint order", () => {
    const view = composeIntegrationCenterView();
    expect(view.groups.map((group) => group.label)).toEqual([
      "Communication",
      "Development",
      "Marketing",
      "Operations",
      "Business",
      "AI Tools",
      "Social Media",
      "Productivity",
      "Research",
    ]);
    const names = view.groups.flatMap((g) => g.integrations.map((i) => i.name));
    expect(names).toContain("PostCraft™");
    expect(names).toContain("Google Mail");
    expect(names).toContain("GitHub");
    expect(names).toContain("ChatGPT Command Center");
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
