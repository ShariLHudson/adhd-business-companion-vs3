"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { GALLERY_WALK_CYCLE_MS } from "./galleryRoom";
import {
  galleryPlateTranslatePx,
  galleryWalkFrame,
  prefersReducedMotion,
} from "./walk";

function applyGalleryWalkFrame(
  viewport: HTMLElement | null,
  plate: HTMLElement | null,
  hallway: HTMLImageElement | null,
  elapsedMs: number,
) {
  const frame = galleryWalkFrame(elapsedMs, prefersReducedMotion());
  if (plate && viewport) {
    const x = galleryPlateTranslatePx(
      frame.walkProgress,
      plate.offsetWidth,
      viewport.clientWidth,
    );
    plate.style.transform = `translate3d(${x}px, 0, 0)`;
    plate.dataset.galleryWalkProgress = frame.walkProgress.toFixed(3);
  }
  if (hallway) {
    hallway.style.objectPosition = frame.objectPosition;
  }
}

export function useGalleryWalk(
  paused: boolean,
  viewportRef: RefObject<HTMLElement | null>,
  plateRef: RefObject<HTMLElement | null>,
  hallwayRef: RefObject<HTMLImageElement | null>,
): { nudgeForward: () => void; resetWalk: () => void } {
  const originRef = useRef<number | null>(null);
  const holdMsRef = useRef(0);

  const paint = useCallback(
    (elapsedMs: number) => {
      applyGalleryWalkFrame(
        viewportRef.current,
        plateRef.current,
        hallwayRef.current,
        elapsedMs,
      );
    },
    [viewportRef, plateRef, hallwayRef],
  );

  const nudgeForward = useCallback(() => {
    const step = GALLERY_WALK_CYCLE_MS * 0.08;
    holdMsRef.current = Math.min(
      GALLERY_WALK_CYCLE_MS,
      holdMsRef.current + step,
    );
    paint(holdMsRef.current);
    if (originRef.current !== null) {
      originRef.current -= step;
    }
  }, [paint]);

  const resetWalk = useCallback(() => {
    holdMsRef.current = 0;
    originRef.current = null;
    paint(0);
  }, [paint]);

  useEffect(() => {
    if (prefersReducedMotion()) {
      paint(0);
      return;
    }

    const viewport = viewportRef.current;
    const plate = plateRef.current;
    const hallway = hallwayRef.current;
    if (!viewport || !plate) return;

    const repaint = () => paint(holdMsRef.current);

    const resizeObserver = new ResizeObserver(repaint);
    resizeObserver.observe(viewport);
    resizeObserver.observe(plate);

    if (hallway && !hallway.complete) {
      hallway.addEventListener("load", repaint, { once: true });
    }

    if (paused) {
      repaint();
      originRef.current = null;
      return () => {
        resizeObserver.disconnect();
        hallway?.removeEventListener("load", repaint);
      };
    }

    if (originRef.current === null) {
      originRef.current = performance.now() - holdMsRef.current;
    }

    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - (originRef.current ?? now);
      holdMsRef.current = elapsed;
      paint(elapsed);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      hallway?.removeEventListener("load", repaint);
    };
  }, [paused, paint, viewportRef, plateRef, hallwayRef]);

  return { nudgeForward, resetWalk };
}
