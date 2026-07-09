import { describe, expect, it, beforeEach, vi } from "vitest";

import { getProjects, saveProject } from "@/lib/companionStore";
import {
  createChamberProject,
  isSpecificNextAction,
  suggestProjectBreakdown,
} from "./chamberProjectEngine";
import { getChamberProjectMeta } from "./chamberProjectMeta";

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

describe("chamberProjectEngine", () => {
  beforeEach(() => {
    seedLocalStorage();
    localStorage.clear();
  });

  it("requires specific next actions", () => {
    expect(isSpecificNextAction("Write the homepage headline")).toBe(true);
    expect(isSpecificNextAction("Work on website")).toBe(false);
    expect(isSpecificNextAction("Do it")).toBe(false);
  });

  it("suggests course and website breakdowns", () => {
    expect(suggestProjectBreakdown("Create an online course")).toContain(
      "Define audience",
    );
    expect(suggestProjectBreakdown("Launch my website")).toContain(
      "Write the homepage headline",
    );
  });

  it("creates a project with chamber metadata and next action", () => {
    const project = createChamberProject({
      name: "Website launch",
      desiredOutcome: "Launch my website",
      whyItMatters: "So clients can find me",
      nextAction: "Write the homepage headline",
    });

    expect(getProjects().some((p) => p.id === project.id)).toBe(true);
    expect(project.nextAction).toBe("Write the homepage headline");
    expect(getChamberProjectMeta(project.id)?.desiredOutcome).toBe(
      "Launch my website",
    );
  });

  it("maps existing projects through saveProject without breaking storage", () => {
    const projects = saveProject({
      name: "Existing project",
      goal: "Ship the offer",
      nextAction: "Draft the pricing page outline",
      status: "in-progress",
    });
    expect(projects[0]?.name).toBe("Existing project");
  });
});
