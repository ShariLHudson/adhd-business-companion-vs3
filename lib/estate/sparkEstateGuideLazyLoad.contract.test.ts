/**
 * Contract: Spark Estate Guide flipbook must not ship in ordinary destination
 * entry paths — only lazy-load when the member explicitly opens it.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readSrc(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

const STATIC_FLIPBOOK_IMPORT =
  /import\s*\{[^}]*EstateGuideFlipbook[^}]*\}\s*from\s*["']@\/components\/estate-guide/;

const STATIC_FLIPBOOK_DIRECT =
  /import\s*\{[^}]*EstateGuideFlipbook[^}]*\}\s*from\s*["']@\/components\/estate-guide\/EstateGuideFlipbook["']/;

describe("Spark Estate Guide lazy-load contract", () => {
  it("SparkEstateGuideChrome does not static-import the flipbook", () => {
    const source = readSrc("components/companion/SparkEstateGuideChrome.tsx");
    expect(source).not.toMatch(STATIC_FLIPBOOK_IMPORT);
    expect(source).not.toMatch(STATIC_FLIPBOOK_DIRECT);
    expect(source).toMatch(/lazy\(/);
    expect(source).toMatch(
      /import\("@\/components\/estate-guide\/EstateGuideFlipbook"\)/,
    );
    expect(source).toMatch(/flipbookMounted/);
    expect(source).toMatch(/SparkEstateGuideAnchor/);
  });

  it("Journal Gazebo does not static-import or always-mount the flipbook", () => {
    const source = readSrc(
      "components/journal-gazebo/JournalGazeboExperience.tsx",
    );
    expect(source).not.toMatch(STATIC_FLIPBOOK_IMPORT);
    expect(source).not.toMatch(STATIC_FLIPBOOK_DIRECT);
    expect(source).toMatch(/lazy\(/);
    expect(source).toMatch(
      /import\("@\/components\/estate-guide\/EstateGuideFlipbook"\)/,
    );
    expect(source).toMatch(/estateGuideMounted/);
    expect(source).toMatch(/EstateGuideFlipbookLazy/);
  });

  it("Plan My Day path does not import or mount the full Guide", () => {
    const sources = [
      "components/companion/PlanDayJourneyShell.tsx",
      "components/companion/PlanDayLivingBoard.tsx",
      "components/companion/PlanDayFlexiblePlanningMode.tsx",
    ];
    for (const file of sources) {
      const source = readSrc(file);
      expect(source).not.toMatch(/EstateGuideFlipbook/);
      expect(source).not.toMatch(/SparkEstateGuideChrome/);
      expect(source).not.toMatch(/estate-guide\/EstateGuideFlipbook/);
    }
  });

  it("Business Estate path does not import or mount the full Guide", () => {
    const sources = [
      "components/companion/business-estate/GuidedEstateField.tsx",
      "components/companion/GrowthProfileRoomPanel.tsx",
    ];
    for (const file of sources) {
      const source = readSrc(file);
      expect(source).not.toMatch(/EstateGuideFlipbook/);
      expect(source).not.toMatch(/SparkEstateGuideChrome/);
      expect(source).not.toMatch(/estate-guide\/EstateGuideFlipbook/);
    }
  });

  it("CompanionPageClient wires Wander → openSparkEstateGuideCore without static flipbook import", () => {
    const source = readSrc("app/companion/CompanionPageClient.tsx");
    expect(source).not.toMatch(STATIC_FLIPBOOK_IMPORT);
    expect(source).not.toMatch(STATIC_FLIPBOOK_DIRECT);
    expect(source).toMatch(/onOpenSparkEstateGuide=\{\(\) => openSparkEstateGuideCore\(null\)\}/);
    expect(source).toMatch(/SparkEstateGuideChrome/);
    expect(source).toMatch(/initialRoomId=\{estateGuideInitialRoomId\}/);
  });

  it("EstateTopRightChrome forwards onOpenSparkEstateGuide", () => {
    const source = readSrc(
      "components/companion/estate/EstateTopRightChrome.tsx",
    );
    expect(source).toMatch(/onOpenSparkEstateGuide\?:/);
    expect(source).toMatch(/onOpenSparkEstateGuide=\{onOpenSparkEstateGuide\}/);
  });
});
