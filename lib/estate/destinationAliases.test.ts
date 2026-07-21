import { describe, expect, it } from "vitest";
import {
  AUTHORITATIVE_DESTINATION_IDS,
  LEGACY_ALIAS_RETIREMENT_PLAN,
  LEGACY_DESTINATION_ALIASES,
  isLegacyDestinationAlias,
  resolveAuthoritativeDestinationId,
} from "./destinationAliases";

describe("destinationAliases (096)", () => {
  it("lists authoritative destination ids", () => {
    expect(AUTHORITATIVE_DESTINATION_IDS).toContain("create");
    expect(AUTHORITATIVE_DESTINATION_IDS).toContain("projects");
    expect(AUTHORITATIVE_DESTINATION_IDS).toContain("spark-estate-guide");
  });

  it("resolves each legacy alias", () => {
    for (const [legacy, current] of Object.entries(LEGACY_DESTINATION_ALIASES)) {
      expect(resolveAuthoritativeDestinationId(legacy)).toBe(current);
      expect(isLegacyDestinationAlias(legacy)).toBe(true);
      expect(LEGACY_ALIAS_RETIREMENT_PLAN[legacy as keyof typeof LEGACY_ALIAS_RETIREMENT_PLAN]).toBeTruthy();
    }
  });
});
