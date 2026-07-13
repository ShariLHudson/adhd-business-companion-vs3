/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EstateHowToGuide } from "@/components/companion/EstateHowToGuide";
import { EstateHowToOpenControls } from "@/components/companion/EstateHowToOpenControls";
import { ChamberMemberGallery } from "@/components/companion/chamber/ChamberMemberGallery";
import { MyBusinessEstatePanel } from "@/components/companion/MyBusinessEstatePanel";
import {
  BUSINESS_ESTATE_HOW_TO_GUIDE,
  CHAMBER_HOW_TO_GUIDE,
  dismissEstateHowToInvite,
  hasDismissedEstateHowToInvite,
  matchEstateRoomHowToGuide,
  requestOpenEstateHowToGuide,
} from "@/lib/estateRoomGuides";
import { CHAMBER_MEMBERS } from "@/lib/chamber/chamberMemberRegistry";
import { listAllBoardMembers } from "@/lib/boardroom";

describe("Estate How to Use guides", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("Chamber How to Use action is visible on gallery home", () => {
    const html = renderToStaticMarkup(
      <ChamberMemberGallery
        onTalkWithMember={() => {}}
        onOpenHowTo={() => {}}
      />,
    );
    expect(html).toContain('data-testid="estate-how-to-open-chamber-of-momentum"');
    expect(html).toContain("How to Use the Chamber");
    // guide stays closed until the member opens it
    expect(html).not.toContain('data-testid="estate-how-to-guide-chamber-of-momentum"');
  });

  it("Chamber guide includes approved welcome, three help paths, and Board distinction", () => {
    const html = renderToStaticMarkup(
      <EstateHowToGuide
        content={CHAMBER_HOW_TO_GUIDE}
        open
        onClose={() => {}}
        onPrimaryAction={() => {}}
      />,
    );
    expect(html).toContain("Welcome to the Chamber of Momentum");
    expect(html).toContain("This is where ideas become action");
    expect(html).toContain("Three ways to get help");
    expect(html).toContain("Let Shari Recommend");
    expect(html).toContain("Ask a Chamber Specialist");
    expect(html).toContain("Continue a Previous Conversation");
    expect(html).toContain("Board of Directors");
    expect(html).toContain("Chamber of Momentum");
    expect(html).toContain("Research This With Shari");
    expect(html).toContain("Find the Right Chamber Member");
    expect(html).toContain('data-testid="estate-how-to-comparison-table"');
    expect(html).toContain('data-open="true"');
    const openCount = (html.match(/data-open="true"/g) ?? []).length;
    expect(openCount).toBe(1);
  });

  it("Chamber guide primary action label exists and Chamber Members are not Board Directors", () => {
    const chamberNames = new Set(CHAMBER_MEMBERS.map((m) => m.displayName));
    const boardNames = new Set(listAllBoardMembers().map((m) => m.displayName));
    for (const name of chamberNames) {
      expect(boardNames.has(name)).toBe(false);
    }
    expect(CHAMBER_HOW_TO_GUIDE.primaryActionLabel).toBe(
      "Find the Right Chamber Member",
    );
    expect(CHAMBER_HOW_TO_GUIDE.sections.some((s) => s.id === "compare")).toBe(
      true,
    );
  });

  it("Business Estate guide is available from overview markup and describes six areas", () => {
    const html = renderToStaticMarkup(<MyBusinessEstatePanel onClose={() => {}} />);
    expect(html).toContain(
      'data-testid="estate-how-to-open-my-business-estate"',
    );
    expect(html).toContain("How to Use My Business Estate");
    expect(html).toContain('data-testid="my-business-estate-main"');
    expect(html).toContain('data-active-section="overview"');
    expect(html).toContain('data-section-dirty="false"');

    const guideHtml = renderToStaticMarkup(
      <EstateHowToGuide
        content={BUSINESS_ESTATE_HOW_TO_GUIDE}
        open
        onClose={() => {}}
        onPrimaryAction={() => {}}
      />,
    );
    expect(guideHtml).toContain("Welcome to My Business Estate");
    expect(guideHtml).toContain("Identity Office");
    expect(guideHtml).toContain("Offer Suite");
    expect(guideHtml).toContain("Brand Studio");
    expect(guideHtml).toContain("Strategy Desk");
    expect(guideHtml).toContain("Working Style Study");
    expect(guideHtml).toContain("Systems Desk");
    expect(guideHtml).toContain("Quick Start");
    expect(guideHtml).toContain("Guided Setup");
    expect(guideHtml).toContain("Browse and Update");
    expect(guideHtml).toContain("Talk This Through With Shari");
    expect(guideHtml).toContain("Research This With Shari");
    expect(guideHtml).toContain("Ask a Chamber Specialist");
    expect(guideHtml).toContain("Take This to the Board");
    expect(guideHtml).toContain("View this in Cartography");
    expect(guideHtml).toContain("Choose a Business Area");
    expect(guideHtml).toContain("do not auto-update profile data");
    expect(guideHtml).toContain("Nothing changes without approval");
  });

  it("only one section is open by default and close control is present", () => {
    const html = renderToStaticMarkup(
      <EstateHowToGuide
        content={BUSINESS_ESTATE_HOW_TO_GUIDE}
        open
        onClose={() => {}}
      />,
    );
    expect(html).toContain('data-testid="estate-how-to-guide-close-my-business-estate"');
    expect(html).toContain('aria-modal="true"');
    const openSections = (html.match(/data-open="true"/g) ?? []).length;
    expect(openSections).toBe(1);
    expect(html).toMatch(/font-size|estate-how-to-guide__title/);
  });

  it("first-visit invite can be dismissed without opening the full guide every visit", () => {
    expect(hasDismissedEstateHowToInvite("chamber-of-momentum")).toBe(false);
    const html = renderToStaticMarkup(
      <EstateHowToOpenControls
        content={CHAMBER_HOW_TO_GUIDE}
        onOpen={() => {}}
      />,
    );
    // SSR: invite state starts closed until effect — button still visible
    expect(html).toContain("How to Use the Chamber");
    dismissEstateHowToInvite("chamber-of-momentum");
    expect(hasDismissedEstateHowToInvite("chamber-of-momentum")).toBe(true);
  });

  it("chat phrases match the correct guide", () => {
    expect(matchEstateRoomHowToGuide("How do I use the Chamber?")?.guideId).toBe(
      "chamber-of-momentum",
    );
    expect(
      matchEstateRoomHowToGuide("What is the Chamber for?")?.guideId,
    ).toBe("chamber-of-momentum");
    expect(
      matchEstateRoomHowToGuide(
        "What is the difference between the Board and Chamber?",
      )?.guideId,
    ).toBe("chamber-of-momentum");
    expect(
      matchEstateRoomHowToGuide("How do I use My Business Estate?")?.guideId,
    ).toBe("my-business-estate");
    expect(
      matchEstateRoomHowToGuide(
        "What should I put in My Business Estate?",
      )?.guideId,
    ).toBe("my-business-estate");
  });

  it("requestOpenEstateHowToGuide stores pending for destination mount", () => {
    requestOpenEstateHowToGuide("my-business-estate");
    expect(window.sessionStorage.getItem("estate-how-to-guide-pending-v1")).toBe(
      "my-business-estate",
    );
  });

  it("opening the guide does not change Chamber member or Board records", () => {
    const beforeChamber = CHAMBER_MEMBERS.length;
    const beforeBoard = listAllBoardMembers().length;
    renderToStaticMarkup(
      <EstateHowToGuide
        content={CHAMBER_HOW_TO_GUIDE}
        open
        onClose={() => {}}
      />,
    );
    expect(CHAMBER_MEMBERS.length).toBe(beforeChamber);
    expect(listAllBoardMembers().length).toBe(beforeBoard);
  });
});

