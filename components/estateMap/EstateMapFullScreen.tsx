"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EXPLORE_CATEGORY_LABELS,
  EXPLORE_MEMBER_BUCKET_LABELS,
  getExploreEstateCategoryGroups,
  getExploreEstateDestinationById,
  getExploreFeaturedDestinations,
  getExploreMemberBucketGroups,
  searchExploreEstateDestinations,
  type ExploreMemberBucketId,
} from "@/lib/estateMap/exploreEstateDestinations";
import type {
  EstateExploreCategory,
  EstateExploreDestination,
} from "@/lib/estateMap/exploreEstateTypes";
import type {
  EstateMapFullScreenProps,
  EstateMapLocation,
} from "@/lib/estateMap/types";
import "./estate-map-full-screen.css";

type DestinationCardProps = {
  destination: EstateExploreDestination;
  isHere: boolean;
  onSelect: (destination: EstateExploreDestination) => void;
};

function DestinationCard({
  destination,
  isHere,
  onSelect,
}: DestinationCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = destination.imageReady && destination.imagePath && !imageFailed;

  return (
    <button
      type="button"
      className={`emfs-dest-card${isHere ? " emfs-dest-card--here" : ""}${
        !showImage ? " emfs-dest-card--no-image" : ""
      }`}
      onClick={() => {
        if (!destination.isAvailable) return;
        onSelect(destination);
      }}
      disabled={!destination.isAvailable}
      data-testid={`explore-estate-card-${destination.id}`}
      data-destination-id={destination.destinationId}
      data-category={destination.category}
      data-media-type={destination.mediaType}
      data-video-path={destination.videoPath ?? ""}
      data-image-ready={showImage ? "true" : "false"}
      aria-label={`${destination.name}. ${destination.description}${
        isHere ? ". You are here." : ""
      }${!showImage ? ". Image being prepared." : ""}${
        !destination.isAvailable ? ". Not available yet." : ""
      }`}
    >
      <span className="emfs-dest-card__media">
        {showImage ? (
          <Image
            src={destination.imagePath}
            alt=""
            fill
            sizes="(max-width: 40rem) 92vw, (max-width: 64rem) 44vw, 30vw"
            className="emfs-dest-card__image"
            style={{ objectPosition: destination.focalPosition ?? "center" }}
            draggable={false}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span
            className="emfs-dest-card__placeholder"
            data-testid={`explore-estate-image-pending-${destination.id}`}
          >
            Image being prepared
          </span>
        )}
        <span className="emfs-dest-card__shade" aria-hidden />
      </span>
      <span className="emfs-dest-card__body">
        <span className="emfs-dest-card__category">
          {EXPLORE_CATEGORY_LABELS[destination.category]}
        </span>
        <span className="emfs-dest-card__name">{destination.name}</span>
        <span className="emfs-dest-card__desc">{destination.description}</span>
        {!showImage ? (
          <span className="emfs-dest-card__status">
            {destination.unavailableMessage ?? "Image being prepared"}
          </span>
        ) : null}
        {!destination.isAvailable ? (
          <span className="emfs-dest-card__status">
            {destination.unavailableMessage ?? "This place is not open yet"}
          </span>
        ) : null}
        {isHere ? (
          <span className="emfs-dest-card__here">You are here</span>
        ) : null}
      </span>
    </button>
  );
}

function toDestination(location: EstateMapLocation): EstateExploreDestination {
  const known = getExploreEstateDestinationById(location.id);
  if (known) return known;
  return {
    id: location.id,
    name: location.name,
    category: "other",
    imagePath: location.image,
    mediaType: "image",
    description: location.mood,
    destinationType: "room",
    destinationId: location.id,
    isAvailable: Boolean(location.image),
    imageReady: Boolean(location.image),
    focalPosition: "center",
  };
}

/**
 * Explore Spark / Explore Estate — visual directory of Estate places.
 * Image cards grouped by category; search includes official names and aliases.
 */
