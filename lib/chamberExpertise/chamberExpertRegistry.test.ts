import { describe, expect, it } from "vitest";
import {
  CHAMBER_EXPERT_REGISTRY,
  assertChamberExpertRegistryIsWellFormed,
  chamberExpertById,
  chamberExpertName,
} from "./chamberExpertRegistry";
import { CHAMBER_EXPERT_IDS } from "./types";
import {
  ESTATE_BRAIN_TO_CANONICAL,
  PHASE_33_TO_CANONICAL,
  resolveLegacyExpertId,
  resolveLegacyExpertIds,
} from "./legacyExpertAliasMap";

describe("chamberExpertRegistry", () => {
  it("is well-formed (24 unique entries, valid relationships)", () => {
    expect(() => assertChamberExpertRegistryIsWellFormed()).not.toThrow();
  });

  it("has exactly the 24 canonical Chamber Members", () => {
    expect(CHAMBER_EXPERT_REGISTRY.length).toBe(24);
    expect(CHAMBER_EXPERT_REGISTRY.map((e) => e.id).sort()).toEqual(
      [...CHAMBER_EXPERT_IDS].sort(),
    );
  });

  it("looks up an expert by canonical id", () => {
    expect(chamberExpertById("SYS")?.name).toBe("Systems Intelligence");
    expect(chamberExpertName("MKT")).toBe("Marketing Intelligence");
  });

  it("every entry has activation signals, expertise areas, and a profile path", () => {
    for (const entry of CHAMBER_EXPERT_REGISTRY) {
      expect(entry.activationSignals.length).toBeGreaterThan(0);
      expect(entry.expertiseAreas.length).toBeGreaterThan(0);
      expect(entry.profilePath).toContain("Expert_Intelligence_Profile.md");
    }
  });

  it("never lists itself as a supporting or possible relationship", () => {
    for (const entry of CHAMBER_EXPERT_REGISTRY) {
      expect(entry.supportingRelationships).not.toContain(entry.id);
      expect(entry.possibleRelationships).not.toContain(entry.id);
    }
  });
});

describe("legacyExpertAliasMap", () => {
  it("maps all Phase 33 team member ids to a canonical prefix", () => {
    for (const canonical of Object.values(PHASE_33_TO_CANONICAL)) {
      expect(CHAMBER_EXPERT_IDS).toContain(canonical);
    }
  });

  it("maps all Estate Brain expert ids to a canonical prefix", () => {
    for (const canonical of Object.values(ESTATE_BRAIN_TO_CANONICAL)) {
      expect(CHAMBER_EXPERT_IDS).toContain(canonical);
    }
  });

  it("resolves a known legacy id case-insensitively", () => {
    expect(resolveLegacyExpertId("marketing")).toBe("MKT");
    expect(resolveLegacyExpertId("Business-Strategist")).toBe("STR");
  });

  it("returns null for an unknown legacy id", () => {
    expect(resolveLegacyExpertId("not-a-real-expert")).toBeNull();
  });

  it("resolves and de-duplicates a list of legacy ids", () => {
    expect(resolveLegacyExpertIds(["marketing-expert", "marketing", "unknown"])).toEqual(["MKT"]);
  });

  it("returns an empty array for missing input", () => {
    expect(resolveLegacyExpertIds(null)).toEqual([]);
    expect(resolveLegacyExpertIds(undefined)).toEqual([]);
    expect(resolveLegacyExpertIds([])).toEqual([]);
  });
});