describe("Estate How to Use chat matching", () => {
  it("maps Chamber and Business Estate how-to phrases to guide ids", () => {
    expect(matchEstateRoomHowToGuide("How do I use the Chamber?")?.guideId).toBe(
      "chamber-of-momentum",
    );
    expect(
      matchEstateRoomHowToGuide("How do I use My Business Estate?")?.guideId,
    ).toBe("my-business-estate");
    expect(
      matchEstateRoomHowToGuide("How do I use the Chamber?")?.shariReply,
    ).toMatch(/How to Use the Chamber/i);
  });
});

describe("CompanionPageClient how-to wiring", () => {
  it("handles immediateEstateHowToGuideOpen for Chamber and Business Estate", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const source = readFileSync(
      join(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(source).toContain("completeImmediateEstateHowToGuideOpen");
    expect(source).toContain("immediateEstateHowToGuideOpen");
    expect(source).toContain('requestOpenEstateHowToGuide("chamber-of-momentum")');
    expect(source).toContain('requestOpenEstateHowToGuide("my-business-estate")');
  });

  it("frictionless layer forwards immediateEstateHowToGuideOpen", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const source = readFileSync(
      join(process.cwd(), "lib/frictionlessActionLayer.ts"),
      "utf8",
    );
    expect(source).toContain("matchEstateRoomHowToGuide");
    expect(source).toContain("immediateEstateHowToGuideOpen: estateRoomHowTo.guideId");
  });
});
