"use client";

import {
  filterCollectionItems,
  listCollectionCategories,
  listCollectionFieldValues,
  type CollectionBrowseState,
} from "@/lib/estate/collectionFramework/collectionQuery";
import type {
  EstateCollectionBrowseConfig,
  EstateCollectionItem,
} from "@/lib/estate/collectionFramework/types";

type Props = {
  items: EstateCollectionItem[];
  browse: EstateCollectionBrowseConfig;
  state: CollectionBrowseState;
  onChange: (state: CollectionBrowseState) => void;
};

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={[
        "estate-collection-browse__chip",
        active ? "estate-collection-browse__chip--active" : "",
      ].join(" ")}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function FilterGroup({
  label,
  values,
  selected,
  onSelect,
}: {
  label: string;
  values: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}) {
  if (values.length === 0) return null;
  return (
    <div
      className="estate-collection-browse__categories"
      role="group"
      aria-label={label}
    >
      <Chip
        active={!selected}
        label={`All ${label.toLowerCase()}`}
        onClick={() => onSelect(null)}
      />
      {values.map((value) => (
        <Chip
          key={value}
          active={selected === value}
          label={value}
          onClick={() => onSelect(value)}
        />
      ))}
    </div>
  );
}

/** Curated browse controls — search, favorites, category — never dashboard chrome. */
export function EstateCollectionBrowseBar({
  items,
  browse,
  state,
  onChange,
}: Props) {
  const categories = listCollectionCategories(items);
  const sources = listCollectionFieldValues(items, "Source");
  const emotions = listCollectionFieldValues(items, "Emotion");
  const projects = listCollectionFieldValues(items, "Project");
  const people = listCollectionFieldValues(items, "Person");
  const filteredCount = filterCollectionItems(items, {
    ...state,
    visibleCount: items.length,
  }).length;

  const hasActiveFilter = Boolean(
    state.search ||
      state.favoritesOnly ||
      state.category ||
      state.source ||
      state.emotion ||
      state.projectName ||
      state.personName ||
      state.confidenceBoostOnly ||
      state.recentOnly ||
      state.datePreset ||
      state.hallCandidateOnly,
  );

  function patch(partial: Partial<CollectionBrowseState>) {
    onChange({
      ...state,
      ...partial,
      visibleCount: browse.pageSize,
    });
  }

  return (
    <section
      className="estate-collection-browse"
      aria-label="Browse collection"
    >
      {browse.enableSearch ? (
        <label className="estate-collection-browse__search-wrap">
          <span className="estate-collection-browse__search-label estate-collection-browse__search-label--sr">
            Search
          </span>
          <input
            type="search"
            className="estate-collection-browse__search"
            value={state.search}
            placeholder={browse.searchPlaceholder}
            onChange={(event) => patch({ search: event.target.value })}
          />
        </label>
      ) : null}

      <div className="estate-collection-browse__filters">
        {browse.enableFavorites ? (
          <Chip
            active={state.favoritesOnly}
            label="Treasured"
            onClick={() => patch({ favoritesOnly: !state.favoritesOnly })}
          />
        ) : null}

        {browse.enableConfidenceBoostFilter ? (
          <Chip
            active={state.confidenceBoostOnly}
            label="Confidence boost"
            onClick={() =>
              patch({ confidenceBoostOnly: !state.confidenceBoostOnly })
            }
          />
        ) : null}

        {browse.enableRecentFilter ? (
          <Chip
            active={state.recentOnly}
            label="Recent evidence"
            onClick={() =>
              patch({ recentOnly: !state.recentOnly })
            }
          />
        ) : null}

        {browse.enableDatePresets ? (
          <>
            {(
              [
                ["today", "Today"],
                ["yesterday", "Yesterday"],
                ["this-week", "This Week"],
                ["last-week", "Last Week"],
                ["this-month", "This Month"],
                ["last-month", "Last Month"],
                ["this-year", "This Year"],
              ] as const
            ).map(([id, label]) => (
              <Chip
                key={id}
                active={state.datePreset === id}
                label={label}
                onClick={() =>
                  patch({
                    datePreset: state.datePreset === id ? null : id,
                  })
                }
              />
            ))}
          </>
        ) : null}

        {browse.enableHallCandidateFilter ? (
          <Chip
            active={state.hallCandidateOnly}
            label="Hall Candidate"
            onClick={() =>
              patch({ hallCandidateOnly: !state.hallCandidateOnly })
            }
          />
        ) : null}

        {browse.enableCategoryFilter && categories.length > 0 ? (
          <FilterGroup
            label={browse.categoryLabel ?? "Category"}
            values={categories}
            selected={state.category}
            onSelect={(category) => patch({ category })}
          />
        ) : null}

        {browse.enableSourceFilter ? (
          <FilterGroup
            label={browse.sourceLabel ?? "Source"}
            values={sources}
            selected={state.source}
            onSelect={(source) => patch({ source })}
          />
        ) : null}

        {browse.enableEmotionFilter ? (
          <FilterGroup
            label={browse.emotionLabel ?? "Emotion"}
            values={emotions}
            selected={state.emotion}
            onSelect={(emotion) => patch({ emotion })}
          />
        ) : null}

        {browse.enableProjectFilter ? (
          <FilterGroup
            label={browse.projectLabel ?? "Project"}
            values={projects}
            selected={state.projectName}
            onSelect={(projectName) => patch({ projectName })}
          />
        ) : null}

        {browse.enablePersonFilter ? (
          <FilterGroup
            label={browse.personLabel ?? "Person"}
            values={people}
            selected={state.personName}
            onSelect={(personName) => patch({ personName })}
          />
        ) : null}
      </div>

      {hasActiveFilter ? (
        <p className="estate-collection-browse__count" aria-live="polite">
          {filteredCount === 0
            ? browse.emptyFilterMessage
            : `${filteredCount} ${filteredCount === 1 ? "entry" : "entries"} ${browse.resultsLabel.toLowerCase()}`}
        </p>
      ) : null}
    </section>
  );
}
