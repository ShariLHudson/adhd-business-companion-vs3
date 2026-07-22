/**
 * 096 — Spark Estate Guide lives under Welcome Home → Spark Estate (with Wander).
 * Still: no bottom-corner launcher; no auto-mount on arrival.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { WELCOME_HOME_NAV_CATEGORIES } from "./welcomeHomeNavigationStructure";

function readSrc(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("sparkEstateGuideMenuMove (100 / 096)", () => {
  it("places Estate last with Wander + Guide destinations", () => {
    expect(WELCOME_HOME_NAV_CATEGORIES.map((c) => c.id)).toEqual([
      "my-day",
      "my-work",
      "get-advice",
      "take-a-moment",
      "audio",
      "chamber",
      "board",
      "spark-estate",
    ]);
    const sparkEstate = WELCOME_HOME_NAV_CATEGORIES.find(
      (c) => c.id === "spark-estate",
    );
    expect(sparkEstate?.label).toBe("Estate");
    expect(sparkEstate?.destinations.map((d) => d.id)).toEqual([
      "wander-the-grounds",
      "spark-estate-guide",
    ]);
    expect(sparkEstate?.destinations.map((d) => d.label)).toEqual([
      "Wander the Grounds",
      "Spark Estate Guide",
    ]);
    expect(WELCOME_HOME_NAV_CATEGORIES.at(-1)?.id).toBe("spark-estate");
  });

  it("menu routes Wander and Guide openers", () => {
    const menu = readSrc(
      "components/companion/estate/EstateRoomExperienceMenu.tsx",
    );
    expect(menu).toMatch(/"wander-the-grounds":\s*onExploreSpark/);
    expect(menu).toMatch(/"spark-estate-guide":\s*onOpenSparkEstateGuide/);
    expect(menu).not.toMatch(/WELCOME_HOME_WANDER_GROUNDS/);
    expect(menu).not.toMatch(/estate-room-menu-section-wander/);
    expect(menu).toMatch(/estate-room-menu-section-\$\{category\.id\}/);
  });

  it("removes bottom-corner guide anchor from SparkEstateGuideChrome", () => {
    const chrome = readSrc("components/companion/SparkEstateGuideChrome.tsx");
    expect(chrome).not.toMatch(/SparkEstateGuideAnchor/);
    expect(chrome).toMatch(/lazy\(/);
    expect(chrome).toMatch(
      /import\("@\/components\/estate-guide\/EstateGuideFlipbook"\)/,
    );
    expect(chrome).toMatch(/!flipbookOpen && !flipbookMounted/);
  });

  it("CompanionPageClient mounts guide chrome only when open and wires menu opener", () => {
    const cpc = readSrc("app/companion/CompanionPageClient.tsx");
    expect(cpc).toMatch(/showSparkEstateGuideChrome/);
    expect(cpc).toMatch(
      /estateGuideFlipbookOpen && overlay !== "signin"/,
    );
    expect(cpc).toMatch(
      /onOpenSparkEstateGuide=\{\(\) => openSparkEstateGuideCore\(\)\}/,
    );
    expect(cpc).not.toMatch(
      /const showSparkEstateGuide =\s*\n?\s*overlay !== "signin"/,
    );
  });
});
