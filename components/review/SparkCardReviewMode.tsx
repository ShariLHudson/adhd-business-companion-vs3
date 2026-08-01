"use client";

import { useCallback, useMemo, useState } from "react";

import { SPARK_NOTE_CATALOG } from "@/lib/sparkNote/catalog";
import { sparkEditionForCategory } from "@/lib/sparkNote/sparkEditions";
import { TodaysSparkCardShell } from "@/components/companion/TodaysSparkCardShell";
import {
  computeSparkReviewProgress,
  getAllSparkReviews,
  getReviewRecentlyOpened,
  recordReviewRecentlyOpened,
  setSparkReviewNote,
  setSparkReviewStatus,
  SPARK_REVIEW_MARKS,
  SPARK_REVIEW_STATUS_LABEL,
  type SparkReviewRecord,
  type SparkReviewStatus,
} from "@/lib/sparkReview/reviewStore";
import {
  buildReviewList,
  reviewAdjacent,
  type SparkReviewFilter,
  type SparkReviewSort,
} from "@/lib/sparkReview/reviewList";

const DEFAULT_REVIEW: SparkReviewRecord = {
  status: "needs_review",
  note: "",
  updatedAtIso: null,
};

const FILTER_OPTIONS: { value: SparkReviewFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "001", label: "001 Discovery" },
  { value: "002", label: "002 People & Stories" },
  { value: "003", label: "003 Creativity & Inspiration" },
  { value: "004", label: "004 Nature & Places" },
  { value: "005", label: "005 Curiosity" },
  { value: "006", label: "006 Words & Origins" },
  { value: "007", label: "007 Strategy" },
  { value: "008", label: "008 Reflection" },
  { value: "009", label: "009 Adventure" },
  { value: "010", label: "010 Business" },
  { value: "011", label: "011 Innovation" },
  { value: "012", label: "012 Wonder" },
  { value: "quick", label: "Quick" },
  { value: "story", label: "Story" },
  { value: "deep", label: "Deep" },
  { value: "approved", label: "Approved" },
  { value: "needs_review", label: "Needs Review" },
  { value: "needs_changes", label: "Needs Changes" },
];

const SORT_OPTIONS: { value: SparkReviewSort; label: string }[] = [
  { value: "id", label: "Card ID" },
  { value: "title", label: "Title" },
  { value: "category", label: "Category" },
  { value: "status", label: "Review status" },
];

