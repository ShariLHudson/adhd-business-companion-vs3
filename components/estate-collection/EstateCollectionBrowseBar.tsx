"use client";

import {
  filterCollectionItems,
  listCollectionCategories,
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

/** Curated browse controls — search, favorites, category — never dashboard chrome. */
export function EstateCollectionBrowseBar({
  items,
  browse,
  state,
  onChange,
}: Props) {
  const categories = listCollectionCategories(items);
  const filteredCount = filterCollectionItems(items, {
    ...state,
    visibleCount: items.length,
  }).length;

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
            onChange={(event) =>
              onChange({ ...state, search: event.target.value, visibleCount: browse.pageSize })
            }
          />
        </label>
      ) : null}

      <div className="estate-collection-browse__filters">
        {browse.enableFavorites ? (
          <button
            type="button"
            className={[
              "estate-collection-browse__chip",
              state.favoritesOnly ? "estate-collection-browse__chip--active" : "",
            ].join(" ")}
            aria-pressed={state.favoritesOnly}
            onClick={() =>
              onChange({
                ...state,
                favoritesOnly: !state.favoritesOnly,
                visibleCount: browse.pageSize,
              })
            }
          >
            Treasured
          </button>
        ) : null}

        {browse.enableCategoryFilter && categories.length > 0 ? (
          <div
            className="estate-collection-browse__categories"
            role="group"
            aria-label={browse.categoryLabel ?? "Category"}
          >
            <button
              type="button"
              className={[
                "estate-collection-browse__chip",
                !state.category ? "estate-collection-browse__chip--active" : "",
              ].join(" ")}
              aria-pressed={!state.category}
              onClick={() =>
                onChange({ ...state, category: null, visibleCount: browse.pageSize })
              }
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={[
                  "estate-collection-browse__chip",
                  state.category === category
                    ? "estate-collection-browse__chip--active"
                    : "",
                ].join(" ")}
                aria-pressed={state.category === category}
                onClick={() =>
                  onChange({
                    ...state,
                    category,
                    visibleCount: browse.pageSize,
                  })
                }
              >
                {category}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {(state.search || state.favoritesOnly || state.category) && (
        <p className="estate-collection-browse__count" aria-live="polite">
          {filteredCount === 0
            ? browse.emptyFilterMessage
            : `${filteredCount} ${filteredCount === 1 ? "entry" : "entries"} ${browse.resultsLabel.toLowerCase()}`}
        </p>
      )}
    </section>
  );
}
