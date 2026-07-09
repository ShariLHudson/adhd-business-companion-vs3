import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  formatChamberDemoChecklistReport,
  runChamberFinalDemoChecklist,
  verifyChamberDemoFlowSteps,
} from "./chamberFinalDemoChecklist";
import { ensureChamberDemoDataSeeded } from "./seedChamberDemoData";
import { CHAMBER_WELCOME_TITLE } from "../chamberOfMomentumRouting";

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

describe("chamberFinalDemoChecklist", () => {
  it("passes Priority 1 checks for the Chamber demo build", () => {
    const result = runChamberFinalDemoChecklist();
    expect(result.mustFix.every((item) => item.passed)).toBe(true);
    expect(CHAMBER_WELCOME_TITLE).toContain("Welcome to the Chamber");
    expect(verifyChamberDemoFlowSteps().every((step) => step.passed)).toBe(true);
  });

  it("requires demo assets when requested for full demo readiness", () => {
    seedLocalStorage();
    localStorage.clear();
    const withoutAssets = runChamberFinalDemoChecklist({ requireDemoAssets: true });
    expect(withoutAssets.readyForDemo).toBe(false);

    ensureChamberDemoDataSeeded();
    const withAssets = runChamberFinalDemoChecklist({ requireDemoAssets: true });
    const failed = [...withAssets.mustFix, ...withAssets.important].filter(
      (item) => !item.passed,
    );
    expect(failed, failed.map((item) => item.id).join(", ")).toEqual([]);
    expect(withAssets.readyForDemo).toBe(true);
    expect(withAssets.demoHref).toContain("chamberDemo=1");
  });

  it("formats a readable readiness report", () => {
    const report = formatChamberDemoChecklistReport(runChamberFinalDemoChecklist());
    expect(report).toContain("Priority 1");
    expect(report).toContain("Demo URL");
  });
});
