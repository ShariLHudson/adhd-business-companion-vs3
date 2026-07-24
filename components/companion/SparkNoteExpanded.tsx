"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type {
  SparkNoteDailyCard,
  SparkNoteGalleryIconKey,
} from "@/lib/sparkNote/types";
import {
  buildSparkCardShareText,
  resolveSparkCardFooterLine,
  resolveSparkCardHeroVisual,
  resolveSparkCardSimplifiedPresentation,
  resolveSparkCardThemedScene,
  SPARK_CARD_SECTION_SPARK_IN_ACTION,
  SPARK_CARD_SECTION_STORY,
  SPARK_CARD_SECTION_TELL_ME_MORE,
  SPARK_CARD_SECTION_TODAYS_SPARK,
  type SparkCardGalleryItem,
} from "@/lib/sparkNote/sparkCardCollectibleDisplay";
import {
  logSparkCardImageLoadError,
  resolveSparkCardImage,
} from "@/lib/sparkNote/resolveSparkCardImage";
import { normalizeSparkCardImageSrc } from "@/lib/sparkNote/wikimediaCommonsUrl";
import {
  getFavoriteSparkIds,
  recordSparkNoteReaction,
  toggleSparkNoteFavorite,
} from "@/lib/sparkNote/persistence";
import { copySparkNoteText } from "@/lib/sparkNote/sparkNoteDestinations";
import { useDismissibleWindow } from "@/lib/windowDismiss";
import { SparkFlameIcon } from "@/components/companion/SparkFlameIcon";
import {
  SparkCompassIcon,
  SparkLeafIcon,
  SparkMagnifyingGlassIcon,
  SparkOpenBookIcon,
  SparkSealIcon,
  SparkSparkleIcon,
} from "@/components/companion/SparkNoteSectionIcons";

function SparkCardEstateIcon({
  icon,
  className,
}: {
  icon: SparkNoteGalleryIconKey;
  className?: string;
}): ReactNode {
  switch (icon) {
    case "flame":
      return <SparkFlameIcon className={className} />;
    case "book":
      return <SparkOpenBookIcon className={className} />;
    case "compass":
      return <SparkCompassIcon className={className} />;
    case "seal":
      return <SparkSealIcon className={className} />;
    case "lens":
      return <SparkMagnifyingGlassIcon className={className} />;
    case "leaf":
      return <SparkLeafIcon className={className} />;
    case "spark":
    default:
      return <SparkSparkleIcon className={className} />;
  }
}

type Props = {
  card: SparkNoteDailyCard;
  onClose: () => void;
  onOpenCollection: () => void;
};

type ViewPhase = "keepsake" | "saved";

/**
 * Illustrated hero scene — estate medallion + line-art motifs only.
 * Used solely as the `onError` fallback when a real photo fails to load.
 */
function SparkCardIllustratedScene({
  card,
  scene,
}: {
  card: SparkNoteDailyCard;
  scene: ReturnType<typeof resolveSparkCardThemedScene>;
}) {
  return (
    <div
      className="spark-note-expanded__art-scene"
      data-diversity-category={scene.diversityCategory}
      role="img"
      aria-label={scene.alt}
    >
      <span className="spark-note-expanded__art-tape" aria-hidden />
      <span className="spark-note-expanded__art-medallion" aria-hidden>
        <span className="spark-note-expanded__art-medallion-emblem">
          <SparkCardEstateIcon
            icon={scene.emblem}
            className="spark-note-expanded__art-medallion-svg"
          />
        </span>
      </span>
      <div className="spark-note-expanded__art-motifs" aria-hidden>
        {scene.motifs.map((motif, index) => (
          <span
            key={`${card.id}-motif-${index}`}
            className={`spark-note-expanded__art-motif spark-note-expanded__art-motif--${index + 1}`}
          >
            <SparkCardEstateIcon
              icon={motif}
              className="spark-note-expanded__art-motif-svg"
            />
          </span>
        ))}
      </div>
      <span className="spark-note-expanded__art-stamp" aria-hidden>
        <SparkSealIcon className="spark-note-expanded__art-stamp-svg" />
      </span>
      <span className="spark-note-expanded__art-caption" aria-hidden>
        {scene.caption}
      </span>
    </div>
  );
}

