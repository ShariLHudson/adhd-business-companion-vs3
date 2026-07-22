"use client";

import { useMemo, useState } from "react";
import { CreateDraftResumeList } from "@/components/companion/CreateDraftResumeList";
import { CreateWorkspaceResumeList } from "@/components/companion/CreateWorkspaceResumeList";
import { CompanionObjectVisual } from "@/components/companion/CompanionObjectVisual";
import { objectIdForEmoji } from "@/lib/companionObjects";
import type { CreateCatalogItem } from "@/lib/createCatalog";
import type { ActiveCreationWorkspaceSummary } from "@/lib/createEstate/listActiveCreationWorkspaces";
import type { CreateSuggestionContext } from "@/lib/createEstate/contextAwareSuggestions";
import {
  CREATE_ESTATE_CATEGORIES_HEADING,
  CREATE_ESTATE_CONTINUE_HEADING,
  CREATE_ESTATE_CONTINUE_SOMETHING_HEADING,
  CREATE_ESTATE_IDEA_PREVIEW_BACK,
  CREATE_ESTATE_IDEA_PREVIEW_CREATE,
  CREATE_ESTATE_INSPIRATION_HEADING,
  CREATE_ESTATE_INSPIRATION_HINT,
  CREATE_ESTATE_PREVIOUS_WORK_EMPTY,
  CREATE_ESTATE_PREVIOUS_WORK_HEADING,
  CREATE_ESTATE_RECENT_WORK_EMPTY,
  CREATE_ESTATE_RECENT_WORK_HEADING,
  CREATE_ESTATE_RECOMMENDED_EMPTY,
  CREATE_ESTATE_RECOMMENDED_HEADING,
} from "@/lib/createEstate/copy";
import {
  EXPLORE_IDEA_CATEGORY_CARDS,
  EXPLORE_IDEA_SOURCE_CHIPS,
  buildExploreIdeaPreview,
  buildExploreIdeaRecommendations,
  queryExploreIdeas,
  recentLabelsFromWorkspaces,
  type ExploreIdeaCategoryId,
  type ExploreIdeaResult,
  type ExploreIdeaSourceId,
} from "@/lib/createEstate/exploreIdeas";
import { SPARK_CREATE_MORE_WAYS_MAX_DECISION_LAYERS } from "@/lib/sparkCreateIntentConstitution/types";

type Props = {
  activeWorkspaces: readonly ActiveCreationWorkspaceSummary[];
  draftCount: number;
  suggestionContext: CreateSuggestionContext;
  onResumeCreationWorkspace: (
    workspace: ActiveCreationWorkspaceSummary,
  ) => void | { ok: boolean; acknowledgment?: string };
  onRenameWorkspace?: (id: string, title: string) => void | Promise<void>;
  onOpenSavedDraft: (id: string) => void;
  onRenameDraft: (id: string, title: string) => void;
  onDuplicateDraft: (id: string) => void;
  onDeleteDraft: (id: string) => void;
  /** Spec 130/131 — confirm before Work opens. */
  onRequestCreate: (item: CreateCatalogItem) => void;
};

/**
 * Spec 133 — Explore Ideas discovery.
 * Hierarchy: Continue → Search → Recommended → Categories.
 * One result list for search OR category. Confirm gate stays with parent.
 */
