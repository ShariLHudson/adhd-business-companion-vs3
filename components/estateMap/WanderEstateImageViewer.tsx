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
};

/**
 * Focused Wander the Estate image viewer — exclusive layer over the gallery.
 * Does not mount chat or the directory grid.
 */
export function WanderEstateImageViewer({
  image,
  onClose,
  onNavigate,
}: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageFailed, setImageFailed] = useState(false);
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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
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
  }, [goNext, goPrevious, onClose]);

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
  }, [image.id]);

  const showImage = Boolean(image.imageSrc) && !imageFailed;

  return (
    <div
      ref={containerRef}
      className="weiv-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="wander-estate-image-viewer"
      data-wander-view="image_viewer"
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
            className={`weiv-image weiv-image--${image.objectFit}`}
            style={{
              objectPosition: image.focalPosition ?? "center",
            }}
            data-testid="wander-estate-viewer-image"
            data-loaded="true"
            draggable={false}
            onError={() => setImageFailed(true)}
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

      <div className="weiv-controls" role="group" aria-label="Image navigation">
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
    </div>
  );
}
