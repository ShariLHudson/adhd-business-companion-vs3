/**
 * EC-002.4a — execution / adapter boundary proofs for the estateIntelligence
 * routing surface. Locks the already-correct architecture without changing
 * behavior:
 *  - estateIntelligence is an adapter and cannot affirm itself as the owner.
 *  - runDirectEstateRoomNavigation is execution-only (no intent interpretation,
 *    no capability matching, no estate-command evaluation, no destination
 *    (re)selection via goToPlace).
 *  - estateNavigateCommandForPlace builds a command from a SUPPLIED place; it
 *    never selects a destination from natural-language intent.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  RoutingOwnershipViolation,
  assertRoutingOwnership,
  isPrimaryRoutingIntelligence,
  routingOwnerRoleForPath,
} from "@/lib/estateBrain/routingOwnershipContract";
import { estateNavigateCommandForPlace } from "./estateCommandRouter";

const COMPANION_CLIENT = "app/companion/CompanionPageClient.tsx";

/** Extract the runDirectEstateRoomNavigation function body (brace-matched). */
function runDirectEstateRoomNavigationBody(src: string): string {
  const start = src.indexOf("function runDirectEstateRoomNavigation(");
  expect(start).toBeGreaterThan(-1);
  // The parameter list itself contains a `{ skipAssistantMessage }` brace, so
  // anchor on `) {` (params close + body open), not the first `{`.
  const sigEnd = src.indexOf(") {", start);
  expect(sigEnd).toBeGreaterThan(start);
  const bodyStart = src.indexOf("{", sigEnd);
  let depth = 0;
  for (let i = bodyStart; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return src.slice(bodyStart, i + 1);
    }
  }
  return src.slice(bodyStart);
}

describe("EC-002.4a — estateIntelligence adapter boundary", () => {
  const ADAPTER_PATHS = [
    "lib/estateIntelligence/estateCommandRouter.ts",
    "lib/estateIntelligence/estateRouter.ts",
    "lib/estateIntelligence/estateMatcher.ts",
  ];

  it("is registered as an adapter, never the primary routing owner", () => {
    for (const path of ADAPTER_PATHS) {
      expect(routingOwnerRoleForPath(path)).toBe("adapter");
      expect(isPrimaryRoutingIntelligence(path)).toBe(false);
    }
  });

  it("cannot affirm itself as the routing owner", () => {
    expect(() =>
      assertRoutingOwnership({
        ownerPath: "lib/estateIntelligence/estateCommandRouter.ts",
        liveSymbols: {
          resolveEstateIntelligenceImmediateAction: () => {},
          resolveEstateIntelligenceRoute: () => {},
        },
      }),
    ).toThrow(RoutingOwnershipViolation);
  });

  it("routing-surface registry roles still match runtime reality", () => {
    expect(routingOwnerRoleForPath("lib/frictionlessActionLayer.ts")).toBe(
      "orchestration-hub",
    );
    expect(
      routingOwnerRoleForPath("lib/estateBrain/routeEstateIntelligence.ts"),
    ).toBe("primary-intelligence");
    expect(
      routingOwnerRoleForPath("lib/estateIntelligence/estateCommandRouter.ts"),
    ).toBe("adapter");
    expect(routingOwnerRoleForPath("lib/estate/goToPlace.ts")).toBe(
      "execution-primitive",
    );
    expect(routingOwnerRoleForPath(COMPANION_CLIENT)).toBe("execution-primitive");
  });
});

describe("EC-002.4a — estateNavigateCommandForPlace is a command-builder (adapter)", () => {
  it("builds a command from a SUPPLIED placeId", () => {
    const cmd = estateNavigateCommandForPlace("apple-orchard", "visit");
    expect(cmd?.kind).toBe("direct");
    expect(cmd?.roomId ?? cmd?.entryId).toBe("apple-orchard");
  });

  it("does not self-grant executeImmediately (EC-002.4b-1 — recommendation only)", () => {
    // The builder recommends a destination; it must not authorize immediate
    // execution itself — that authority belongs to the hub / Estate Brain path.
    const cmd = estateNavigateCommandForPlace("apple-orchard", "visit");
    expect(cmd).not.toBeNull();
    expect(cmd?.executeImmediately).toBe(false);
    const viaAlias = estateNavigateCommandForPlace("clear-my-mind");
    expect(viaAlias?.executeImmediately).toBe(false);
  });

  it("does not select a destination from natural-language intent", () => {
    // A feeling/task sentence is not a supplied place → no command produced.
    expect(
      estateNavigateCommandForPlace(
        "i feel overwhelmed and don't know what to work on today",
      ),
    ).toBeNull();
    expect(estateNavigateCommandForPlace("help me write an email")).toBeNull();
  });
});

describe("EC-002.4a — runDirectEstateRoomNavigation is execution-only", () => {
  const src = readFileSync(join(process.cwd(), COMPANION_CLIENT), "utf8");

  it("the shell never re-selects via goToPlace / matchEstate / evaluateEstateCommand", () => {
    expect(src).not.toMatch(/\bgoToPlace\s*\(/);
    expect(src).not.toMatch(/matchEstate/);
    expect(src).not.toMatch(/evaluateEstateCommand/);
  });

  it("its body executes a decided command and never interprets or selects intent", () => {
    const body = runDirectEstateRoomNavigationBody(src);
    // Sanity: we extracted the real (large) executor body.
    expect(body.length).toBeGreaterThan(3000);
    expect(body).toMatch(/command\.section/);
    expect(body).toMatch(/command\.roomId/);
    expect(body).toMatch(/executeEstateCommandMemoryHandoff/);
    // Execution-only: no intent interpretation or destination (re)selection.
    expect(body).not.toMatch(/\bdetectDirectCommand\s*\(/);
    expect(body).not.toMatch(/\bestateNavigateCommandForPlace\s*\(/);
    expect(body).not.toMatch(/\bevaluateEstateCommand\s*\(/);
    expect(body).not.toMatch(/\bmatchEstate\w*\s*\(/);
    expect(body).not.toMatch(/\bgoToPlace\s*\(/);
  });
});
