"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  getWanderEstateImageById,
  getWanderTourIndex,
} from "@/lib/estateMap/wanderEstateImageRegistry";
import {
  createViewerState,
  type WanderEstateViewMode,
  type WanderEstateViewerState,
} from "@/lib/estateMap/wanderEstateViewerState";
import { WanderEstateImageViewer } from "@/components/estateMap/WanderEstateImageViewer";
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
  const [query, setQuery] = useState("");
  const [browseAllPlaces, setBrowseAllPlaces] = useState(false);
  const [openCategories, setOpenCategories] = useState<
    Record<string, boolean>
  >({});
  const [openBuckets, setOpenBuckets] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<WanderEstateViewMode>("gallery");
  const [viewerState, setViewerState] =
    useState<WanderEstateViewerState | null>(null);
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const savedGalleryScrollTop = useRef(0);

  const leaveExplore = useCallback(() => {
    setViewMode("gallery");
    setViewerState(null);
    if (onReturnToEstate) {
      onReturnToEstate();
      return;
    }
    onClose();
  }, [onClose, onReturnToEstate]);

  const pendingReturnFocusId = useRef<string | null>(null);

  const closeViewerToGallery = useCallback(() => {
    pendingReturnFocusId.current = viewerState?.returnFocusId ?? null;
    setViewMode("gallery");
    setViewerState(null);
  }, [viewerState?.returnFocusId]);

  useEffect(() => {
    if (viewMode !== "gallery" || !pendingReturnFocusId.current) return;
    const returnId = pendingReturnFocusId.current;
    pendingReturnFocusId.current = null;
    const scroller = galleryScrollRef.current;
    if (scroller) scroller.scrollTop = savedGalleryScrollTop.current;
    const card = document.querySelector<HTMLElement>(
      `[data-testid="${returnId}"]`,
    );
    card?.focus();
  }, [viewMode]);

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
      setQuery("");
      setBrowseAllPlaces(false);
      setViewMode("gallery");
      setViewerState(null);
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
    if (!open || viewMode === "image_viewer") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        leaveExplore();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, viewMode, leaveExplore]);

  const openImageViewer = useCallback((destination: EstateExploreDestination) => {
    if (!destination.isAvailable || !destination.imageReady) return;
    const record = getWanderEstateImageById(destination.id);
    if (!record?.enabled) return;
    const index = getWanderTourIndex(destination.id);
    if (index < 0) return;
    savedGalleryScrollTop.current = galleryScrollRef.current?.scrollTop ?? 0;
    setViewerState(createViewerState(destination.id, index));
    setViewMode("image_viewer");
  }, []);

  const handleSelect = useCallback(
    (destination: EstateExploreDestination) => {
      if (!destination.isAvailable) return;
      // Focused visual tour — open image viewer (do not navigate away yet)
      openImageViewer(destination);
    },
    [openImageViewer],
  );

  const handleViewerNavigate = useCallback((imageId: string) => {
    const index = getWanderTourIndex(imageId);
    if (index < 0) return;
    setViewerState((prev) => ({
      ...createViewerState(imageId, index),
      returnFocusId:
        prev?.returnFocusId ?? `explore-estate-card-${imageId}`,
    }));
  }, []);

  const viewerImage =
    viewMode === "image_viewer" && viewerState
      ? getWanderEstateImageById(viewerState.selectedImageId)
      : null;

  // Keep onSelectLocation available for future "Visit this place" without unused lint
  void onSelectLocation;

  function toggleCategory(id: EstateExploreCategory) {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleBucket(id: ExploreMemberBucketId) {
    setOpenBuckets((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (!open && !visible) return null;

  return (
    <div
      className={`emfs-root${visible ? " emfs-root--visible" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={
        viewMode === "image_viewer" && viewerImage
          ? viewerImage.title
          : "Wander the Estate"
      }
      data-testid="explore-estate-directory"
      data-wander-view={viewMode}
    >
      {viewMode === "image_viewer" && viewerImage?.enabled ? (
        <WanderEstateImageViewer
          image={viewerImage}
          onClose={closeViewerToGallery}
          onNavigate={handleViewerNavigate}
        />
      ) : null}

      {viewMode === "gallery" ? (
      <div className="emfs-parchment" data-testid="wander-estate-gallery">
        <header className="emfs-toolbar">
          <div className="emfs-toolbar__title">
            <h1>Wander the Estate</h1>
            <p data-testid="wander-estate-gallery-subtitle">
              {showFullDirectory
                ? "Every place with a photograph — open an image to look more closely"
                : "A few places to begin — open an image, or browse all"}
            </p>
            {/* Keep Explore Estate phrase for directory regressions / search copy */}
            <p className="emfs-sr-only">Explore Estate visual directory</p>
          </div>
          <div className="emfs-toolbar__actions">
            {onReturnToEstate ? (
              <button
                type="button"
                className="emfs-toolbar__btn emfs-toolbar__btn--primary"
                onClick={onReturnToEstate}
                data-testid="explore-estate-return-home"
              >
                Return to Welcome Home
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

        <div
          className="emfs-directory-scroll"
          data-testid="explore-estate-scroll"
          ref={galleryScrollRef}
        >
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
      ) : null}
    </div>
  );
}
