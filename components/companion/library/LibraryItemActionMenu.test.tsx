/**
 * @vitest-environment jsdom
 */
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LibraryItemActionMenu } from "./LibraryItemActionMenu";
import { EMPTY_CAPABILITIES } from "@/lib/sparkLibraryCollection/capabilities";
import type { LibraryItem } from "@/lib/sparkLibraryCollection/types";
import "@/app/companion/library-collection.css";

function makeItem(partial?: Partial<LibraryItem>): LibraryItem {
  return {
    id: "ws-1",
    kind: "creation",
    title: "Clarity Workshop",
    typeLabel: "Workshop",
    statusId: "active",
    statusLabel: "In Progress",
    favorite: false,
    archived: false,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-20T00:00:00.000Z",
    relationship: null,
    capabilities: {
      ...EMPTY_CAPABILITIES,
      canRename: true,
      canArchive: true,
      canFavorite: true,
      canContinue: true,
    },
    primaryAction: "continue",
    sourceRef: null,
    ...partial,
  };
}

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

describe("LibraryItemActionMenu", () => {
  it("uses Actions for [Item Name] label and does not bubble to card", () => {
    const onAction = vi.fn();
    const onCardClick = vi.fn();
    act(() => {
      root.render(
        <div onClick={onCardClick}>
          <LibraryItemActionMenu item={makeItem()} onAction={onAction} />
        </div>,
      );
    });
    const trigger = container.querySelector(
      "[data-testid='library-menu-trigger-ws-1']",
    ) as HTMLButtonElement;
    expect(trigger.getAttribute("aria-label")).toBe(
      "Actions for Clarity Workshop",
    );
    act(() => {
      trigger.click();
    });
    expect(onCardClick).not.toHaveBeenCalled();
    expect(
      container.querySelector("[data-testid='library-menu-panel-ws-1']"),
    ).toBeTruthy();
  });

  it("hides unsupported actions", () => {
    act(() => {
      root.render(
        <LibraryItemActionMenu
          item={makeItem({
            capabilities: {
              ...EMPTY_CAPABILITIES,
              canRename: true,
            },
          })}
          onAction={() => {}}
        />,
      );
    });
    act(() => {
      (
        container.querySelector(
          "[data-testid='library-menu-trigger-ws-1']",
        ) as HTMLButtonElement
      ).click();
    });
    expect(
      container.querySelector(
        "[data-testid='library-menu-action-ws-1-rename']",
      ),
    ).toBeTruthy();
    expect(
      container.querySelector(
        "[data-testid='library-menu-action-ws-1-archive']",
      ),
    ).toBeNull();
  });

  it("Escape closes the menu", () => {
    act(() => {
      root.render(
        <LibraryItemActionMenu item={makeItem()} onAction={() => {}} />,
      );
    });
    act(() => {
      (
        container.querySelector(
          "[data-testid='library-menu-trigger-ws-1']",
        ) as HTMLButtonElement
      ).click();
    });
    expect(
      container.querySelector("[data-testid='library-menu-panel-ws-1']"),
    ).toBeTruthy();
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    expect(
      container.querySelector("[data-testid='library-menu-panel-ws-1']"),
    ).toBeNull();
  });

  it("invokes action without opening card", () => {
    const onAction = vi.fn();
    const onCardClick = vi.fn();
    act(() => {
      root.render(
        <div onClick={onCardClick}>
          <LibraryItemActionMenu item={makeItem()} onAction={onAction} />
        </div>,
      );
    });
    act(() => {
      (
        container.querySelector(
          "[data-testid='library-menu-trigger-ws-1']",
        ) as HTMLButtonElement
      ).click();
    });
    act(() => {
      (
        container.querySelector(
          "[data-testid='library-menu-action-ws-1-rename']",
        ) as HTMLButtonElement
      ).click();
    });
    expect(onAction).toHaveBeenCalledWith("rename", expect.any(Object));
    expect(onCardClick).not.toHaveBeenCalled();
  });
});
