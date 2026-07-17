/**
 * 116–118 — My Work → Create estate destination.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS } from "@/lib/estate/estateFullBleedPanelSections";
import { WELCOME_HOME_NAV_CATEGORIES } from "@/lib/estate/welcomeHomeNavigationStructure";
import {
  CREATE_ESTATE_EXPLANATION,
  CREATE_ESTATE_HOW_DO_I,
  CREATE_ESTATE_START_CHOICES,
  CREATE_ESTATE_WINDOW_TITLE,
  CREATE_VS_PROJECTS_CUE,
} from "./copy";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("My Work → Create navigation (116)", () => {
  it("places Create first under My Work", () => {
    const myWork = WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === "my-work");
    expect(myWork?.destinations.map((d) => d.id)).toEqual([
      "create",
      "projects",
      "destination-gallery",
      "cartographers-studio",
    ]);
  });

  it("registers create as full-bleed estate section", () => {
    expect(ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS).toContain("create");
  });

  it("opens Create estate entrance without auto-resume", () => {
    const client = read("app/companion/CompanionPageClient.tsx");
    expect(client).toContain("function openCreateEstateCore");
    expect(client).toContain('openStandaloneFocusSectionCore("create")');
    expect(client).toContain("EMPTY_CREATE_WORKFLOW");
    expect(client).toContain('onOpenCreateStudio={() => openCreateEstateCore()}');
    expect(client).toContain("CreateEstateEntrancePanel");
    expect(client).toContain("function startFreshCreateFromEstate");
    expect(client).toContain('source: "hard_nav"');
  });

  it("CreateEstateEntrancePanel owns How Do I and three start choices", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    expect(panel).toContain("create-estate-entrance");
    expect(panel).toContain("create-estate-how-do-i");
    expect(panel).toContain("create-estate-choice-${choice.id}");
    expect(panel).toContain("CreateDraftResumeList");
    expect(panel).toContain("CREATE_VS_PROJECTS_CUE");
    expect(CREATE_ESTATE_WINDOW_TITLE).toBe("Create");
    expect(CREATE_ESTATE_EXPLANATION).toMatch(/Make something new/i);
    expect(CREATE_VS_PROJECTS_CUE).toMatch(/Projects organize/i);
    expect(CREATE_ESTATE_HOW_DO_I).toMatch(/Create is different from Projects/i);
    expect(CREATE_ESTATE_START_CHOICES.map((c) => c.id)).toEqual([
      "start",
      "browse",
      "continue",
    ]);
  });

  it("routes strategy browse to Strategy Library create path", () => {
    const client = read("app/companion/CompanionPageClient.tsx");
    expect(client).toMatch(
      /onOpenStrategyCreate=\{\(\)\s*=>\s*openStrategyLibraryCore/,
    );
  });
});
