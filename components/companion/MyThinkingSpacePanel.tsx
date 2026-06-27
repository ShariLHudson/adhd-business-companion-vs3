"use client";

import { useEffect, useMemo, useState } from "react";
import { getBrainDumps, type BrainDumpEntry } from "@/lib/companionStore";
import {
  NAV_CLEAR_MY_MIND,
  NAV_MY_THOUGHTS,
} from "@/lib/navigationBack";
import { usePanelNavigationHistory } from "@/lib/usePanelNavigationHistory";
import {
  buildCollectionSummaries,
  searchThinkingSpaceThoughts,
} from "@/lib/thinkingSpace";
import {
  clearThoughtSeparationUndo,
  getPendingThoughtSeparationUndo,
  undoThoughtSeparation,
  type ThoughtSeparateUndo,
} from "@/lib/thinkingSpace/thoughtSeparate";
import {
  thoughtBelongsToCollectionId,
} from "@/lib/thinkingSpace/thoughtCollectionAuthority";
import {
  MY_THOUGHTS_ARCHIVED,
  MY_THOUGHTS_COLLECTIONS_HEADING,
  MY_THOUGHTS_EMPTY,
  MY_THOUGHTS_EXPLORE_PROMPT,
  MY_THOUGHTS_SEARCH_EMPTY,
  MY_THOUGHTS_SEARCH_PLACEHOLDER,
  MY_THOUGHTS_TITLE,
} from "@/lib/thinkingSpace/copy";
import { useThinkingSpace } from "@/lib/thinkingSpace/useThinkingSpace";
import { AppBackButton } from "@/components/companion/AppBackButton";
import { ThinkingSpaceCollectionCard } from "@/components/companion/ThinkingSpaceCollectionCard";
import { ThinkingSpaceCollectionView } from "@/components/companion/ThinkingSpaceCollectionView";
import { ThinkingSpaceCreateCollection } from "@/components/companion/ThinkingSpaceCreateCollection";
import { ThoughtCompanionBox } from "@/components/companion/ThoughtCompanionBox";
import { ThoughtCompanionModal } from "@/components/companion/ThoughtCompanionModal";
import { ThinkingSpacePresence } from "@/components/companion/ThinkingSpacePresence";
import { ThoughtDetailSheet } from "@/components/companion/ThoughtDetailSheet";
import { ThoughtSeparateUndoBar } from "@/components/companion/ThoughtSeparateUndoBar";

type View = "garden" | "collection" | "search" | "archived";

type MyThoughtsNavState = {
  view: View;
  openCollectionId: string | null;
  searchQuery: string;
};

const INITIAL_NAV: MyThoughtsNavState = {
  view: "garden",
  openCollectionId: null,
  searchQuery: "",
};

type Props = {
  /** Where the user came from before My Thoughts (journey-aware). */
  backDestination?: string;
  onBack: () => void;
  presenceEntryKey?: number;
};

