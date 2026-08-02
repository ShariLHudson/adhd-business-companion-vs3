"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  dismissHomeTeaserToday,
  getFavoriteSparkIds,
  isTodaysSparkViewed,
  markTodaysSparkViewed,
} from "@/lib/sparkNote/persistence";
import { resolveDailySparkCard } from "@/lib/sparkNote/sparkCardVisualDesignAndDailyGeneration";
import type { SparkNoteDailyCard } from "@/lib/sparkNote/types";
import type { RegionCode } from "@/lib/companionLanguage";
import type { PersonalDate } from "@/lib/recognition/types";
import type { PersonalLibraryEntryView } from "@/lib/estate/personalLibraryEntry";
import { TodaysSparkCardShell } from "@/components/companion/TodaysSparkCardShell";
import { SparkNoteMyCollection } from "@/components/companion/SparkNoteMyCollection";

type Props = {
  onBack: () => void;
  backLabel?: string | null;
  /** When true (teaser arrival), land in the room with Today's Spark focused. */
  arrivalMode?: boolean;
  /** Called after arrival focuses Today's Spark, so the one-shot flag can clear. */
  onArrivalConsumed?: () => void;
  firstName?: string | null;
  birthday?: { month: number; day: number } | null;
  personalDates?: PersonalDate[];
  memberSinceIso?: string | null;
  region?: RegionCode;
  /**
   * Which sub-view to land on (from intentional navigation). "collection" /
   * "find" / "recent" open the real saved-Spark collection; "find" focuses
   * Search, "recent" shows most-recent-first. Defaults to the plain room.
   */
  initialView?: PersonalLibraryEntryView;
};

/**
 * The approved My Personal Library room is a single, complete piece of artwork
 * (1536x1024): the Spark Editions shelves, the My Journey panel, and a wrapped
 * "Today's Spark" gift on the table. It is the entrance + collection view.
 *
 * Interactivity is added as transparent, keyboard-accessible hotspots laid over
 * the artwork - the control *is* the artwork, so no button chrome is drawn on
 * top. Real behaviour lives behind the hotspots:
 *   - the gift -> the real Today's Spark card (`TodaysSparkCardShell`)
 *   - "My Spark Collection / View all" -> the real saved-card collection
 *   - the "Welcome Home" pill -> back navigation
 *
 * The example counts/cards/notes drawn into the artwork are decorative and never
 * treated as member data; the real collection is the source of truth and opens
 * live on demand. The 12 edition covers on the shelves are catalogued in
 * `lib/sparkNote/sparkEditions.ts` for future edition browsing - they are not
 * wired as individual card hero images.
 */
