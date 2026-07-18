import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "../..");

describe("universal navigation destination wiring", () => {
  it("CompanionPageClient captures leave and restores Living Place origin", () => {
    const source = readFileSync(
      join(root, "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(source).toContain("captureLeaveToDestination");
    expect(source).toContain("restoreNavigationFrame");
    expect(source).toContain("hasDestinationOriginBeneath");
    expect(source).toMatch(/function navigateBackToEstateHome[\s\S]*hasDestinationOriginBeneath/);
    expect(source).toContain('captureLeaveToDestination("talk-it-out")');
    expect(source).toContain('captureLeaveToDestination("boardroom")');
    expect(source).toContain('captureLeaveToDestination("chamber-of-momentum")');
    expect(source).toContain('captureLeaveToDestination("project-homes"');
    expect(source).toContain("clearNavigationStack");
  });

  it("Talk It Out and Project Homes mount NavigationReturnBar", () => {
    const talk = readFileSync(
      join(root, "components/companion/TalkItOutPanel.tsx"),
      "utf8",
    );
    const projects = readFileSync(
      join(root, "components/companion/projectHomes/ProjectHomesPrototypePanel.tsx"),
      "utf8",
    );
    expect(talk).toContain("NavigationReturnBar");
    expect(projects).toContain("NavigationReturnBar");
    expect(projects).toContain("pushNavigationFrame");
    expect(projects).toContain('label: "Projects"');
  });

  it("ProfileReturnBar remains Profile consumer of universal stack", () => {
    const bar = readFileSync(
      join(root, "components/companion/ProfileReturnBar.tsx"),
      "utf8",
    );
    expect(bar).toContain("getNavigationOrigin");
    expect(bar).toContain("Universal Navigation Context");
  });

  it("universal rule and docs exist; Profile-only rule retired", () => {
    const rule = readFileSync(
      join(root, ".cursor/rules/universal-navigation-context-return.mdc"),
      "utf8",
    );
    expect(rule).toContain("Universal Navigation Context");
    expect(rule).toContain("Living Places");
    expect(rule).toContain("History clock");
    const doc = readFileSync(
      join(root, "docs/navigation/UNIVERSAL_NAVIGATION_CONTEXT_RETURN.md"),
      "utf8",
    );
    expect(doc).toContain("lib/navigationContext");
    const retired = readFileSync(
      join(root, "docs/navigation/GLOBAL_RETURN_TO_PROFILE_NAVIGATION.md"),
      "utf8",
    );
    expect(retired).toMatch(/RETIRED|Superseded/i);
  });
});
