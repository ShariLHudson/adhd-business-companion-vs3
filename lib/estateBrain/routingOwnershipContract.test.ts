import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ROUTING_ADAPTER_OR_LEGACY_STACKS,
  ROUTING_OWNERSHIP_CONTRACT,
  isPrimaryRoutingIntelligence,
  routingOwnerRoleForPath,
} from "./routingOwnershipContract";

describe("Routing ownership contract (P0-05)", () => {
  it("declares Frictionless → Estate Brain as the production path", () => {
    expect(ROUTING_OWNERSHIP_CONTRACT.companionOrchestrationHub).toBe(
      "lib/frictionlessActionLayer.ts",
    );
    expect(ROUTING_OWNERSHIP_CONTRACT.companionEntrySymbol).toBe(
      "resolveFrictionlessAction",
    );
    expect(ROUTING_OWNERSHIP_CONTRACT.primaryIntelligenceOwner).toBe(
      "lib/estateBrain/",
    );
    expect(ROUTING_OWNERSHIP_CONTRACT.primaryRouteSymbols).toContain(
      "resolveEstateIntelligenceImmediateAction",
    );
  });

  it("marks estateIntelligence and capability registry as adapters", () => {
    expect(routingOwnerRoleForPath("lib/estateIntelligence/estateRouter.ts")).toBe(
      "adapter",
    );
    expect(
      routingOwnerRoleForPath("lib/estateCapabilityRegistry/index.ts"),
    ).toBe("adapter");
    expect(isPrimaryRoutingIntelligence("lib/estateBrain/routeEstateIntelligence.ts")).toBe(
      true,
    );
    expect(ROUTING_ADAPTER_OR_LEGACY_STACKS.length).toBeGreaterThanOrEqual(2);
  });

  it("CompanionPageClient calls resolveFrictionlessAction (not a parallel router)", () => {
    const client = readFileSync(
      join(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(client).toContain("resolveFrictionlessAction");
    expect(client).not.toMatch(
      /from ["']@\/lib\/estateIntelligence\/estateRouter["']/,
    );
  });

  it("frictionless hub imports Estate Brain immediate action", () => {
    const hub = readFileSync(
      join(process.cwd(), "lib/frictionlessActionLayer.ts"),
      "utf8",
    );
    expect(hub).toContain("resolveEstateIntelligenceImmediateAction");
    expect(hub).toContain("P0-05 Routing Ownership");
    expect(hub).toContain("routingOwnershipContract");
  });
});