function SparkCardArt({
  card,
  overrideSrc,
  overrideAlt,
}: {
  card: SparkNoteDailyCard;
  overrideSrc?: string;
  overrideAlt?: string;
}) {
  // Live + print share one resolver — never gate visibility on a load flag.
  // Cached images often skip onLoad; opacity:0 until load hid the hero live
  // while print still painted the same <img>.
  const resolved = useMemo(() => resolveSparkCardImage(card), [card]);
  const hero = useMemo(() => resolveSparkCardHeroVisual(card), [card]);
  const fallbackScene = useMemo(() => resolveSparkCardThemedScene(card), [card]);
  const [photoFailed, setPhotoFailed] = useState(false);
  const photoSrc = useMemo(() => {
    if (overrideSrc?.trim()) {
      return normalizeSparkCardImageSrc(overrideSrc.trim());
    }
    return resolved.src || "";
  }, [overrideSrc, resolved.src]);
  const hasPhotoCandidate = Boolean(photoSrc) && !photoFailed;
  const aspectRatio =
    resolved.aspectRatio ||
    (hero.kind === "photo" || hero.kind === "themed"
      ? hero.aspectRatio
      : "landscape");
  const focalPoint =
    resolved.focalPoint ||
    (hero.kind === "photo" || hero.kind === "themed"
      ? hero.focalPoint
      : "center");
  const alt = overrideAlt || resolved.alt || fallbackScene.alt;
  const caption = hasPhotoCandidate
    ? resolved.caption ||
      (hero.kind === "photo" ? hero.caption : undefined) ||
      undefined
    : undefined;

  useEffect(() => {
    setPhotoFailed(false);
  }, [photoSrc]);

  // No resolved photo and no override — omit the image region cleanly.
  if (!photoSrc && !overrideSrc?.trim() && !resolved.hasImage) {
    return null;
  }

  return (
    <figure
      className={[
        "spark-note-expanded__art",
        hasPhotoCandidate ? "" : "spark-note-expanded__art--themed",
        `spark-note-expanded__art--${aspectRatio}`,
        `spark-note-expanded__art--focus-${focalPoint}`,
      ]
        .filter(Boolean)
        .join(" ")}
      data-spark-image-source={resolved.sourceType}
      data-spark-image-field={resolved.sourceField || undefined}
      data-spark-has-image={hasPhotoCandidate ? "true" : "false"}
      data-testid="spark-card-hero"
    >
      {hasPhotoCandidate ? (
        <img
          src={photoSrc}
          alt={alt}
          className="spark-note-expanded__art-image"
          // Wikimedia / storage often block hotlinking with a Referer.
          referrerPolicy="no-referrer"
          decoding="async"
          onError={() => {
            setPhotoFailed(true);
            logSparkCardImageLoadError({
              cardId: card.id,
              src: photoSrc,
              sourceField: resolved.sourceField,
              error: "img_onerror",
            });
          }}
        />
      ) : (
        <SparkCardIllustratedScene
          card={card}
          scene={hero.kind === "themed" ? hero : fallbackScene}
        />
      )}
      <span className="spark-note-expanded__art-frame" aria-hidden />
      {hasPhotoCandidate && caption ? (
        <figcaption className="spark-note-expanded__art-photo-caption">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function SeeItDifferentlyGallery({
  items,
  onSelect,
  selectedIndex,
}: {
  items: SparkCardGalleryItem[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="spark-note-expanded__more-gallery">
      <p className="spark-note-expanded__more-section-label">
        See It Differently
      </p>
      <div
        className="spark-note-expanded__more-gallery-row"
        role="list"
        aria-label="Different ways to see this Spark"
      >
        {items.map((item, index) => {
          const selected = selectedIndex === index;
          return (
            <button
              key={`gallery-${index}`}
              type="button"
              role="listitem"
              className={[
                "spark-note-expanded__more-gallery-chip",
                "spark-note-expanded__more-gallery-chip--interactive",
                selected
                  ? "spark-note-expanded__more-gallery-chip--selected"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={selected}
              onClick={() => onSelect(index)}
            >
              <SparkCardEstateIcon
                icon={item.icon}
                className="spark-note-expanded__more-gallery-chip-icon"
              />
              <span className="spark-note-expanded__more-gallery-caption">
                {item.caption}
              </span>
            </button>
          );
        })}
      </div>
      {selectedIndex != null && items[selectedIndex] ? (
        <div
          className="spark-note-expanded__more-gallery-reveal"
          data-testid="spark-note-see-it-differently-reveal"
        >
          {items[selectedIndex].imageSrc ? (
            <img
              src={items[selectedIndex].imageSrc}
              alt={
                items[selectedIndex].imageAlt ||
                items[selectedIndex].caption
              }
              className="spark-note-expanded__more-gallery-reveal-image"
            />
          ) : null}
          <p className="spark-note-expanded__more-gallery-reveal-copy">
            {items[selectedIndex].detail}
          </p>
        </div>
      ) : (
        <p className="spark-note-expanded__more-gallery-hint">
          Choose one to see a short example.
        </p>
      )}
    </div>
  );
}

/** Decorative gold corner flourishes — Spark Estate treasure-card frame. */
function SparkCardOrnaments() {
  return (
    <div className="spark-note-expanded__ornaments" aria-hidden>
      <span className="spark-note-expanded__ornament spark-note-expanded__ornament--tl" />
      <span className="spark-note-expanded__ornament spark-note-expanded__ornament--tr" />
      <span className="spark-note-expanded__ornament spark-note-expanded__ornament--bl" />
      <span className="spark-note-expanded__ornament spark-note-expanded__ornament--br" />
    </div>
  );
}

/** Daily Spark — illustrated collectible treasure card, not an article panel. */
export function SparkNoteExpanded({ card, onClose, onOpenCollection }: Props) {
  const presentation = useMemo(
    () => resolveSparkCardSimplifiedPresentation(card),
    [card],
  );
  const footerLine = useMemo(() => resolveSparkCardFooterLine(card), [card]);
  const [phase, setPhase] = useState<ViewPhase>("keepsake");
  const [tellMeMoreOpen, setTellMeMoreOpen] = useState(false);
  const [selectedSeeItIndex, setSelectedSeeItIndex] = useState<number | null>(
    null,
  );
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const [kept, setKept] = useState(() =>
    getFavoriteSparkIds().includes(card.id),
  );
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const { requestClose, onBackdropClick } = useDismissibleWindow({
    open: true,
    onClose,
  });

  useEffect(() => {
    if (!moreMenuOpen) return;
    function handlePointerDown(event: MouseEvent) {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setMoreMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreMenuOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [moreMenuOpen]);

  function ensureSaved() {
    if (!getFavoriteSparkIds().includes(card.id)) {
      toggleSparkNoteFavorite(card.id);
      recordSparkNoteReaction(card.id, "save", card.category, card.tags);
    }
    setKept(true);
  }

  function handleSaveSpark() {
    ensureSaved();
    setPhase("saved");
  }

  function handleFavorite() {
    const next = toggleSparkNoteFavorite(card.id);
    setKept(next);
    if (next) {
      recordSparkNoteReaction(card.id, "save", card.category, card.tags);
    }
  }

  async function handleShare() {
    const text = buildSparkCardShareText(card);
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: presentation.title,
          text,
        });
        setShareStatus("Shared");
        setMoreMenuOpen(false);
        return;
      } catch {
        /* fall through to clipboard */
      }
    }
    const ok = await copySparkNoteText(text);
    setShareStatus(ok ? "Copied" : "Couldn’t copy just now");
    setMoreMenuOpen(false);
  }

  function handlePrint() {
    setMoreMenuOpen(false);
    if (typeof window === "undefined") return;
    // Tell Me More is conditionally mounted — open it first so the printed
    // page includes the new discoveries/visuals, not a blank placeholder.
    if (hasTellMeMore && !tellMeMoreOpen) {
      setTellMeMoreOpen(true);
      window.requestAnimationFrame(() => window.print());
      return;
    }
    window.print();
  }

  if (phase === "saved") {
    return (
      <div
        className="spark-note-expanded"
        role="dialog"
        aria-label="Spark saved. Click outside the card to close."
        data-testid="spark-note-expanded"
      >
        <div
          className="spark-note-expanded__backdrop"
          aria-hidden
          onClick={() => onBackdropClick()}
        />
        <div className="spark-note-expanded__card spark-note-expanded__card--saved">
          <SparkCardOrnaments />
          <SparkFlameIcon className="spark-note-expanded__saved-flame" />
          <p className="spark-note-expanded__saved-title" role="status">
            Saved to your collection
          </p>
          <p className="spark-note-expanded__saved-copy">
            A keepsake discovery — yours whenever you want it.
          </p>
          <div className="spark-note-expanded__actions spark-note-expanded__actions--save">
            <button
              type="button"
              className="spark-note-expanded__btn spark-note-expanded__btn--primary spark-note-expanded__btn--save"
              onClick={onOpenCollection}
            >
              View collection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tellMeMore = presentation.tellMeMore;
  const selectedSeeIt =
    selectedSeeItIndex != null
      ? tellMeMore.gallery[selectedSeeItIndex]
      : null;
  const hasTellMeMore =
    tellMeMore.facts.length > 0 ||
    Boolean(tellMeMore.lookCloser) ||
    Boolean(tellMeMore.deeperStory) ||
    Boolean(tellMeMore.whatHappenedNext) ||
    Boolean(tellMeMore.unexpectedConnection) ||
    Boolean(tellMeMore.tryThis) ||
    tellMeMore.gallery.length > 0 ||
    tellMeMore.timeline.length > 0 ||
    Boolean(tellMeMore.reflectionPrompt);

  return (
    <div
      className="spark-note-expanded"
      role="dialog"
      aria-label={`Today's Daily Spark: ${card.title}. Click outside the card to close.`}
      data-testid="spark-note-expanded"
    >
      <div
        className="spark-note-expanded__backdrop"
        aria-hidden
        onClick={() => onBackdropClick()}
      />
      <article
        className="spark-note-expanded__card spark-note-expanded__card--keepsake"
        onClick={(e) => e.stopPropagation()}
        data-diversity-category={presentation.diversityCategory}
      >
        <SparkCardOrnaments />

        <div className="spark-note-expanded__topline">
          <div
            className="spark-note-expanded__badge"
            aria-label={`Category: ${presentation.categoryRibbon}`}
          >
            <SparkFlameIcon className="spark-note-expanded__badge-icon" />
            <span className="spark-note-expanded__badge-text">
              {presentation.categoryRibbon}
            </span>
          </div>
          <button
            type="button"
            className="spark-note-expanded__close"
            onClick={() => requestClose()}
            aria-label="Close Spark Card"
          >
            ×
          </button>
        </div>

        <header className="spark-note-expanded__header">
          <span className="spark-note-expanded__kicker">Today&apos;s Spark</span>
        </header>

        <h2 className="spark-note-expanded__title">{presentation.title}</h2>
        <p className="spark-note-expanded__subtitle">{presentation.subtitle}</p>
        <span className="spark-note-expanded__divider" aria-hidden />

        <SparkCardArt card={card} />

        <div className="spark-note-expanded__sections">
          <section className="spark-note-expanded__section spark-note-expanded__section--story">
            <h3 className="spark-note-expanded__section-title">
              <SparkOpenBookIcon className="spark-note-expanded__section-icon" />
              {SPARK_CARD_SECTION_STORY}
            </h3>
            {presentation.storyParagraphs.map((paragraph, index) => (
              <p
                key={`story-${index}`}
                className="spark-note-expanded__section-copy"
              >
                {paragraph}
              </p>
            ))}
          </section>

          <div className="spark-note-expanded__panels">
            <section className="spark-note-expanded__panel spark-note-expanded__panel--takeaway">
              <h3 className="spark-note-expanded__panel-title">
                <SparkSparkleIcon className="spark-note-expanded__panel-icon" />
                {SPARK_CARD_SECTION_TODAYS_SPARK}
              </h3>
              <p className="spark-note-expanded__panel-copy">
                {presentation.todaysSpark}
              </p>
            </section>
          </div>

          <section className="spark-note-expanded__action">
            <SparkFlameIcon className="spark-note-expanded__action-icon" />
            <div className="spark-note-expanded__action-copy">
              <h3 className="spark-note-expanded__action-title">
                {SPARK_CARD_SECTION_SPARK_IN_ACTION}
              </h3>
              <p className="spark-note-expanded__action-text">
                {presentation.sparkInAction}
              </p>
            </div>
          </section>
        </div>

        {hasTellMeMore ? (
          <div className="spark-note-expanded__more-wrap">
            <button
              type="button"
              className="spark-note-expanded__more-toggle"
              aria-expanded={tellMeMoreOpen}
              onClick={() => setTellMeMoreOpen((open) => !open)}
            >
              <SparkMagnifyingGlassIcon className="spark-note-expanded__more-toggle-icon" />
              {SPARK_CARD_SECTION_TELL_ME_MORE}
            </button>
            {tellMeMoreOpen ? (
              <div
                className="spark-note-expanded__more-panel"
                data-testid="spark-note-tell-me-more"
              >
                {selectedSeeIt?.imageSrc ? (
                  <SparkCardArt
                    card={card}
                    overrideSrc={selectedSeeIt.imageSrc}
                    overrideAlt={
                      selectedSeeIt.imageAlt || selectedSeeIt.caption
                    }
                  />
                ) : null}

                {tellMeMore.lookCloser ? (
                  <div className="spark-note-expanded__more-block">
                    <p className="spark-note-expanded__more-section-label">
                      Look Closer
                    </p>
                    <p className="spark-note-expanded__section-copy">
                      {tellMeMore.lookCloser}
                    </p>
                  </div>
                ) : null}

                {tellMeMore.facts.length > 0 ? (
                  <div className="spark-note-expanded__more-facts">
                    {tellMeMore.facts.slice(0, 3).map((fact, index) => (
                      <p
                        key={`fact-${index}`}
                        className="spark-note-expanded__more-fact"
                      >
                        <SparkSparkleIcon className="spark-note-expanded__more-fact-icon" />{" "}
                        {fact}
                      </p>
                    ))}
                  </div>
                ) : null}

                {tellMeMore.deeperStory ? (
                  <div className="spark-note-expanded__more-block">
                    <p className="spark-note-expanded__more-section-label">
                      Behind The Scenes
                    </p>
                    <p className="spark-note-expanded__section-copy">
                      {tellMeMore.deeperStory}
                    </p>
                  </div>
                ) : null}

                {tellMeMore.gallery.length > 0 ? (
                  <SeeItDifferentlyGallery
                    items={tellMeMore.gallery}
                    selectedIndex={selectedSeeItIndex}
                    onSelect={(index) =>
                      setSelectedSeeItIndex((current) =>
                        current === index ? null : index,
                      )
                    }
                  />
                ) : null}

                {tellMeMore.timeline.length > 0 ? (
                  <div className="spark-note-expanded__more-timeline">
                    <p className="spark-note-expanded__more-section-label">
                      A Small Timeline
                    </p>
                    <ol>
                      {tellMeMore.timeline.map((step, index) => (
                        <li key={`timeline-${index}`}>
                          <span className="spark-note-expanded__more-timeline-label">
                            {step.label}
                          </span>
                          {step.detail ? (
                            <span className="spark-note-expanded__more-timeline-detail">
                              {step.detail}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                {tellMeMore.whatHappenedNext ? (
                  <div className="spark-note-expanded__more-block">
                    <p className="spark-note-expanded__more-section-label">
                      What Happened Next
                    </p>
                    <p className="spark-note-expanded__section-copy">
                      {tellMeMore.whatHappenedNext}
                    </p>
                  </div>
                ) : null}

                {tellMeMore.unexpectedConnection ? (
                  <div className="spark-note-expanded__more-block">
                    <p className="spark-note-expanded__more-section-label">
                      Surprising Connection
                    </p>
                    <p className="spark-note-expanded__section-copy">
                      {tellMeMore.unexpectedConnection}
                    </p>
                  </div>
                ) : null}

                {tellMeMore.tryThis ? (
                  <div className="spark-note-expanded__more-try">
                    <SparkSparkleIcon className="spark-note-expanded__more-try-icon" />
                    <p>{tellMeMore.tryThis}</p>
                  </div>
                ) : null}

                {tellMeMore.reflectionPrompt ? (
                  <p className="spark-note-expanded__section-copy spark-note-expanded__section-copy--quiet">
                    A question to sit with: {tellMeMore.reflectionPrompt}
                  </p>
                ) : null}

                {tellMeMore.sources.length > 0 ? (
                  <p className="spark-note-expanded__more-sources">
                    {tellMeMore.sources.join(" ")}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <p className="spark-note-expanded__footer">{footerLine}</p>

        <div
          className="spark-note-expanded__actions spark-note-expanded__actions--collection"
          aria-label="Spark Card actions"
        >
          <button
            type="button"
            className="spark-note-expanded__btn spark-note-expanded__btn--primary spark-note-expanded__btn--save"
            onClick={handleSaveSpark}
            aria-pressed={kept}
          >
            {kept ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            className={[
              "spark-note-expanded__btn spark-note-expanded__btn--ghost spark-note-expanded__btn--save",
              kept ? "spark-note-expanded__btn--favorite-on" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={handleFavorite}
            aria-pressed={kept}
          >
            {kept ? "Favorited" : "Favorite"}
          </button>
          <div
            className="spark-note-expanded__more-menu-wrap"
            ref={moreMenuRef}
          >
            <button
              type="button"
              className="spark-note-expanded__btn spark-note-expanded__btn--ghost spark-note-expanded__btn--save spark-note-expanded__btn--more"
              onClick={() => setMoreMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={moreMenuOpen}
              aria-label="More Spark Card actions"
            >
              More ⋯
            </button>
            {moreMenuOpen ? (
              <div
                className="spark-note-expanded__more-menu"
                role="menu"
                aria-label="More Spark Card actions"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="spark-note-expanded__more-menu-item"
                  onClick={() => void handleShare()}
                >
                  Share
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="spark-note-expanded__more-menu-item"
                  onClick={handlePrint}
                >
                  Print
                </button>
              </div>
            ) : null}
          </div>
        </div>
        {shareStatus ? (
          <p className="spark-note-expanded__share-status" role="status">
            {shareStatus}
          </p>
        ) : null}
      </article>
    </div>
  );
}
