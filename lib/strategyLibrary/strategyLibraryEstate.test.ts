/**
 * 109–112 — Strategy Library Spark Estate destination.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS } from "@/lib/estate/estateFullBleedPanelSections";
import {
  STRATEGY_LIBRARY_HOW_DO_I,
  STRATEGY_LIBRARY_MODE_CHOICES,
  STRATEGY_LIBRARY_TITLE,
} from "./estateCopy";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Strategy Library estate destination (110)", () => {
  it("keeps approved title and mode choices", () => {
    expect(STRATEGY_LIBRARY_TITLE).toBe("ADHD Entrepreneur Strategy Library");
    expect(STRATEGY_LIBRARY_MODE_CHOICES.map((m) => m.id)).toEqual([
      "browse",
      "apply",
      "create",
      "resume",
    ]);
    expect(STRATEGY_LIBRARY_HOW_DO_I).toMatch(/Browse when/i);
    expect(STRATEGY_LIBRARY_HOW_DO_I).toMatch(/Apply when/i);
  });

  it("registers playbook as a full-bleed estate panel", () => {
    expect(ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS).toContain("playbook");
  });

  it("opens Strategy Library as standalone estate destination", () => {
    const client = read("app/companion/CompanionPageClient.tsx");
    expect(client).toContain("function openStrategyLibraryCore");
    expect(client).toContain(
      'openStandaloneFocusSectionCore("playbook")',
    );
    expect(client).toContain("renderStrategyLibraryEstate");
    expect(client).toContain("StrategyLibraryEstatePanel");
    expect(client).toContain("activeSection !== \"playbook\"");
    expect(client).not.toMatch(
      /function openStrategyLibraryCore[\s\S]{0,400}applyChatLayoutMode\("split"\)/,
    );
  });

  it("StrategyLibraryEstatePanel owns shell and How Do I lives in StrategiesPanel estate mode", () => {
    const estate = read("components/companion/StrategyLibraryEstatePanel.tsx");
    const panel = read("components/companion/StrategiesPanel.tsx");
    const shell = read("components/companion/StrategyLibraryRoomShell.tsx");
    expect(estate).toContain('presentation="estate"');
    expect(estate).toContain("StrategyLibraryRoomShell");
    expect(estate).toContain("strategy-library-previous-screen");
    expect(shell).toContain("strategy-library-room");
    expect(shell).toContain("STRATEGY_LIBRARY_ROOM_BG");
    expect(panel).toContain('presentation?: "workspace" | "estate"');
    expect(panel).toContain("strategy-library-how-do-i");
    expect(panel).toContain("strategy-library-mode-choices");
    expect(panel).toContain("STRATEGY_LIBRARY_TITLE");
  });

  it("does not auto-seed the old Strategies discovery coach on library open", () => {
    const coach = read("lib/workspaceCoachAutoStart.ts");
    expect(coach).toContain("I see you've opened **Strategies**");
    const client = read("app/companion/CompanionPageClient.tsx");
    const openFn = client.match(
      /function openStrategyLibraryCore\([\s\S]*?\n  \}/,
    )?.[0];
    expect(openFn).toBeTruthy();
    expect(openFn).not.toContain('setCoachingMode("playbook")');
  });
});
