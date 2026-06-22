import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getRegistryCoverageReport,
  listAllRegistryKeys,
  lookupRegistryEntry,
  SIGNAL_REGISTRY,
} from "./signalRegistry";
import { listMappedSignalCategories } from "./signalMapping";

describe("signalRegistry", () => {
  it("has registry entries for all signalMapping categories", () => {
    const report = getRegistryCoverageReport();
    expect(report.missingCategories).toEqual([]);
    expect(report.coveragePercent).toBe(100);
    expect(report.registeredCategories).toBe(report.totalMappingCategories);
  });

  it("every mapped category resolves via lookupRegistryEntry", () => {
    for (const category of listMappedSignalCategories()) {
      const keys = listAllRegistryKeys().filter((k) => k.endsWith(`:${category}`));
      expect(keys.length).toBeGreaterThan(0);
      const [domain, cat] = keys[0]!.split(":");
      expect(lookupRegistryEntry(domain as import("./signalBusTypes").SignalDomain, cat)).not.toBeNull();
    }
  });

  it("registry keys are unique domain:category pairs", () => {
    const keys = listAllRegistryKeys();
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("known emotional overwhelm entry has trait paths", () => {
    const entry = lookupRegistryEntry("emotional", "overwhelm");
    expect(entry?.traitPaths.length).toBeGreaterThan(0);
    expect(entry?.defaultWeight).toBeGreaterThan(0);
  });
});
