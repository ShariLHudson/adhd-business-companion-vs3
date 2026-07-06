import { describe, expect, it } from "vitest";

import {
  GHL_CAPABILITIES,
  POSTCRAFT_CAPABILITIES,
  parseMarketingIntegrationStatus,
  resolveIntegrationActionHref,
  resolveIntegrationConnectionLabel,
} from "./integrationConnection";
import { composeIntegrationCenterView } from "./services/executiveIntegrationService";

describe("Integration connection — PostCraft & GoHighLevel", () => {
  it("defines PostCraft and GHL capability lists", () => {
    expect(POSTCRAFT_CAPABILITIES.map((c) => c.label)).toEqual([
      "Open PostCraft",
      "Send content to PostCraft",
      "Import PostCraft analytics",
    ]);
    expect(GHL_CAPABILITIES.map((c) => c.label)).toEqual([
      "Open GHL",
      "Prepare funnel",
      "Prepare email workflow",
      "Import campaign results",
    ]);
  });

  it("parseMarketingIntegrationStatus reflects live env configuration", () => {
    expect(
      parseMarketingIntegrationStatus({
        ghlApiConfigured: true,
        locationIdConfigured: true,
        ecosystemSignalsLive: true,
      }),
    ).toEqual({ postcraft: "connected", gohighlevel: "connected" });

    expect(parseMarketingIntegrationStatus({})).toEqual({
      postcraft: "not-connected",
      gohighlevel: "not-connected",
    });
  });

  it("resolveIntegrationActionHref maps marketing actions", () => {
    expect(resolveIntegrationActionHref("postcraft", "pc-open")).toBe("/ecosystem/dashboard");
    expect(resolveIntegrationActionHref("gohighlevel", "ghl-funnel")).toBe("/ghl/dashboard");
    expect(resolveIntegrationActionHref("postcraft", "pc-send")).toBe(
      "/companion/founder/creation-studio",
    );
  });

  it("marketing integrations expose capabilities and actions in center view", () => {
    const view = composeIntegrationCenterView();
    const postcraft = view.groups
      .flatMap((g) => g.integrations)
      .find((i) => i.id === "postcraft");
    const ghl = view.groups
      .flatMap((g) => g.integrations)
      .find((i) => i.id === "gohighlevel");

    expect(postcraft?.capabilities).toHaveLength(3);
    expect(ghl?.capabilities).toHaveLength(4);
    expect(postcraft?.quickActions.map((a) => a.label)).toContain("Open PostCraft");
    expect(ghl?.quickActions.map((a) => a.label)).toContain("Prepare email workflow");
    expect(resolveIntegrationConnectionLabel(postcraft!)).toBe("not-connected");
  });
});
