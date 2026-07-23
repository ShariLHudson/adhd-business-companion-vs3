"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ActiveCreationWorkspaceSummary } from "@/lib/createEstate/listActiveCreationWorkspaces";
import { continueCardFromRegistryEntry } from "@/lib/activeWorkspaceRegistry/continueCardProjection";
import type { ActiveWorkspaceEntry } from "@/lib/activeWorkspaceRegistry/types";
import {
  applyLibraryQuery,
  CREATION_FILTER_OPTIONS,
  CREATION_SORT_OPTIONS,
  DEFAULT_LIBRARY_PAGE_SIZE,
  libraryArchiveCreation,
  libraryDuplicateCreation,
  libraryEditCreationDetails,
  libraryRenameCreation,
  libraryRestoreCreation,
  libraryToggleCreationFavorite,
  libraryTrashCreation,
  libraryTurnCreationIntoProject,
  listCreationLibraryItems,
  loadLibraryUiState,
  nextVisibleCount,
  saveLibraryUiState,
  type LibraryFilterId,
  type LibraryItem,
  type LibrarySortId,
  type LibraryUiState,
  type LibraryViewMode,
  type SparkLibraryCardActionId,
} from "@/lib/sparkLibraryCollection";
import { ConfirmDialog } from "@/components/companion/ConfirmDialog";
import { LibraryCard } from "./LibraryCard";
import { LibraryEditDetailsDialog } from "./LibraryEditDetailsDialog";
import { LibraryRenameDialog } from "./LibraryRenameDialog";
import { LibraryShell } from "./LibraryShell";
import { LibraryToolbar } from "./LibraryToolbar";

type Props = {
  onResume: (
    workspace: ActiveCreationWorkspaceSummary,
  ) => void | { ok: boolean; acknowledgment?: string };
  onOpenLinkedProject?: (projectHomeId: string) => void;
  onFeedback?: (message: string | null) => void;
};

function toSummary(entry: ActiveWorkspaceEntry): ActiveCreationWorkspaceSummary {
  const card = continueCardFromRegistryEntry(entry);
  return {
    id: entry.workspaceId,
    title: card.title,
    kindLabel: card.creationType,
    phaseLabel: card.statusLabel,
    updatedAt: entry.lastActivityAt,
    eventRecordId: entry.eventRecordId || entry.workspaceId,
    creationRecordId: entry.runtimeCreationRecordId,
    projectHomeId: entry.projectHomeId,
    nextAction: entry.currentFocusTitle
      ? `Next step: ${entry.currentFocusTitle}`
      : "",
    currentFocusTitle: entry.currentFocusTitle,
    statusLabel: card.statusLabel,
    lastWorkedLabel: card.lastWorkedLabel,
    progressSummary: card.progressSummary,
  };
}

