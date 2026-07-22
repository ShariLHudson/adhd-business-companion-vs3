"use client";



import { useMemo, useState } from "react";

import {

  filterMySparksCollection,

  formatMySparkSavedDate,

  mySparkCollectionCategories,

  resolveMySparksCollection,

  type MySparkCollectionDateFilter,

  type MySparkCollectionSort,

} from "@/lib/sparkNote/mySparksCollection";

import { useDismissibleWindow } from "@/lib/windowDismiss";

type Props = {

  onClose: () => void;

  onBack: () => void;

};



/** Personal collection of saved Daily Sparks — separate from today's discovery. */

export function SparkNoteMyCollection({ onClose, onBack }: Props) {
  const { requestClose, onBackdropClick } = useDismissibleWindow({
    open: true,
    onClose,
  });

  const saved = resolveMySparksCollection();

  const categories = mySparkCollectionCategories(saved);

  const [query, setQuery] = useState("");

  const [category, setCategory] = useState<string>("");

  const [dateFilter, setDateFilter] =

    useState<MySparkCollectionDateFilter>("all");

  const [sort, setSort] = useState<MySparkCollectionSort>("newest");



  const filtered = useMemo(

    () =>

      filterMySparksCollection({

        items: saved,

        query,

        category: category || null,

        dateFilter,

        sort,

      }),

    [saved, query, category, dateFilter, sort],

  );



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

        <header className="spark-note-collection__header">

          <button type="button" className="spark-note-collection__back" onClick={onBack}>

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

              <span className="spark-note-collection__field-label">Category</span>

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



        {saved.length === 0 ? (

          <p className="spark-note-collection__empty">

            Sparks you keep will appear here — tap Save Spark when something resonates.

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

                    {item.categoryLabel}

                  </span>

                  <span className="spark-note-collection__item-date">

                    {formatMySparkSavedDate(item.savedAtIso)}

                  </span>

                </div>

                <span className="spark-note-collection__item-title">{item.title}</span>

                <span className="spark-note-collection__item-teaser">{item.teaser}</span>

              </li>

            ))}

          </ul>

        )}

      </div>

    </div>

  );

}

