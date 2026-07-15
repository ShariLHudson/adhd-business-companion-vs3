/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BusinessEstateOverview } from "./BusinessEstateOverview";
import { IdentityOfficeEntrance } from "./IdentityOfficeEntrance";
import { BUSINESS_ESTATE_OPTIONAL_REASSURANCE } from "@/lib/profile/businessEstateRedesign";

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

  it("shows optional reassurance and a single recommendation", () => {
    const html = renderToStaticMarkup(
      <BusinessEstateOverview
        onClose={() => {}}
        onStartBusinessBasics={() => {}}
        onEnterRoom={() => {}}
      />,
    );
    expect(html).toContain('data-testid="be-optional-reassurance"');
    expect(html).toContain(BUSINESS_ESTATE_OPTIONAL_REASSURANCE.slice(0, 40));
    expect(html).toMatch(/right away/i);
    expect(html).toMatch(/optional/i);
    expect((html.match(/data-testid="be-next-step"/g) ?? []).length).toBe(1);
    expect(html).toMatch(/Start Business Basics/i);
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

    expect(
      container
        .querySelector('[data-testid="be-group-understand"]')
        ?.getAttribute("data-open"),
    ).toBe("false");
    expect(
      container
        .querySelector('[data-testid="be-group-guide"]')
        ?.getAttribute("data-open"),
    ).toBe("false");

    act(() => {
      container
        .querySelector<HTMLButtonElement>(
          '[data-testid="be-group-toggle-understand"]',
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
    expect(html).not.toContain("Need Another Perspective");
    expect(html).not.toContain("Guiding Principles");
    expect(html).not.toContain("Definition of Success");
  });
});
