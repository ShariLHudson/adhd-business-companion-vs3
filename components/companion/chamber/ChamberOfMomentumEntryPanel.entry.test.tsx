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

  it("14. focus order: intake first, then the six quick-start choices in order, then browse", () => {
    renderEntry();
    const guide = container.querySelector(
      '[data-testid="chamber-perspective-guide"]',
    )!;
    const testids = Array.from(guide.querySelectorAll("button")).map((b) =>
      b.getAttribute("data-testid"),
    );
    // Natural-language intake submit precedes the optional quick-start choices.
    const submitIdx = testids.indexOf("chamber-intake-submit");
    const firstChoiceIdx = testids.indexOf("chamber-perspective-decide");
    expect(submitIdx).toBeGreaterThanOrEqual(0);
    expect(submitIdx).toBeLessThan(firstChoiceIdx);
    // The six quick-start choices remain, in registry order.
    const choiceOrder = CHAMBER_PERSPECTIVE_CHOICES.map(
      (c) => `chamber-perspective-${c.id}`,
    );
    const choicesInDom = testids.filter(
      (id) =>
        id?.startsWith("chamber-perspective-") &&
        id !== "chamber-perspective-browse-all",
    );
    expect(choicesInDom).toEqual(choiceOrder);
    // Browse remains secondary, after the last choice.
    expect(testids.indexOf("chamber-perspective-browse-all")).toBeGreaterThan(
      testids.lastIndexOf(choiceOrder[choiceOrder.length - 1]!),
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

  // --- Phase 1A: natural-language intake + conversational matching ---

  function renderEntryWithSpies() {
    const spies = {
      onBack: vi.fn(),
      onViewModeChange: vi.fn(),
      onInviteMember: vi.fn(),
      onEndMemberConversation: vi.fn(),
    };
    act(() => {
      root.render(
        <ChamberOfMomentumEntryPanel
          onBack={spies.onBack}
          activeMemberId={null}
          viewMode="gallery"
          onViewModeChange={spies.onViewModeChange}
          onInviteMember={spies.onInviteMember}
          onEndMemberConversation={spies.onEndMemberConversation}
        />,
      );
    });
    return spies;
  }

  function clickExample(index: number) {
    act(() => {
      (
        container.querySelector(
          `[data-testid="chamber-intake-example-${index}"]`,
        ) as HTMLButtonElement
      ).click();
    });
  }

  function setIntake(text: string) {
    const input = container.querySelector(
      '[data-testid="chamber-intake-input"]',
    ) as HTMLTextAreaElement;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    )!.set!;
    act(() => {
      setter.call(input, text);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  function submitIntake() {
    const form = container.querySelector(
      '[data-testid="chamber-intake"]',
    ) as HTMLFormElement;
    act(() => {
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });
  }

  it("17. natural-language intake and primary submit button render on entry", () => {
    renderEntry();
    expect(
      container.querySelector('[data-testid="chamber-intake-input"]'),
    ).toBeTruthy();
    const submit = container.querySelector(
      '[data-testid="chamber-intake-submit"]',
    );
    expect(submit).toBeTruthy();
    expect(submit?.textContent).toContain("Find the right Chamber member");
  });

  it("18. six quick-start choices remain as optional shortcuts, with example prompts", () => {
    renderEntry();
    expect(
      container.querySelectorAll(
        '[data-testid="chamber-perspective-choices"] button',
      ),
    ).toHaveLength(6);
    expect(
      container.querySelector('[data-testid="chamber-intake-examples"]'),
    ).toBeTruthy();
    expect(
      container.querySelectorAll('[data-testid^="chamber-intake-example-"]')
        .length,
    ).toBeGreaterThan(0);
  });

  it("19. a clear request shows a recommended starting point with a reason", () => {
    renderEntry();
    clickExample(1); // "My marketing is not working." → Marketing
    expect(
      container.querySelector('[data-testid="chamber-perspective-recs"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="chamber-recs-primary"]'),
    ).toBeTruthy();
    const primaryHeading = container.querySelector(
      '[data-testid="chamber-recs-primary"] .chamber-entry-card__recs-heading',
    );
    expect(primaryHeading?.textContent).toBe("Recommended starting point");
    const why = container.querySelector(
      '[data-testid="chamber-rec-card-marketing"] .chamber-entry-card__rec-why',
    );
    expect((why?.textContent ?? "").trim().length).toBeGreaterThan(0);
  });

  it("20. a clear request returns exactly one primary member (no extra perspectives)", () => {
    renderEntry();
    clickExample(1); // Marketing — one clear match
    const cards = container.querySelectorAll(
      '[data-testid="chamber-perspective-recs-list"] [role="listitem"]',
    );
    expect(cards).toHaveLength(1);
  });

  it("21. never more than three members in a recommendation set", () => {
    renderEntry();
    clickExample(0); // "I cannot decide whether to launch now." → decide bucket
    const cards = container.querySelectorAll(
      '[data-testid="chamber-perspective-recs-list"] [role="listitem"]',
    );
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBeLessThanOrEqual(3);
  });

  it("22. Talk with uses the existing onInviteMember route", () => {
    const spies = renderEntryWithSpies();
    clickExample(1);
    act(() => {
      (
        container.querySelector(
          '[data-testid="chamber-rec-talk-marketing"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(spies.onInviteMember).toHaveBeenCalledWith("marketing", undefined);
    expect(spies.onViewModeChange).toHaveBeenCalledWith("member_chat");
  });

  it("23. Learn about this member opens the existing profile view", () => {
    const spies = renderEntryWithSpies();
    clickExample(1);
    act(() => {
      (
        container.querySelector(
          '[data-testid="chamber-rec-about-marketing"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(spies.onViewModeChange).toHaveBeenCalledWith("member_profile");
  });

  it("24. Choose someone myself opens the full 24-member gallery", () => {
    renderEntry();
    clickExample(1);
    act(() => {
      (
        container.querySelector(
          '[data-testid="chamber-recs-choose-myself"]',
        ) as HTMLButtonElement
      ).click();
    });
    const gallery = container.querySelector(
      '[data-testid="chamber-member-gallery"]',
    );
    expect(gallery).toBeTruthy();
    expect(gallery?.getAttribute("data-member-total")).toBe("24");
  });

  it("25. an unclear request asks one follow-up; an answer then produces recommendations", () => {
    renderEntry();
    setIntake("I do not know what to do next");
    submitIntake();
    expect(
      container.querySelector('[data-testid="chamber-intake-follow-up"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="chamber-perspective-recs"]'),
    ).toBeNull();
    // The follow-up is answered in the same intake area.
    setIntake("making a plan");
    submitIntake();
    expect(
      container.querySelector('[data-testid="chamber-perspective-recs"]'),
    ).toBeTruthy();
  });

  it("26. exactly one How the Chamber Works control remains on entry", () => {
    renderEntry();
    expect(
      container.querySelectorAll('[data-testid="chamber-how-it-works"]'),
    ).toHaveLength(1);
  });

  // --- Scrollable recommendation results + "more perspectives" cue ---

  it("27. the room scroll container is a bounded scroll owner (viewport-capped)", () => {
    const css = readFileSync(
      resolve(process.cwd(), "app/companion/chamber-of-momentum.css"),
      "utf8",
    );
    // Single scroll owner: overflow-y auto AND a viewport height cap so it
    // actually scrolls instead of growing past an overflow:hidden parent.
    expect(css).toMatch(
      /\.chamber-room__scroll\s*\{[\s\S]*?overflow-y:\s*auto/,
    );
    expect(css).toMatch(
      /\.chamber-room__scroll\s*\{[\s\S]*?max-height:\s*100(dvh|svh)/,
    );
  });

  it("28. recommendation results have bottom clearance so the last card is reachable", () => {
    const css = readFileSync(
      resolve(process.cwd(), "app/companion/chamber-entry.css"),
      "utf8",
    );
    expect(css).toMatch(
      /\.chamber-entry-card__recs\s*\{[\s\S]*?padding-bottom:/,
    );
  });

  it("29. a multi-member result shows the 'More perspectives below' cue", () => {
    renderEntry();
    clickExample(0); // "I cannot decide whether to launch now." → decide bucket (3 members)
    const cue = container.querySelector(
      '[data-testid="chamber-recs-more-cue"]',
    );
    expect(cue).toBeTruthy();
    expect(cue?.textContent).toContain("More perspectives below");
    // Additional recommendations remain in the document flow (not clipped away).
    expect(
      container.querySelector('[data-testid="chamber-recs-additional"]'),
    ).toBeTruthy();
  });

  it("30. a single-member result does NOT show the cue", () => {
    renderEntry();
    clickExample(1); // "My marketing is not working." → one clear match
    expect(
      container.querySelector('[data-testid="chamber-recs-more-cue"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="chamber-recs-additional"]'),
    ).toBeNull();
  });

  it("31. final recommendation actions (footer) remain in the results flow", () => {
    renderEntry();
    clickExample(0);
    // The last actions live after the recommendation list, in normal flow.
    const recs = container.querySelector(
      '[data-testid="chamber-perspective-recs"]',
    )!;
    expect(
      recs.querySelector('[data-testid="chamber-recs-try-another"]'),
    ).toBeTruthy();
    expect(
      recs.querySelector('[data-testid="chamber-recs-choose-myself"]'),
    ).toBeTruthy();
  });
});
