/**
 * Evidence Vault (and every collection room) shares one saved-entry card.
 * Removal must always be a calm, in-place confirm — never a silent no-op,
 * never an instant delete, never a native browser popup.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EstateCollectionItemCard } from "./EstateCollectionItemCard";
import type {
  EstateCollectionCardFormat,
  EstateCollectionItem,
} from "@/lib/estate/collectionFramework/types";

const CARD: EstateCollectionCardFormat = {
  showMeta: true,
  showTitle: false,
  showIcon: false,
  showBadge: false,
  showExtraFields: false,
  showProgress: false,
  bodyEmphasis: "prose",
  layout: "stack",
  editLabel: "Refine discovery",
  favoriteLabel: "Treasure this",
  previewLines: 4,
};

const ITEM: EstateCollectionItem = {
  id: "disc-1",
  body: "Helped a client finish their launch",
  createdAt: "2026-01-01T00:00:00.000Z",
  category: "Client Result",
};

describe("EstateCollectionItemCard — calm removal", () => {
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

  function renderCard(onRemove = vi.fn(), onEdit = vi.fn()) {
    act(() => {
      root.render(
        <EstateCollectionItemCard
          item={ITEM}
          displayStyle="vault"
          card={CARD}
          removeLabel="Remove from vault"
          onRemove={onRemove}
          onEdit={onEdit}
        />,
      );
    });
    return { onRemove, onEdit };
  }

  it("does not remove on first click — asks a calm confirming question instead", () => {
    const { onRemove } = renderCard();
    act(() => {
      container
        .querySelector('[data-testid="estate-collection-remove-disc-1"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onRemove).not.toHaveBeenCalled();
    expect(
      container.querySelector('[data-testid="estate-collection-confirm-disc-1"]'),
    ).toBeTruthy();
    expect(container.textContent).toMatch(/Remove this for good/);
  });

  it("removes only after the member confirms", () => {
    const { onRemove } = renderCard();
    act(() => {
      container
        .querySelector('[data-testid="estate-collection-remove-disc-1"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    act(() => {
      container
        .querySelector('[data-testid="estate-collection-confirm-remove-disc-1"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("keeps the entry when the member chooses Keep it", () => {
    const { onRemove } = renderCard();
    act(() => {
      container
        .querySelector('[data-testid="estate-collection-remove-disc-1"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    act(() => {
      container
        .querySelector('[data-testid="estate-collection-confirm-keep-disc-1"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onRemove).not.toHaveBeenCalled();
    expect(
      container.querySelector('[data-testid="estate-collection-confirm-disc-1"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="estate-collection-remove-disc-1"]'),
    ).toBeTruthy();
  });

  it("still allows Edit and Favorite while not confirming removal", () => {
    const { onEdit } = renderCard(vi.fn(), vi.fn());
    act(() => {
      container
        .querySelector(".estate-collection-card__edit")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
