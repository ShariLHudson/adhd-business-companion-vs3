/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProjectHomeCard } from "@/components/companion/projectHomes/ProjectHomeCard";
import { ProjectHomeDetail } from "@/components/companion/projectHomes/ProjectHomeDetail";
import { ConnectedPlacesSection } from "@/components/companion/projectHomes/ConnectedPlacesSection";
import { ProjectHomesPrototypePanel } from "@/components/companion/projectHomes/ProjectHomesPrototypePanel";
import { saveProject } from "@/lib/companionStore";
import {
  EXPLORE_EXAMPLES_SECTION_NOTE,
  SAMPLE_PROJECT_HOMES,
  createPersistedProjectHomeWithResult,
  prototypeRecentProgress,
  prototypeRecentWins,
  prototypeRelatedConversations,
  prototypeUpcomingMilestones,
} from "@/lib/projectHomes";

vi.mock("@/components/companion/scene/CinematicBackground", () => ({
  CinematicBackground: () => <div data-testid="mock-cinematic" />,
}));

vi.mock("@/lib/roomBackgroundPreload", () => ({
  preloadRoomBackground: () => undefined,
}));

vi.mock("@/lib/roomBackgroundAssets", () => ({
  roomBackgroundImageStyle: () => ({}),
}));

const PROJECTS_KEY = "companion-projects-v1";
const PROJECT_ITEMS_KEY = "companion-project-items-v1";

