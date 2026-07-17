/**
 * 106–108 — Global Escape, click-outside, persistent Welcome Home.
 * @vitest-environment jsdom
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { WELCOME_HOME_NAV_LABEL, isEstateHomeDestination } from "@/lib/navigationBack";
import { isScrollbarPointerTarget } from "@/lib/planMyDay/morningRoomOutsideDismiss";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("global Escape and Welcome Home (106–108)", () => {
  it("uses one Welcome Home label for the persistent control", () => {
    expect(WELCOME_HOME_NAV_LABEL).toBe("Welcome Home");
    expect(isEstateHomeDestination("Welcome Home")).toBe(true);
    expect(isEstateHomeDestination("Back To Estate")).toBe(true);
  });

  it("EstateImmersiveHomeLink defaults to Welcome Home", () => {
    const source = read("components/companion/EstateImmersiveHomeLink.tsx");
    expect(source).toContain("WELCOME_HOME_NAV_LABEL");
    expect(source).toContain('data-testid="estate-room-home-link"');
  });

  it("CompanionPageClient shows Welcome Home during estate chrome and full-bleed rooms", () => {
    const client = read("app/companion/CompanionPageClient.tsx");
    expect(client).toContain("showCompanionBackControl");
    expect(client).toContain("estatePlaceChromeActive");
    expect(client).toContain("isEstateFullBleedPanelSection(activeSection)");
    expect(client).toContain("estateGuideFlipbookOpen");
    expect(client).toContain('label="Welcome Home"');
    expect(client).toContain("function returnToWelcomeHome(");
    const showBlock = client.match(
      /const showCompanionBackControl =[\s\S]*?;/,
    )?.[0];
    expect(showBlock).toBeTruthy();
    expect(showBlock).toContain("estatePlaceChromeActive");
    expect(showBlock).not.toContain("!estatePlaceChromeActive");
  });

  it("Spark Estate Guide joins dismiss stack with accessible close", () => {
    const guide = read("components/estate-guide/EstateGuideFlipbook.tsx");
    expect(guide).toContain("useDismissibleWindow");
    expect(guide).toContain('aria-label="Close Spark Estate Guide"');
    expect(guide).toContain('data-testid="estate-guide-close"');
    expect(guide).toContain('data-testid="estate-guide-backdrop"');
    expect(guide).toContain("onBackdropClick");
  });

  it("shared My Day windows register Escape dismiss", () => {
    const plan = read("components/companion/PlanAdaptSharedWindow.tsx");
    const reminders = read(
      "components/companion/RemindersRhythmsEntrancePanel.tsx",
    );
    expect(plan).toContain("useDismissibleWindow");
    expect(reminders).toContain("useDismissibleWindow");
  });

  it("dismissible Escape skips text fields", () => {
    const hook = read("lib/windowDismiss/useDismissibleWindow.ts");
    expect(hook).toContain('tag === "INPUT"');
    expect(hook).toContain("isContentEditable");
  });

  it("scrollbar pointer helper ignores scrollbar clicks", () => {
    const scrollEl = {
      clientWidth: 100,
      clientHeight: 100,
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        right: 120,
        bottom: 120,
        width: 120,
        height: 120,
      }),
    } as unknown as Element;
    expect(
      isScrollbarPointerTarget(
        { target: scrollEl, clientX: 110, clientY: 50 },
        scrollEl,
      ),
    ).toBe(true);
    expect(
      isScrollbarPointerTarget(
        { target: scrollEl, clientX: 40, clientY: 40 },
        scrollEl,
      ),
    ).toBe(false);
  });

  it("menu Welcome Home calls the same authoritative return", () => {
    const menu = read(
      "components/companion/estate/EstateRoomExperienceMenu.tsx",
    );
    expect(menu).toContain('data-testid="estate-return-to-estate"');
    expect(menu).toContain("Welcome Home");
    expect(menu).toContain("closeAndRun(onBackToEstate)");
  });
});
