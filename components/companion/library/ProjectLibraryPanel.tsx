"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getProjects } from "@/lib/companionProjectsStore";
import type { ProjectHomeRecord } from "@/lib/projectHomes/types";
import {
  applyLibraryQuery,
  DEFAULT_LIBRARY_PAGE_SIZE,
  libraryArchiveProject,
  libraryCycleProjectStatus,
  libraryDuplicateProject,
  libraryEditProjectDetails,
  libraryRenameProject,
  libraryRestoreProject,
  libraryToggleProjectFavorite,
  listProjectLibraryItems,
  loadLibraryUiState,
  nextVisibleCount,
  PROJECT_FILTER_OPTIONS,
  PROJECT_SORT_OPTIONS,
  saveLibraryUiState,
  type LibraryFilterId,
  type LibraryItem,
  type LibrarySortId,
  type LibraryUiState,
  type LibraryViewMode,
  type SparkLibraryCardActionId,
} from "@/lib/sparkLibraryCollection";
import { LibraryCard } from "./LibraryCard";
import { LibraryEditDetailsDialog } from "./LibraryEditDetailsDialog";
import { LibraryRenameDialog } from "./LibraryRenameDialog";
import { LibraryShell } from "./LibraryShell";
import { LibraryToolbar } from "./LibraryToolbar";

type Props = {
  homes: ProjectHomeRecord[];
  onHomesChange: (homes: ProjectHomeRecord[]) => void;
  onOpen: (id: string) => void;
  onOpenSourceCreation?: (creationId: string) => void;
  onFeedback?: (message: string | null) => void;
};

