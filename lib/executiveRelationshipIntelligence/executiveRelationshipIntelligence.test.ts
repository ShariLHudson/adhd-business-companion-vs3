import { describe, expect, it } from "vitest";

import {
  composeDiscoveryDetail,
  composeDiscoverySession,
  getRelationshipIntelligenceBootstrap,
  RELATIONSHIP_INTELLIGENCE_PRINCIPLE,
} from "./index";

describe("Executive Relationship Intelligence engine", () => {
  it("exposes discovery principle", () => {
    expect(RELATIONSHIP_INTELLIGENCE_PRINCIPLE).toContain("knowledge");
  });

  it("composeDiscoverySession returns discoveries with why-it-matters", () => {
    const session = composeDiscoverySession("What might we be missing?");
    expect(session).not.toBeNull();
    expect(session!.discoveries.length).toBeGreaterThan(2);
    expect(session!.discoveries[0]!.whyShariShouldCare).toBeTruthy();
    expect(session!.discoveries[0]!.nobodyAskedOpener).toContain("noticed");
  });

  it("composeDiscoveryDetail includes butterfly chain and founder alert when present", () => {
    const detail = composeDiscoveryDetail("disc-butterfly-restart");
    expect(detail).not.toBeNull();
    expect(detail!.discovery.butterflyChain?.length).toBeGreaterThan(4);
    expect(detail!.founderAlert?.urgency).toBeTruthy();
  });

  it("getRelationshipIntelligenceBootstrap includes founder alerts", () => {
    const bootstrap = getRelationshipIntelligenceBootstrap();
    expect(bootstrap.founderAlertIds.length).toBeGreaterThan(0);
    expect(bootstrap.categoriesRepresented.length).toBeGreaterThan(3);
  });
});
