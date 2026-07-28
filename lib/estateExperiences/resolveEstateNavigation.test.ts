import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  formatEstateNavigationChoiceMenu,
  resolveEstateNavigationDisambiguation,
  resolveEstateNavigationDiscovery,
  parseEstateNavigationChoiceReply,
} from "./resolveEstateNavigation";
import {
  RoutingOwnershipViolation,
  assertRoutingOwnership,
  isPrimaryRoutingIntelligence,
  routingOwnerRoleForPath,
} from "@/lib/estateBrain/routingOwnershipContract";

describe("resolveEstateNavigation", () => {
  it("offers three experiences for vague business intent", () => {
    const d = resolveEstateNavigationDisambiguation(
      "I need to work on my business",
    );
    expect(d?.confidence).toBe("medium");
    expect(d?.choices.map((c) => c.experienceId)).toEqual([
      "momentum",
      "create",
      "business",
    ]);
    const menu = formatEstateNavigationChoiceMenu(d!);
    expect(menu).toMatch(/Which feels right today/i);
    expect(menu).toMatch(/Momentum/);
    expect(menu).toMatch(/Create/);
    expect(menu).toMatch(/Boardroom/);
  });

  it("discovers collaboratively when member is lost", () => {
    const d = resolveEstateNavigationDiscovery("I don't know where to start");
    expect(d?.confidence).toBe("low");
    expect(d?.intro).toMatch(/figure it out together/i);
    expect(d?.question).toMatch(/making something new/i);
  });

  it("parses numbered and named replies to medium menus", () => {
    const d = resolveEstateNavigationDisambiguation("work on my business")!;
    expect(parseEstateNavigationChoiceReply("2", d.choices)?.experienceId).toBe(
      "create",
    );
    expect(
      parseEstateNavigationChoiceReply("momentum", d.choices)?.experienceId,
    ).toBe("momentum");
  });
});

describe("resolveEstateNavigation — EC-002.2 helper-only (cannot bypass Estate Brain)", () => {
  const MODULE_PATH = "lib/estateExperiences/resolveEstateNavigation.ts";

  it("is registered as a helper, never the primary routing owner", () => {
    expect(routingOwnerRoleForPath(MODULE_PATH)).toBe("helper");
    expect(isPrimaryRoutingIntelligence(MODULE_PATH)).toBe(false);
  });

  it("cannot be affirmed as the routing owner", () => {
    expect(() =>
      assertRoutingOwnership({
        ownerPath: MODULE_PATH,
        liveSymbols: {
          resolveEstateIntelligenceImmediateAction: () => {},
          resolveEstateIntelligenceRoute: () => {},
        },
      }),
    ).toThrow(RoutingOwnershipViolation);
  });

  it("contains no navigation executor — it produces options, never opens a place", () => {
    const src = readFileSync(join(process.cwd(), MODULE_PATH), "utf8");
    expect(src).not.toMatch(/\bgoToPlace\b/);
    expect(src).not.toMatch(/openSection\w*/);
    expect(src).not.toMatch(/window\.location/);
    expect(src).not.toMatch(/requestOpen\w*/);
  });

  it("returns only disambiguation/discovery data (no navigation-action fields)", () => {
    const disambiguation = resolveEstateNavigationDisambiguation(
      "I need to work on my business",
    )!;
    expect(Array.isArray(disambiguation.choices)).toBe(true);
    expect(disambiguation).not.toHaveProperty("pendingAction");
    expect(disambiguation).not.toHaveProperty("section");
    expect(disambiguation).not.toHaveProperty("navigate");

    const discovery = resolveEstateNavigationDiscovery(
      "I don't know where to start",
    )!;
    expect(typeof discovery.question).toBe("string");
    expect(discovery).not.toHaveProperty("pendingAction");
    expect(discovery).not.toHaveProperty("section");
  });
});
