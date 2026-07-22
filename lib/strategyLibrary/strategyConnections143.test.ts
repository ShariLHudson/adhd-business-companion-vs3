import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  connectStrategyToProject,
} from "./strategyConnections";
import { pickActiveProject } from "./pickActiveProject";
import {
  getRecommendedStrategiesForApply,
  getTopStrategyRecommendations,
  STRATEGY_RECOMMENDATION_LIMIT,
} from "./recommendStrategies";
import { STRATEGY_ESTATE_SURFACES } from "./strategyEstateIntelligence";
import { STRATEGIES } from "@/lib/strategySystem";
import {
  getProjects,
  saveProject,
} from "@/lib/companionProjectsStore";

const lsStore: Record<string, string> = {};

describe("Prompt 143 — strategy project connect + recommendations", () => {
  beforeEach(() => {
    for (const k of Object.keys(lsStore)) delete lsStore[k];
    const storage = {
      getItem: (k: string) => lsStore[k] ?? null,
      setItem: (k: string, v: string) => {
        lsStore[k] = v;
      },
      removeItem: (k: string) => {
        delete lsStore[k];
      },
    };
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
      localStorage: storage,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal("localStorage", storage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("never silently creates a Project when none exists", () => {
    const strategy = STRATEGIES[0]!;
    const before = getProjects().length;
    const result = connectStrategyToProject(strategy);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.needsProjectChoice).toBe(true);
    }
    expect(getProjects().length).toBe(before);
  });

  it("defaults Connect to Current Focus project", () => {
    saveProject({
      name: "Website Redesign",
      goal: "Ship calmly",
      status: "active-focus",
      horizon: "now",
      nextAction: "Draft homepage",
    });
    const focus = pickActiveProject();
    expect(focus?.name).toBe("Website Redesign");

    const strategy = STRATEGIES[0]!;
    const beforeCount = getProjects().length;
    const result = connectStrategyToProject(strategy);
    expect(result.ok).toBe(true);
    expect(getProjects().length).toBe(beforeCount);
    if (result.ok) {
      expect(result.createdProject).toBe(false);
      expect(result.message).toMatch(/Current Focus/i);
    }
    const updated = getProjects().find((p) => p.id === focus!.id);
    expect(updated?.notes).toMatch(/Strategy:/);
  });

  it("creates a new Project only when explicitly requested", () => {
    const strategy = STRATEGIES[0]!;
    const before = getProjects().length;
    const result = connectStrategyToProject(strategy, { createNew: true });
    expect(result.ok).toBe(true);
    expect(getProjects().length).toBe(before + 1);
    if (result.ok) {
      expect(result.createdProject).toBe(true);
    }
  });

  it("limits recommendations to three before Browse All", () => {
    expect(STRATEGY_RECOMMENDATION_LIMIT).toBe(3);
    expect(getTopStrategyRecommendations()).toHaveLength(3);
    expect(getRecommendedStrategiesForApply()).toHaveLength(3);
  });

  it("registers Estate surfaces strategies quietly understand", () => {
    const ids = STRATEGY_ESTATE_SURFACES.map((s) => s.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "project",
        "work",
        "cartography",
        "chamber",
        "board",
        "evidence",
        "wins",
        "business-pulse",
      ]),
    );
  });
});
