import { beforeEach, describe, expect, it, vi } from "vitest";

import { getMomentumEvents, saveProject } from "@/lib/companionStore";
import { getEvidenceEntries } from "@/lib/evidenceBankStore";
import { getSavedGrowthWins } from "@/lib/growthWinsStore";
import { completeChamberProject, createChamberProject } from "./chamberProjectEngine";
import { getChamberProjectMeta } from "./chamberProjectMeta";
import {
  buildChamberMemoryGuidance,
  captureChamberProjectCompletion,
  getChamberMemorySnapshot,
  getChamberMemorySummaryForMember,
  recordChamberBlockerOccurrence,
  recordChamberIntelligenceVisit,
  recordChamberPatternObservation,
} from "./chamberOfMomentumMemory";
import type { ChamberIntelligenceAssessment } from "./chamberOfMomentumIntelligence";

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
  });
}

describe("chamberOfMomentumMemory", () => {
  beforeEach(() => {
    seedLocalStorage();
    localStorage.clear();
  });

  it("connects project completion to wins, evidence, and project meta", () => {
    const project = createChamberProject({
      name: "Website launch",
      desiredOutcome: "Launch my website",
      nextAction: "Write the homepage headline",
    });

    const completed = completeChamberProject(
      project.id,
      "Published the homepage",
      "Starting small made it doable",
    );

    expect(completed).not.toBeNull();
    const meta = getChamberProjectMeta(project.id);
    expect(meta?.linkedWinId).toBeTruthy();
    expect(meta?.linkedEvidenceId).toBeTruthy();
    expect(meta?.completedAt).toBeTruthy();
    expect(getSavedGrowthWins().some((win) => win.id === meta?.linkedWinId)).toBe(
      true,
    );
    expect(
      getEvidenceEntries().some((entry) => entry.id === meta?.linkedEvidenceId),
    ).toBe(true);
    expect(getMomentumEvents().some((event) => event.type === "complete")).toBe(
      true,
    );
  });

  it("strengthens patterns and surfaces guidance", () => {
    recordChamberPatternObservation("small-first-step");
    recordChamberPatternObservation("small-first-step");
    expect(buildChamberMemoryGuidance()).toContain("small first step");
  });

  it("records intelligence visits without duplicating domain stores", () => {
    const assessment: ChamberIntelligenceAssessment = {
      state: "overwhelmed",
      energy: "low",
      priority: "reduce-overwhelm",
      intent: "build",
      section: "brain-dump",
      stuckBlocker: null,
      memberQuestion: null,
      lowEnergyMode: true,
    };
    recordChamberIntelligenceVisit(assessment);
    const snapshot = getChamberMemorySnapshot();
    expect(snapshot.recentBlockers.some((entry) => entry.category === "overwhelm")).toBe(
      true,
    );
    expect(
      snapshot.patternObservations.some(
        (entry) => entry.pattern === "low-energy-mode",
      ),
    ).toBe(true);
  });

  it("summarizes remembered progress for the member", () => {
    const projects = saveProject({
      name: "Coaching program",
      goal: "Launch offer",
      nextAction: "Draft outline",
      status: "active-focus",
    });
    const project = projects[0]!;
    captureChamberProjectCompletion(project, "Finished the outline");
    recordChamberBlockerOccurrence({ category: "unclear-next-step" });
    const summary = getChamberMemorySummaryForMember();
    expect(summary.some((line) => line.includes("completed project"))).toBe(true);
  });
});
