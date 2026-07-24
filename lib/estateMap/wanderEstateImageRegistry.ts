/**
 * Canonical Wander the Estate image registry.
 * Built from Explore Estate destinations — one ordered list for Previous / Next.
 * Do not hard-code sequences in UI components.
 */

import { getExploreEstateDestinations } from "./exploreEstateDestinations";
import type { EstateExploreDestination } from "./exploreEstateTypes";

export type WanderEstateImageRecord = {
  id: string;
  destinationId: string;
  title: string;
  imageSrc: string;
  alt: string;
  description: string;
  order: number;
  enabled: boolean;
  mediaType: "image" | "video";
  /** CSS object-fit — contain by default; cover only when approved. */
  objectFit: "contain" | "cover";
  focalPosition?: string;
};

function toRecord(
  destination: EstateExploreDestination,
  order: number,
): WanderEstateImageRecord {
  const enabled =
    destination.isAvailable &&
    destination.imageReady &&
    Boolean(destination.imagePath);
  return {
    id: destination.id,
    destinationId: destination.destinationId,
    title: destination.name,
    imageSrc: destination.imagePath,
    alt: `${destination.name}. ${destination.description}`.trim(),
    description: destination.description,
    order,
    enabled,
    mediaType: destination.mediaType,
    objectFit: "contain",
    focalPosition: destination.focalPosition,
  };
}

/** Full registry in approved Explore order (includes disabled for audits). */
export function getWanderEstateImageRegistry(): WanderEstateImageRecord[] {
  return getExploreEstateDestinations().map((d, index) => toRecord(d, index));
}

/** Enabled tour list — Previous / Next walk this sequence only. */
export function getWanderEstateTourImages(): WanderEstateImageRecord[] {
  return getWanderEstateImageRegistry().filter((r) => r.enabled);
}

export function getWanderEstateImageById(
  id: string,
): WanderEstateImageRecord | null {
  return getWanderEstateImageRegistry().find((r) => r.id === id) ?? null;
}

export function getWanderTourIndex(imageId: string): number {
  return getWanderEstateTourImages().findIndex((r) => r.id === imageId);
}

export function getAdjacentWanderImages(imageId: string): {
  previous: WanderEstateImageRecord | null;
  next: WanderEstateImageRecord | null;
  index: number;
  total: number;
} {
  const tour = getWanderEstateTourImages();
  const index = tour.findIndex((r) => r.id === imageId);
  if (index < 0) {
    return { previous: null, next: null, index: -1, total: tour.length };
  }
  return {
    previous: index > 0 ? tour[index - 1]! : null,
    next: index < tour.length - 1 ? tour[index + 1]! : null,
    index,
    total: tour.length,
  };
}

/** Prefetch helpers — browser Image cache, no UI. */
export function prefetchWanderImageSrc(src: string | null | undefined): void {
  if (!src || typeof window === "undefined") return;
  const img = new window.Image();
  img.src = src;
}

export function prefetchAdjacentWanderImages(imageId: string): void {
  const { previous, next } = getAdjacentWanderImages(imageId);
  prefetchWanderImageSrc(previous?.imageSrc);
  prefetchWanderImageSrc(next?.imageSrc);
}