const ROOM_IMAGE_SRC = "/backgrounds/personal-library-background.png";
const ROOM_IMAGE_ALT =
  "My Personal Library - shelves of Spark Editions on the left, a My Journey panel on the right, and a wrapped Today's Spark gift on the table.";

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
  initialView = "room",
}: Props) {
  const [openedCard, setOpenedCard] = useState<SparkNoteDailyCard | null>(null);
  // Intentional navigation can land directly in the saved-Spark collection
  // (Spark Collection / Find / Recent requests) rather than the plain room.
  const [showCollection, setShowCollection] = useState(
    initialView === "collection" ||
      initialView === "find" ||
      initialView === "recent",
  );

  const giftButtonRef = useRef<HTMLButtonElement | null>(null);

  // Today's Spark - the current pinned daily card, resolved read-only (this
  // never changes the pin or its id). The gift opens exactly this card.
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

  // Today's Spark viewed/saved state - never removes the entry; opening the
  // card is not completion. "Viewed" resets automatically each local day (keyed
  // by dayKey); "saved" reflects membership in My Spark Collection. Read once on
  // mount (the room remounts per visit) and updated by open/close handlers.
  const [sparkViewed, setSparkViewed] = useState(() =>
    dailyCard ? isTodaysSparkViewed(dailyCard.id) : false,
  );
  const [sparkSaved, setSparkSaved] = useState(() =>
    dailyCard ? getFavoriteSparkIds().includes(dailyCard.id) : false,
  );

  // Daily-arrival (from the Welcome Home teaser): land IN the room with the gift
  // focused for keyboard members - do NOT auto-open the full card (that reads as
  // the legacy Spark card). The member unwraps it deliberately.
  useEffect(() => {
    if (arrivalMode) {
      dismissHomeTeaserToday();
      giftButtonRef.current?.focus();
      onArrivalConsumed?.();
    }
  }, [arrivalMode, onArrivalConsumed]);

  function openTodaysSpark() {
    if (!dailyCard) return;
    // Record viewed for the day (resets at local midnight) - not a dismissal.
    markTodaysSparkViewed(dailyCard.id);
    setSparkViewed(true);
    setOpenedCard(dailyCard);
  }

  function closeSpark() {
    setOpenedCard(null);
    // The member may have saved (or unsaved) from the card - reflect it.
    if (dailyCard) setSparkSaved(getFavoriteSparkIds().includes(dailyCard.id));
  }

  const giftLabel = sparkSaved
    ? "Revisit today's Spark (saved to My Spark Collection)"
    : sparkViewed
      ? "Revisit today's Spark"
      : "Open Today's Spark";

  return (
    <section
      className="personal-library-room"
      aria-label="My Personal Library"
      data-testid="personal-library-room"
    >
      <h1 className="personal-library-room__sr-title">My Personal Library</h1>

      {/* Back - a real control (the approved artwork has no drawn back affordance). */}
      <button
        type="button"
        className="personal-library-room__back"
        onClick={onBack}
        data-testid="personal-library-back"
        aria-label={backLabel ?? "Back to Welcome Home"}
      >
        <span aria-hidden="true"></span>
        {backLabel ?? "Back to Welcome Home"}
      </button>

      <div className="personal-library-room__stage">
        <img
          className="personal-library-room__image"
          src={ROOM_IMAGE_SRC}
          alt={ROOM_IMAGE_ALT}
          width={1536}
          height={1024}
          decoding="async"
          data-testid="personal-library-image"
        />

        {/* Today's Spark - the wrapped gift on the table opens the real card.
            Opening never hides it; after viewing/saving it stays available to
            revisit for the rest of the local day. */}
        {dailyCard ? (
          <>
            <button
              ref={giftButtonRef}
              type="button"
              className={
                "pl-hotspot pl-hotspot--gift" +
                (sparkViewed || sparkSaved ? " pl-hotspot--gift-viewed" : "")
              }
              onClick={openTodaysSpark}
              data-testid="pl-todays-spark-open"
              data-viewed={sparkViewed ? "true" : "false"}
              data-saved={sparkSaved ? "true" : "false"}
              aria-label={giftLabel}
              title={giftLabel}
            />
            {sparkViewed || sparkSaved ? (
              <button
                type="button"
                className={
                  "pl-spark-state" +
                  (sparkSaved ? " pl-spark-state--saved" : "")
                }
                onClick={openTodaysSpark}
                data-testid="pl-todays-spark-state"
              >
                {sparkSaved
                  ? "Saved to My Spark Collection - Revisit"
                  : "Revisit today's Spark"}
              </button>
            ) : null}
          </>
        ) : (
          <p
            className="pl-hotspot pl-hotspot--gift pl-hotspot--unavailable"
            role="status"
            data-testid="pl-todays-spark-unavailable"
          >
            <span className="pl-hotspot__sr">
              Today&apos;s Spark isn&apos;t ready just yet - please check back
              soon.
            </span>
          </p>
        )}

        {/* My Spark Collection - the "View all" panel opens the real collection. */}
        <button
          type="button"
          className="pl-hotspot pl-hotspot--collection"
          onClick={() => setShowCollection(true)}
          data-testid="pl-spark-collection-viewall"
          aria-label="Open My Spark Collection"
          title="Open My Spark Collection"
        />
      </div>

      {openedCard ? (
        <TodaysSparkCardShell card={openedCard} onClose={closeSpark} />
      ) : null}

      {showCollection ? (
        <SparkNoteMyCollection
          autoFocusSearch={initialView === "find"}
          onBack={() => setShowCollection(false)}
          onClose={() => setShowCollection(false)}
        />
      ) : null}
    </section>
  );
}
