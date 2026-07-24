/**
 * Chamber entry focused panel — exclusive entry / gallery modes.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ChamberOfMomentumEntryPanel } from "@/components/companion/chamber/ChamberOfMomentumEntryPanel";
import { ChamberPerspectiveGuide } from "@/components/companion/chamber/ChamberPerspectiveGuide";
import { CHAMBER_PERSPECTIVE_CHOICES } from "@/lib/chamber/chamberPerspectiveGuide";

vi.mock("next/image", () => ({
  default: function MockImage(props: {
    src: string;
    alt?: string;
    className?: string;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={props.src} alt={props.alt ?? ""} className={props.className} />;
  },
}));

describe("Chamber entry focused panel", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
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

  function renderEntry() {
    act(() => {
      root.render(
        <ChamberOfMomentumEntryPanel
          onBack={vi.fn()}
          activeMemberId={null}
          viewMode="gallery"
          onViewModeChange={vi.fn()}
          onInviteMember={vi.fn()}
          onEndMemberConversation={vi.fn()}
        />,
      );
    });
  }

  it("1. shows one focused entry panel", () => {
    renderEntry();
    const guide = container.querySelector(
      '[data-testid="chamber-perspective-guide"]',
    );
    expect(guide?.getAttribute("data-chamber-entry")).toBe("focused");
    expect(
      container
        .querySelector('[data-testid="chamber-entry-view-root"]')
        ?.getAttribute("data-chamber-surface"),
    ).toBe("entry");
    expect(container.querySelectorAll(".chamber-entry-card")).toHaveLength(1);
  });

  it("2. shows six guided choices", () => {
    renderEntry();
    const group = container.querySelector(
      '[data-testid="chamber-perspective-choices"]',
    );
    expect(group?.querySelectorAll("button")).toHaveLength(6);
    for (const choice of CHAMBER_PERSPECTIVE_CHOICES) {
      expect(
        container.querySelector(
          `[data-testid="chamber-perspective-${choice.id}"]`,
        ),
      ).toBeTruthy();
    }
  });

  it("3. choices use compact layout (two-column grid class)", () => {
    renderEntry();
    const choices = container.querySelector(
      '[data-testid="chamber-perspective-choices"]',
    );
    expect(choices?.className).toContain("chamber-entry-card__choices");
    const css = readFileSync(
      resolve(process.cwd(), "app/companion/chamber-entry.css"),
      "utf8",
    );
    expect(css).toMatch(
      /\.chamber-entry-card__choices\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2/,
    );
  });

  it("4. Browse All Members is secondary (not equal weight to choices)", () => {
    renderEntry();
    const browse = container.querySelector(
      '[data-testid="chamber-perspective-browse-all"]',
    );
    expect(browse?.className).toContain("chamber-entry-card__browse");
    expect(browse?.className).not.toContain("chamber-entry-card__choice");
    const css = readFileSync(
      resolve(process.cwd(), "app/companion/chamber-entry.css"),
      "utf8",
    );
    expect(css).toMatch(
      /\.chamber-entry-card__browse\s*\{[\s\S]*?background:\s*transparent/,
    );
  });

  it("5. How the Chamber Works is collapsed by default", () => {
    renderEntry();
    const details = container.querySelector(
      '[data-testid="chamber-how-it-works"]',
    ) as HTMLDetailsElement | null;
    expect(details).toBeTruthy();
    expect(details?.open).toBe(false);
  });

  it("6. no empty right-side panels render", () => {
    renderEntry();
    expect(container.querySelector(".chamber-room__aside")).toBeNull();
    expect(container.querySelector(".chamber-room__layout")).toBeNull();
    expect(container.querySelectorAll(".chamber-room__panel")).toHaveLength(0);
  });

  it("7. no active-member strip before selection", () => {
    renderEntry();
    expect(
      container.querySelector('[data-testid="chamber-active-member-card"]'),
    ).toBeNull();
    expect(container.querySelector(".chamber-active-member")).toBeNull();
  });

  it("8. no chat appears before selection", () => {
    renderEntry();
    expect(
      container
        .querySelector('[data-testid="chamber-entry-view-root"]')
        ?.getAttribute("data-chamber-view"),
    ).toBe("gallery");
    expect(
      container.querySelector('[data-testid="chamber-add-member-gallery"]'),
    ).toBeNull();
    expect(container.querySelector(".chamber-conversation")).toBeNull();
  });

  it("9. guided choice recommends no more than three members", () => {
    act(() => {
      root.render(
        <ChamberPerspectiveGuide
          onTalkWithMember={vi.fn()}
          onBrowseAll={vi.fn()}
        />,
      );
    });
    const decide = container.querySelector(
      '[data-testid="chamber-perspective-decide"]',
    ) as HTMLButtonElement;
    act(() => {
      decide.click();
    });
    const items = container.querySelectorAll(
      '[data-testid="chamber-perspective-recs-list"] [role="listitem"]',
    );
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(3);
  });

  it("10. Browse replaces entry with gallery", () => {
    renderEntry();
    const browse = container.querySelector(
      '[data-testid="chamber-perspective-browse-all"]',
    ) as HTMLButtonElement;
    act(() => {
      browse.click();
    });
    expect(
      container.querySelector('[data-testid="chamber-perspective-guide"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="chamber-member-gallery"]'),
    ).toBeTruthy();
    expect(
      container
        .querySelector('[data-testid="chamber-entry-view-root"]')
        ?.getAttribute("data-chamber-surface"),
    ).toBe("gallery");
  });

  it("11. Back returns to Chamber entry", () => {
    renderEntry();
    act(() => {
      (
        container.querySelector(
          '[data-testid="chamber-perspective-browse-all"]',
        ) as HTMLButtonElement
      ).click();
    });
    act(() => {
      (
        container.querySelector(
          '[data-testid="chamber-back-to-start"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(
      container.querySelector('[data-testid="chamber-perspective-guide"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="chamber-member-gallery"]'),
    ).toBeNull();
    expect(
      container
        .querySelector('[data-testid="chamber-entry-view-root"]')
        ?.getAttribute("data-chamber-surface"),
    ).toBe("entry");
  });

  it("12. entry and gallery are never mounted simultaneously", () => {
    renderEntry();
    expect(
      container.querySelector('[data-testid="chamber-perspective-guide"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="chamber-member-gallery"]'),
    ).toBeNull();

    act(() => {
      (
        container.querySelector(
          '[data-testid="chamber-perspective-browse-all"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(
      container.querySelector('[data-testid="chamber-perspective-guide"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="chamber-member-gallery"]'),
    ).toBeTruthy();
  });

  it("13. text has approved contrast classes (dark frosted entry)", () => {
    const css = readFileSync(
      resolve(process.cwd(), "app/companion/chamber-entry.css"),
      "utf8",
    );
    expect(css).toMatch(/background:\s*rgba\(22,\s*32,\s*40,\s*0\.82\)/);
    expect(css).toMatch(/color:\s*#fff9ef/);
    expect(css).toMatch(/backdrop-filter:\s*blur\(18px/);
  });

  it("14. keyboard focus order follows visual order (choices then browse)", () => {
    renderEntry();
    const guide = container.querySelector(
      '[data-testid="chamber-perspective-guide"]',
    )!;
    const buttons = Array.from(guide.querySelectorAll("button"));
    const choiceIds = CHAMBER_PERSPECTIVE_CHOICES.map((c) => c.id);
    const firstSix = buttons
      .slice(0, 6)
      .map((b) => b.getAttribute("data-testid"));
    expect(firstSix).toEqual(
      choiceIds.map((id) => `chamber-perspective-${id}`),
    );
    expect(buttons[6]?.getAttribute("data-testid")).toBe(
      "chamber-perspective-browse-all",
    );
  });

  it("15. mobile CSS uses one column", () => {
    const css = readFileSync(
      resolve(process.cwd(), "app/companion/chamber-entry.css"),
      "utf8",
    );
    expect(css).toMatch(
      /@media \(max-width:\s*40rem\)[\s\S]*?\.chamber-entry-card__choices\s*\{[\s\S]*?grid-template-columns:\s*1fr/,
    );
  });

  it("16. 200% zoom remains usable (short-viewport compact rules)", () => {
    const css = readFileSync(
      resolve(process.cwd(), "app/companion/chamber-entry.css"),
      "utf8",
    );
    expect(css).toMatch(/@media \(max-height:\s*40rem\)/);
    expect(css).toMatch(
      /\.estate-workspace\.chamber-entry--perspective[\s\S]*?max-width:\s*min\(38rem/,
    );
  });
});
