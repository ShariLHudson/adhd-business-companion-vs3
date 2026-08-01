"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { dismissHomeTeaserToday } from "@/lib/sparkNote/persistence";
import { resolveDailySparkCard } from "@/lib/sparkNote/sparkCardVisualDesignAndDailyGeneration";
import type { SparkNoteDailyCard } from "@/lib/sparkNote/types";
import type { RegionCode } from "@/lib/companionLanguage";
import type { PersonalDate } from "@/lib/recognition/types";
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
};

/**
 * The approved My Personal Library room is a single, complete piece of artwork
 * (1536×1024): the Spark Editions shelves, the My Journey panel, and a wrapped
 * "Today's Spark" gift on the table. It is the entrance + collection view.
 *
 * Interactivity is added as transparent, keyboard-accessible hotspots laid over
 * the artwork — the control *is* the artwork, so no button chrome is drawn on
 * top. Real behaviour lives behind the hotspots:
 *   • the gift → the real Today's Spark card (`TodaysSparkCardShell`)
 *   • "My Spark Collection / View all" → the real saved-card collection
 *   • the "Welcome Home" pill → back navigation
 *
 * The example counts/cards/notes drawn into the artwork are decorative and never
 * treated as member data; the real collection is the source of truth and opens
 * live on demand. The 12 edition covers on the shelves are catalogued in
 * `lib/sparkNote/sparkEditions.ts` for future edition browsing — they are not
 * wired as individual card hero images.
 */
const ROOM_IMAGE_SRC = "/backgrounds/personal-library-background.png";
const ROOM_IMAGE_ALT =
  "My Personal Library — shelves of Spark Editions on the left, a My Journey panel on the right, and a wrapped Today's Spark gift on the table.";

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
  const [openedCard, setOpenedCard] = useState<SparkNoteDailyCard | null>(null);
  const [showCollection, setShowCollection] = useState(false);

  const giftButtonRef = useRef<HTMLButtonElement | null>(null);

  // Today's Spark — the current pinned daily card, resolved read-only (this
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

  // Daily-arrival (from the Welcome Home teaser): land IN the room with the gift
  // focused for keyboard members — do NOT auto-open the full card (that reads as
  // the legacy Spark card). The member unwraps it deliberately.
  useEffect(() => {
    if (arrivalMode) {
      dismissHomeTeaserToday();
      giftButtonRef.current?.focus();
      onArrivalConsumed?.();
    }
  }, [arrivalMode, onArrivalConsumed]);

  function closeSpark() {
    setOpenedCard(null);
  }

  return (
    <section
      className="personal-library-room"
      aria-label="My Personal Library"
      data-testid="personal-library-room"
    >
      <h1 className="personal-library-room__sr-title">My Personal Library</h1>

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

        {/* Back — transparent hotspot over the drawn "Welcome Home" pill. */}
        <button
          type="button"
          className="pl-hotspot pl-hotspot--back"
          onClick={onBack}
          data-testid="personal-library-back"
          aria-label={backLabel ?? "Back to Welcome Home"}
          title={backLabel ?? "Back to Welcome Home"}
        />

        {/* Today's Spark — the wrapped gift on the table opens the real card. */}
        {dailyCard ? (
          <button
            ref={giftButtonRef}
            type="button"
            className="pl-hotspot pl-hotspot--gift"
            onClick={() => setOpenedCard(dailyCard)}
            data-testid="pl-todays-spark-open"
            aria-label="Open Today's Spark"
            title="Open Today's Spark"
          />
        ) : (
          <p
            className="pl-hotspot pl-hotspot--gift pl-hotspot--unavailable"
            role="status"
            data-testid="pl-todays-spark-unavailable"
          >
            <span className="pl-hotspot__sr">
              Today&rsquo;s Spark isn&rsquo;t ready just yet — please check back
              soon.
            </span>
          </p>
        )}

        {/* My Spark Collection — the "View all" panel opens the real collection. */}
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
          onBack={() => setShowCollection(false)}
          onClose={() => setShowCollection(false)}
        />
      ) : null}
    </section>
  );
}
