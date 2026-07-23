import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  CREATION_DESTINATION_OWNERSHIP,
  INTERACTION_OWNERSHIP_RULE,
  hasSingleLegalInteractionOwner,
  is066OwnershipArchitectureComplete,
  is066OwnershipRuntimeComplete,
  listIllegalInteractionOwners,
  listOwnershipDefects,
} from "./interactionOwnership";

describe("066 — Single Interaction Ownership", () => {
  it("declares Current Focus as sole legal interaction owner", () => {
    expect(INTERACTION_OWNERSHIP_RULE.soleOwner).toBe("current_focus");
    expect(hasSingleLegalInteractionOwner()).toBe(true);
    expect(is066OwnershipArchitectureComplete()).toBe(true);
  });

  it("066-RUNTIME — illegal owners empty and runtime complete", () => {
    expect(listIllegalInteractionOwners()).toEqual([]);
    expect(listOwnershipDefects()).toEqual([]);
    expect(is066OwnershipRuntimeComplete()).toBe(true);
  });

  it("classifies every Creation Destination interactive", () => {
    expect(CREATION_DESTINATION_OWNERSHIP.length).toBeGreaterThanOrEqual(15);
    const owners = CREATION_DESTINATION_OWNERSHIP.filter(
      (c) => c.role === "INTERACTION_OWNER",
    );
    expect(owners.map((o) => o.id)).toEqual(["current_focus"]);
  });

  it("ownership audit docs exist", () => {
    expect(
      existsSync(
        resolve(
          process.cwd(),
          "docs/create-experience/HARDENING_066_SINGLE_OWNERSHIP.md",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(
          process.cwd(),
          "docs/create-experience/HARDENING_066_RUNTIME_CURRENT_FOCUS.md",
        ),
      ),
    ).toBe(true);
  });
});
