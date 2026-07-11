/**
 * Experience Test Launcher routing contracts — dedicated panels vs SparkEstateShell.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readCompanionPageClient(): string {
  return readFileSync(
    resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
    "utf8",
  );
}

describe("experienceTestLauncherRouting", () => {
  const source = readCompanionPageClient();

  it("imports GrowthProfileRoomPanel and mounts it for growth profile overlay", () => {
    expect(source).toMatch(/import \{ GrowthProfileRoomPanel \}/);
    expect(source).toMatch(/growthProfilePrimary\s*\?/);
    expect(source).toMatch(/<GrowthProfileRoomPanel/);
  });

  it("uses resolveSparkEstateShellPlaceId for shell selection", () => {
    expect(source).toMatch(/resolveSparkEstateShellPlaceId/);
  });

  it("keeps dedicated growth journal panel behind dedicated-section guard", () => {
    expect(source).toMatch(
      /activeSection === "growth-journal"[\s\S]*!showDirectEstateOverlay[\s\S]*<GrowthJournalRoomPanel/,
    );
  });

  it("keeps dedicated evidence vault panel behind dedicated-section guard", () => {
    expect(source).toMatch(
      /activeSection === "evidence-bank"[\s\S]*!showDirectEstateOverlay[\s\S]*<EvidenceVaultRoomPanel/,
    );
  });

  it("preserves welcome home, discovery key host, estate arrival host, and portfolio panel", () => {
    expect(source).toMatch(/<WelcomeHomePage/);
    expect(source).toMatch(/<DiscoveryKeyHost/);
    expect(source).toMatch(/<EstateArrivalHost/);
    expect(source).toMatch(/<GrowthPortfolioPanel/);
  });
});
