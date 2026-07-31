"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  getAdjacentWanderImages,
  getWanderEstateTourImages,
  prefetchAdjacentWanderImages,
  type WanderEstateImageRecord,
} from "@/lib/estateMap/wanderEstateImageRegistry";
import "./wander-estate-image-viewer.css";

type Props = {
  image: WanderEstateImageRecord;
  onClose: () => void;
  onNavigate: (imageId: string) => void;
  /**
   * "Talk here" — stay in this place with Spark. Optional: when provided, the
   * viewer offers to make this image the companion background and drop the
   * member into the normal chat-over-background experience (reuses estate
   * navigation; the viewer never mounts its own chat).
   */
  onEnterPlace?: () => void;
};

/**
 * Focused Wander the Estate image viewer — exclusive layer over the gallery.
 * Two presentations: a framed view (photo + title + Previous/Back/Next), and an
 * immersive full-screen background the member can stay on (chrome hidden, photo
 * full-bleed). Neither mounts chat; "Talk here" reuses estate navigation.
 */
export function WanderEstateImageViewer({
  image,
  onClose,
  onNavigate,
  onEnterPlace,
}: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const adjacent = getAdjacentWanderImages(image.id);
  const canPrevious = Boolean(adjacent.previous);
  const canNext = Boolean(adjacent.next);
  const tour = getWanderEstateTourImages();

  useEffect(() => {
    setImageFailed(false);
    prefetchAdjacentWanderImages(image.id);
  }, [image.id]);

  useEffect(() => {
    closeRef.current?.focus();
  }, [image.id]);

  const goPrevious = useCallback(() => {
    if (adjacent.previous) onNavigate(adjacent.previous.id);
  }, [adjacent.previous, onNavigate]);

  const goNext = useCallback(() => {
    if (adjacent.next) onNavigate(adjacent.next.id);
  }, [adjacent.next, onNavigate]);

  // Single `immersive` authority. Enter is explicit; there is no image-based
  // exit toggle, so a full-screen background click never collapses the view.
  const enterImmersive = useCallback(() => setImmersive(true), []);
  const exitImmersive = useCallback(() => setImmersive(false), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        // Esc steps out of immersive first, then closes the viewer.
        if (immersive) setImmersive(false);
        else onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [goNext, goPrevious, onClose, immersive]);

  // Focus trap within viewer controls
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const onTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    root.addEventListener("keydown", onTab);
    return () => root.removeEventListener("keydown", onTab);
  }, [image.id, immersive]);

  const showImage = Boolean(image.imageSrc) && !imageFailed;

  return (
    <div
      ref={containerRef}
      className={`weiv-root${immersive ? " weiv-root--immersive" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="wander-estate-image-viewer"
      data-wander-view={immersive ? "image_immersive" : "image_viewer"}
      data-immersive={immersive ? "true" : "false"}
      data-image-id={image.id}
      data-image-index={adjacent.index}
    >
      <button
        ref={closeRef}
        type="button"
        className="weiv-close"
        onClick={onClose}
        aria-label="Close image viewer and return to Wander the Estate"
        data-testid="wander-estate-viewer-close"
      >
        <span aria-hidden="true">×</span>
        <span className="weiv-sr-only">Close</span>
      </button>

      <div className="weiv-stage">
        {showImage ? (
          // Immediate paint — no opacity:0 onLoad gate (Spark Card lesson)
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={image.id}
            src={image.imageSrc}
            alt={image.alt}
            className={`weiv-image weiv-image--${
              immersive ? "immersive" : image.objectFit
            }`}
            style={{
              objectPosition: image.focalPosition ?? "center",
            }}
            data-testid="wander-estate-viewer-image"
            data-loaded="true"
            draggable={false}
            onError={() => setImageFailed(true)}
            // Click-to-enter only while framed. In immersive mode the image has
            // no handler, so tapping the full-screen background does nothing.
            onClick={!immersive && showImage ? enterImmersive : undefined}
            title={immersive ? undefined : "View full screen"}
          />
        ) : (
          <div
            className="weiv-fallback"
            data-testid="wander-estate-viewer-fallback"
            role="img"
            aria-label={image.alt || image.title}
          >
            <p>{image.title}</p>
            <p className="weiv-fallback__note">
              This view is resting for a moment.
            </p>
          </div>
        )}
      </div>

      {immersive ? (
        <div
          className="weiv-immersive-bar"
          role="group"
          aria-label="Full-screen background controls"
          data-testid="wander-estate-immersive-bar"
        >
          <button
            type="button"
            className="weiv-btn weiv-btn--ghost"
            onClick={goPrevious}
            disabled={!canPrevious}
            aria-label="Previous image"
            data-testid="wander-estate-immersive-previous"
          >
            ←
          </button>
          {onEnterPlace ? (
            <button
              type="button"
              className="weiv-btn weiv-btn--primary"
              onClick={onEnterPlace}
              data-testid="wander-estate-immersive-talk"
            >
              Talk here with Spark
            </button>
          ) : null}
          <button
            type="button"
            className="weiv-btn weiv-btn--ghost"
            onClick={exitImmersive}
            data-testid="wander-estate-immersive-exit"
          >
            Exit full screen
          </button>
          <button
            type="button"
            className="weiv-btn weiv-btn--ghost"
            onClick={goNext}
            disabled={!canNext}
            aria-label="Next image"
            data-testid="wander-estate-immersive-next"
          >
            →
          </button>
        </div>
      ) : (
        <>
          <div className="weiv-meta">
            <h2 id={titleId} className="weiv-title">
              {image.title}
            </h2>
            {image.description ? (
              <p className="weiv-description">{image.description}</p>
            ) : null}
            <p className="weiv-position" aria-live="polite">
              {adjacent.index >= 0
                ? `${adjacent.index + 1} of ${tour.length}`
                : null}
            </p>
          </div>

          <div
            className="weiv-controls"
            role="group"
            aria-label="Image navigation"
          >
            <button
              type="button"
              className="weiv-btn"
              onClick={goPrevious}
              disabled={!canPrevious}
              aria-label={
                adjacent.previous
                  ? `Previous image, ${adjacent.previous.title}`
                  : "Previous image, unavailable"
              }
              data-testid="wander-estate-viewer-previous"
            >
              ← Previous
            </button>
            <button
              type="button"
              className="weiv-btn weiv-btn--primary"
              onClick={onClose}
              data-testid="wander-estate-viewer-back"
            >
              Back to Estate
            </button>
            <button
              type="button"
              className="weiv-btn"
              onClick={goNext}
              disabled={!canNext}
              aria-label={
                adjacent.next
                  ? `Next image, ${adjacent.next.title}`
                  : "Next image, unavailable"
              }
              data-testid="wander-estate-viewer-next"
            >
              Next →
            </button>
          </div>

          <div className="weiv-secondary" role="group" aria-label="Viewing options">
            {showImage ? (
              <button
                type="button"
                className="weiv-btn weiv-btn--wide"
                onClick={enterImmersive}
                data-testid="wander-estate-viewer-fullscreen"
              >
                View full screen
              </button>
            ) : null}
            {onEnterPlace ? (
              <button
                type="button"
                className="weiv-btn weiv-btn--wide"
                onClick={onEnterPlace}
                data-testid="wander-estate-viewer-talk"
              >
                Talk here with Spark
              </button>
            ) : null}
          </div>

          <p
            className="weiv-kbd-hint"
            data-testid="wander-estate-viewer-esc-hint"
          >
            Tap the photo for full screen · Press Esc to return
          </p>
        </>
      )}
    </div>
  );
}