export function CreationLibraryPanel({
  onResume,
  onOpenLinkedProject,
  onFeedback,
}: Props) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [ui, setUi] = useState<LibraryUiState>(() =>
    loadLibraryUiState("create", {
      sort: "recently_updated",
      view: "comfortable",
    }),
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [renameItem, setRenameItem] = useState<LibraryItem | null>(null);
  const [detailsItem, setDetailsItem] = useState<LibraryItem | null>(null);
  const [trashItem, setTrashItem] = useState<LibraryItem | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    setItems(listCreationLibraryItems({ includeArchived: true }));
  }, []);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  useEffect(() => {
    saveLibraryUiState(ui);
  }, [ui]);

  useEffect(() => {
    const el = listRef.current;
    if (el && typeof ui.scrollTop === "number" && ui.scrollTop > 0) {
      el.scrollTop = ui.scrollTop;
    }
  }, [items.length]); // restore once when list mounts

  const query = useMemo(
    () =>
      applyLibraryQuery({
        items,
        kind: "creation",
        ui,
      }),
    [items, ui],
  );

  function patchUi(patch: Partial<LibraryUiState>) {
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
  }

  function setFeedback(message: string | null) {
    onFeedback?.(message);
  }

  function handlePrimary(item: LibraryItem) {
    if (item.archived) {
      libraryRestoreCreation(item.id);
      refresh();
      setFeedback("Restored. It’s back with your active work.");
      return;
    }
    const entry = item.sourceRef as ActiveWorkspaceEntry;
    setBusyId(item.id);
    setFeedback("Reopening your workspace…");
    try {
      const result = onResume(toSummary(entry));
      if (result && result.ok === false) {
        setFeedback(
          result.acknowledgment ||
            "I couldn't reopen that workspace yet. Please try again.",
        );
      } else {
        setFeedback(null);
      }
    } catch {
      setFeedback(
        "I couldn't reopen that workspace yet. Please try again — I will not claim it is open until it verifies.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleAction(
    action: SparkLibraryCardActionId,
    item: LibraryItem,
  ) {
    switch (action) {
      case "continue":
      case "resume":
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
        const result = libraryDuplicateCreation(item.id);
        refresh();
        setFeedback(
          result.ok
            ? "Duplicated. Your copy is ready when you are."
            : result.message || "I couldn’t duplicate that yet.",
        );
        break;
      }
      case "favorite":
      case "unfavorite":
        libraryToggleCreationFavorite(item.id);
        refresh();
        break;
      case "archive":
        libraryArchiveCreation(item.id);
        refresh();
        setFeedback("Archived. You can find it under Archived.");
        break;
      case "restore":
        libraryRestoreCreation(item.id);
        refresh();
        setFeedback("Restored.");
        break;
      case "trash":
        setTrashItem(item);
        break;
      case "turn_into_project": {
        const result = libraryTurnCreationIntoProject(item.id);
        refresh();
        setFeedback(
          result.ok
            ? "Linked a project. The creation content stays here."
            : result.message || "I couldn’t create a project for this yet.",
        );
        break;
      }
      case "view_linked_project":
        if (item.relationship?.id) {
          onOpenLinkedProject?.(item.relationship.id);
        }
        break;
      default:
        break;
    }
  }

  return (
    <LibraryShell
      testId="creation-library-panel"
      aria-label="Creations library"
    >
      <LibraryToolbar
        kind="creation"
        search={ui.search}
        filter={ui.filter}
        sort={ui.sort}
        view={ui.view}
        filterOptions={CREATION_FILTER_OPTIONS}
        sortOptions={CREATION_SORT_OPTIONS}
        searchLabel="Search creations"
        matchedCount={query.totalMatched}
        totalCount={query.totalSource}
        onSearchChange={(search) => patchUi({ search })}
        onFilterChange={(filter: LibraryFilterId) => patchUi({ filter })}
        onSortChange={(sort: LibrarySortId) => patchUi({ sort })}
        onViewChange={(view: LibraryViewMode) => patchUi({ view })}
        onClearFilters={() =>
          patchUi({ search: "", filter: "all", visibleCount: DEFAULT_LIBRARY_PAGE_SIZE })
        }
      />

      <div
        ref={listRef}
        className={
          ui.view === "compact"
            ? "spark-library-grid spark-library-grid--compact"
            : "spark-library-grid spark-library-grid--comfortable"
        }
        data-testid="creation-library-list"
        onScroll={(e) => {
          const top = (e.target as HTMLDivElement).scrollTop;
          patchUi({ scrollTop: top });
        }}
      >
        {query.items.map((item) => (
          <LibraryCard
            key={item.id}
            item={item}
            view={ui.view}
            busy={busyId === item.id}
            onPrimary={handlePrimary}
            onAction={handleAction}
            onOpenRelationship={(it) => {
              if (it.relationship?.id) {
                onOpenLinkedProject?.(it.relationship.id);
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
        title="Rename this work"
        initialName={renameItem?.title ?? ""}
        busy={dialogBusy}
        errorMessage={dialogError}
        onCancel={() => {
          setRenameItem(null);
          setDialogError(null);
        }}
        onSave={async (name) => {
          if (!renameItem) return;
          setDialogBusy(true);
          setDialogError(null);
          const result = await libraryRenameCreation(renameItem.id, name);
          setDialogBusy(false);
          if (!result.ok) {
            setDialogError(
              result.message ||
                "I couldn't rename that yet. Your title is still here — try again.",
            );
            return;
          }
          setRenameItem(null);
          refresh();
          setFeedback("Renamed.");
        }}
      />

      <LibraryEditDetailsDialog
        open={Boolean(detailsItem)}
        heading="Edit details"
        showAudience
        initial={{
          title: detailsItem?.title ?? "",
          purpose: detailsItem?.description ?? "",
          audience: detailsItem?.clientOrAudience ?? "",
        }}
        busy={dialogBusy}
        errorMessage={dialogError}
        onCancel={() => {
          setDetailsItem(null);
          setDialogError(null);
        }}
        onSave={(draft) => {
          if (!detailsItem) return;
          setDialogBusy(true);
          const result = libraryEditCreationDetails(detailsItem.id, {
            title: draft.title,
            purpose: draft.purpose,
            audience: draft.audience,
          });
          setDialogBusy(false);
          if (!result.ok) {
            setDialogError(result.message || "I couldn’t save those details.");
            return;
          }
          setDetailsItem(null);
          refresh();
          setFeedback("Details saved.");
        }}
      />

      <ConfirmDialog
        open={Boolean(trashItem)}
        title="Move to Trash?"
        message={
          trashItem
            ? `Move “${trashItem.title}” to Trash? You can restore it later.`
            : ""
        }
        confirmLabel="Move to Trash"
        cancelLabel="Cancel"
        destructive
        onCancel={() => setTrashItem(null)}
        onConfirm={() => {
          if (trashItem) {
            libraryTrashCreation(trashItem.id);
            setTrashItem(null);
            refresh();
            setFeedback("Moved to Trash. You can restore it from Manage My Work.");
          }
        }}
      />
    </LibraryShell>
  );
}