export function EstateMapFullScreen({
  open,
  onClose,
  onReturnToEstate,
  locations,
  currentLocationId,
  onSelectLocation,
}: EstateMapFullScreenProps) {
  const [visible, setVisible] = useState(false);
  const [entering, setEntering] = useState<EstateExploreDestination | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [browseAllPlaces, setBrowseAllPlaces] = useState(false);
  const [openCategories, setOpenCategories] = useState<
    Record<string, boolean>
  >({});
  const [openBuckets, setOpenBuckets] = useState<Record<string, boolean>>({});

  const leaveExplore = useCallback(() => {
    if (onReturnToEstate) {
      onReturnToEstate();
      return;
    }
    onClose();
  }, [onClose, onReturnToEstate]);

  const destinations = useMemo(
    () => locations.map(toDestination),
    [locations],
  );

  const filtered = useMemo(
    () => searchExploreEstateDestinations(query, destinations),
    [query, destinations],
  );

  const groups = useMemo(
    () => getExploreEstateCategoryGroups(filtered),
    [filtered],
  );

  const memberBuckets = useMemo(
    () => getExploreMemberBucketGroups(filtered),
    [filtered],
  );

  const featuredIds = useMemo(() => {
    const featured = getExploreFeaturedDestinations(destinations, 3);
    return new Set(featured.map((d) => d.id));
  }, [destinations]);

  const showFullDirectory = browseAllPlaces || query.trim().length > 0;

  useEffect(() => {
    if (!open) {
      setVisible(false);
      setEntering(null);
      setQuery("");
      setBrowseAllPlaces(false);
      return;
    }
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open || groups.length === 0) return;
    setOpenCategories((prev) => {
      const next = { ...prev };
      for (const group of groups) {
        if (next[group.id] === undefined) next[group.id] = true;
      }
      return next;
    });
  }, [open, groups]);

  useEffect(() => {
    if (!open || memberBuckets.length === 0) return;
    setOpenBuckets((prev) => {
      const next = { ...prev };
      for (const group of memberBuckets) {
        if (next[group.id] === undefined) next[group.id] = true;
      }
      return next;
    });
  }, [open, memberBuckets]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (entering) setEntering(null);
        else leaveExplore();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, entering, leaveExplore]);

  const handleSelect = useCallback(
    (destination: EstateExploreDestination) => {
      if (!destination.isAvailable) return;
      setEntering(destination);
      const asLocation: EstateMapLocation = {
        id: destination.id,
        name: destination.name,
        image: destination.imagePath,
        mood: destination.description,
        x: 50,
        y: 50,
        width: 12,
        rotation: 0,
      };
      /**
       * Parent closes Explore and navigates. Do not call onClose/leaveExplore
       * here — Fold / Return to Estate go to Welcome Home and would cancel
       * the room hop.
       */
      window.setTimeout(() => {
        onSelectLocation?.(asLocation);
        setEntering(null);
      }, 450);
    },
    [onSelectLocation],
  );

  function toggleCategory(id: EstateExploreCategory) {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleBucket(id: ExploreMemberBucketId) {
    setOpenBuckets((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (!open && !visible) return null;

  return (
    <div
      className={`emfs-root${visible ? " emfs-root--visible" : ""}${
        entering ? " emfs-root--entering" : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Explore Estate"
      data-testid="explore-estate-directory"
    >
      <div className="emfs-parchment">
        <header className="emfs-toolbar">
          <div className="emfs-toolbar__title">
            <h1>Explore Estate</h1>
            <p>
              {showFullDirectory
                ? "Every place with a photograph — choose where to go"
                : "A few places to begin — browse all when you want to wander"}
            </p>
          </div>
          <div className="emfs-toolbar__actions">
            {onReturnToEstate ? (
              <button
                type="button"
                className="emfs-toolbar__btn emfs-toolbar__btn--primary"
                onClick={onReturnToEstate}
                data-testid="explore-estate-return-home"
              >
                Return to Estate
              </button>
            ) : null}
            <button
              type="button"
              className="emfs-toolbar__btn"
              onClick={leaveExplore}
              data-testid="explore-estate-fold"
            >
              Fold map
            </button>
          </div>
        </header>

        <div className="emfs-directory-controls">
          <label className="emfs-search">
            <span className="emfs-search__label">Search places</span>
            <input
              type="search"
              className="emfs-search__input"
              placeholder="Try treehouse, boardroom, journal, peaceful…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              data-testid="explore-estate-search"
              autoComplete="off"
            />
          </label>
          <p className="emfs-directory-count" data-testid="explore-estate-count">
            {filtered.length} place{filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="emfs-directory-scroll" data-testid="explore-estate-scroll">
          {!showFullDirectory ? (
            <>
              {memberBuckets.map((group) => {
                const expanded = openBuckets[group.id] !== false;
                const cards = group.destinations.filter((d) =>
                  featuredIds.has(d.id),
                );
                if (cards.length === 0) return null;
                return (
                  <section
                    key={group.id}
                    className="emfs-category"
                    data-testid={`explore-estate-bucket-${group.id}`}
                  >
                    <button
                      type="button"
                      className="emfs-category__toggle"
                      aria-expanded={expanded}
                      onClick={() => toggleBucket(group.id)}
                    >
                      <span>
                        {EXPLORE_MEMBER_BUCKET_LABELS[group.id] ?? group.label}
                      </span>
                      <span aria-hidden>{expanded ? "▾" : "▸"}</span>
                    </button>
                    {expanded ? (
                      <div className="emfs-dest-grid" role="list">
                        {cards.map((destination) => (
                          <div key={destination.id} role="listitem">
                            <DestinationCard
                              destination={destination}
                              isHere={
                                destination.id === currentLocationId ||
                                destination.destinationId === currentLocationId
                              }
                              onSelect={handleSelect}
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </section>
                );
              })}
              <div className="emfs-directory-controls" style={{ marginTop: "1rem" }}>
                <button
                  type="button"
                  className="emfs-toolbar__btn emfs-toolbar__btn--primary"
                  onClick={() => setBrowseAllPlaces(true)}
                  data-testid="explore-estate-browse-all"
                >
                  Browse All Places
                </button>
              </div>
            </>
          ) : groups.length === 0 ? (
            <p className="emfs-directory-empty">
              No places match that search. Try another name or purpose.
            </p>
          ) : (
            <>
              {!query.trim() ? (
                <div className="emfs-directory-controls" style={{ marginBottom: "0.75rem" }}>
                  <button
                    type="button"
                    className="emfs-toolbar__btn"
                    onClick={() => setBrowseAllPlaces(false)}
                    data-testid="explore-estate-show-featured"
                  >
                    Show featured places
                  </button>
                </div>
              ) : null}
              {groups.map((group) => {
                const expanded = openCategories[group.id] !== false;
                return (
                  <section
                    key={group.id}
                    className="emfs-category"
                    data-testid={`explore-estate-category-${group.id}`}
                  >
                    <button
                      type="button"
                      className="emfs-category__toggle"
                      aria-expanded={expanded}
                      onClick={() => toggleCategory(group.id)}
                    >
                      <span>{group.label}</span>
                      <span aria-hidden>{expanded ? "▾" : "▸"}</span>
                    </button>
                    {expanded ? (
                      <div className="emfs-dest-grid" role="list">
                        {group.destinations.map((destination) => (
                          <div key={destination.id} role="listitem">
                            <DestinationCard
                              destination={destination}
                              isHere={
                                destination.id === currentLocationId ||
                                destination.destinationId === currentLocationId
                              }
                              onSelect={handleSelect}
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </>
          )}
        </div>
      </div>

      {entering ? (
        <div className="emfs-enter" aria-hidden>
          {entering.imageReady && entering.imagePath ? (
            <div
              className="emfs-enter__image"
              style={{
                backgroundImage: `url(${entering.imagePath})`,
                backgroundPosition: entering.focalPosition ?? "center",
              }}
            />
          ) : (
            <div className="emfs-enter__image emfs-enter__image--plain" />
          )}
          <p className="emfs-enter__label">Stepping into {entering.name}…</p>
        </div>
      ) : null}
    </div>
  );
}
