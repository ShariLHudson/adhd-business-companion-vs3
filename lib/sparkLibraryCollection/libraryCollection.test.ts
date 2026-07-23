/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { applyLibraryQuery } from "./applyLibraryQuery";
import { menuActionsForItem } from "./capabilities";
import {
  clearLibraryFavoritesForTests,
  isLibraryFavorite,
  setLibraryFavorite,
  toggleLibraryFavorite,
} from "./favorites";
import { activeFilterChips } from "./filter";
import {
  clearLibraryUiStateForTests,
  loadLibraryUiState,
  saveLibraryUiState,
} from "./persistLibraryState";
import { nextVisibleCount, paginateLibraryItems } from "./paginate";
import type { LibraryItem, LibraryItemCapabilities } from "./types";
import { EMPTY_CAPABILITIES } from "./capabilities";

function caps(
  partial: Partial<LibraryItemCapabilities>,
): LibraryItemCapabilities {
  return { ...EMPTY_CAPABILITIES, ...partial };
}

function item(
  overrides: Partial<LibraryItem> & Pick<LibraryItem, "id" | "title">,
): LibraryItem {
  return {
    kind: "creation",
    description: "",
    typeLabel: "Workshop",
    statusId: "active",
    statusLabel: "In Progress",
    favorite: false,
    archived: false,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-20T00:00:00.000Z",
    relationship: null,
    capabilities: caps({
      canRename: true,
      canFavorite: true,
      canArchive: true,
      canContinue: true,
      canDuplicate: true,
      canTrash: true,
      canEditDetails: true,
    }),
    primaryAction: "continue",
    sourceRef: null,
    ...overrides,
  };
}

describe("sparkLibraryCollection — Phase 1", () => {
  beforeEach(() => {
    clearLibraryFavoritesForTests();
    clearLibraryUiStateForTests();
  });

  it("hides unsupported menu actions", () => {
    const limited = item({
      id: "a",
      title: "A",
      capabilities: caps({ canRename: true, canContinue: true }),
    });
    const actions = menuActionsForItem(limited);
    expect(actions).toContain("rename");
    expect(actions).not.toContain("trash");
    expect(actions).not.toContain("duplicate");
    expect(actions).not.toContain("delete");
  });

  it("creation menu includes turn into project when capable", () => {
    const withProject = item({
      id: "b",
      title: "B",
      capabilities: caps({
        canCreateProject: true,
        canRename: true,
        canFavorite: true,
        canArchive: true,
      }),
    });
    expect(menuActionsForItem(withProject)).toContain("turn_into_project");
  });

  it("project menu hides trash/delete in Phase 1", () => {
    const project = item({
      id: "p1",
      title: "P",
      kind: "project",
      primaryAction: "open",
      capabilities: caps({
        canOpen: true,
        canRename: true,
        canArchive: true,
        canFavorite: true,
        canDuplicate: true,
        canTrash: false,
      }),
    });
    const actions = menuActionsForItem(project);
    expect(actions).toContain("rename");
    expect(actions).not.toContain("trash");
    expect(actions).not.toContain("delete");
  });

  it("search matches title, type, and linked name", () => {
    const items = [
      item({
        id: "1",
        title: "Retreat Map",
        typeLabel: "Workshop",
        relationship: {
          kind: "linked_project",
          id: "ph1",
          label: "Summer Launch",
        },
      }),
      item({ id: "2", title: "Other", typeLabel: "Email" }),
    ];
    expect(
      applyLibraryQuery({ items, kind: "creation", search: "summer" }).items
        .map((i) => i.id),
    ).toEqual(["1"]);
    expect(
      applyLibraryQuery({ items, kind: "creation", search: "email" }).items
        .map((i) => i.id),
    ).toEqual(["2"]);
  });

  it("filters favorites and archived", () => {
    const items = [
      item({ id: "1", title: "A", favorite: true }),
      item({ id: "2", title: "B", archived: true, statusId: "archived" }),
      item({ id: "3", title: "C" }),
    ];
    expect(
      applyLibraryQuery({
        items,
        kind: "creation",
        filter: "favorites",
      }).items.map((i) => i.id),
    ).toEqual(["1"]);
    expect(
      applyLibraryQuery({
        items,
        kind: "creation",
        filter: "archived",
      }).items.map((i) => i.id),
    ).toEqual(["2"]);
    expect(
      applyLibraryQuery({ items, kind: "creation", filter: "all" }).items.map(
        (i) => i.id,
      ),
    ).toEqual(["1", "3"]);
  });

  it("exposes active filter chips and clears to all", () => {
    expect(activeFilterChips("favorites", "creation")).toEqual([
      { id: "favorites", label: "Favorites" },
    ]);
    expect(activeFilterChips("all", "creation")).toEqual([]);
  });

  it("sorts by name and recently updated", () => {
    const items = [
      item({
        id: "1",
        title: "Zebra",
        updatedAt: "2026-07-01T00:00:00.000Z",
      }),
      item({
        id: "2",
        title: "Apple",
        updatedAt: "2026-07-22T00:00:00.000Z",
      }),
    ];
    expect(
      applyLibraryQuery({
        items,
        kind: "creation",
        sort: "name_asc",
      }).items.map((i) => i.title),
    ).toEqual(["Apple", "Zebra"]);
    expect(
      applyLibraryQuery({
        items,
        kind: "creation",
        sort: "recently_updated",
      }).items.map((i) => i.id),
    ).toEqual(["2", "1"]);
  });

  it("paginates with Load More", () => {
    const items = Array.from({ length: 20 }, (_, i) =>
      item({ id: `i${i}`, title: `Item ${i}` }),
    );
    const first = paginateLibraryItems(items, 12, 12);
    expect(first.items).toHaveLength(12);
    expect(first.hasMore).toBe(true);
    const next = paginateLibraryItems(
      items,
      nextVisibleCount(first.visibleCount, 12),
      12,
    );
    expect(next.items).toHaveLength(20);
    expect(next.hasMore).toBe(false);
  });

  it("favorites toggle persists", () => {
    expect(isLibraryFavorite("creation", "x")).toBe(false);
    expect(toggleLibraryFavorite("creation", "x")).toBe(true);
    expect(isLibraryFavorite("creation", "x")).toBe(true);
    setLibraryFavorite("creation", "x", false);
    expect(isLibraryFavorite("creation", "x")).toBe(false);
  });

  it("persists library UI state for return", () => {
    saveLibraryUiState({
      surface: "create",
      search: "retreat",
      filter: "in_progress",
      sort: "name_asc",
      view: "compact",
      pageSize: 12,
      visibleCount: 24,
      scrollTop: 120,
    });
    const loaded = loadLibraryUiState("create");
    expect(loaded.search).toBe("retreat");
    expect(loaded.filter).toBe("in_progress");
    expect(loaded.sort).toBe("name_asc");
    expect(loaded.view).toBe("compact");
    expect(loaded.visibleCount).toBe(24);
    expect(loaded.scrollTop).toBe(120);
  });

  it("relationship indicator fields survive query", () => {
    const items = [
      item({
        id: "c1",
        title: "Workshop",
        relationship: {
          kind: "linked_project",
          id: "ph1",
          label: "Launch Home",
        },
      }),
    ];
    const result = applyLibraryQuery({ items, kind: "creation" });
    expect(result.items[0].relationship?.label).toBe("Launch Home");
  });
});