describe("Project Homes UI usability", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(PROJECT_ITEMS_KEY);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(PROJECT_ITEMS_KEY);
  });

  it("renders sample badge, Open affordance, and opens on card click", () => {
    const sample = SAMPLE_PROJECT_HOMES[0]!;
    const onOpen = vi.fn();
    act(() => {
      root.render(<ProjectHomeCard project={sample} onOpen={onOpen} />);
    });

    expect(
      container.querySelector(
        `[data-testid="project-home-sample-badge-${sample.id}"]`,
      )?.textContent,
    ).toContain("Sample");
    expect(container.querySelector(".project-home-card__open")?.textContent).toBe(
      "Open",
    );

    act(() => {
      (
        container.querySelector(
          `[data-testid="project-home-card-${sample.id}"]`,
        ) as HTMLElement
      ).click();
    });
    expect(onOpen).toHaveBeenCalledWith(sample.id);
  });

  it("opens on keyboard Enter", () => {
    const sample = SAMPLE_PROJECT_HOMES[0]!;
    const onOpen = vi.fn();
    act(() => {
      root.render(<ProjectHomeCard project={sample} onOpen={onOpen} />);
    });
    const card = container.querySelector(
      `[data-testid="project-home-card-${sample.id}"]`,
    ) as HTMLElement;
    act(() => {
      card.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    });
    expect(onOpen).toHaveBeenCalledWith(sample.id);
  });

  it("opens options menu without opening the card", () => {
    const sample = SAMPLE_PROJECT_HOMES[0]!;
    const onOpen = vi.fn();
    const onAction = vi.fn();
    act(() => {
      root.render(
        <ProjectHomeCard
          project={sample}
          onOpen={onOpen}
          onAction={onAction}
        />,
      );
    });

    act(() => {
      (
        container.querySelector(
          `[data-testid="project-home-options-${sample.id}"]`,
        ) as HTMLButtonElement
      ).click();
    });

    expect(
      container.querySelector(`[data-testid="project-home-menu-${sample.id}"]`),
    ).toBeTruthy();
    expect(onOpen).not.toHaveBeenCalled();
    expect(
      container.querySelector(`[data-testid="project-home-delete-${sample.id}"]`),
    ).toBeNull();
  });

  it("requires confirmation that explains related items before delete", () => {
    const member = {
      ...SAMPLE_PROJECT_HOMES[0]!,
      id: "ph-member-test",
      isSample: false,
      name: "Member Draft",
    };
    const onAction = vi.fn();
    act(() => {
      root.render(
        <ProjectHomeCard
          project={member}
          onOpen={() => undefined}
          onAction={onAction}
        />,
      );
    });

    act(() => {
      (
        container.querySelector(
          `[data-testid="project-home-options-${member.id}"]`,
        ) as HTMLButtonElement
      ).click();
    });
    act(() => {
      (
        container.querySelector(
          `[data-testid="project-home-delete-${member.id}"]`,
        ) as HTMLButtonElement
      ).click();
    });
    expect(onAction).not.toHaveBeenCalled();
    const confirm = container.querySelector(
      `[data-testid="project-home-delete-confirm-${member.id}"]`,
    );
    expect(confirm?.textContent).toContain("Delete this project?");
    expect(confirm?.textContent).toContain("Cancel");
    expect(confirm?.textContent).toContain("Delete Project");

    act(() => {
      (
        container.querySelector(
          `[data-testid="project-home-delete-confirm-yes-${member.id}"]`,
        ) as HTMLButtonElement
      ).click();
    });
    expect(onAction).toHaveBeenCalledWith("delete", member.id);
  });

  it("gallery shows Active Work landing (057) — no Project Home creation", () => {
    act(() => {
      root.render(<ProjectHomesPrototypePanel onBack={() => undefined} />);
    });

    expect(
      container.querySelector('[data-testid="projects-landing-title"]')
        ?.textContent,
    ).toMatch(/Continue Your Work/i);
    expect(container.textContent).not.toMatch(/Create a Project Home/i);
    expect(
      container.querySelector('[data-testid="projects-start-something-new"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="project-homes-my-projects"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="project-homes-explore-examples"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="project-homes-empty-state"]')
        ?.textContent,
    ).toMatch(/don't have any active work yet/i);
    expect(
      container.querySelector('[data-testid="project-homes-view-samples"]'),
    ).toBeTruthy();

    for (const sample of SAMPLE_PROJECT_HOMES) {
      expect(
        container.querySelector(
          `[data-testid="project-home-card-${sample.id}"]`,
        ),
      ).toBeNull();
    }

    act(() => {
      (
        container.querySelector(
          '[data-testid="project-homes-view-samples"]',
        ) as HTMLButtonElement
      ).click();
    });

    expect(
      container.querySelector('[data-testid="project-homes-explore-examples"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="project-homes-sample-note"]')
        ?.textContent,
    ).toContain(EXPLORE_EXAMPLES_SECTION_NOTE);

    for (const sample of SAMPLE_PROJECT_HOMES) {
      expect(
        container.querySelector(
          `[data-testid="project-home-sample-badge-${sample.id}"]`,
        ),
      ).toBeTruthy();
      const explore = container.querySelector(
        '[data-testid="project-homes-explore-examples"]',
      );
      expect(
        explore?.querySelector(`[data-testid="project-home-card-${sample.id}"]`),
      ).toBeTruthy();
    }
  });

  it("Start Something New opens the Project setup flow, never Create (Start New Project Routing Fix)", () => {
    // Mirrors CompanionPageClient — Start Something New is no longer wired
    // to a Create callback, so clicking it must land on the built-in
    // new-project questions, not any Create surface.
    act(() => {
      root.render(<ProjectHomesPrototypePanel onBack={() => undefined} />);
    });
    act(() => {
      (
        container.querySelector(
          '[data-testid="projects-start-something-new"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(
      container.querySelector('[data-testid="project-homes-create-purpose"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="project-home-intention-input"]'),
    ).toBeTruthy();
    expect(container.textContent).not.toMatch(/create-estate|content-generator/i);
  });

  it("an explicit onStartSomethingNew override still takes precedence (future Create handoff hook)", () => {
    const onStartSomethingNew = vi.fn();
    act(() => {
      root.render(
        <ProjectHomesPrototypePanel
          onBack={() => undefined}
          onStartSomethingNew={onStartSomethingNew}
        />,
      );
    });
    act(() => {
      (
        container.querySelector(
          '[data-testid="projects-start-something-new"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(onStartSomethingNew).toHaveBeenCalledTimes(1);
    expect(
      container.querySelector('[data-testid="project-homes-create-purpose"]'),
    ).toBeNull();
  });

  it("gallery hydrates companion-projects-v1 into Active Work cards", () => {
    const list = saveProject({
      name: "Hydrated Member Project",
      goal: "Appear after refresh",
      nextAction: "Open the home",
    });
    const projectId = list[0]!.id;

    act(() => {
      root.render(<ProjectHomesPrototypePanel onBack={() => undefined} />);
    });

    expect(
      container.querySelector('[data-testid="project-homes-empty-state"]'),
    ).toBeNull();
    const mySection = container.querySelector(
      '[data-testid="project-homes-my-projects"]',
    );
    expect(
      mySection?.querySelector(
        `[data-testid="active-work-card-project:${projectId}"]`,
      ),
    ).toBeTruthy();
    expect(mySection?.textContent).toContain("Hydrated Member Project");
    expect(mySection?.textContent).toContain("Continue");
    expect(
      container.querySelector('[data-testid="project-homes-explore-examples"]'),
    ).toBeNull();
  });

  it("card open from gallery reaches detail", () => {
    const sample = SAMPLE_PROJECT_HOMES[0]!;
    act(() => {
      root.render(<ProjectHomesPrototypePanel onBack={() => undefined} />);
    });
    act(() => {
      (
        container.querySelector(
          '[data-testid="project-homes-view-samples"]',
        ) as HTMLButtonElement
      ).click();
    });
    act(() => {
      (
        container.querySelector(
          `[data-testid="project-home-card-${sample.id}"]`,
        ) as HTMLElement
      ).click();
    });
    expect(
      container.querySelector('[data-testid="project-home-detail"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="project-home-detail-sample-badge"]')
        ?.textContent,
    ).toContain("Example Project");
    expect(
      container.querySelector('[data-testid="project-home-drawer-plan"]'),
    ).toBeTruthy();
  });

  it("detail shows Current Focus and Your Next Step; drawers collapse by default", () => {
    const sample = SAMPLE_PROJECT_HOMES[0]!;
    act(() => {
      root.render(
        <ProjectHomeDetail
          project={sample}
          onProjectChange={() => undefined}
        />,
      );
    });

    expect(
      container.querySelector('[data-testid="project-home-current-focus"]')
        ?.textContent,
    ).toContain(sample.currentFocus);
    expect(
      container.querySelector('[data-testid="project-home-next-step"]')
        ?.textContent,
    ).toContain("Your Next Step");
    expect(
      container.querySelector('[data-testid="project-home-next-step"]')
        ?.textContent,
    ).toContain(sample.nextSuggestedStep);
    expect(container.textContent).not.toContain("Open Questions");
    expect(container.textContent).not.toContain("Next Suggested Step");

    for (const id of ["plan", "tools", "progress", "connections"] as const) {
      const toggle = container.querySelector(
        `[data-testid="project-home-drawer-toggle-${id}"]`,
      ) as HTMLButtonElement;
      expect(toggle).toBeTruthy();
      expect(toggle.getAttribute("aria-expanded")).toBe("false");
      expect(
        container.querySelector(`[data-testid="project-home-drawer-body-${id}"]`),
      ).toBeNull();
    }
  });

  it("Project Plan, Tools, Progress, and Connections expand without losing data", () => {
    const sample = SAMPLE_PROJECT_HOMES[0]!;
    const progress = prototypeRecentProgress(sample);
    const milestones = prototypeUpcomingMilestones(sample);
    const wins = prototypeRecentWins(sample);
    const conversations = prototypeRelatedConversations(sample.currentFocus);

    act(() => {
      root.render(
        <ProjectHomeDetail
          project={sample}
          onProjectChange={() => undefined}
        />,
      );
    });

    act(() => {
      (
        container.querySelector(
          '[data-testid="project-home-drawer-toggle-plan"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(
      container.querySelector('[data-testid="project-home-drawer-body-plan"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="project-home-structure"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="project-home-actions"]'),
    ).toBeTruthy();
    expect(container.textContent).toContain(
      "Capture a task anytime — it lands in Inbox.",
    );
    expect(
      container.querySelector('[data-testid="project-home-suggest-helpers"]'),
    ).toBeTruthy();

    act(() => {
      (
        container.querySelector(
          '[data-testid="project-home-drawer-toggle-tools"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(
      container.querySelector('[data-testid="project-home-drawer-body-tools"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="project-home-tool-ask-shari"]')
        ?.textContent,
    ).toContain("Being prepared");
    // Not-yet-wired tools (Ask Chamber, Cartographer, Clear My Mind) no
    // longer render as individual "Being prepared" cards — they are named
    // once in a compact "Coming later" line (Connected Places Completion).
    expect(
      container.querySelector('[data-testid="project-home-tool-clear-my-mind"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="project-home-tools-coming-later"]')
        ?.textContent,
    ).toContain("Clear My Mind");
    expect(
      container.querySelectorAll('[data-testid^="project-home-tool-"] button')
        .length,
    ).toBe(0);

    act(() => {
      (
        container.querySelector(
          '[data-testid="project-home-drawer-toggle-progress"]',
        ) as HTMLButtonElement
      ).click();
    });
    const progressBody = container.querySelector(
      '[data-testid="project-home-drawer-body-progress"]',
    );
    expect(progressBody).toBeTruthy();
    for (const item of [...progress, ...milestones, ...wins]) {
      expect(progressBody?.textContent).toContain(item);
    }

    act(() => {
      (
        container.querySelector(
          '[data-testid="project-home-drawer-toggle-connections"]',
        ) as HTMLButtonElement
      ).click();
    });
    const connectionsBody = container.querySelector(
      '[data-testid="project-home-drawer-body-connections"]',
    );
    expect(connectionsBody).toBeTruthy();
    for (const item of conversations) {
      expect(connectionsBody?.textContent).toContain(item);
    }
    expect(
      connectionsBody?.querySelector(
        '[data-testid="project-homes-connected-places"]',
      ),
    ).toBeTruthy();
    expect(
      connectionsBody?.querySelector(
        '[data-testid="project-home-connections-files"]',
      )?.textContent,
    ).toMatch(/files linked to this project|gather here/i);
  });

  it("Project Tools stay preparing and do not navigate to legacy workspaces", () => {
    const sample = SAMPLE_PROJECT_HOMES[0]!;
    const html = renderToStaticMarkup(
      <ProjectHomeDetail
        project={sample}
        onProjectChange={() => undefined}
      />,
    );
    // Tools content is collapsed by default — expand via live render for navigation checks
    act(() => {
      root.render(
        <ProjectHomeDetail
          project={sample}
          onProjectChange={() => undefined}
        />,
      );
    });
    act(() => {
      (
        container.querySelector(
          '[data-testid="project-home-drawer-toggle-tools"]',
        ) as HTMLButtonElement
      ).click();
    });
    const tools = container.querySelector(
      '[data-testid="project-home-tools-list"]',
    );
    expect(tools?.innerHTML).not.toContain("<button");
    expect(tools?.innerHTML).not.toContain("href=");
    expect(container.textContent).not.toMatch(
      /saved-work|create\/|\/create|legacy/i,
    );
    expect(html).not.toContain("Open Questions");
  });

  it("Connected Places render preparing state without buttons", () => {
    const html = renderToStaticMarkup(
      <ConnectedPlacesSection projectHomeId="writing-room" />,
    );
    expect(html).toContain("Coming soon — this connection is being prepared.");
    expect(html).toContain('aria-disabled="true"');
    expect(html).not.toContain("<button");
    expect(html).toContain('data-testid="project-homes-connected-places"');
  });

  it("Suggest Next Step generates a real, actionable suggestion distinct from Current Focus", () => {
    const home = createPersistedProjectHomeWithResult({
      name: "Fall Workshop",
      purpose: "Host a small business workshop this fall",
      projectHomeId: "study-hall",
      pieces: ["Date: mid-September, one Saturday morning"],
    }).home!;
    const onProjectChange = vi.fn();

    act(() => {
      root.render(
        <ProjectHomeDetail project={home} onProjectChange={onProjectChange} />,
      );
    });
    act(() => {
      (
        container.querySelector(
          '[data-testid="project-home-drawer-toggle-plan"]',
        ) as HTMLButtonElement
      ).click();
    });
    act(() => {
      (
        container.querySelector(
          '[data-testid="project-home-suggest-suggest"]',
        ) as HTMLButtonElement
      ).click();
    });

    const card = container.querySelector(
      '[data-testid="project-home-suggestion-card"]',
    );
    expect(card).toBeTruthy();
    const suggestionTitle = container.querySelector(
      '[data-testid="project-home-suggestion-title"]',
    )?.textContent;
    expect(suggestionTitle).toBeTruthy();
    // The suggestion is never a copy of Current Focus or the raw setup fact.
    expect(suggestionTitle).not.toBe(home.currentFocus);
    expect(suggestionTitle).not.toContain(
      "Date: mid-September, one Saturday morning",
    );
    expect(
      container.querySelectorAll(
        '[data-testid="project-home-suggestion-card"] button',
      ).length,
    ).toBeGreaterThan(0);

    act(() => {
      (
        container.querySelector(
          '[data-testid="project-home-suggestion-use"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(onProjectChange).toHaveBeenCalled();
    const updated = onProjectChange.mock.calls.at(-1)?.[0];
    expect(updated.nextSuggestedStep).toBe(suggestionTitle);
    expect(updated.nextSuggestedStep).not.toBe(updated.currentFocus);
  });

  it("Projects owns the screen — no frosted chat, Journal, or disabled fields", () => {
    act(() => {
      root.render(
        <ProjectHomesPrototypePanel
          onBack={() => undefined}
          initialView="create-purpose"
          chatVisible
          thread={<div data-testid="project-homes-chat-thread">thread</div>}
          footer={<div data-testid="project-homes-chat-footer">footer</div>}
        />,
      );
    });
    expect(
      container.querySelector('[data-testid="estate-room-frosted-chat"]'),
    ).toBeNull();
    expect(container.querySelector(".journal-gazebo")).toBeNull();
    expect(
      container
        .querySelector('[data-testid="project-homes-prototype"]')
        ?.getAttribute("data-exclusive-destination"),
    ).toBe("project-homes");
    const intention = container.querySelector<HTMLTextAreaElement>(
      '[data-testid="project-home-intention-input"]',
    );
    const name = container.querySelector<HTMLInputElement>(
      '[data-testid="project-home-name-input"]',
    );
    const continueBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="project-homes-continue-intention"]',
    );
    const cancelBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="project-homes-cancel-create"]',
    );
    expect(intention?.disabled).toBe(false);
    expect(name?.disabled).toBe(false);
    expect(continueBtn).toBeTruthy();
    expect(cancelBtn?.disabled).toBe(false);
  });
});