export function MyThinkingSpacePanel({
  backDestination = NAV_CLEAR_MY_MIND,
  onBack,
  presenceEntryKey = 0,
}: Props) {
  const { allThoughts, archived, refresh } = useThinkingSpace();
  const nav = usePanelNavigationHistory<MyThoughtsNavState>(INITIAL_NAV);
  const { view, openCollectionId, searchQuery } = nav.snapshot;
  const [selectedThought, setSelectedThought] = useState<BrainDumpEntry | null>(
    null,
  );
  const [separateUndo, setSeparateUndo] = useState<ThoughtSeparateUndo | null>(
    () => getPendingThoughtSeparationUndo(),
  );

  function patchNav(partial: Partial<MyThoughtsNavState>) {
    nav.setSnapshot({ ...nav.snapshot, ...partial });
  }

  useEffect(() => {
    const syncUndo = () =>
      setSeparateUndo(getPendingThoughtSeparationUndo());
    syncUndo();
    const id = window.setInterval(syncUndo, 15_000);
    return () => window.clearInterval(id);
  }, [allThoughts]);

  const summaries = useMemo(
    () => buildCollectionSummaries(allThoughts),
    [allThoughts],
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchThinkingSpaceThoughts(searchQuery, allThoughts);
  }, [searchQuery, allThoughts]);

  const backDestinationLabel =
    nav.activeBackDestination ?? backDestination;

  function handleBack() {
    if (selectedThought) {
      setSelectedThought(null);
      return;
    }
    clearThoughtSeparationUndo();
    setSeparateUndo(null);
    if (nav.pop()) return;
    onBack();
  }

  function openCollection(id: string) {
    clearThoughtSeparationUndo();
    setSeparateUndo(null);
    nav.push({ ...nav.snapshot }, NAV_MY_THOUGHTS);
    patchNav({
      view: "collection",
      openCollectionId: id,
      searchQuery: "",
    });
  }

  function openArchived() {
    nav.push({ ...nav.snapshot }, NAV_MY_THOUGHTS);
    patchNav({ view: "archived" });
  }

  function handleSearchChange(value: string) {
    if (value.trim() && value !== searchQuery) {
      clearThoughtSeparationUndo();
      setSeparateUndo(null);
    }

    if (value.trim() && !searchQuery.trim() && view === "garden") {
      nav.push({ ...nav.snapshot }, NAV_MY_THOUGHTS);
      patchNav({
        view: "search",
        openCollectionId: null,
        searchQuery: value,
      });
      return;
    }

    patchNav({ searchQuery: value });

    if (value.trim()) {
      patchNav({ view: "search", openCollectionId: null });
    } else if (view === "search") {
      if (!nav.pop()) {
        patchNav({ view: "garden", openCollectionId: null });
      }
    }
  }

  return (
    <div
      className="my-thinking-space companion-fade-in"
      data-testid="my-thoughts"
      data-my-thoughts-version="5"
      data-thinking-view={view}
      data-nav-depth={nav.depth}
    >
      <ThinkingSpacePresence
        thoughtCount={allThoughts.length}
        workspaceEntryKey={presenceEntryKey}
      />

      {separateUndo ? (
        <div className="mb-4 max-w-xl">
          <ThoughtSeparateUndoBar
            undo={separateUndo}
            onUndo={() => {
              if (undoThoughtSeparation()) {
                refresh();
                setSeparateUndo(null);
                setSelectedThought(null);
              }
            }}
            onDismiss={() => {
              clearThoughtSeparationUndo();
              setSeparateUndo(null);
            }}
          />
        </div>
      ) : null}

      <header className="mb-4 max-w-2xl pr-16 sm:pr-20">
        {!selectedThought ? (
          <AppBackButton
            destination={backDestinationLabel}
            onBack={handleBack}
          />
        ) : null}
        <p className="text-2xl font-semibold text-[#1f1c19]">
          {MY_THOUGHTS_TITLE}
        </p>
        {view === "garden" ? (
          <p className="mt-2 text-base leading-relaxed text-[#6b635a]">
            {MY_THOUGHTS_EXPLORE_PROMPT}
          </p>
        ) : null}
      </header>

      <div className="my-thoughts-search-sticky mb-6 max-w-xl">
        <label className="sr-only" htmlFor="thinking-space-search">
          Search
        </label>
        <input
          id="thinking-space-search"
          type="search"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={MY_THOUGHTS_SEARCH_PLACEHOLDER}
          className="w-full rounded-2xl border border-[#d4cdc3] bg-white px-4 py-3 text-base text-[#1f1c19] shadow-sm outline-none focus:border-[#1e4f4f] focus:ring-2 focus:ring-[#1e4f4f]/15"
          data-testid="thinking-space-search"
        />
      </div>

      {allThoughts.length === 0 && view === "garden" ? (
        <p className="text-sm text-[#6b635a]">{MY_THOUGHTS_EMPTY}</p>
      ) : null}

      {view === "garden" && summaries.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6b635a]">
            {MY_THOUGHTS_COLLECTIONS_HEADING}
          </h2>
          <div
            className="grid gap-4 sm:grid-cols-2"
            aria-label="Collections"
          >
            {summaries.map((summary) => (
              <ThinkingSpaceCollectionCard
                key={summary.id}
                summary={summary}
                onOpen={openCollection}
              />
            ))}
          </div>

          <ThinkingSpaceCreateCollection
            existingLabels={
              new Set(summaries.map((s) => s.label.toLowerCase()))
            }
            onCreated={refresh}
          />
        </div>
      ) : null}

      {view === "collection" && openCollectionId ? (
        <ThinkingSpaceCollectionView
          collectionId={openCollectionId}
          searchQuery={searchQuery}
          thoughts={allThoughts}
          onOpenThought={setSelectedThought}
          onRefresh={refresh}
        />
      ) : null}

      {view === "search" && searchQuery.trim() ? (
        <div data-testid="thinking-space-search-results">
          {searchResults.length === 0 ? (
            <p className="text-sm text-[#6b635a]">
              {MY_THOUGHTS_SEARCH_EMPTY}
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5" aria-label="Search results">
              {searchResults.slice(0, 20).map((entry) => (
                <li key={entry.id}>
                  <ThoughtCompanionBox
                    entry={entry}
                    onOpen={setSelectedThought}
                  />
                </li>
              ))}
            </ul>
          )}
          {searchResults.length > 20 ? (
            <p className="mt-3 text-sm text-[#6b635a]">
              Showing 20 of {searchResults.length} — refine your search for
              more.
            </p>
          ) : null}
        </div>
      ) : null}

      {view === "garden" && archived.length > 0 ? (
        <div className="mt-10">
          <button
            type="button"
            onClick={openArchived}
            className="text-sm font-semibold text-[#6b635a] hover:text-[#1e4f4f]"
          >
            {MY_THOUGHTS_ARCHIVED} ({archived.length})
          </button>
        </div>
      ) : null}

      {view === "archived" ? (
        <ul className="flex flex-col gap-2.5" aria-label="Archived thoughts">
          {archived.map((entry) => (
            <li key={entry.id}>
              <ThoughtCompanionBox
                entry={entry}
                onOpen={setSelectedThought}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {selectedThought ? (
        <ThoughtCompanionModal onClose={() => setSelectedThought(null)}>
          <ThoughtDetailSheet
            key={selectedThought.id}
            entry={selectedThought}
            allThoughts={[...allThoughts, ...archived]}
            variant="modal"
            onClose={() => setSelectedThought(null)}
            onChanged={() => {
              clearThoughtSeparationUndo();
              setSeparateUndo(null);
              refresh();
              setSelectedThought((prev) => {
                if (!prev) return null;
                const latest =
                  getBrainDumps().find((t) => t.id === prev.id) ?? null;
                if (!latest) return null;
                if (
                  view === "collection" &&
                  openCollectionId &&
                  !thoughtBelongsToCollectionId(latest, openCollectionId)
                ) {
                  return null;
                }
                return latest;
              });
            }}
            onSeparated={() => {
              refresh();
              setSeparateUndo(getPendingThoughtSeparationUndo());
            }}
            onDeleted={() => setSelectedThought(null)}
          />
        </ThoughtCompanionModal>
      ) : null}
    </div>
  );
}

/** My Thoughts — organization workshop. */
export { MyThinkingSpacePanel as MyThoughtsPanel };
