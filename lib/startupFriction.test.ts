import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  FOCUS_START_OPTIONS,
  activeAvatarSummary,
  buildCreateInspiration,
  buildHomeSuggestedStep,
  buildTodayMomentum,
} from "./startupFriction";
import { createSavedWork } from "./savedWorkStore";
import { logMomentum, saveAvatar } from "./companionStore";

function seedLocalStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => mem.set(k, v),
    removeItem: (k: string) => mem.delete(k),
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { dispatchEvent: vi.fn(), localStorage: storage });
  for (const key of [
    "companion-saved-work-v1",
    "companion-momentum-v1",
    "companion-ideal-clients-v1",
    "companion-create-workflow-record-v1",
    "companion-decision-compass-session-v1",
    "companion-projects-v1",
    "companion-project-items-v1",
  ]) {
    localStorage.removeItem(key);
  }
}

describe("Momentum Sprint #1 — startup friction", () => {
  beforeEach(() => {
    seedLocalStorage();
  });

  it("suggested next step when saved work has no project", () => {
    createSavedWork({
      title: "Marketing Plan",
      artifactType: "Marketing Plan",
      body: "Plan",
      sourceWorkspace: "create",
    });
    const step = buildHomeSuggestedStep();
    expect(step?.reason).toMatch(/Marketing Plan/i);
    expect(step?.openTarget.kind).toBe("saved-work");
  });

  it("focus feelings are emotional entry points only", () => {
    expect(FOCUS_START_OPTIONS).toHaveLength(2);
    expect(FOCUS_START_OPTIONS.find((o) => o.id === "stuck")?.label).toBe(
      "I'm Stuck",
    );
    expect(FOCUS_START_OPTIONS.find((o) => o.id === "need-break")?.label).toBe(
      "I Need A Break",
    );
  });

  it("create inspiration includes recent and suggestions", () => {
    createSavedWork({
      title: "Last SOP",
      artifactType: "SOP",
      body: "Steps",
      sourceWorkspace: "create",
    });
    const items = buildCreateInspiration();
    expect(items.some((i) => /Last SOP/i.test(i.title))).toBe(true);
    expect(items.some((i) => i.kind === "suggestion")).toBe(true);
  });

  it("avatar summary from active avatar", () => {
    saveAvatar({
      name: "ADHD Entrepreneur",
      tagline: "Founder",
      who: "Founders",
      painPoints: "Overwhelm",
      goals: "Revenue",
      currentBehavior: "Scattered",
      solution: "Systems",
      isPrimary: true,
    });
    expect(activeAvatarSummary()?.name).toBe("ADHD Entrepreneur");
  });

  it("today momentum calculates from momentum events", () => {
    logMomentum("complete", "Finished task");
    logMomentum("capture", "Brain dump idea");
    logMomentum("start", "Focus timer session");
    const stats = buildTodayMomentum();
    expect(stats.length).toBeGreaterThan(0);
    expect(stats.some((s) => s.count > 0)).toBe(true);
  });

  it("empty-state handling for suggested step", () => {
    expect(buildHomeSuggestedStep()).toBeNull();
  });

  it("create inspiration empty without data", () => {
    const items = buildCreateInspiration();
    expect(items.some((i) => i.kind === "suggestion")).toBe(true);
  });

  it("draft saved work appears in create inspiration", () => {
    createSavedWork({
      title: "Continue Draft",
      artifactType: "Workshop",
      body: "Draft body",
      sourceWorkspace: "create",
      status: "draft",
    });
    const items = buildCreateInspiration();
    expect(items.some((i) => i.kind === "draft")).toBe(true);
  });
});
