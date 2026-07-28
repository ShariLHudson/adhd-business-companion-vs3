/**
 * EC-001 — the Routing Ownership Contract (P0-05) is enforced at runtime.
 *
 * Before EC-001 the contract was passive metadata: nothing consumed it, so
 * drift (a renamed/removed primary symbol, or a non-primary owner) went
 * undetected. These tests verify the contract is now enforced — loading the
 * primary routing module runs a load-time self-affirmation, and
 * `assertRoutingOwnership` fails loudly on drift.
 */
import { describe, expect, it } from "vitest";
import {
  ROUTING_OWNERSHIP_CONTRACT,
  RoutingOwnershipViolation,
  assertRoutingOwnership,
} from "./routingOwnershipContract";
// Static import: loading this module runs its dev/test load-time
// self-affirmation. If the contract were violated, this import — and the whole
// test file — would throw at collection instead of reaching the assertions.
import * as routeModule from "./routeEstateIntelligence";

const liveRouteSymbols = routeModule as unknown as Record<string, unknown>;

describe("EC-001 routing ownership enforcement", () => {
  it("the primary owner module loaded and ran its self-affirmation without throwing", () => {
    expect(typeof routeModule.resolveEstateIntelligenceImmediateAction).toBe(
      "function",
    );
    expect(typeof routeModule.resolveEstateIntelligenceRoute).toBe("function");
  });

  it("every declared primary symbol resolves to a live function (no drift)", () => {
    for (const symbol of ROUTING_OWNERSHIP_CONTRACT.primaryRouteSymbols) {
      expect(typeof liveRouteSymbols[symbol]).toBe("function");
    }
  });

  it("assertRoutingOwnership passes for the real primary owner", () => {
    expect(() =>
      assertRoutingOwnership({
        ownerPath: "lib/estateBrain/routeEstateIntelligence.ts",
        liveSymbols: liveRouteSymbols,
      }),
    ).not.toThrow();
  });

  it("throws when a non-primary module claims ownership", () => {
    expect(() =>
      assertRoutingOwnership({
        ownerPath: "lib/estateIntelligence/estateRouter.ts",
        liveSymbols: {
          resolveEstateIntelligenceImmediateAction: () => {},
          resolveEstateIntelligenceRoute: () => {},
        },
      }),
    ).toThrow(RoutingOwnershipViolation);
  });

  it("throws when a declared primary symbol is missing (drift)", () => {
    expect(() =>
      assertRoutingOwnership({
        ownerPath: "lib/estateBrain/routeEstateIntelligence.ts",
        liveSymbols: { resolveEstateIntelligenceImmediateAction: () => {} },
      }),
    ).toThrow(RoutingOwnershipViolation);
  });

  it("no longer declares the stale routeEstateIntelligence symbol", () => {
    expect(ROUTING_OWNERSHIP_CONTRACT.primaryRouteSymbols).toContain(
      "resolveEstateIntelligenceRoute",
    );
    expect(ROUTING_OWNERSHIP_CONTRACT.primaryRouteSymbols).not.toContain(
      "routeEstateIntelligence",
    );
  });
});
