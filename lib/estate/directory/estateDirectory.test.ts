import { describe, expect, it } from "vitest";

import { canonicalRegistryStats } from "../canonicalEstateRegistry";
import {
  ESTATE_DIRECTORY,
  estateDirectoryStats,
  getEstateDirectoryConnections,
  getEstateDirectoryEntriesByCategory,
  getEstateDirectoryEntriesForProfile,
  getEstateDirectoryEntry,
  getNavigableEstateDirectoryEntries,
  validateEstateDirectoryIntegrity,
} from "./index";
import { goToPlace } from "../goToPlace";

describe("Estate Directory", () => {
  it("contains every canonical place", () => {
    const canon = canonicalRegistryStats();
    const directory = estateDirectoryStats();
    expect(directory.total).toBe(canon.total);
    expect(ESTATE_DIRECTORY.size).toBe(canon.total);
  });

  it("passes integrity validation", () => {
    expect(validateEstateDirectoryIntegrity()).toEqual([]);
  });

  it("maps category counts to canon", () => {
    const canon = canonicalRegistryStats();
    const directory = estateDirectoryStats();
    expect(directory.byCategory).toEqual(canon.byCategory);
  });

  it("resolves shell, media, and connections per entry", () => {
    const greenhouse = getEstateDirectoryEntry("greenhouse");
    expect(greenhouse).toBeDefined();
    expect(greenhouse!.category).toBe("living-place");
    expect(greenhouse!.shell.navigable).toBe(true);
    expect(greenhouse!.shell.section).toBe("growth-greenhouse");
    expect(greenhouse!.media.backgroundUrl).toContain("greenhouse");
    expect(greenhouse!.media.ambience?.src).toContain("greenhouse");
    expect(greenhouse!.connections.length).toBeGreaterThan(0);
    expect(greenhouse!.recommendWhen.length).toBeGreaterThan(0);
  });

  it("lists navigable living places and destinations", () => {
    const living = getEstateDirectoryEntriesByCategory("living-place");
    const destinations = getEstateDirectoryEntriesByCategory("destination");
    expect(living.length).toBe(28);
    expect(destinations.length).toBe(21);
    expect(
      getNavigableEstateDirectoryEntries().every((entry) => entry.shell.navigable),
    ).toBe(true);
  });

  it("suggests from directory profiles only", () => {
    const quiet = getEstateDirectoryEntriesForProfile("quiet", 3);
    expect(quiet.length).toBeGreaterThan(0);
    expect(quiet.length).toBeLessThanOrEqual(3);
    for (const entry of quiet) {
      expect(entry.suggestionProfiles).toContain("quiet");
    }
  });

  it("returns connected spaces that exist in directory", () => {
    const connections = getEstateDirectoryConnections("welcome-home");
    expect(connections.length).toBeGreaterThan(0);
    for (const entry of connections) {
      expect(ESTATE_DIRECTORY.has(entry.id)).toBe(true);
    }
  });

  it("goToPlace reads from directory without per-room hard-coding", () => {
    const outcome = goToPlace({
      placeId: "momentum-institute",
      userIntent: "Take me to the Momentum Institute.",
    });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const entry = getEstateDirectoryEntry("momentum-institute");
    expect(outcome.backgroundImage).toBe(entry?.media.backgroundUrl);
    expect(outcome.section).toBe(entry?.shell.section);
  });
});
