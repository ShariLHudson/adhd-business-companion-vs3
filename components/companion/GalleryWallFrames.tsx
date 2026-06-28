"use client";

import { memo } from "react";
import {
  galleryWallMemoryLayout,
  type GalleryWallMemory,
} from "@/lib/gallery/galleryWallMemories";

type Props = {
  memories: readonly GalleryWallMemory[];
  fading?: boolean;
};

/**
 * Framed memories anchored to the hallway plate — scroll into view as you walk.
 */
export const GalleryWallFrames = memo(function GalleryWallFrames({
  memories,
  fading = false,
}: Props) {
  return (
    <div
      className={`gallery__wall-memories ${fading ? "gallery__wall-memories--fading" : ""}`}
      aria-hidden="true"
    >
      {memories.map((memory) => {
        const layout = galleryWallMemoryLayout(memory);
        const accentClass = memory.accent
          ? `gallery__wall-memory--accent-${memory.accent}`
          : "";
        return (
          <article
            key={memory.id}
            className={`gallery__wall-memory gallery__wall-memory--${memory.wallSide} gallery__wall-memory--${memory.variant} ${accentClass}`.trim()}
            data-gallery-memory-id={memory.id}
            data-gallery-walk-position={memory.walkPosition}
            style={{
              left: `${layout.leftPercent}%`,
              top: `${layout.topPercent}%`,
            }}
          >
            {memory.accent === "flowers" ? (
              <div className="gallery__wall-memory-flowers" aria-hidden="true" />
            ) : null}
            <div className="gallery__wall-memory-frame">
              {memory.variant === "botanical" ? (
                <div className="gallery__wall-memory-botanical" />
              ) : memory.variant === "empty" ? (
                <div className="gallery__wall-memory-empty">
                  <span>{memory.plaque}</span>
                </div>
              ) : memory.variant === "photo" ? (
                <div className="gallery__wall-memory-photo">
                  <span className="gallery__wall-memory-photo-glyph" aria-hidden>
                    ✦
                  </span>
                </div>
              ) : memory.variant === "lesson" ? (
                <div className="gallery__wall-memory-lesson">
                  {memory.title ? (
                    <h3 className="gallery__wall-memory-heading">{memory.title}</h3>
                  ) : null}
                  {memory.body ? (
                    <p className="gallery__wall-memory-body">{memory.body}</p>
                  ) : null}
                </div>
              ) : memory.variant === "portfolio" ? (
                <div className="gallery__wall-memory-portfolio">
                  <div className="gallery__wall-memory-portfolio-mat" />
                  {memory.title ? (
                    <p className="gallery__wall-memory-portfolio-label">
                      {memory.title}
                    </p>
                  ) : null}
                </div>
              ) : memory.variant === "impact" ? (
                <div className="gallery__wall-memory-impact">
                  {memory.title ? (
                    <p className="gallery__wall-memory-impact-title">
                      {memory.title}
                    </p>
                  ) : null}
                  {memory.body ? (
                    <p className="gallery__wall-memory-body">{memory.body}</p>
                  ) : null}
                </div>
              ) : memory.variant === "anniversary" ? (
                <div className="gallery__wall-memory-anniversary">
                  {memory.body ? (
                    <p className="gallery__wall-memory-body">{memory.body}</p>
                  ) : null}
                </div>
              ) : (
                <div className="gallery__wall-memory-content">
                  {memory.title ? (
                    <p className="gallery__wall-memory-title">{memory.title}</p>
                  ) : null}
                  {memory.body ? (
                    <p className="gallery__wall-memory-body">{memory.body}</p>
                  ) : null}
                  {memory.subtitle ? (
                    <p className="gallery__wall-memory-subtitle">
                      {memory.subtitle}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
            {memory.plaque && memory.variant !== "empty" ? (
              <p className="gallery__wall-memory-plaque">{memory.plaque}</p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
});