export function ProjectLibraryPanel({
  homes,
  onHomesChange,
  onOpen,
  onOpenSourceCreation,
  onFeedback,
}: Props) {
  const [ui, setUi] = useState<LibraryUiState>(() =>
    loadLibraryUiState("projects", {
      sort: "recently_updated",
      view: "comfortable",
    }),
  );
  const [renameItem, setRenameItem] = useState<LibraryItem | null>(null);
  const [detailsItem, setDetailsItem] = useState<LibraryItem | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [favoriteTick, setFavoriteTick] = useState(0);

  useEffect(() => {
    saveLibraryUiState(ui);
  }, [ui]);

  const items = useMemo(() => {
    void favoriteTick;
    return listProjectLibraryItems(homes);
  }, [homes, favoriteTick]);

  const query = useMemo(
    () =>
      applyLibraryQuery({
        items,
        kind: "project",
        ui,
      }),
    [items, ui],
  );

  const patchUi = useCallback((patch: Partial<LibraryUiState>) => {
    setUi((prev) => ({
      ...prev,
      ...patch,
      visibleCount:
        patch.search !== undefined ||
        patch.filter !== undefined ||
        patch.sort !== undefined
          ? DEFAULT_LIBRARY_PAGE_SIZE
          : (patch.visibleCount ?? prev.visibleCount),
    }));
  }, []);

  function handlePrimary(item: LibraryItem) {
    if (item.archived) {
      onHomesChange(libraryRestoreProject(homes, item.id));
      onFeedback?.("Restored.");
      return;
    }
    onOpen(item.id);
  }

  function handleAction(action: SparkLibraryCardActionId, item: LibraryItem) {
    switch (action) {
      case "open":
        handlePrimary(item);
        break;
      case "rename":
        setDialogError(null);
        setRenameItem(item);
        break;
      case "edit_details":
        setDialogError(null);
        setDetailsItem(item);
        break;
      case "duplicate": {
        const result = libraryDuplicateProject(homes, item.id);
        if (result.duplicate) {
          onHomesChange(result.homes);
          onFeedback?.("Duplicated project.");
        }
        break;
      }
      case "favorite":
      case "unfavorite":
        libraryToggleProjectFavorite(item.id);
        setFavoriteTick((n) => n + 1);
        break;
      case "archive":
        onHomesChange(libraryArchiveProject(homes, item.id));
        onFeedback?.("Archived. You can find it under Archived.");
        break;
      case "restore":
        onHomesChange(libraryRestoreProject(homes, item.id));
        onFeedback?.("Restored.");
        break;
      case "view_source_creation":
        if (item.relationship?.id) {
          onOpenSourceCreation?.(item.relationship.id);
        }
        break;
      case "change_status": {
        const store = getProjects().find(
          (p) =>
            p.id ===
            ((item.sourceRef as ProjectHomeRecord).companionProjectId ||
              item.id),
        );
        onHomesChange(
          libraryCycleProjectStatus(homes, item.id, store?.status ?? null),
        );
        onFeedback?.("Status updated.");
        break;
      }
      default:
        break;
    }
  }

  if (homes.filter((h) => !h.isSample).length === 0) {
    return null;
  }

  return (
    <LibraryShell
      testId="project-library-panel"
      aria-label="Projects library"
    >
      <LibraryToolbar
        kind="project"
        search={ui.search}
        filter={ui.filter}
        sort={ui.sort}
        view={ui.view}
        filterOptions={PROJECT_FILTER_OPTIONS}
        sortOptions={PROJECT_SORT_OPTIONS}
        searchLabel="Search projects"
        matchedCount={query.totalMatched}
        totalCount={query.totalSource}
        onSearchChange={(search) => patchUi({ search })}
        onFilterChange={(filter: LibraryFilterId) => patchUi({ filter })}
        onSortChange={(sort: LibrarySortId) => patchUi({ sort })}
        onViewChange={(view: LibraryViewMode) => patchUi({ view })}
        onClearFilters={() =>
          patchUi({
            search: "",
            filter: "all",
            visibleCount: DEFAULT_LIBRARY_PAGE_SIZE,
          })
        }
      />

      <div
        className={
          ui.view === "compact"
            ? "spark-library-grid spark-library-grid--compact"
            : "spark-library-grid spark-library-grid--comfortable spark-library-grid--projects"
        }
        data-testid="project-library-list"
      >
        {query.items.map((item) => (
          <LibraryCard
            key={item.id}
            item={item}
            view={ui.view}
            onPrimary={handlePrimary}
            onAction={handleAction}
            onOpenRelationship={(it) => {
              if (it.relationship?.id) {
                onOpenSourceCreation?.(it.relationship.id);
              }
            }}
          />
        ))}
      </div>

      {query.hasMore ? (
        <button
          type="button"
          className="spark-library-load-more"
          data-testid="library-load-more"
          onClick={() =>
            patchUi({
              visibleCount: nextVisibleCount(ui.visibleCount, ui.pageSize),
            })
          }
        >
          Load More
        </button>
      ) : null}

      <LibraryRenameDialog
        open={Boolean(renameItem)}
        title="Rename this project"
        initialName={renameItem?.title ?? ""}
        errorMessage={dialogError}
        onCancel={() => {
          setRenameItem(null);
          setDialogError(null);
        }}
        onSave={(name) => {
          if (!renameItem) return;
          if (!name.trim()) {
            setDialogError("Please enter a name.");
            return;
          }
          onHomesChange(libraryRenameProject(homes, renameItem.id, name));
          setRenameItem(null);
          onFeedback?.("Renamed.");
        }}
      />

      <LibraryEditDetailsDialog
        open={Boolean(detailsItem)}
        heading="Edit project details"
        initial={{
          title: detailsItem?.title ?? "",
          purpose: detailsItem?.description ?? "",
        }}
        errorMessage={dialogError}
        onCancel={() => {
          setDetailsItem(null);
          setDialogError(null);
        }}
        onSave={(draft) => {
          if (!detailsItem) return;
          onHomesChange(
            libraryEditProjectDetails(homes, detailsItem.id, {
              name: draft.title,
              purpose: draft.purpose,
            }),
          );
          setDetailsItem(null);
          onFeedback?.("Details saved.");
        }}
      />
    </LibraryShell>
  );
}
