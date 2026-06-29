import { describe, expect, it } from "vitest";

import {
  isFloatingCardSection,
  resolveWorkspacePresentationMode,
  usesCompanionDesk,
  usesFloatingWorkspaceCard,
} from "./workspaceLayout";

const baseCtx = {
  overlay: null,
  workspacePanel: null,
  welcomeScene: false,
  activitySession: { activityId: "", phase: "browse" as const },
};

describe("workspaceLayout", () => {
  it("uses floating cards for static scene workspaces", () => {
    for (const section of [
      "brain-dump",
      "growth-journal",
      "evidence-bank",
      "energy",
      "growth-portfolio",
      "plan-my-day",
      "home",
      "focus-audio",
    ] as const) {
      const ctx = { ...baseCtx, activeSection: section };
      expect(usesCompanionDesk(ctx)).toBe(false);
      expect(usesFloatingWorkspaceCard(ctx)).toBe(true);
      expect(resolveWorkspacePresentationMode(ctx)).toBe("floating-card");
      expect(isFloatingCardSection(section)).toBe(true);
    }
  });

  it("hides the global desk on Focus My Brain hub landing", () => {
    expect(
      usesCompanionDesk({
        ...baseCtx,
        activeSection: "focus",
        activitySession: { activityId: "", phase: "browse" },
      }),
    ).toBe(false);
  });

  it("uses floating card for active Focus My Brain guided workflows", () => {
    expect(
      usesCompanionDesk({
        ...baseCtx,
        activeSection: "focus",
        activitySession: { activityId: "first-step-finder", phase: "active" },
      }),
    ).toBe(false);
    expect(
      resolveWorkspacePresentationMode({
        ...baseCtx,
        activeSection: "focus",
        activitySession: { activityId: "first-step-finder", phase: "active" },
      }),
    ).toBe("floating-card");
    expect(
      usesCompanionDesk({
        ...baseCtx,
        activeSection: "guided-exercises",
        activitySession: { activityId: "priority-sort", phase: "active" },
      }),
    ).toBe(false);
  });

  it("keeps guided exercise browse on floating cards", () => {
    const ctx = {
      ...baseCtx,
      activeSection: "guided-exercises" as const,
      activitySession: { activityId: "", phase: "browse" as const },
    };
    expect(usesCompanionDesk(ctx)).toBe(false);
  });

  it("hides desk during welcome and sign-in", () => {
    expect(
      usesCompanionDesk({
        ...baseCtx,
        activeSection: "focus",
        activitySession: { activityId: "first-step-finder", phase: "active" },
        welcomeScene: true,
      }),
    ).toBe(false);
    expect(
      usesCompanionDesk({
        ...baseCtx,
        activeSection: "focus",
        activitySession: { activityId: "first-step-finder", phase: "active" },
        overlay: "signin",
      }),
    ).toBe(false);
  });
});
