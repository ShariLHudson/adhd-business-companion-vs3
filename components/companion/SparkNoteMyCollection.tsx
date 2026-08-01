"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  filterMySparksCollection,
  formatMySparkSavedDate,
  mySparkCollectionCategories,
  type MySparkCollectionDateFilter,
  type MySparkCollectionSort,
  type MySparkSavedItem,
} from "@/lib/sparkNote/mySparksCollection";
import {
  loadMySparksCollection,
  removeSparkDurable,
} from "@/lib/sparkNote/savedSparksDurable";
import { findCatalogCardById } from "@/lib/sparkNote/evaluateDailySparkNote";
import { resolveSparkCardImage } from "@/lib/sparkNote/resolveSparkCardImage";
import { isSavedSparkDurableEnabled } from "@/lib/durableRecords/flags";
import type { SparkNoteDailyCard } from "@/lib/sparkNote/types";
import { useDismissibleWindow } from "@/lib/windowDismiss";
import { SparkSparkleIcon } from "@/components/companion/SparkNoteSectionIcons";
import { TodaysSparkCardShell } from "./TodaysSparkCardShell";

type Props = {
  onClose: () => void;
  onBack: () => void;
  /** Focus the Search field on open (Find/Search navigation intent). */
  autoFocusSearch?: boolean;
};

type ResolvedSavedSpark = {
  card: SparkNoteDailyCard | null;
  imageSrc: string | null;
  imageAlt: string;
};

/** Personal collection of saved Daily Sparks — durable-first, separate from today's discovery. */
export function SparkNoteMyCollection({
  onClose,
  onBack,
  autoFocusSearch = false,
}: Props) {
  const { requestClose, onBackdropClick } = useDismissibleWindow({
    open: true,
    onClose,
  });

  const searchRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (autoFocusSearch) searchRef.current?.focus();
  }, [autoFocusSearch]);

  // null = still loading; array = loaded (durable-first, local fallback).
  const [saved, setSaved] = useState<MySparkSavedItem[] | null>(null);
  const [source, setSource] = useState<"durable" | "local">("durable");
  const [openedCard, setOpenedCard] = useState<SparkNoteDailyCard | null>(null);
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
      if (!active) return;
      setSaved(result.items);
      setSource(result.source);
    });
    return () => {
      active = false;
    };
  }, []);

  function refresh() {
    void loadMySparksCollection().then((result) => {
      setSaved(result.items);
      setSource(result.source);
    });
  }

  const items = saved ?? [];
  const categories = mySparkCollectionCategories(items);

  // Resolve each saved Spark to its full card (to reopen) + a visual reference.
  const resolvedById = useMemo(() => {
    const map = new Map<string, ResolvedSavedSpark>();
    for (const item of items) {
      const card = findCatalogCardById(item.id);
      const image = card ? resolveSparkCardImage(card) : null;
      map.set(item.id, {
        card,
        imageSrc: image?.src ?? null,
        imageAlt: image?.alt ?? item.title,
      });
    }
    return map;
  }, [items]);

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

  // Durable is enabled but we could only load the on-device copy → be honest.
  const degraded = source === "local" && isSavedSparkDurableEnabled();

  function handleOpen(id: string) {
    const resolved = resolvedById.get(id);
    if (resolved?.card) setOpenedCard(resolved.card);
  }

  function handleCloseCard() {
    setOpenedCard(null);
    // A save/remove may have happened inside the card — reflect it truthfully.
    refresh();
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    setRemoveError(null);
    const claim = await removeSparkDurable(id);
    if (claim.confirmed) {
      // Refresh from durable storage so the removed Spark cannot reappear.
      refresh();
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
              ref={searchRef}
              type="search"
              className="spark-note-collection__input"
              data-testid="spark-note-collection-search"
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

        {degraded ? (
          <p
            className="spark-note-collection__notice"
            role="status"
            data-testid="spark-note-collection-offline"
          >
            Showing the copy saved on this device — it will sync when you’re back
            online.
          </p>
        ) : null}

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
          <div className="spark-note-collection__empty-state">
            <p className="spark-note-collection__empty">
              Sparks you keep will appear here. When something resonates, tap Save
              on Today’s Spark and it will be waiting for you.
            </p>
            <button
              type="button"
              className="spark-note-collection__empty-action"
              onClick={onBack}
              data-testid="spark-note-collection-back-to-today"
            >
              Back to Today’s Spark
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="spark-note-collection__empty">
            No saved Sparks match your filters yet.
          </p>
        ) : (
          <ul className="spark-note-collection__list">
            {filtered.map((item) => {
              const resolved = resolvedById.get(item.id);
              const canOpen = Boolean(resolved?.card);
              return (
                <li key={item.id} className="spark-note-collection__item">
                  <button
                    type="button"
                    className="spark-note-collection__item-open"
                    onClick={() => handleOpen(item.id)}
                    disabled={!canOpen}
                    aria-label={`Open ${item.title}`}
                    data-testid={`spark-note-collection-open-${item.id}`}
                  >
                    <span
                      className="spark-note-collection__item-thumb"
                      aria-hidden
                    >
                      {resolved?.imageSrc ? (
                        <img
                          className="spark-note-collection__item-thumb-img"
                          src={resolved.imageSrc}
                          alt=""
                          referrerPolicy="no-referrer"
                          decoding="async"
                          loading="lazy"
                        />
                      ) : (
                        <SparkSparkleIcon className="spark-note-collection__item-thumb-icon" />
                      )}
                    </span>
                    <span className="spark-note-collection__item-body">
                      <span className="spark-note-collection__item-meta">
                        <span className="spark-note-collection__item-category">
                          {item.categoryLabel}
                        </span>
                        <span className="spark-note-collection__item-date">
                          {formatMySparkSavedDate(item.savedAtIso)}
                        </span>
                      </span>
                      <span className="spark-note-collection__item-title">
                        {item.title}
                      </span>
                      <span className="spark-note-collection__item-teaser">
                        {item.teaser}
                      </span>
                    </span>
                  </button>
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
              );
            })}
          </ul>
        )}
      </div>

      {openedCard ? (
        <TodaysSparkCardShell card={openedCard} onClose={handleCloseCard} />
      ) : null}
    </div>
  );
}
