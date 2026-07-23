/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BusinessEstateOverview } from "./BusinessEstateOverview";
import { IdentityOfficeEntrance } from "./IdentityOfficeEntrance";
import {
  BUSINESS_ESTATE_BROWSE_GROUPS,
  BUSINESS_ESTATE_OPTIONAL_REASSURANCE,
} from "@/lib/profile/businessEstateRedesign";

describe("BusinessEstateOverview", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("defaults to Next Helpful Step without a room-status wall", () => {
    const html = renderToStaticMarkup(
      <BusinessEstateOverview
        onClose={() => {}}
        onStartBusinessBasics={() => {}}
        onEnterRoom={() => {}}
      />,
    );
    expect(html).toContain('data-testid="be-optional-reassurance"');
    expect(html).toContain(BUSINESS_ESTATE_OPTIONAL_REASSURANCE.slice(0, 40));
    expect(html).toMatch(/grows with you/i);
    expect((html.match(/data-testid="be-optional-reassurance"/g) ?? []).length).toBe(
      1,
    );
    expect((html.match(/data-testid="be-next-step"/g) ?? []).length).toBe(1);
    expect(html).toMatch(/Start Business Basics/i);
    expect(html).toMatch(/greet you and your business by name/i);
    // Full room browse starts collapsed
    expect(html).not.toContain('data-testid="be-progress-strip"');
    expect(html).toContain('data-testid="be-overview-browse-toggle"');
    expect(html).toContain("Browse all rooms (optional)");
  });

  it("reveals visual room browse when requested", () => {
    act(() => {
      root.render(
        <BusinessEstateOverview
          onClose={vi.fn()}
          onStartBusinessBasics={vi.fn()}
          onEnterRoom={vi.fn()}
        />,
      );
    });
    act(() => {
      container
        .querySelector<HTMLButtonElement>(
          '[data-testid="be-overview-browse-toggle"]',
        )
        ?.click();
    });
    expect(
      container.querySelector('[data-testid="be-progress-strip"]'),
    ).toBeTruthy();
    expect(container.textContent).toContain("Rooms at a glance");
    expect(container.textContent).toContain("Identity Office");
  });

  it("uses a compact Coming Later teaser instead of five inactive rows", () => {
    const keepMoving = BUSINESS_ESTATE_BROWSE_GROUPS.find(
      (g) => g.id === "keep-moving",
    );
    expect(keepMoving?.entries).toHaveLength(1);
    expect(keepMoving?.entries[0]?.id).toBe("more-support-coming");
    expect(keepMoving?.entries[0]?.kind).toBe("coming-soon");
    expect(keepMoving?.entries.map((e) => e.name)).not.toContain(
      "Goals and Progress",
    );

    act(() => {
      root.render(
        <BusinessEstateOverview
          onClose={vi.fn()}
          onStartBusinessBasics={vi.fn()}
          onEnterRoom={vi.fn()}
        />,
      );
    });
    act(() => {
      container
        .querySelector<HTMLButtonElement>(
          '[data-testid="be-overview-browse-toggle"]',
        )
        ?.click();
    });
    act(() => {
      container
        .querySelector<HTMLButtonElement>(
          '[data-testid="be-group-toggle-keep-moving"]',
        )
        ?.click();
    });
    expect(container.textContent).toContain("More Support Is Coming");
    expect(container.textContent).toContain("Coming Later");
    expect(container.textContent).toContain("See What's Coming");
    expect(container.textContent).not.toContain("Wins and Evidence");
    expect(
      container.querySelectorAll('[data-testid^="be-entry-"]').length,
    ).toBe(1);
  });

  it("lists People I Help inside Understand My Business", () => {
    const understand = BUSINESS_ESTATE_BROWSE_GROUPS.find(
      (g) => g.id === "understand",
    );
    expect(understand?.entries.map((e) => e.id)).toEqual([
      "identity",
      "people-i-help",
      "offers",
      "brand",
    ]);
  });

  it("keeps groups collapsed by default and opens only one at a time", () => {
    act(() => {
      root.render(
        <BusinessEstateOverview
          onClose={vi.fn()}
          onStartBusinessBasics={vi.fn()}
          onEnterRoom={vi.fn()}
        />,
      );
    });
    act(() => {
      container
        .querySelector<HTMLButtonElement>(
          '[data-testid="be-overview-browse-toggle"]',
        )
        ?.click();
    });

    expect(
      container
        .querySelector('[data-testid="be-group-understand"]')
        ?.getAttribute("data-open"),
    ).toBe("true");

    act(() => {
      container
        .querySelector<HTMLButtonElement>(
          '[data-testid="be-group-toggle-guide"]',
        )
        ?.click();
    });
    expect(
      container
        .querySelector('[data-testid="be-group-understand"]')
        ?.getAttribute("data-open"),
    ).toBe("false");
    expect(
      container
        .querySelector('[data-testid="be-group-guide"]')
        ?.getAttribute("data-open"),
    ).toBe("true");
  });

  it("does not show Identity Office section list on the main screen", () => {
    const html = renderToStaticMarkup(
      <BusinessEstateOverview
        onClose={() => {}}
        onStartBusinessBasics={() => {}}
        onEnterRoom={() => {}}
      />,
    );
    expect(html).not.toContain("Guiding Principles");
    expect(html).not.toContain("Definition of Success");
    expect(html).not.toContain("Need Another Perspective");
  });
});

describe("IdentityOfficeEntrance", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("keeps the Identity Office image and emphasizes only Business Basics", () => {
    const html = renderToStaticMarkup(
      <IdentityOfficeEntrance
        onStartBasics={() => {}}
        onChooseSection={() => {}}
        onHowThisHelps={() => {}}
        onBack={() => {}}
        showHowThisHelps={false}
      />,
    );
    expect(html).toContain("founder-office-background.png");
    expect(html).toContain('data-testid="be-identity-recommended"');
    expect(html).toContain("Business Basics");
    expect(html).toContain("Start Business Basics");
    expect(html).toContain("Back to My Business Estate");
    expect(html).toContain("My Business Estate › Identity Office");
    expect(html).toMatch(/greet you and your business by name/i);
    expect(html).not.toContain("Need Another Perspective");
    expect(html).not.toContain("Guiding Principles");
    expect(html).not.toContain("Definition of Success");
  });
});
