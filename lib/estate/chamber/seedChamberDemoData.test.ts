import { beforeEach, describe, expect, it, vi } from "vitest";

import { getProjects } from "@/lib/companionStore";
import { getEvidenceEntries } from "@/lib/evidenceBankStore";
import { getSavedGrowthWins } from "@/lib/growthWinsStore";
import { readMomentumPathMilestones } from "@/lib/momentumBuilderRoom/momentumPathHooks";
import {
  COMPANION_CHAMBER_DEMO_HREF,
  isChamberDemoMode,
  readChamberDemoQuery,
} from "./chamberDemoMode";
import {
  CHAMBER_DEMO_WEBSITE_PROJECT,
  CHAMBER_DEMO_WELCOME,
} from "./chamberDemoContent";
import {
  ensureChamberDemoDataSeeded,
  isChamberDemoPrepared,
  verifyChamberDemoAssets,
} from "./seedChamberDemoData";

function seedLocalStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
    clear: () => {
      mem.clear();
    },
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
    localStorage: storage,
    location: { search: "" },
  });
}

describe("chamberDemoMode", () => {
  it("detects demo query param", () => {
    expect(readChamberDemoQuery("?chamberDemo=1")).toBe(true);
    expect(readChamberDemoQuery("?chamberDemo=false")).toBe(false);
    expect(COMPANION_CHAMBER_DEMO_HREF).toContain("chamberDemo=1");
  });

  it("reads demo mode from window search", () => {
    seedLocalStorage();
    window.location.search = "?section=chamber-of-momentum&chamberDemo=1";
    expect(isChamberDemoMode()).toBe(true);
  });
});

describe("seedChamberDemoData", () => {
  beforeEach(() => {
    seedLocalStorage();
    localStorage.clear();
  });

  it("seeds Alex demo assets once", () => {
    expect(ensureChamberDemoDataSeeded()).toBe(true);
    expect(ensureChamberDemoDataSeeded()).toBe(false);
    expect(isChamberDemoPrepared()).toBe(true);

    const website = getProjects().find(
      (project) => project.name === CHAMBER_DEMO_WEBSITE_PROJECT.name,
    );
    expect(website?.nextAction).toBe(CHAMBER_DEMO_WEBSITE_PROJECT.nextAction);
    expect(getSavedGrowthWins().length).toBeGreaterThanOrEqual(3);
    expect(getEvidenceEntries().length).toBeGreaterThanOrEqual(3);
    expect(readMomentumPathMilestones().length).toBeGreaterThanOrEqual(4);

    const verification = verifyChamberDemoAssets();
    expect(verification.ok).toBe(true);
    expect(verification.missing).toEqual([]);
  });

  it("uses the Phase 8 welcome copy for Alex", () => {
    expect(CHAMBER_DEMO_WELCOME.title).toContain("Alex");
    expect(CHAMBER_DEMO_WELCOME.subtitle).toContain("next thing");
  });
});
