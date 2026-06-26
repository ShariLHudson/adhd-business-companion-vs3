/**
 * Companion Presence Library™ — approved relationship images.
 *
 * Scenes live in sceneCatalog.ts — add files there only; no code changes elsewhere.
 */

import type { CompanionPresenceSurface } from "@/lib/companionPresence/types";
import { publicUrlFromPublicRelative } from "@/lib/shariPhotoManifest";
import {
  COMPANION_PRESENCE_SCENE_CATALOG,
  COMPANION_PRESENCE_WELCOME_IMAGE_ID,
  companionPresenceEntryById,
  type CompanionPresenceLibraryEntry,
} from "@/lib/companionPresenceLibrary/sceneCatalog";

export {
  COMPANION_PRESENCE_WELCOME_IMAGE_ID,
  companionPresenceEntryById,
  type CompanionPresenceLibraryEntry,
} from "@/lib/companionPresenceLibrary/sceneCatalog";

/** Emotional home of the ecosystem — never rotated or randomized. */
export const WELCOME_PRESENCE_GREETING = "I'm here for you.";
export const WELCOME_PRESENCE_INVITE = "What's on your mind today?";

/** Approved Companion Presence™ images (expand via scene catalog). */
export const COMPANION_PRESENCE_LIBRARY: CompanionPresenceLibraryEntry[] =
  COMPANION_PRESENCE_SCENE_CATALOG;

const WELCOME_ENTRY =
  companionPresenceEntryById(COMPANION_PRESENCE_WELCOME_IMAGE_ID) ??
  COMPANION_PRESENCE_SCENE_CATALOG[0]!;

export function companionPresenceWelcomeImageUrl(): string {
  return publicUrlFromPublicRelative(WELCOME_ENTRY.relativePath);
}

export function resolveCompanionPresenceLibraryImage(
  surface?: CompanionPresenceSurface | null,
  imageId?: string | null,
): string | null {
  if (imageId) {
    const entry = companionPresenceEntryById(imageId);
    if (entry) return publicUrlFromPublicRelative(entry.relativePath);
  }

  if (surface === "chat-welcome") {
    return companionPresenceWelcomeImageUrl();
  }

  const bySurface = COMPANION_PRESENCE_SCENE_CATALOG.find((item) =>
    item.surfaces?.includes(surface as CompanionPresenceSurface),
  );
  if (bySurface) {
    return publicUrlFromPublicRelative(bySurface.relativePath);
  }

  return null;
}
