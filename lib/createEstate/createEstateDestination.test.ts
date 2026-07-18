/**
 * 116–118 / 149–151 — My Work → Create estate destination.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS } from "@/lib/estate/estateFullBleedPanelSections";
import { WELCOME_HOME_NAV_CATEGORIES } from "@/lib/estate/welcomeHomeNavigationStructure";
import {
  CREATE_ESTATE_CONTINUE_HEADING,
  CREATE_ESTATE_EXPLANATION,
  CREATE_ESTATE_HOW_DO_I,
  CREATE_ESTATE_PICKER_HEADING,
  CREATE_ESTATE_WINDOW_TITLE,
  CREATE_VS_PROJECTS_CUE,
} from "./copy";
import {
  listActiveCreationPickerCatalog,
  listActiveCreationTypes,
} from "./activeCreationTypes";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("My Work → Create navigation (116 / 149)", () => {
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
    expect(client).toContain("onSelectCreationType");
    expect(client).toContain("resolveCreateLauncherType");
  });

  it("CreateEstateEntrancePanel shows picker + continue (no Browse / Start With)", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    expect(panel).toContain("create-estate-entrance");
    expect(panel).toContain("create-estate-how-do-i");
    expect(panel).toContain("CreateCatalogPicker");
    expect(panel).toContain("CreateDraftResumeList");
    expect(panel).toContain("CREATE_ESTATE_PICKER_HEADING");
    expect(panel).toContain("CREATE_ESTATE_CONTINUE_HEADING");
    expect(panel).not.toContain("CREATE_ESTATE_START_CHOICES");
    expect(panel).not.toContain("Browse things I can create");
    expect(panel).not.toContain("Start with what I need");
    expect(CREATE_ESTATE_WINDOW_TITLE).toBe("Create");
    expect(CREATE_ESTATE_PICKER_HEADING).toBe("What Do You Want to Create?");
    expect(CREATE_ESTATE_CONTINUE_HEADING).toBe("Continue a Saved Creation");
    expect(CREATE_ESTATE_EXPLANATION).toMatch(/Make something new/i);
    expect(CREATE_VS_PROJECTS_CUE).toMatch(/Projects organize/i);
    expect(CREATE_ESTATE_HOW_DO_I).toMatch(/Create is different from Projects/i);
  });

  it("active creation types are alphabetized and workflow-backed", () => {
    const catalog = listActiveCreationPickerCatalog();
    const labels = catalog.map((c) => c.label);
    expect([...labels].sort((a, b) => a.localeCompare(b))).toEqual(labels);
    for (const cat of catalog) {
      const itemLabels = cat.items.map((i) => i.label);
      expect([...itemLabels].sort((a, b) => a.localeCompare(b))).toEqual(
        itemLabels,
      );
      expect(cat.items.every((i) => !i.route)).toBe(true);
    }
    const types = listActiveCreationTypes();
    expect(types.length).toBeGreaterThan(5);
    expect(types.every((t) => t.status === "active" && t.workflowId)).toBe(
      true,
    );
  });

  it("does not offer Strategy Library inside Create (package 180)", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    const client = read("app/companion/CompanionPageClient.tsx");
    expect(panel).not.toContain("create-estate-browse-strategy");
    expect(panel).not.toContain("onOpenStrategyCreate");
    expect(client).not.toContain("onOpenStrategyCreate");
    expect(CREATE_ESTATE_HOW_DO_I).toMatch(/Get Advice/i);
    expect(CREATE_ESTATE_HOW_DO_I).toMatch(/Strategy Library/i);
  });
});
