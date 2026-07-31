"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  formatMySparkSavedDate,
  type MySparkSavedItem,
} from "@/lib/sparkNote/mySparksCollection";
import { loadMySparksCollection } from "@/lib/sparkNote/savedSparksDurable";
import { dismissHomeTeaserToday } from "@/lib/sparkNote/persistence";
import { findCatalogCardById } from "@/lib/sparkNote/evaluateDailySparkNote";
import { resolveDailySparkCard } from "@/lib/sparkNote/sparkCardVisualDesignAndDailyGeneration";
import { resolveSparkCardImage } from "@/lib/sparkNote/resolveSparkCardImage";
import { isSavedSparkDurableEnabled } from "@/lib/durableRecords/flags";
import type { SparkNoteDailyCard } from "@/lib/sparkNote/types";
import type { RegionCode } from "@/lib/companionLanguage";
import type { PersonalDate } from "@/lib/recognition/types";
import { TodaysSparkCardShell } from "@/components/companion/TodaysSparkCardShell";
import { SparkNoteMyCollection } from "@/components/companion/SparkNoteMyCollection";
import { SparkSparkleIcon } from "@/components/companion/SparkNoteSectionIcons";

type Props = {
  onBack: () => void;
  backLabel?: string | null;
  /** When true (teaser arrival), auto-open Today's Spark once on mount. */
  arrivalMode?: boolean;
  /** Called after arrival opens Today's Spark, so the one-shot flag can clear. */
  onArrivalConsumed?: () => void;
  firstName?: string | null;
  birthday?: { month: number; day: number } | null;
  personalDates?: PersonalDate[];
  memberSinceIso?: string | null;
  region?: RegionCode;
};

type ResolvedSpark = {
  card: SparkNoteDailyCard | null;
  imageSrc: string | null;
};

const BACKGROUND_SRC = "/backgrounds/personal-library-no-gift-background.png";
const PREVIEW_LIMIT = 3;

/**
 * "My Journey" sections whose durable record types do not exist yet. They are
 * shown truthfully as not-populated — never with the illustrative content baked
 * into the room artwork. Wired in later slices when their records ship.
 */
const JOURNEY_UPCOMING = [
  "My Ideas & Notes",
  "Actions I Tried",
  "What I've Learned",
  "Questions to Revisit",
] as const;

/**
 * My Personal Library room (Slice 3a).
 *
 * The approved artwork is a non-interactive, aspect-locked background. All
 * member-facing controls are live HTML/React overlays; opaque panels sit over
 * the artwork's illustrative (non-member) cards so no baked-in fake content is
 * shown as the member's. Only My Spark Collection is live in this slice; The
 * World, Find/Search, and Recent arrive in later slices and are shown as calm
 * "coming soon" states rather than the artwork's placeholders.
 */
