/**
 * Welcome Home cross-experience navigation matrix.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  planWelcomeHomeDestinationSwitch,
  WELCOME_HOME_NAV_MATRIX,
  WELCOME_HOME_NAV_SEQUENCE,
} from "./welcomeHomeDestinationSwitch";

const CPC = path.join(
  process.cwd(),
  "app/companion/CompanionPageClient.tsx",
);

function readCpc(): string {
  return readFileSync(CPC, "utf8");
}

describe("planWelcomeHomeDestinationSwitch", () => {
  it("closes Explore Estate when opening Plan My Day / Projects / Chamber / Settings", () => {
    for (const row of WELCOME_HOME_NAV_MATRIX.filter(
      (r) => r.from === "explore-estate",
    )) {
      const plan = planWelcomeHomeDestinationSwitch({
        destinationId: row.to,
        kind: row.toKind,
      });
      expect(plan.closeExploreEstate, row.to).toBe(true);
      expect(plan.clearExploreReturnPending, row.to).toBe(true);
      expect(plan.clearGuidedFieldHelpChat, row.to).toBe(true);
      if (row.toKind === "overlay") {
        expect(plan.clearOverlays).toBe(false);
      } else {
        expect(plan.clearOverlays).toBe(true);
      }
    }
  });

  it("keeps Explore open only when the requested destination is Explore Estate", () => {
    const plan = planWelcomeHomeDestinationSwitch({
      destinationId: "explore-estate",
      kind: "explore-estate",
    });
    expect(plan.closeExploreEstate).toBe(false);
    expect(plan.clearOverlays).toBe(true);
    expect(plan.clearBreathe).toBe(true);
  });

  it("clears Explore + overlays when returning to Welcome Home", () => {
    const plan = planWelcomeHomeDestinationSwitch({
      destinationId: "welcome-home",
      kind: "welcome-home",
    });
    expect(plan.closeExploreEstate).toBe(true);
    expect(plan.clearOverlays).toBe(true);
    expect(plan.clearBreathe).toBe(true);
  });

  it("supports the full sequential navigation matrix on first click", () => {
    let exploreOpen = false;
    let overlay: string | null = null;
    let activeSection = "home";
    let activeDestination = "welcome-home";

    for (const step of WELCOME_HOME_NAV_SEQUENCE) {
      const plan = planWelcomeHomeDestinationSwitch({
        destinationId: step.id,
        kind: step.kind,
      });

      if (plan.closeExploreEstate) exploreOpen = false;
      if (plan.clearOverlays) overlay = null;

      if (step.kind === "explore-estate") {
        exploreOpen = true;
        activeDestination = "explore-estate";
      } else if (step.kind === "overlay") {
        overlay = step.id;
        activeDestination = step.id;
      } else if (step.kind === "welcome-home") {
        activeSection = "home";
        activeDestination = "welcome-home";
        exploreOpen = false;
        overlay = null;
      } else {
        activeSection = step.id;
        activeDestination = step.id;
      }

      expect(activeDestination).toBe(step.id);
      if (step.kind === "explore-estate") {
        expect(exploreOpen).toBe(true);
      } else {
        expect(exploreOpen).toBe(false);
      }
      if (step.kind === "overlay") {
        expect(overlay).toBe(step.id);
      } else {
        expect(overlay).toBeNull();
      }
      if (step.kind === "section") {
        expect(activeSection).toBe(step.id);
      }
    }
  });

  it("when leaving an Explore room for Plan My Day, Explore must close (video layer gone)", () => {
    const plan = planWelcomeHomeDestinationSwitch({
      destinationId: "plan-my-day",
      kind: "section",
    });
    expect(plan.closeExploreEstate).toBe(true);
    expect(plan.clearExploreReturnPending).toBe(true);
    expect(plan.clearOverlays).toBe(true);
  });
});

describe("CompanionPageClient Welcome Home destination switch wiring", () => {
  it("defines dismissTransientEstateExperiencesForDestinationSwitch and uses it before section opens", () => {
    const source = readCpc();
    expect(source).toContain(
      "function dismissTransientEstateExperiencesForDestinationSwitch",
    );
    expect(source).toContain("planWelcomeHomeDestinationSwitch");
    expect(source).toContain("clearExploreEstateReturnPending");

    const standalone = source.match(
      /function openStandaloneFocusSectionCore\(section: AppSection\) \{[\s\S]*?\n  \}/,
    )?.[0];
    expect(standalone).toBeTruthy();
    expect(standalone).toContain(
      "dismissTransientEstateExperiencesForDestinationSwitch",
    );
    expect(standalone).toMatch(/kind:\s*"section"/);
  });

  it("closes Explore before Plan My Day / Projects / Chamber / Settings / Welcome Home", () => {
    const source = readCpc();

    expect(source).toMatch(
      /onOpenPlanMyDay=\{\(\) => openPlanMyDayCore\(\)\}/,
    );
    // Plan My Day goes through openStandaloneFocusSectionCore → dismiss
    expect(source).toContain('openStandaloneFocusSectionCore("plan-my-day")');

    const explore = source.match(
      /function openExploreSparkVisualExplorer\(\) \{[\s\S]*?\n  \}/,
    )?.[0];
    expect(explore).toBeTruthy();
    expect(explore).toContain(
      "dismissTransientEstateExperiencesForDestinationSwitch",
    );
    expect(explore).toMatch(/kind:\s*"explore-estate"/);

    const profile = source.match(
      /function openProfileDestinationCore\([\s\S]*?\n  \}/,
    )?.[0];
    expect(profile).toBeTruthy();
    expect(profile).toContain(
      "dismissTransientEstateExperiencesForDestinationSwitch",
    );

    expect(source).toMatch(
      /case\s+"settings"\s*:[\s\S]*?dismissTransientEstateExperiencesForDestinationSwitch\([\s\S]*?kind:\s*"overlay"/,
    );
  });

  it("does not use pathname-only already-active checks for Explore → Plan My Day", () => {
    const source = readCpc();
    expect(source).not.toMatch(
      /if\s*\(\s*exploreSparkMapOpen\s*&&\s*[^)]*plan-my-day/,
    );
    expect(source).toContain(
      "dismissTransientEstateExperiencesForDestinationSwitch",
    );
  });
});
