import { describe, expect, it } from "vitest";

import {
  CHAMBER_OF_MOMENTUM_ENTRY_PLACE_ID,
  CHAMBER_OF_MOMENTUM_MEMBER_NAME,
  consolidateChamberPlaceIdsForMenu,
  isChamberOfMomentumPlace,
  resolveChamberMemberFacingName,
} from "./chamberOfMomentumIdentity";

describe("chamberOfMomentumIdentity", () => {
  it("recognizes momentum sub-places as Chamber areas", () => {
    expect(isChamberOfMomentumPlace("momentum-institute")).toBe(true);
    expect(isChamberOfMomentumPlace("momentum-builder")).toBe(true);
    expect(isChamberOfMomentumPlace("goals-projects")).toBe(true);
    expect(isChamberOfMomentumPlace("library")).toBe(false);
  });

  it("returns one member-facing Chamber name for all momentum sub-places", () => {
    expect(resolveChamberMemberFacingName("momentum-builder")).toBe(
      CHAMBER_OF_MOMENTUM_MEMBER_NAME,
    );
    expect(resolveChamberMemberFacingName("goals-projects")).toBe(
      CHAMBER_OF_MOMENTUM_MEMBER_NAME,
    );
    expect(resolveChamberMemberFacingName("library")).toBeNull();
  });

  it("consolidates duplicate momentum entries to the Chamber doorway", () => {
    expect(
      consolidateChamberPlaceIdsForMenu([
        "library",
        "momentum-builder",
        "goals-projects",
        "momentum-institute",
      ]),
    ).toEqual(["library", CHAMBER_OF_MOMENTUM_ENTRY_PLACE_ID]);
  });
});