export function PersonalLibraryRoom({
  onBack,
  backLabel,
  arrivalMode = false,
  onArrivalConsumed,
  firstName,
  birthday,
  personalDates,
  memberSinceIso,
  region,
}: Props) {
  const [saved, setSaved] = useState<MySparkSavedItem[] | null>(null);
  const [source, setSource] = useState<"durable" | "local">("durable");
  const [openedCard, setOpenedCard] = useState<SparkNoteDailyCard | null>(null);
  const [showCollection, setShowCollection] = useState(false);

  const todaysSparkButtonRef = useRef<HTMLButtonElement | null>(null);

  // Today's Spark — the current pinned daily card, resolved read-only (this
  // never changes the pin or its id). Always available in the room.
  const dailyCard = useMemo(
    () =>
      resolveDailySparkCard({
        firstName,
        birthday,
        personalDates,
        memberSinceIso,
        region,
      }).card,
    [firstName, birthday, personalDates, memberSinceIso, region],
  );

  // Daily-arrival mode (from the Welcome Home teaser): land IN the room with
  // Today's Spark available and focused — do NOT auto-open the full-card overlay
  // (that reads as the legacy Spark card). The member opens it deliberately.
  useEffect(() => {
    if (arrivalMode) {
      // The room opened successfully → now mark the Welcome Home teaser opened
      // for the day (once), and focus Today's Spark for keyboard members.
      dismissHomeTeaserToday();
      todaysSparkButtonRef.current?.focus();
      onArrivalConsumed?.();
    }
  }, [arrivalMode, onArrivalConsumed]);

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
  const preview = items.slice(0, PREVIEW_LIMIT);

  const resolvedById = useMemo(() => {
    const map = new Map<string, ResolvedSpark>();
    for (const item of preview) {
      const card = findCatalogCardById(item.id);
      const image = card ? resolveSparkCardImage(card) : null;
      map.set(item.id, { card, imageSrc: image?.src ?? null });
    }
    return map;
  }, [preview]);

  const degraded = source === "local" && isSavedSparkDurableEnabled();

  function openSpark(id: string) {
    const card = resolvedById.get(id)?.card ?? findCatalogCardById(id);
    if (card) setOpenedCard(card);
  }

  function closeSpark() {
    setOpenedCard(null);
    refresh();
  }

  return (
    <section
      className="personal-library-room"
      aria-label="My Personal Library"
      data-testid="personal-library-room"
    >
      <h1 className="personal-library-room__sr-title">My Personal Library</h1>

      <button
        type="button"
        className="personal-library-room__back"
        onClick={onBack}
        data-testid="personal-library-back"
      >
        <span aria-hidden="true">‹ </span>
        {backLabel ?? "Back to Welcome Home"}
      </button>

      <div className="personal-library-room__stage">
        <div
          className="personal-library-room__bg"
          aria-hidden="true"
          style={{ backgroundImage: `url(${BACKGROUND_SRC})` }}
        />
        {/* THE WORLD — not built in 3a; honest state over the artwork's cards. */}
        <section
          className="pl-region pl-region--world"
          aria-labelledby="pl-world-heading"
        >
          <h2 id="pl-world-heading" className="pl-region__title">
            The World
          </h2>
          <p className="pl-region__note">
            Discovery collections are coming soon.
          </p>
        </section>

        {/* MY JOURNEY — My Spark Collection is live; others are honest empties. */}
        <section
          className="pl-region pl-region--journey"
          aria-labelledby="pl-journey-heading"
        >
          <h2 id="pl-journey-heading" className="pl-region__title">
            My Journey
          </h2>

          <div
            className="pl-card-panel pl-card-panel--today"
            data-testid="pl-todays-spark"
          >
            <div className="pl-card-panel__head">
              <h3 className="pl-card-panel__title">Today’s Spark</h3>
            </div>
            {dailyCard ? (
              <button
                ref={todaysSparkButtonRef}
                type="button"
                className="pl-today-open"
                onClick={() => setOpenedCard(dailyCard)}
                data-testid="pl-todays-spark-open"
                aria-label={`Open today’s Spark: ${dailyCard.shortTitle}`}
              >
                Open today’s Spark
                <span className="pl-today-open__hint">
                  {dailyCard.shortTitle}
                </span>
              </button>
            ) : (
              <p className="pl-state">Today’s Spark will appear here.</p>
            )}
          </div>

          <div className="pl-card-panel" data-testid="pl-spark-collection">
            <div className="pl-card-panel__head">
              <h3 className="pl-card-panel__title">My Spark Collection</h3>
              <button
                type="button"
                className="pl-viewall"
                onClick={() => setShowCollection(true)}
                data-testid="pl-spark-collection-viewall"
                aria-label={
                  saved === null
                    ? "View all saved Sparks"
                    : `View all ${items.length} saved Sparks`
                }
              >
                View all{saved === null ? "" : ` (${items.length})`}
              </button>
            </div>

            {saved === null ? (
              <p className="pl-state" role="status">
                Gathering your saved Sparks…
              </p>
            ) : items.length === 0 ? (
              <p className="pl-state">
                Sparks you save will appear here — tap Save on Today’s Spark.
              </p>
            ) : (
              <ul className="pl-cards">
                {preview.map((item) => {
                  const resolved = resolvedById.get(item.id);
                  const canOpen = Boolean(resolved?.card);
                  return (
                    <li key={item.id} className="pl-cards__item">
                      <button
                        type="button"
                        className="pl-cards__open"
                        onClick={() => openSpark(item.id)}
                        disabled={!canOpen}
                        aria-label={`Open ${item.title}`}
                        data-testid={`pl-spark-open-${item.id}`}
                      >
                        <span className="pl-cards__thumb" aria-hidden="true">
                          {resolved?.imageSrc ? (
                            <img
                              className="pl-cards__thumb-img"
                              src={resolved.imageSrc}
                              alt=""
                              referrerPolicy="no-referrer"
                              decoding="async"
                              loading="lazy"
                            />
                          ) : (
                            <SparkSparkleIcon className="pl-cards__thumb-icon" />
                          )}
                        </span>
                        <span className="pl-cards__title">{item.title}</span>
                        <span className="pl-cards__date">
                          {formatMySparkSavedDate(item.savedAtIso)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {degraded ? (
              <p
                className="pl-state pl-state--offline"
                role="status"
                data-testid="pl-offline"
              >
                Showing the copy saved on this device — it will sync when you’re
                back online.
              </p>
            ) : null}
          </div>

          {JOURNEY_UPCOMING.map((title) => (
            <div key={title} className="pl-card-panel pl-card-panel--soon">
              <div className="pl-card-panel__head">
                <h3 className="pl-card-panel__title">{title}</h3>
              </div>
              <p className="pl-state">Available soon.</p>
            </div>
          ))}
        </section>

        {/* Bottom bar — Find/Recent arrive in later slices; honest for now. */}
        <div className="pl-region pl-region--bottom">
          <p className="pl-bottom__note">Find &amp; Recent are coming soon.</p>
        </div>
      </div>

      {openedCard ? (
        <TodaysSparkCardShell card={openedCard} onClose={closeSpark} />
      ) : null}

      {showCollection ? (
        <SparkNoteMyCollection
          onBack={() => {
            setShowCollection(false);
            refresh();
          }}
          onClose={() => {
            setShowCollection(false);
            refresh();
          }}
        />
      ) : null}
    </section>
  );
}
