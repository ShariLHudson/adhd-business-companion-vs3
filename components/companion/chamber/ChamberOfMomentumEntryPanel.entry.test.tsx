/**
 * Chamber entry focused panel — simplified opening, three labeled
 * recommendations, single scroll owner.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ChamberOfMomentumEntryPanel } from "@/components/companion/chamber/ChamberOfMomentumEntryPanel";

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

const cssEntry = () =>
  readFileSync(resolve(process.cwd(), "app/companion/chamber-entry.css"), "utf8");
const cssRoom = () =>
  readFileSync(
    resolve(process.cwd(), "app/companion/chamber-of-momentum.css"),
    "utf8",
  );
const roomPanelSrc = () =>
  readFileSync(
    resolve(
      process.cwd(),
      "components/companion/chamber/ChamberOfMomentumRoomPanel.tsx",
    ),
    "utf8",
  );

describe("Chamber entry focused panel", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function renderEntry(
    spies: Partial<{
      onInviteMember: ReturnType<typeof vi.fn>;
      onViewModeChange: ReturnType<typeof vi.fn>;
    }> = {},
  ) {
    act(() => {
      root.render(
        <ChamberOfMomentumEntryPanel
          onBack={vi.fn()}
          activeMemberId={null}
          viewMode="gallery"
          onViewModeChange={spies.onViewModeChange ?? vi.fn()}
          onInviteMember={spies.onInviteMember ?? vi.fn()}
          onEndMemberConversation={vi.fn()}
        />,
      );
    });
  }
  const q = (sel: string) => container.querySelector(sel);
  const click = (sel: string) =>
    act(() => (q(sel) as HTMLButtonElement).click());
  function setIntake(text: string) {
    const input = q('[data-testid="chamber-intake-input"]') as HTMLTextAreaElement;
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
    const form = q('[data-testid="chamber-intake"]') as HTMLFormElement;
    act(() =>
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      ),
    );
  }

  // --- Opening screen: simplified ---

  it("1. one focused entry panel with the intake as the primary action", () => {
    renderEntry();
    expect(container.querySelectorAll(".chamber-entry-card")).toHaveLength(1);
    expect(q('[data-testid="chamber-intake-input"]')).toBeTruthy();
    const submit = q('[data-testid="chamber-intake-submit"]');
    expect(submit?.textContent).toContain("Find the right Chamber members");
    expect(
      container.querySelector("h1")?.textContent,
    ).toContain("What would you like help with today?");
    expect(q('[data-chamber-entry="focused"]')).toBeTruthy();
  });

  it("2. shows exactly one instruction line and one How the Chamber works", () => {
    renderEntry();
    expect(q(".chamber-entry-card__question")?.textContent).toBe(
      "Describe what you are trying to decide, plan, improve, or move forward.",
    );
    expect(
      container.querySelectorAll('[data-testid="chamber-how-it-works"]'),
    ).toHaveLength(1);
  });

  it("3. removes the duplicate label, example pills, and six starting-point cards", () => {
    renderEntry();
    expect(container.textContent).not.toContain(
      "Describe your situation in your own words",
    );
    expect(q('[data-testid="chamber-perspective-choices"]')).toBeNull();
    expect(q('[data-testid="chamber-intake-examples"]')).toBeNull();
    expect(
      container.querySelectorAll('[data-testid^="chamber-perspective-decide"]'),
    ).toHaveLength(0);
  });

  it("4. the sentence-starters are behind a collapsed disclosure", () => {
    renderEntry();
    const starters = q(
      '[data-testid="chamber-intake-starters"]',
    ) as HTMLDetailsElement;
    expect(starters).toBeTruthy();
    expect(starters.open).toBe(false);
    expect(
      container.querySelectorAll('[data-testid^="chamber-intake-starter-"]'),
    ).toHaveLength(5);
  });

  it("5. a starter only populates/focuses the intake (does not route)", () => {
    renderEntry();
    click('[data-testid="chamber-intake-starter-0"]');
    const input = q('[data-testid="chamber-intake-input"]') as HTMLTextAreaElement;
    expect(input.value.length).toBeGreaterThan(0);
    // still on the intake — no recommendations rendered
    expect(q('[data-testid="chamber-perspective-recs"]')).toBeNull();
  });

  it("6. Browse all Chamber members stays a secondary link", () => {
    renderEntry();
    const browse = q('[data-testid="chamber-perspective-browse-all"]');
    expect(browse?.textContent).toContain("Browse all Chamber members");
    expect(browse?.className).toContain("chamber-entry-card__browse");
    expect(cssEntry()).toMatch(
      /\.chamber-entry-card__browse\s*\{[\s\S]*?background:\s*transparent/,
    );
  });

  it("7. no gallery/profile/chat before selection", () => {
    renderEntry();
    expect(q('[data-testid="chamber-member-gallery"]')).toBeNull();
    expect(q('[data-testid="chamber-active-member-card"]')).toBeNull();
    expect(q(".chamber-conversation")).toBeNull();
  });

  // --- Recommendations: three labeled, distinct ---

  it("8. a clear request shows three labeled recommendations", () => {
    renderEntry();
    setIntake("my marketing is not working");
    submitIntake();
    expect(q('[data-testid="chamber-perspective-recs"]')).toBeTruthy();
    expect(q('[data-testid="chamber-recs-best"]')).toBeTruthy();
    expect(q('[data-testid="chamber-recs-another"]')).toBeTruthy();
    expect(q('[data-testid="chamber-recs-different"]')).toBeTruthy();
    const cards = container.querySelectorAll(
      '[data-testid^="chamber-rec-card-"]',
    );
    expect(cards).toHaveLength(3);
  });

  it("9. the three headings and reasons are distinct", () => {
    renderEntry();
    setIntake("help me decide between two directions");
    submitIntake();
    const headings = [
      ...container.querySelectorAll(".chamber-entry-card__recs-heading"),
    ].map((h) => h.textContent);
    expect(headings).toEqual([
      "Best fit",
      "Supporting perspective",
      "Different perspective",
    ]);
    const whys = [
      ...container.querySelectorAll(".chamber-entry-card__rec-why"),
    ].map((w) => w.textContent);
    expect(new Set(whys).size).toBe(3);
  });

  it("10. the 'more perspectives below' cue appears with multiple recs", () => {
    renderEntry();
    setIntake("my marketing is not working");
    submitIntake();
    expect(q('[data-testid="chamber-recs-more-cue"]')).toBeTruthy();
  });

  it("11. an unrecognizable request asks one follow-up, not weak matches", () => {
    renderEntry();
    setIntake("asdf qwerty zzz");
    submitIntake();
    expect(q('[data-testid="chamber-intake-follow-up"]')).toBeTruthy();
    expect(q('[data-testid="chamber-perspective-recs"]')).toBeNull();
  });

  it("12. Talk uses the existing onInviteMember route", () => {
    const onInviteMember = vi.fn();
    renderEntry({ onInviteMember });
    setIntake("my marketing is not working");
    submitIntake();
    click('[data-testid="chamber-rec-talk-marketing"]');
    expect(onInviteMember).toHaveBeenCalledWith("marketing", undefined);
  });

  it("13. Learn about opens the existing profile view", () => {
    const onViewModeChange = vi.fn();
    renderEntry({ onViewModeChange });
    setIntake("my marketing is not working");
    submitIntake();
    click('[data-testid="chamber-rec-about-marketing"]');
    expect(onViewModeChange).toHaveBeenCalledWith("member_profile");
  });

  it("14. Choose someone myself opens the full 24-member gallery", () => {
    renderEntry();
    setIntake("my marketing is not working");
    submitIntake();
    click('[data-testid="chamber-recs-choose-myself"]');
    const gallery = q('[data-testid="chamber-member-gallery"]');
    expect(gallery?.getAttribute("data-member-total")).toBe("24");
  });

  it("15. Try another description returns cleanly to the intake", () => {
    renderEntry();
    setIntake("my marketing is not working");
    submitIntake();
    click('[data-testid="chamber-recs-try-another"]');
    expect(q('[data-testid="chamber-intake-input"]')).toBeTruthy();
    expect(q('[data-testid="chamber-perspective-recs"]')).toBeNull();
  });

  // --- Scroll ownership (static CSS/structure assertions) ---

  it("16. exactly one scroll owner: .chamber-room__scroll is a bounded flex scroller", () => {
    const css = cssRoom();
    expect(css).toMatch(
      /\.chamber-room__scroll\s*\{[\s\S]*?overflow-y:\s*auto/,
    );
    expect(css).toMatch(/\.chamber-room__scroll\s*\{[\s\S]*?flex:\s*1/);
    expect(css).toMatch(/\.chamber-room__scroll\s*\{[\s\S]*?min-height:\s*0/);
    // exactly one overflow-y:auto in the whole room stylesheet (single owner)
    expect((css.match(/overflow-y:\s*auto/g) ?? []).length).toBe(1);
  });

  it("17. embedded chamber content is NOT sized to 100dvh", () => {
    const css = cssRoom();
    const scrollBlock = css.match(/\.chamber-room__scroll\s*\{[\s\S]*?\}/)?.[0] ?? "";
    const roomBlock = css.match(/\.chamber-room\s*\{[\s\S]*?\}/)?.[0] ?? "";
    expect(scrollBlock).not.toMatch(/100dvh|100svh/);
    expect(roomBlock).not.toMatch(/min-height:\s*100dvh/);
  });

  it("18. the duplicate .chamber-room ownership is removed (panel uses a host wrapper)", () => {
    const src = roomPanelSrc();
    expect(src).toContain('className="chamber-room-host"');
    expect(src).not.toMatch(/className="chamber-room"/);
    expect(cssRoom()).toMatch(
      /\.chamber-room-host\s*\{[\s\S]*?flex:\s*1[\s\S]*?min-height:\s*0/,
    );
  });

  it("19. frosted contrast + responsive/zoom protections remain", () => {
    const css = cssEntry();
    expect(css).toMatch(/background:\s*rgba\(22,\s*32,\s*40,\s*0\.82\)/);
    expect(css).toMatch(/color:\s*#fff9ef/);
    expect(css).toMatch(/@media \(max-width:\s*40rem\)/);
    expect(css).toMatch(/@media \(max-height:\s*40rem\)/);
  });
});