export function SparkCardReviewMode() {
  const cards = SPARK_NOTE_CATALOG;

  const [reviews, setReviews] = useState<Record<string, SparkReviewRecord>>(
    () => getAllSparkReviews(),
  );
  const [recent, setRecent] = useState<string[]>(() => getReviewRecentlyOpened());
  const [filter, setFilter] = useState<SparkReviewFilter>("all");
  const [sort, setSort] = useState<SparkReviewSort>("id");
  const [search, setSearch] = useState("");
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  const lookup = useCallback(
    (id: string) => reviews[id] ?? DEFAULT_REVIEW,
    [reviews],
  );

  const list = useMemo(
    () => buildReviewList(cards, { filter, sort, search }, lookup),
    [cards, filter, sort, search, lookup],
  );

  const progress = useMemo(
    () => computeSparkReviewProgress(cards, reviews),
    [cards, reviews],
  );

  const openCard = useCallback((id: string) => {
    setOpenCardId(id);
    setRecent(recordReviewRecentlyOpened(id));
  }, []);

  const mark = useCallback((id: string, status: SparkReviewStatus) => {
    const next = setSparkReviewStatus(id, status);
    setReviews((prev) => ({ ...prev, [id]: next }));
  }, []);

  const noteChange = useCallback((id: string, note: string) => {
    const next = setSparkReviewNote(id, note);
    setReviews((prev) => ({ ...prev, [id]: next }));
  }, []);

  const openCardEntry = openCardId
    ? cards.find((c) => c.id === openCardId) ?? null
    : null;

  if (openCardEntry) {
    const adjacent = reviewAdjacent(list, openCardEntry.id);
    const review = lookup(openCardEntry.id);
    return (
      <div className="scr-root scr-root--detail" data-testid="scr-root">
        {/* The REAL full Spark Card component + real runtime data. */}
        <TodaysSparkCardShell
          card={{
            ...openCardEntry,
            sparkType: openCardEntry.sparkType ?? "story",
            shortTitle: openCardEntry.shortTitle ?? openCardEntry.title,
            source: "library",
          }}
          onClose={() => setOpenCardId(null)}
        />

        <aside className="scr-review-panel" data-testid="scr-detail" aria-label="Review controls">
          <div className="scr-review-nav">
            <button
              type="button"
              className="scr-btn"
              data-testid="scr-back"
              onClick={() => setOpenCardId(null)}
            >
              ‹ Back to Review List
            </button>
            <div className="scr-review-nav__stepper">
              <button
                type="button"
                className="scr-btn"
                data-testid="scr-prev"
                disabled={!adjacent.prevId}
                onClick={() => adjacent.prevId && openCard(adjacent.prevId)}
              >
                ◀ Previous
              </button>
              <span className="scr-review-pos" data-testid="scr-position">
                {adjacent.index + 1} / {list.length}
              </span>
              <button
                type="button"
                className="scr-btn"
                data-testid="scr-next"
                disabled={!adjacent.nextId}
                onClick={() => adjacent.nextId && openCard(adjacent.nextId)}
              >
                Next ▶
              </button>
            </div>
          </div>

          <div className="scr-review-meta">
            <span className="scr-mono">{openCardEntry.id}</span>
            <span className="scr-badge" data-status={review.status}>
              {SPARK_REVIEW_STATUS_LABEL[review.status]}
            </span>
            <span className="scr-review-cat">
              {openCardEntry.category} · {openCardEntry.categoryLabel}
            </span>
          </div>

          <div className="scr-review-marks" role="group" aria-label="Mark this card">
            {SPARK_REVIEW_MARKS.map((m) => (
              <button
                key={m.status}
                type="button"
                className={
                  "scr-mark" +
                  (review.status === m.status ? " scr-mark--active" : "")
                }
                data-testid={`scr-mark-${m.status}`}
                aria-pressed={review.status === m.status}
                onClick={() => mark(openCardEntry.id, m.status)}
              >
                {m.label}
              </button>
            ))}
          </div>

          <label className="scr-review-note-label" htmlFor="scr-review-note">
            Review note (internal only — never shown to members)
          </label>
          <textarea
            id="scr-review-note"
            className="scr-review-note"
            data-testid="scr-review-note"
            value={review.note}
            placeholder="What needs changing? Category, image, wording, bug…"
            onChange={(e) => noteChange(openCardEntry.id, e.target.value)}
          />
        </aside>
      </div>
    );
  }

  return (
    <div className="scr-root" data-testid="scr-root">
      <header className="scr-header">
        <h1 className="scr-title">Spark Card Review — internal</h1>
        <p className="scr-subtitle">
          Inspect and approve all {cards.length} runtime Spark Cards. Review
          status and notes are private and never appear in the member experience.
        </p>
      </header>

      <section className="scr-progress" data-testid="scr-progress" aria-label="Review progress">
        <div className="scr-stat">
          <span className="scr-stat__n" data-testid="scr-progress-reviewed">
            {progress.reviewed}
          </span>
          <span className="scr-stat__l">Reviewed / {progress.total}</span>
        </div>
        <div className="scr-stat">
          <span className="scr-stat__n" data-testid="scr-progress-approved">
            {progress.approved}
          </span>
          <span className="scr-stat__l">Approved</span>
        </div>
        <div className="scr-stat">
          <span className="scr-stat__n" data-testid="scr-progress-needschanges">
            {progress.needsChanges}
          </span>
          <span className="scr-stat__l">Needs changes</span>
        </div>
        <div className="scr-cat-grid" data-testid="scr-progress-bycategory">
          {FILTER_OPTIONS.filter((o) => /^0\d\d$/.test(o.value)).map((o) => {
            const b = progress.byCategoryApproved[o.value] ?? {
              approved: 0,
              total: 0,
            };
            return (
              <span key={o.value} className="scr-cat-pill" title={o.label}>
                {o.value}: {b.approved}/{b.total}
              </span>
            );
          })}
        </div>
      </section>

      {recent.length > 0 ? (
        <section className="scr-recent" data-testid="scr-recent" aria-label="Recently opened">
          <span className="scr-recent__label">Recently opened:</span>
          {recent.slice(0, 8).map((id) => (
            <button
              key={id}
              type="button"
              className="scr-recent__chip"
              onClick={() => openCard(id)}
            >
              {id}
            </button>
          ))}
        </section>
      ) : null}

      <section className="scr-controls">
        <input
          className="scr-search"
          data-testid="scr-search"
          type="search"
          placeholder="Search by title or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search Spark Cards"
        />
        <label className="scr-control">
          Filter
          <select
            className="scr-select"
            data-testid="scr-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as SparkReviewFilter)}
          >
            {FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="scr-control">
          Sort
          <select
            className="scr-select"
            data-testid="scr-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SparkReviewSort)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <span className="scr-count" data-testid="scr-count">
          {list.length} shown
        </span>
      </section>

      <table className="scr-table" data-testid="scr-list">
        <thead>
          <tr>
            <th>Card ID</th>
            <th>Title</th>
            <th>Cat</th>
            <th>Category label</th>
            <th>Type</th>
            <th>Review status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {list.map((card) => {
            const status = lookup(card.id).status;
            return (
              <tr key={card.id} data-testid={`scr-row-${card.id}`}>
                <td className="scr-mono">{card.id}</td>
                <td>{card.title}</td>
                <td>{card.category}</td>
                <td>{card.categoryLabel}</td>
                <td className="scr-type">{card.sparkType}</td>
                <td>
                  <span className="scr-badge" data-status={status}>
                    {SPARK_REVIEW_STATUS_LABEL[status]}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="scr-btn scr-btn--open"
                    data-testid={`scr-open-${card.id}`}
                    onClick={() => openCard(card.id)}
                  >
                    Open Full Card
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Small helper kept for the route: is the current category image registered. */
export function hasRegisteredEditionImage(category: string): boolean {
  return Boolean(sparkEditionForCategory(category)?.imageSrc);
}
