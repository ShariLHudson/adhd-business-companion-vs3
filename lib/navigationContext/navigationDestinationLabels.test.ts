import { describe, expect, it, vi } from "vitest";
import { labelForDestinationId } from "./destinationLabels";
import { DESTINATION_LABELS } from "./types";
import {
  workspaceAreaTitle,
  workspaceTitle,
  WORKSPACE_TITLES,
} from "@/lib/workspaceMode";
import type { AppSection } from "@/lib/companionUi";

/**
 * Navigation-labels audit batch — the 14 confirmed-live destinations that
 * previously had no authored label in one or both of the two systems
 * (lib/navigationContext/types.ts DESTINATION_LABELS and
 * lib/workspaceMode.ts WORKSPACE_TITLES/EXTRA_AREA_TITLES), so they either
 * leaked a raw id or fell through to mechanical title-casing.
 */
const AUDITED_DESTINATION_IDS: AppSection[] = [
  "project-homes",
  "adapt-plan-my-day",
  "reminders-rhythms",
  "creation-workspace",
  "research-library",
  "personal-library",
  "destination-gallery",
  "calendar",
  "create",
  "talk-it-out",
  "boardroom",
  "stables",
  "reminders",
  "rhythms",
];

describe("navigation destination labels — every audited destination resolves to an authored label", () => {

  it("project-homes never appears to users — resolves to Projects, not the raw id or a slug", () => {
    expect(workspaceAreaTitle("project-homes")).toBe("Projects");
    expect(workspaceTitle("project-homes")).toBe("Projects");
    expect(labelForDestinationId("project-homes")).toBe("Projects");
  });

  it("adapt-plan-my-day never renders as a title-cased slug", () => {
    const label = workspaceAreaTitle("adapt-plan-my-day");
    expect(label).not.toBe("Adapt Plan My Day");
    expect(label).toBe("Plan My Day / Adapt My Day");
  });

  it("reminders-rhythms never renders as a title-cased slug", () => {
    const label = workspaceAreaTitle("reminders-rhythms");
    expect(label).not.toBe("Reminders Rhythms");
    expect(label).toBe("Reminders / Rhythms");
  });

  it("creation-workspace resolves through the authored map, not the raw-id/humanize fallback path", () => {
    // "Creation Workspace" is this room's own real, authored title (its
    // <h1>) — the point isn't to avoid that string, it's to avoid it being
    // produced by accident via the unmapped fallback path.
    expect(WORKSPACE_TITLES["creation-workspace"]).toBe("Creation Workspace");
    expect(workspaceAreaTitle("creation-workspace")).toBe("Creation Workspace");
  });

  it("every audited AppSection has an explicit WORKSPACE_TITLES entry", () => {
    for (const id of AUDITED_DESTINATION_IDS) {
      expect(WORKSPACE_TITLES[id]).toBeTruthy();
    }
  });

  it("every audited destination id has an explicit DESTINATION_LABELS entry", () => {
    for (const id of AUDITED_DESTINATION_IDS) {
      expect(DESTINATION_LABELS[id]).toBeTruthy();
      expect(labelForDestinationId(id)).toBe(DESTINATION_LABELS[id]);
    }
  });

  it("labelForDestinationId matches workspaceAreaTitle for every shared audited id (no cross-system drift)", () => {
    // "calendar" and "reminders" are a pre-existing, intentional exception:
    // the same string key is reused for two different things — a Settings
    // *tab* id (DESTINATION_LABELS, "Calendar Settings" / "Reminder
    // Settings") and a standalone Estate *room* AppSection (WORKSPACE_
    // TITLES, "Calendar" / "Reminders"). Neither is wrong for its own
    // context; unifying them would break whichever one changed. Left as a
    // documented gap (see report) rather than silently "fixed" into a bug.
    const knownDualPurposeIds = new Set(["calendar", "reminders"]);
    for (const id of AUDITED_DESTINATION_IDS) {
      if (knownDualPurposeIds.has(id)) continue;
      expect(labelForDestinationId(id)).toBe(workspaceAreaTitle(id));
    }
  });
});

describe("unknown ids use a safe, readable fallback — never the raw id verbatim", () => {
  it("labelForDestinationId humanizes an unmapped id instead of returning it raw", () => {
    const label = labelForDestinationId("some-brand-new-room");
    expect(label).not.toBe("some-brand-new-room");
    expect(label).not.toContain("-");
    expect(label).toBe("Some Brand New Room");
  });

  it("workspaceAreaTitle humanizes an unmapped AppSection instead of returning the raw slug", () => {
    // A section value guaranteed not to be in either map, cast for the test
    // since AppSection is a closed union — this exercises the fallback path
    // exactly as an actual future unmapped id would.
    const label = workspaceAreaTitle(
      "not-a-real-section" as unknown as AppSection,
    );
    expect(label).toBe("Not A Real Section");
    expect(label).not.toContain("-");
  });
});

describe("developer visibility — unmapped ids are surfaced, not silently shipped", () => {
  it("labelForDestinationId warns in development for an unmapped id", () => {
    const originalEnv = process.env.NODE_ENV;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      (process.env as { NODE_ENV: string }).NODE_ENV = "development";
      labelForDestinationId("totally-unmapped-destination");
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("totally-unmapped-destination"),
      );
    } finally {
      (process.env as { NODE_ENV: string }).NODE_ENV = originalEnv ?? "test";
      warnSpy.mockRestore();
    }
  });

  it("workspaceAreaTitle warns in development for an unmapped section", () => {
    const originalEnv = process.env.NODE_ENV;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      (process.env as { NODE_ENV: string }).NODE_ENV = "development";
      workspaceAreaTitle("another-unmapped-section" as unknown as AppSection);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("another-unmapped-section"),
      );
    } finally {
      (process.env as { NODE_ENV: string }).NODE_ENV = originalEnv ?? "test";
      warnSpy.mockRestore();
    }
  });

  it("neither helper warns for a known, mapped destination", () => {
    const originalEnv = process.env.NODE_ENV;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      (process.env as { NODE_ENV: string }).NODE_ENV = "development";
      labelForDestinationId("project-homes");
      workspaceAreaTitle("project-homes");
      expect(warnSpy).not.toHaveBeenCalled();
    } finally {
      (process.env as { NODE_ENV: string }).NODE_ENV = originalEnv ?? "test";
      warnSpy.mockRestore();
    }
  });
});
