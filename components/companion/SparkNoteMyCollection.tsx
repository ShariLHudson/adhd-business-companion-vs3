"use client";

import { useEffect, useMemo, useState } from "react";

import {
  filterMySparksCollection,
  formatMySparkSavedDate,
  mySparkCollectionCategories,
  type MySparkCollectionDateFilter,
  type MySparkCollectionSort,
  type MySparkSavedItem,
} from "@/lib/sparkNote/mySparksCollection";
import { loadMySparksCollection, removeSparkDurable } from "@/lib/sparkNote/savedSparksDurable";
import { useDismissibleWindow } from "@/lib/windowDismiss";
import { SparkSparkleIcon } from "@/components/companion/SparkNoteSectionIcons";

type Props = {
  onClose: () => void;
  onBack: () => void;
};

/** Personal collection of saved Daily Sparks — durable-first, separate from today's discovery. */
export function SparkNoteMyCollection({ onClose, onBack }: Props) {
  const { requestClose, onBackdropClick } = useDismissibleWindow({
    open: true,
    onClose,
  });

  // null = still loading; array = loaded (durable-first, local fallback).
  const [saved, setSaved] = useState<MySparkSavedItem[] | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const [dateFilter, setDateFilter] =
    useState<MySparkCollectionDateFilter>("all");
  const [sort, setSort] = useState<MySparkCollectionSort>("newest");

  useEffect(() => {
    let active = true;
    void loadMySparksCollection().then((result) => {
      if (active) setSaved(result.items);
    });
    return () => {
      active = false;
    };
  }, []);

  const items = saved ?? [];
  const categories = mySparkCollectionCategories(items);

  const filtered = useMemo(
    () =>
      filterMySparksCollection({
        items,
        query,
        category: category || null,
        dateFilter,
        sort,
      }),
    [items, query, category, dateFilter, sort],
  );

  async function handleRemove(id: string) {
    setRemovingId(id);
    setRemoveError(null);
    const claim = await removeSparkDurable(id);
    if (claim.confirmed) {
      setSaved((prev) => (prev ? prev.filter((item) => item.id !== id) : prev));
      setRemovingId(null);
      return;
    }
    setRemoveError(claim.message);
    setRemovingId(null);
  }

  return (
    <div
      className="spark-note-collection"
      role="dialog"
      aria-label="My Spark Collection"
      data-testid="spark-note-my-collection"
    >
      <div
        className="spark-note-collection__backdrop"
        aria-hidden
        onClick={() => onBackdropClick()}
      />

      <div className="spark-note-collection__card">
        <div className="spark-note-collection__ornaments" aria-hidden>
          <span className="spark-note-collection__ornament spark-note-collection__ornament--tl" />
          <span className="spark-note-collection__ornament spark-note-collection__ornament--tr" />
        </div>

        <header className="spark-note-collection__header">
          <button
            type="button"
            className="spark-note-collection__back"
            onClick={onBack}
          >
            Return
          </button>

          <h2 className="spark-note-collection__title">My Spark Collection</h2>

          <button
            type="button"
            className="spark-note-collection__close"
            onClick={() => requestClose()}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <p className="spark-note-collection__subtitle">
          Your personal collection of favorite discoveries.
        </p>

        <div className="spark-note-collection__filters">
          <label className="spark-note-collection__field">
            <span className="spark-note-collection__field-label">Search</span>
            <input
              type="search"
              className="spark-note-collection__input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search saved Sparks…"
            />
          </label>

          <div className="spark-note-collection__filter-row">
            <label className="spark-note-collection__field spark-note-collection__field--compact">
              <span className="spark-note-collection__field-label">
                Category
              </span>
              <select
                className="spark-note-collection__select"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">All categories</option>
                {categories.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label className="spark-note-collection__field spark-note-collection__field--compact">
              <span className="spark-note-collection__field-label">Date</span>
              <select
                className="spark-note-collection__select"
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(event.target.value as MySparkCollectionDateFilter)
                }
              >
                <option value="all">All dates</option>
                <option value="this-month">This month</option>
                <option value="this-year">This year</option>
              </select>
            </label>

            <label className="spark-note-collection__field spark-note-collection__field--compact">
              <span className="spark-note-collection__field-label">Sort</span>
              <select
                className="spark-note-collection__select"
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as MySparkCollectionSort)
                }
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
          </div>
        </div>

        {removeError ? (
          <p className="spark-note-collection__error" role="alert">
            {removeError}
          </p>
        ) : null}

        {saved === null ? (
          <p className="spark-note-collection__empty" role="status">
            Gathering your saved Sparks…
          </p>
        ) : items.length === 0 ? (
          <p className="spark-note-collection__empty">
            Sparks you keep will appear here — tap Save Spark when something
            resonates.
          </p>
        ) : filtered.length === 0 ? (
          <p className="spark-note-collection__empty">
            No saved Sparks match your filters yet.
          </p>
        ) : (
          <ul className="spark-note-collection__list">
            {filtered.map((item) => (
              <li key={item.id} className="spark-note-collection__item">
                <div className="spark-note-collection__item-meta">
                  <span className="spark-note-collection__item-category">
                    <SparkSparkleIcon className="spark-note-collection__item-category-icon" />
                    {item.categoryLabel}
                  </span>
                  <span className="spark-note-collection__item-date">
                    {formatMySparkSavedDate(item.savedAtIso)}
                  </span>
                </div>
                <span className="spark-note-collection__item-title">
                  {item.title}
                </span>
                <span className="spark-note-collection__item-teaser">
                  {item.teaser}
                </span>
                <button
                  type="button"
                  className="spark-note-collection__item-remove"
                  onClick={() => void handleRemove(item.id)}
                  disabled={removingId === item.id}
                  aria-label={`Remove ${item.title} from your collection`}
                  data-testid={`spark-note-collection-remove-${item.id}`}
                >
                  {removingId === item.id ? "Removing…" : "Remove"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
