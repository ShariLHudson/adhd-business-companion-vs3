"use client";

import { useEffect, useRef, useState } from "react";

import { dismissHomeTeaserToday } from "@/lib/sparkNote/persistence";
import type { RegionCode } from "@/lib/companionLanguage";
import type { PersonalDate } from "@/lib/recognition/types";
import type { PersonalLibraryEntryView } from "@/lib/estate/personalLibraryEntry";
import { SparkNoteMyCollection } from "@/components/companion/SparkNoteMyCollection";

type Props = {
  onBack: () => void;
  backLabel?: string | null;
  /** When true (intentional arrival), focus Find for keyboard members. */
  arrivalMode?: boolean;
  /** Called after arrival focuses Find, so the one-shot flag can clear. */
  onArrivalConsumed?: () => void;
  // Accepted for compatibility with the caller (Today's Spark now lives in the
  // main-page teaser gift flow, not this browse room).
  firstName?: string | null;
  birthday?: { month: number; day: number } | null;
  personalDates?: PersonalDate[];
  memberSinceIso?: string | null;
  region?: RegionCode;
  /**
   * Which sub-view to land on (from intentional navigation): "find" / "recent" /
   * "collection" open the real saved-Spark collection with the matching preset;
   * "room" (default) shows the browse room.
   */
  initialView?: PersonalLibraryEntryView;
};

/**
 * My Personal Library - the BROWSE room (chat "go to my personal library" and
 * Wander the Estate). The approved artwork is one complete image with the 12
 * Spark Editions, the My Journey panel, and Find/Search + Recent controls on the
 * table. Interactivity is transparent, keyboard-accessible hotspots over the
 * artwork; all of them open the real saved-Spark collection:
 *   - Find/Search  -> collection with Search focused
 *   - Recent       -> collection (most-recent first)
 *   - My Spark Collection / View all -> collection
 *
 * Today's Spark (the gift + unviewed/viewed/saved states) is a separate flow from
 * the Welcome Home teaser, not part of this browse room.
 */
const ROOM_IMAGE_SRC =
  "/backgrounds/personal-library-search-recent-background.png";
const ROOM_IMAGE_ALT =
  "My Personal Library - shelves of Spark Editions on the left, a My Journey panel on the right, and Find/Search and Recent controls to browse saved items.";

type CollectionMode = "find" | "recent" | "collection";

function toCollectionMode(view: PersonalLibraryEntryView): CollectionMode | null {
  return view === "find" || view === "recent" || view === "collection"
    ? view
    : null;
}

export function PersonalLibraryRoom({
  onBack,
  backLabel,
  arrivalMode = false,
  onArrivalConsumed,
  initialView = "room",
}: Props) {
  const [collectionMode, setCollectionMode] = useState<CollectionMode | null>(
    () => toCollectionMode(initialView),
  );

  const findButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (arrivalMode) {
      dismissHomeTeaserToday();
      findButtonRef.current?.focus();
      onArrivalConsumed?.();
    }
  }, [arrivalMode, onArrivalConsumed]);

  const closeCollection = () => setCollectionMode(null);

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

        {/* Find / Search - opens the saved collection with Search focused. */}
        <button
          ref={findButtonRef}
          type="button"
          className="pl-hotspot pl-hotspot--find"
          onClick={() => setCollectionMode("find")}
          data-testid="pl-find-open"
          aria-label="Find or search saved library items"
          title="Find / Search"
        />

        {/* Recent - opens the saved collection, most-recent first. */}
        <button
          type="button"
          className="pl-hotspot pl-hotspot--recent"
          onClick={() => setCollectionMode("recent")}
          data-testid="pl-recent-open"
          aria-label="View recently saved library items"
          title="Recent"
        />

        {/* My Spark Collection - the "View all" panel opens the real collection. */}
        <button
          type="button"
          className="pl-hotspot pl-hotspot--collection"
          onClick={() => setCollectionMode("collection")}
          data-testid="pl-spark-collection-viewall"
          aria-label="Open My Spark Collection"
          title="Open My Spark Collection"
        />
      </div>

      {collectionMode ? (
        <SparkNoteMyCollection
          autoFocusSearch={collectionMode === "find"}
          onBack={closeCollection}
          onClose={closeCollection}
        />
      ) : null}
    </section>
  );
}
