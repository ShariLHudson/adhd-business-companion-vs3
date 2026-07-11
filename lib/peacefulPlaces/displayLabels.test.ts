import { describe, expect, it } from "vitest";
import { peacefulPlaceDisplayName } from "./displayLabels";

describe("peacefulPlaceDisplayName", () => {
  it("removes trademark symbols from destination labels", () => {
    expect(peacefulPlaceDisplayName("Cozy Café")).toBe("Cozy Café");
    expect(peacefulPlaceDisplayName("Peaceful Places")).toBe("Peaceful Places");
  });
});
