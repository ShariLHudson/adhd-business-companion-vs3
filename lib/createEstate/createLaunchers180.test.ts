/**
 * Package 180 — every visible Create option launches; Strategy Library out of Create.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CREATE_CATALOG } from "@/lib/createCatalogData";
import {
  hasLaunchableCreateWorkflow,
  getDiscoveryQuestions,
} from "@/lib/createWorkflow";
import {
  isActiveCreationCatalogItem,
  isStrategyLibraryCreateAlias,
  listActiveCreationPickerCatalog,
  listActiveCreationTypes,
} from "./activeCreationTypes";
import { WELCOME_HOME_NAV_CATEGORIES } from "@/lib/estate/welcomeHomeNavigationStructure";
import { resolveLegacyCreateWorkspaceGuard } from "@/lib/createExperience/blockLegacyCreateWorkspaceRouting";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("180 — Create launch contract", () => {
  it("every visible picker option has a launchable workflow", () => {
    const types = listActiveCreationTypes();
    expect(types.length).toBeGreaterThan(5);
    for (const t of types) {
      expect(hasLaunchableCreateWorkflow(t.label)).toBe(true);
      expect(isStrategyLibraryCreateAlias(t.label)).toBe(false);
      const questions = getDiscoveryQuestions(t.label);
      expect(questions.length).toBeGreaterThan(0);
      expect(t.workflowId).toMatch(/^create-workflow:/);
      expect(t.supportsSave).toBe(true);
    }
  });

  it("hides DEFAULT-only and Strategy Library aliases from the picker", () => {
    expect(
      isActiveCreationCatalogItem({ label: "Automation", emoji: "🔄" }),
    ).toBe(false);
    expect(
      isActiveCreationCatalogItem({ label: "Checklist", emoji: "✅" }),
    ).toBe(false);
    expect(
      isActiveCreationCatalogItem({
        label: "Business Strategy",
        emoji: "🏢",
      }),
    ).toBe(false);
    expect(
      isActiveCreationCatalogItem({ label: "Email", emoji: "✉️" }),
    ).toBe(true);
    expect(
      isActiveCreationCatalogItem({ label: "Lead Magnet", emoji: "🧲" }),
    ).toBe(true);
  });

  it("estate Create picker open is allowed through the legacy guard", () => {
    expect(
      resolveLegacyCreateWorkspaceGuard({
        section: "content-generator",
        itemType: "Email",
        estateCreateLaunch: true,
      }),
    ).toEqual({ kind: "allow" });
  });

  it("wires picker select → startFreshCreateFromEstate with my-work-create", () => {
    const client = read("app/companion/CompanionPageClient.tsx");
    expect(client).toContain("function startFreshCreateFromEstate");
    expect(client).toContain('hardNavCommand: "my-work-create"');
    expect(client).toContain("estateCreateLaunch:");
    expect(client).toContain("onSelectCreationType");
    expect(client).toContain("resolveCreateLauncherType");
  });
});

describe("180 — Strategy Library removed from Create", () => {
  it("catalog has no strategies category and no Strategy Library aliases", () => {
    expect(CREATE_CATALOG.some((c) => c.id === "strategies")).toBe(false);
    const labels = CREATE_CATALOG.flatMap((c) => c.items.map((i) => i.label));
    for (const alias of [
      "Business Strategy",
      "Personal Companion Strategy",
      "Strategy Library",
      "Strategy Guide",
      "Browse Strategies",
    ]) {
      expect(labels).not.toContain(alias);
    }
    const pickerLabels = listActiveCreationPickerCatalog().flatMap((c) =>
      c.items.map((i) => i.label),
    );
    expect(pickerLabels.join(" ")).not.toMatch(/Strategy Library|Browse Strategies/i);
  });

  it("Create entrance panel has no Strategy card", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    expect(panel).not.toContain("create-estate-browse-strategy");
    expect(panel).not.toContain("onOpenStrategyCreate");
    expect(panel).not.toMatch(/Strategy Library create mode/i);
  });

  it("Strategy Library remains under Get Advice", () => {
    const advice = WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === "get-advice");
    expect(advice?.destinations.some((d) => d.id === "strategy-library")).toBe(
      true,
    );
    expect(
      advice?.destinations.find((d) => d.id === "strategy-library")?.label,
    ).toBe("Strategy Library");
  });
});

describe("180 — duplicate / misplaced findings (informational)", () => {
  it("reports visible Create options for taxonomy follow-up", () => {
    const catalog = listActiveCreationPickerCatalog();
    const report = catalog.map((c) => ({
      category: c.label,
      items: c.items.map((i) => i.label),
    }));
    // Snapshot-style invariant: Marketing Strategy stays a document creator, not Library.
    const marketing = report.find((r) => r.category === "Marketing");
    expect(marketing?.items).toContain("Marketing Strategy");
    expect(marketing?.items).not.toContain("Strategy Library");
  });
});
