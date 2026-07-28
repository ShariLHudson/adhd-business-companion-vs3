import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ROUTING_ADAPTER_OR_LEGACY_STACKS,
  ROUTING_OWNERSHIP_CONTRACT,
  ROUTING_SURFACES,
  RoutingOwnershipViolation,
  assertRoutingOwnership,
  isPrimaryRoutingIntelligence,
  routingOwnerRoleForPath,
  type RoutingOwnerRole,
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

describe("EC-002.1 routing surface roles", () => {
  // Passing valid primary symbols means non-primary paths fail on the
  // ownership check (not the symbol check) — proving they cannot own.
  const liveSymbols = {
    resolveEstateIntelligenceImmediateAction: () => {},
    resolveEstateIntelligenceRoute: () => {},
  };

  it("only the declared primary owner can be affirmed as the routing owner", () => {
    expect(() =>
      assertRoutingOwnership({
        ownerPath: "lib/estateBrain/routeEstateIntelligence.ts",
        liveSymbols,
      }),
    ).not.toThrow();
    // The orchestration hub calls the primary but never owns place choice.
    expect(() =>
      assertRoutingOwnership({
        ownerPath: "lib/frictionlessActionLayer.ts",
        liveSymbols,
      }),
    ).toThrow(RoutingOwnershipViolation);
  });

  it("adapters, helpers, and execution primitives cannot claim ownership", () => {
    const nonOwners = [
      "lib/estateIntelligence/estateRouter.ts", // adapter
      "lib/estateCapabilityRegistry/index.ts", // adapter
      "lib/intentRoutingIntelligence.ts", // adapter
      "lib/estateNavigationIntelligence/resolveEstateNavigationIntent.ts", // helper
      "lib/estateExperiences/resolveEstateNavigation.ts", // helper
      "lib/estate/goToPlace.ts", // execution-primitive
      "app/companion/CompanionPageClient.tsx", // execution-primitive
    ];
    for (const path of nonOwners) {
      expect(isPrimaryRoutingIntelligence(path)).toBe(false);
      expect(() =>
        assertRoutingOwnership({ ownerPath: path, liveSymbols }),
      ).toThrow(RoutingOwnershipViolation);
    }
  });

  it("registers all six EC-002 routing surfaces with the correct role", () => {
    const expected: Array<[string, RoutingOwnerRole]> = [
      ["lib/estateIntelligence/estateRouter.ts", "adapter"],
      ["lib/estateCapabilityRegistry/index.ts", "adapter"],
      [
        "lib/estateNavigationIntelligence/resolveEstateNavigationIntent.ts",
        "helper",
      ],
      ["lib/estateExperiences/resolveEstateNavigation.ts", "helper"],
      ["lib/intentRoutingIntelligence.ts", "adapter"],
      // runDirectEstateRoomNavigation lives in the shell file.
      ["app/companion/CompanionPageClient.tsx", "execution-primitive"],
    ];
    for (const [path, role] of expected) {
      expect(routingOwnerRoleForPath(path)).toBe(role);
    }
    expect(
      ROUTING_SURFACES.some(
        (s) =>
          s.symbol === "runDirectEstateRoomNavigation" &&
          s.role === "execution-primitive",
      ),
    ).toBe(true);
  });

  it("keeps the primary route resolveFrictionlessAction -> Estate Brain -> shell execution", () => {
    expect(routingOwnerRoleForPath("lib/frictionlessActionLayer.ts")).toBe(
      "orchestration-hub",
    );
    expect(ROUTING_OWNERSHIP_CONTRACT.companionEntrySymbol).toBe(
      "resolveFrictionlessAction",
    );
    expect(
      routingOwnerRoleForPath("lib/estateBrain/routeEstateIntelligence.ts"),
    ).toBe("primary-intelligence");
    // Shared shell execution is represented as an execution primitive.
    expect(ROUTING_SURFACES.some((s) => s.role === "execution-primitive")).toBe(
      true,
    );
  });

  it("derives the adapter/helper view from ROUTING_SURFACES (single source of truth)", () => {
    expect(ROUTING_ADAPTER_OR_LEGACY_STACKS.length).toBeGreaterThanOrEqual(2);
    for (const entry of ROUTING_ADAPTER_OR_LEGACY_STACKS) {
      expect(["adapter", "helper"]).toContain(entry.role);
    }
    const validRoles = [
      "orchestration-hub",
      "primary-intelligence",
      "adapter",
      "helper",
      "execution-primitive",
    ];
    for (const surface of ROUTING_SURFACES) {
      expect(validRoles).toContain(surface.role);
    }
  });
});
