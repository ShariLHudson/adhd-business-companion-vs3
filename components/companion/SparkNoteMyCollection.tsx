"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  formatMySparkSavedDate,
  type MySparkSavedItem,
} from "@/lib/sparkNote/mySparksCollection";
import {
  PERSONAL_LIBRARY_ALPHABET_RANGES,
  PERSONAL_LIBRARY_DATE_OPTIONS,
  PERSONAL_LIBRARY_ITEM_TYPES,
  filterAndSortPersonalLibrary,
  personalLibraryEmptyState,
  shouldShowPersonalLibraryResults,
  sparkRecordsForItemType,
  type AlphabetRangeId,
  type PersonalLibraryDateOption,
  type PersonalLibraryItemType,
} from "@/lib/sparkNote/personalLibraryFilters";
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
  /**
   * Focus the first filter (Item Type) on open — the Find/Search navigation
   * intent from the room. (The free-text search box was replaced by the
   * Item Type / Alphabet Range / Date dropdowns.)
   */
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

  const itemTypeRef = useRef<HTMLSelectElement | null>(null);
  useEffect(() => {
    if (autoFocusSearch) itemTypeRef.current?.focus();
  }, [autoFocusSearch]);

  // Preserve the results scroll position across opening/closing a record.
  const listRef = useRef<HTMLUListElement | null>(null);
  const savedScrollTop = useRef(0);

  // null = still loading; array = loaded (durable-first, local fallback).
  const [saved, setSaved] = useState<MySparkSavedItem[] | null>(null);
  const [source, setSource] = useState<"durable" | "local">("durable");
  const [openedCard, setOpenedCard] = useState<SparkNoteDailyCard | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  // Item Type + Alphabet Range gate the results; Date is optional.
  const [itemType, setItemType] = useState<PersonalLibraryItemType | "">("");
  const [alphabetRange, setAlphabetRange] = useState<AlphabetRangeId | "">("");
  const [dateOption, setDateOption] =
    useState<PersonalLibraryDateOption>("all");

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

  const items = useMemo(() => saved ?? [], [saved]);

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

  const showResults = shouldShowPersonalLibraryResults(itemType, alphabetRange);

  // Records backing the chosen Item Type, then narrowed by Alphabet Range + Date.
  const filtered = useMemo(() => {
    if (!itemType || !alphabetRange) return [] as MySparkSavedItem[];
    const records = sparkRecordsForItemType(itemType, items).map((item) => ({
      ...item,
      dateIso: item.savedAtIso,
    }));
    return filterAndSortPersonalLibrary({
      records,
      alphabetRange,
      dateOption,
    });
  }, [items, itemType, alphabetRange, dateOption]);

  // Durable is enabled but we could only load the on-device copy → be honest.
  const degraded = source === "local" && isSavedSparkDurableEnabled();

  function handleOpen(id: string) {
    const resolved = resolvedById.get(id);
    if (!resolved?.card) return;
    // Remember where the member was so closing the record restores their place.
    savedScrollTop.current = listRef.current?.scrollTop ?? 0;
    setOpenedCard(resolved.card);
  }

  function handleCloseCard() {
    setOpenedCard(null);
    // A save/remove may have happened inside the card — reflect it truthfully.
    // Item Type / Alphabet Range / Date selections are preserved (component
    // state is untouched); restore the scroll position too.
    refresh();
  }

  // Restore scroll position after the record closes and the list re-renders.
  useEffect(() => {
    if (openedCard) return;
    const list = listRef.current;
    if (list) list.scrollTop = savedScrollTop.current;
  }, [openedCard, filtered]);

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
          <div className="spark-note-collection__filter-row">
            <label className="spark-note-collection__field spark-note-collection__field--compact">
              <span className="spark-note-collection__field-label">
                Item Type
              </span>
              <select
                ref={itemTypeRef}
                className="spark-note-collection__select"
                data-testid="spark-note-collection-item-type"
                value={itemType}
                onChange={(event) =>
                  setItemType(event.target.value as PersonalLibraryItemType | "")
                }
              >
                <option value="">Choose a type…</option>
                {PERSONAL_LIBRARY_ITEM_TYPES.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="spark-note-collection__field spark-note-collection__field--compact">
              <span className="spark-note-collection__field-label">
                Alphabet Range
              </span>
              <select
                className="spark-note-collection__select"
                data-testid="spark-note-collection-alphabet-range"
                value={alphabetRange}
                onChange={(event) =>
                  setAlphabetRange(event.target.value as AlphabetRangeId | "")
                }
              >
                <option value="">Choose a range…</option>
                {PERSONAL_LIBRARY_ALPHABET_RANGES.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="spark-note-collection__field spark-note-collection__field--compact">
              <span className="spark-note-collection__field-label">Date</span>
              <select
                className="spark-note-collection__select"
                data-testid="spark-note-collection-date"
                value={dateOption}
                onChange={(event) =>
                  setDateOption(event.target.value as PersonalLibraryDateOption)
                }
              >
                {PERSONAL_LIBRARY_DATE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
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
        ) : !showResults ? (
          <p
            className="spark-note-collection__empty"
            role="status"
            data-testid="spark-note-collection-choose-filters"
          >
            Choose an item type and a letter range to see your saved items.
          </p>
        ) : filtered.length === 0 ? (
          <div
            className="spark-note-collection__empty-state"
            data-testid="spark-note-collection-empty-state"
            data-item-type={itemType}
          >
            <p
              className="spark-note-collection__empty"
              data-testid="spark-note-collection-empty-heading"
            >
              {personalLibraryEmptyState(itemType as PersonalLibraryItemType).heading}
            </p>
            <p className="spark-note-collection__empty">
              {personalLibraryEmptyState(itemType as PersonalLibraryItemType).body}
            </p>
            {itemType === "spark-cards" ? (
              <button
                type="button"
                className="spark-note-collection__empty-action"
                onClick={onBack}
                data-testid="spark-note-collection-back-to-today"
              >
                Back to Today’s Spark
              </button>
            ) : null}
          </div>
        ) : (
          <ul ref={listRef} className="spark-note-collection__list">
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
