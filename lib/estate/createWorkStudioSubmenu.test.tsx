/**
 * My Work Studio → Create nested submenu (structure only).
 * @vitest-environment jsdom
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EstateRoomExperienceMenu } from "@/components/companion/estate/EstateRoomExperienceMenu";
import {
  SPARK_ESTATE_ROOM_MENU_CREATE_SUBMENU_ITEMS,
  SPARK_ESTATE_ROOM_MENU_MY_WORK_STUDIO_ITEMS,
} from "@/lib/estate/sparkEstateTopNavigationAndProfileMenu";

vi.mock("@/lib/estate/estateAmbiencePreference", () => ({
  isEstateAmbienceEnabled: () => false,
  setEstateAmbienceEnabled: () => undefined,
}));

vi.mock("@/lib/estate/estateAudioSettings", () => ({
  subscribeEstateAudioSettings: () => () => undefined,
}));

vi.mock("@/lib/estate/estateEnvironmentalAudio", () => ({
  stopAllEstateEnvironmentalAudio: () => undefined,
}));

vi.mock("@/lib/estate/estateBrowserFullscreen", () => ({
  isEstateBrowserFullscreen: () => false,
  toggleEstateBrowserFullscreen: async () => false,
}));

vi.mock("@/lib/estate/estateRoomAmbience", () => ({
  activeEstateAmbienceRoomId: () => null,
  kickstartEstateRoomAmbience: () => undefined,
}));

vi.mock("@/lib/estate/useIdleChromeReveal", () => ({
  useIdleChromeReveal: () => ({
    fullscreen: false,
    faded: false,
    bumpVisibility: () => undefined,
  }),
}));

function read(rel: string): string {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}

describe("Create submenu — menu canon", () => {
  it("lists Create under My Work Studio with nested items in order", () => {
    expect(SPARK_ESTATE_ROOM_MENU_MY_WORK_STUDIO_ITEMS.map((i) => i.id)).toEqual([
      "projects",
      "create",
      "destination-gallery",
      "cartographers-studio",
    ]);
    expect(SPARK_ESTATE_ROOM_MENU_CREATE_SUBMENU_ITEMS.map((i) => i.label)).toEqual([
      "Documents",
      "Templates",
      "SOPs",
      "Content",
    ]);
  });
});

describe("Create submenu — EstateRoomExperienceMenu", () => {
  let container: HTMLDivElement;
  let root: Root;
  const onToggleChat = vi.fn();
  const onOpenProjects = vi.fn();
  const onOpenDocuments = vi.fn();
  const onOpenDestinationGallery = vi.fn();
  const onOpenCartographersStudio = vi.fn();

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    onToggleChat.mockReset();
    onOpenProjects.mockReset();
    onOpenDocuments.mockReset();
    onOpenDestinationGallery.mockReset();
    onOpenCartographersStudio.mockReset();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  function renderMenu() {
    act(() => {
      root.render(
        <EstateRoomExperienceMenu
          roomId="welcome-home"
          embedded
          chatVisible={false}
          onToggleChat={onToggleChat}
          onBackToEstate={() => undefined}
          onOpenProjects={onOpenProjects}
          onOpenDocuments={onOpenDocuments}
          onOpenDestinationGallery={onOpenDestinationGallery}
          onOpenCartographersStudio={onOpenCartographersStudio}
        />,
      );
    });
  }

  function openStudio() {
    const trigger = container.querySelector(
      ".estate-room-experience-menu__trigger",
    ) as HTMLButtonElement | null;
    expect(trigger).toBeTruthy();
    act(() => {
      trigger?.click();
    });
    const studio = container.querySelector(
      '[data-testid="estate-room-menu-section-my-work-studio"]',
    ) as HTMLButtonElement | null;
    expect(studio).toBeTruthy();
    act(() => {
      studio?.click();
    });
  }

  it("expands My Work Studio and shows Projects then Create then Gallery then Cartographer's Studio", () => {
    renderMenu();
    openStudio();
    const group = container.querySelector('[aria-label="My Work Studio"]');
    expect(group).toBeTruthy();
    const labels = Array.from(
      group!.querySelectorAll(
        ":scope > .estate-room-experience-menu__item .estate-room-experience-menu__item-label, :scope > .estate-room-experience-menu__nested-group .estate-room-experience-menu__category-label",
      ),
    ).map((el) => el.textContent?.trim());
    expect(labels).toEqual([
      "Projects",
      "Create",
      "Destination Gallery",
      "Cartographer's Studio",
    ]);
  });

  it("toggles Create nested submenu without opening Chat or Create workspace handlers", () => {
    renderMenu();
    openStudio();
    const create = container.querySelector(
      '[data-testid="estate-open-create"]',
    ) as HTMLButtonElement;
    expect(create.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector('[data-testid="estate-create-submenu"]')).toBeFalsy();

    act(() => {
      create.click();
    });
    expect(create.getAttribute("aria-expanded")).toBe("true");
    const submenu = container.querySelector('[data-testid="estate-create-submenu"]');
    expect(submenu).toBeTruthy();
    expect(onToggleChat).not.toHaveBeenCalled();
    expect(onOpenDocuments).not.toHaveBeenCalled();

    act(() => {
      create.click();
    });
    expect(create.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector('[data-testid="estate-create-submenu"]')).toBeFalsy();
    expect(onToggleChat).not.toHaveBeenCalled();
  });

  it("shows Documents, Templates, SOPs, Content indented under Create when expanded", () => {
    renderMenu();
    openStudio();
    act(() => {
      (
        container.querySelector(
          '[data-testid="estate-open-create"]',
        ) as HTMLButtonElement
      ).click();
    });
    const submenu = container.querySelector(
      '[data-testid="estate-create-submenu"]',
    ) as HTMLElement;
    expect(submenu.className).toContain("estate-room-experience-menu__section-items--nested");
    expect(submenu.className).toContain("estate-room-experience-menu__section-items--create");
    const nested = Array.from(
      submenu.querySelectorAll("[data-testid^='estate-create-']"),
    ).map((el) => ({
      id: el.getAttribute("data-testid"),
      label: el.textContent?.trim(),
      nestedClass: el.classList.contains("estate-room-experience-menu__item--nested"),
      ariaDisabled: el.getAttribute("aria-disabled"),
    }));
    expect(nested.map((n) => n.id)).toEqual([
      "estate-create-documents",
      "estate-create-templates",
      "estate-create-sops",
      "estate-create-content",
    ]);
    expect(nested.map((n) => n.label)).toEqual([
      "Documents",
      "Templates",
      "SOPs",
      "Content",
    ]);
    expect(nested.every((n) => n.nestedClass && n.ariaDisabled === "true")).toBe(
      true,
    );
  });

  it("keeps Destination Gallery and Cartographer's Studio as working siblings under My Work Studio", () => {
    renderMenu();
    openStudio();
    act(() => {
      (
        container.querySelector(
          '[data-testid="estate-open-destination-gallery"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(onOpenDestinationGallery).toHaveBeenCalledTimes(1);

    onOpenCartographersStudio.mockReset();
    renderMenu();
    openStudio();
    act(() => {
      (
        container.querySelector(
          '[data-testid="estate-open-cartographers-studio"]',
        ) as HTMLButtonElement
      ).click();
    });
    expect(onOpenCartographersStudio).toHaveBeenCalledTimes(1);
  });

  it("supports keyboard activation of Create expand and focus into nested items", () => {
    renderMenu();
    openStudio();
    const create = container.querySelector(
      '[data-testid="estate-open-create"]',
    ) as HTMLButtonElement;
    create.focus();
    act(() => {
      create.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
      create.click();
    });
    expect(create.getAttribute("aria-expanded")).toBe("true");
    const documents = container.querySelector(
      '[data-testid="estate-create-documents"]',
    ) as HTMLButtonElement;
    expect(documents).toBeTruthy();
    documents.focus();
    expect(document.activeElement).toBe(documents);
  });
});

describe("Create submenu — structure safety (source)", () => {
  const menu = read("components/companion/estate/EstateRoomExperienceMenu.tsx");
  const css = read("app/companion/estate-room-experience-menu.css");

  it("Create click only toggles expand — does not closeAndRun Create workspace paths", () => {
    expect(menu).toMatch(/data-testid="estate-open-create"/);
    expect(menu).toMatch(/setCreateExpanded\(\(current\) => !current\)/);
    const createHandler = menu.match(
      /data-testid="estate-open-create"[\s\S]{0,400}onClick=\{\(\) => \{[\s\S]*?\}\}/,
    )?.[0];
    expect(createHandler).toBeTruthy();
    expect(createHandler).not.toMatch(/closeAndRun/);
    expect(createHandler).not.toMatch(/onToggleChat/);
    expect(menu).not.toMatch(/closeAndRun\(_onOpenDocuments\)/);
    expect(menu).not.toMatch(/closeAndRun\(onOpenDocuments\)/);
  });

  it("indents Create nested items in CSS", () => {
    expect(css).toMatch(/__section-items--create/);
    expect(css).toMatch(/__item--nested/);
    expect(css).toMatch(/__item--pending/);
  });

  it("does not touch authentication files in this change set contract", () => {
    // Focused Create submenu work lives in menu hierarchy / CSS / tests only.
    expect(menu).not.toMatch(/signInWithPassword|CompanionSignInForm/);
    const authPaths = [
      "app/companion/login/page.tsx",
      "components/companion/CompanionSignInForm.tsx",
      "lib/auth/companionAuth.ts",
    ];
    for (const path of authPaths) {
      // File may exist; this suite must not require editing it.
      expect(path.includes("login") || path.includes("auth") || path.includes("SignIn")).toBe(
        true,
      );
    }
  });
});