export function CreateExploreIdeasPanel({
  activeWorkspaces,
  draftCount,
  suggestionContext,
  onResumeCreationWorkspace,
  onRenameWorkspace,
  onOpenSavedDraft,
  onRenameDraft,
  onDuplicateDraft,
  onDeleteDraft,
  onRequestCreate,
}: Props) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<ExploreIdeaCategoryId | null>(
    null,
  );
  const [source, setSource] = useState<ExploreIdeaSourceId | "all">("all");
  const [previewIdea, setPreviewIdea] = useState<ExploreIdeaResult | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  const hasWorkspaces = activeWorkspaces.length > 0;
  const recentLabels = useMemo(
    () => recentLabelsFromWorkspaces(activeWorkspaces),
    [activeWorkspaces],
  );

  const recommendations = useMemo(
    () =>
      buildExploreIdeaRecommendations({
        workspaces: activeWorkspaces,
        suggestionContext,
      }),
    [activeWorkspaces, suggestionContext],
  );

  const resultsActive = Boolean(search.trim() || categoryId);

  const results = useMemo(() => {
    if (!resultsActive) return [];
    return queryExploreIdeas({
      search,
      categoryId,
      source,
      suggestionContext,
      recentLabels,
    });
  }, [
    resultsActive,
    search,
    categoryId,
    source,
    suggestionContext,
    recentLabels,
  ]);

  const preview = previewIdea ? buildExploreIdeaPreview(previewIdea) : null;

  if (preview && previewIdea) {
    return (
      <section
        className="flex flex-col gap-4"
        data-testid="create-explore-idea-preview"
        aria-labelledby="create-explore-preview-heading"
      >
        <h3
          id="create-explore-preview-heading"
          className="text-base font-semibold text-[#1f1c19]"
        >
          {preview.emoji} {preview.label}
        </h3>
        <dl className="grid gap-3 text-sm leading-relaxed text-[#3d3429]">
          <div>
            <dt className="font-semibold text-[#1f1c19]">Who for</dt>
            <dd className="mt-0.5 text-[#6b635a]">{preview.whoFor}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#1f1c19]">Time</dt>
            <dd className="mt-0.5 text-[#6b635a]">{preview.time}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#1f1c19]">Difficulty</dt>
            <dd className="mt-0.5 text-[#6b635a]">{preview.difficulty}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#1f1c19]">Expected outcome</dt>
            <dd className="mt-0.5 text-[#6b635a]">{preview.expectedOutcome}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#1f1c19]">Best when…</dt>
            <dd className="mt-0.5 text-[#6b635a]">{preview.bestWhen}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-xl bg-[#3d3429] px-5 py-2.5 text-sm font-semibold text-[#f7f2ea] transition hover:bg-[#2c241c]"
            data-testid="create-explore-idea-create"
            data-primary-action="create"
            onClick={() => onRequestCreate(previewIdea.catalogItem)}
          >
            {CREATE_ESTATE_IDEA_PREVIEW_CREATE}
          </button>
          <button
            type="button"
            className="rounded-xl border border-[#cfc6b8] bg-white px-5 py-2.5 text-sm font-semibold text-[#3d3429] transition hover:bg-[#f3ebe0]"
            data-testid="create-explore-idea-back"
            onClick={() => setPreviewIdea(null)}
          >
            {CREATE_ESTATE_IDEA_PREVIEW_BACK}
          </button>
        </div>
      </section>
    );
  }

  return (
    <div
      className="mt-4 flex flex-col gap-6"
      data-testid="create-explore-ideas-body"
      data-max-decision-layers={SPARK_CREATE_MORE_WAYS_MAX_DECISION_LAYERS}
    >
      {/* 1 — Continue Something */}
      <section
        data-testid="create-explore-continue-something"
        aria-labelledby="create-explore-continue-heading"
      >
        <h3
          id="create-explore-continue-heading"
          className="text-base font-semibold text-[#1f1c19]"
        >
          {CREATE_ESTATE_CONTINUE_SOMETHING_HEADING}
        </h3>

        {hasWorkspaces ? (
          <div className="mt-3" data-testid="create-explore-continue-working">
            <h4 className="text-sm font-semibold text-[#3d3429]">
              {CREATE_ESTATE_CONTINUE_HEADING}
            </h4>
            <div className="mt-2">
              <CreateWorkspaceResumeList
                onResume={onResumeCreationWorkspace}
                onRename={onRenameWorkspace ?? undefined}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-3" data-testid="create-explore-recent-work">
          <h4 className="text-sm font-semibold text-[#3d3429]">
            {CREATE_ESTATE_RECENT_WORK_HEADING}
          </h4>
          {recentLabels.length === 0 ? (
            <p className="mt-1 text-sm leading-relaxed text-[#6b635a]">
              {CREATE_ESTATE_RECENT_WORK_EMPTY}
            </p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2">
              {recentLabels.map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    className="rounded-full border border-[#cfc6b8] bg-white px-3 py-1.5 text-sm font-semibold text-[#3d3429] transition hover:bg-[#f3ebe0]"
                    data-testid="create-explore-recent-chip"
                    onClick={() => {
                      setSearch(label);
                      setCategoryId(null);
                      setSource("all");
                    }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-3" data-testid="create-estate-previous-work">
          <h4
            id="create-estate-previous-work-heading"
            className="text-sm font-semibold text-[#3d3429]"
          >
            {CREATE_ESTATE_PREVIOUS_WORK_HEADING}
          </h4>
          <div className="mt-2">
            {draftCount === 0 ? (
              <p
                className="text-sm leading-relaxed text-[#6b635a]"
                data-testid="create-estate-previous-work-empty"
              >
                {CREATE_ESTATE_PREVIOUS_WORK_EMPTY}
              </p>
            ) : (
              <CreateDraftResumeList
                onOpen={onOpenSavedDraft}
                onRename={onRenameDraft}
                onDuplicate={onDuplicateDraft}
                onDelete={onDeleteDraft}
              />
            )}
          </div>
        </div>
      </section>

      {/* 2 — I Need Inspiration */}
      <section
        data-testid="create-explore-inspiration"
        aria-labelledby="create-explore-inspiration-heading"
      >
        <h3
          id="create-explore-inspiration-heading"
          className="text-base font-semibold text-[#1f1c19]"
        >
          {CREATE_ESTATE_INSPIRATION_HEADING}
        </h3>
        <p className="mt-1 text-sm text-[#6b635a]">
          {CREATE_ESTATE_INSPIRATION_HINT}
        </p>
        <label className="mt-3 block">
          <span className="sr-only">Search ideas</span>
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value.trim()) setCategoryId(null);
            }}
            placeholder="Search ideas — e.g. flyer, email, workshop…"
            className="w-full rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            data-testid="create-explore-search"
          />
        </label>

        <div
          className="mt-3 flex flex-wrap gap-2"
          role="toolbar"
          aria-label="Idea source"
          data-testid="create-explore-source-chips"
        >
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 text-sm ${
              source === "all"
                ? "bg-[#1e4f4f] text-white"
                : "bg-[#f4efe7] text-[#1f1c19]"
            }`}
            aria-pressed={source === "all"}
            onClick={() => setSource("all")}
          >
            All
          </button>
          {EXPLORE_IDEA_SOURCE_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              title={`${chip.label} — ${chip.explanation}`}
              className={`rounded-full px-3 py-1.5 text-sm ${
                source === chip.id
                  ? "bg-[#1e4f4f] text-white"
                  : "bg-[#f4efe7] text-[#1f1c19]"
              }`}
              aria-pressed={source === chip.id}
              data-testid={`create-explore-source-${chip.id}`}
              onClick={() => setSource(chip.id)}
            >
              <span aria-hidden="true">{chip.emoji}</span> {chip.label}
              <span className="sr-only"> — {chip.explanation}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#6b635a]" role="note">
          {EXPLORE_IDEA_SOURCE_CHIPS.map(
            (c) => `${c.emoji} ${c.label} — ${c.explanation}`,
          ).join(" · ")}
        </p>
      </section>

      {/* Results — search OR category (same list) */}
      {resultsActive ? (
        <section
          data-testid="create-explore-results"
          aria-labelledby="create-explore-results-heading"
        >
          <div className="flex items-center justify-between gap-2">
            <h3
              id="create-explore-results-heading"
              className="text-base font-semibold text-[#1f1c19]"
            >
              Ideas
            </h3>
            <button
              type="button"
              className="text-sm font-semibold text-[#1e4f4f] hover:underline"
              data-testid="create-explore-clear-results"
              onClick={() => {
                setSearch("");
                setCategoryId(null);
                setSource("all");
              }}
            >
              Clear
            </button>
          </div>
          {results.length === 0 ? (
            <p className="mt-2 text-sm text-[#6b635a]" role="status">
              Nothing matched yet. Try another word, or browse a category below.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {results.map((idea) => (
                <li key={idea.id}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 rounded-2xl border border-[#1e4f4f]/20 bg-white/85 px-3 py-3 text-left shadow-sm transition hover:border-[#1e4f4f]/45 hover:bg-white"
                    data-testid="create-explore-result"
                    onClick={() => setPreviewIdea(idea)}
                  >
                    <CompanionObjectVisual
                      objectId={objectIdForEmoji(idea.emoji, "create")}
                      size="sm"
                      variant="icon"
                    />
                    <span>
                      <span className="block font-semibold text-[#1f1c19]">
                        {idea.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-[#6b635a]">
                        {idea.categoryLabel}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {/* 3 — Recommended For Me (before categories when not browsing results) */}
      {!resultsActive ? (
        <section
          data-testid="create-explore-recommended"
          aria-labelledby="create-explore-recommended-heading"
        >
          <h3
            id="create-explore-recommended-heading"
            className="text-base font-semibold text-[#1f1c19]"
          >
            {CREATE_ESTATE_RECOMMENDED_HEADING}
          </h3>
          {recommendations.length === 0 ? (
            <p className="mt-2 text-sm leading-relaxed text-[#6b635a]">
              {CREATE_ESTATE_RECOMMENDED_EMPTY}
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {recommendations.map(({ result, reason }) => (
                <li key={result.id}>
                  <button
                    type="button"
                    className="w-full rounded-2xl border border-[#e7dfd4] bg-[#faf7f2] px-4 py-3 text-left transition hover:border-[#cfc6b8]"
                    data-testid="create-explore-recommendation"
                    onClick={() => setPreviewIdea(result)}
                  >
                    <span className="block font-semibold text-[#1f1c19]">
                      {result.emoji} {result.label}
                    </span>
                    <span className="mt-1 block text-sm text-[#6b635a]">
                      {reason}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {/* 4 — Show Me Categories (progressive — expand if collapsed) */}
      <section
        data-testid="create-explore-categories"
        aria-labelledby="create-explore-categories-heading"
      >
        <div className="flex items-center justify-between gap-2">
          <h3
            id="create-explore-categories-heading"
            className="text-base font-semibold text-[#1f1c19]"
          >
            {CREATE_ESTATE_CATEGORIES_HEADING}
          </h3>
          {!showCategories && !categoryId ? (
            <button
              type="button"
              className="text-sm font-semibold text-[#1e4f4f] hover:underline"
              data-testid="create-explore-show-categories"
              onClick={() => setShowCategories(true)}
            >
              Show categories
            </button>
          ) : null}
        </div>
        {showCategories || categoryId ? (
          <div
            className="mt-3 grid gap-2 sm:grid-cols-2"
            data-testid="create-explore-category-cards"
          >
            {EXPLORE_IDEA_CATEGORY_CARDS.map((card) => {
              const active = categoryId === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    active
                      ? "border-[#1e4f4f] bg-[#1e4f4f]/10"
                      : "border-[#e7dfd4] bg-white/90 hover:border-[#cfc6b8]"
                  }`}
                  data-testid="create-explore-category-card"
                  data-category={card.id}
                  aria-pressed={active}
                  onClick={() => {
                    setCategoryId(card.id);
                    setSearch("");
                    setShowCategories(true);
                  }}
                >
                  <span className="block text-base font-semibold text-[#1f1c19]">
                    {card.label}
                  </span>
                  <span className="mt-1 block text-sm text-[#6b635a]">
                    {card.hint}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-sm text-[#6b635a]">
            Prefer browsing? Open categories when you’re ready — one click fills
            the same idea list as search.
          </p>
        )}
      </section>
    </div>
  );
}
