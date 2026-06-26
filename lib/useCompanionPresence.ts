"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ASSETS } from "@/lib/companionUi";
import { resolveCompanionPresenceLibraryImage } from "@/lib/companionPresenceLibrary";
import {
  logCompanionPresenceDebug,
  pickCompanionPhoto,
  pickNextCompanionPhoto,
  pickWorkspaceEntryPhoto,
} from "@/lib/companionPhotoLibrary";
import { useCompanionPhotoCatalog } from "@/lib/companionPhotoProvider";
import { companionPhotoSrcWithVersion } from "@/lib/companionPhotoCatalog";
import { SHARI_IMAGE_ASSETS } from "@/lib/shariImageState";
import { SHARI_PHOTO_ROTATION_MS } from "@/lib/shariPhotoRotation";
import {
  evaluateCompanionPresence,
  type CompanionPresenceInput,
  type CompanionPresenceResolved,
} from "@/lib/companionPresence";

function resolvePresenceSrc(
  presence: ReturnType<typeof evaluateCompanionPresence>,
  available: string[],
  presenceKey: string,
  input: CompanionPresenceInput,
): string {
  const libraryImage = resolveCompanionPresenceLibraryImage(
    input.presenceSurface,
    input.presenceImageId,
  );
  if (libraryImage) {
    return libraryImage;
  }

  const dedicated = SHARI_IMAGE_ASSETS[presence.shariImageState];
  if (dedicated && dedicated !== ASSETS.profile) {
    return dedicated;
  }
  return pickCompanionPhoto(presence.photoContext, {
    available,
    preferSessionContinuity: true,
    presenceKey,
  });
}

function buildPresenceKey(
  input: CompanionPresenceInput,
  presence: ReturnType<typeof evaluateCompanionPresence>,
): string {
  if (input.presenceSurface) {
    return `${input.presenceSurface}:${presence.shariImageState}`;
  }
  if (input.presenceWorkspace) {
    return `${input.presenceWorkspace}:${presence.shariImageState}`;
  }
  if (input.homeState) {
    return `home:${input.homeState}:${presence.shariImageState}`;
  }
  if (input.workspacePanel) {
    return `workspace:${input.workspacePanel}:${presence.shariImageState}`;
  }
  return `${presence.photoContext}:${presence.shariImageState}`;
}

/**
 * Client hook — evaluates presence, probes real photos, handles gentle rotation.
 * Never rotates while Shari is thinking.
 */
export function useCompanionPresence(
  input: CompanionPresenceInput,
): CompanionPresenceResolved {
  const presence = useMemo(
    () => evaluateCompanionPresence(input),
    [
      input.compact,
      input.calmHome,
      input.homeState,
      input.workspacePanel,
      input.workspaceActiveBeside,
      input.emotion,
      input.isThinking,
      input.userBirthday,
      input.recognitionMoment,
      input.recoveryLevel,
      input.focusMode,
      input.recognitionWin,
      input.memberSince,
      input.clearMyMindPhase,
      input.presenceSurface,
      input.presenceImageId,
    ],
  );

  const { catalog } = useCompanionPhotoCatalog();
  const available = catalog.images;
  const cacheVersion = catalog.version;

  const librarySrc = useMemo(
    () =>
      resolveCompanionPresenceLibraryImage(
        input.presenceSurface,
        input.presenceImageId,
      ),
    [input.presenceSurface, input.presenceImageId],
  );

  const [src, setSrc] = useState<string>(librarySrc ?? catalog.primarySrc);
  const frozenSrc = useRef<string | null>(null);
  const workspaceEntry = input.presenceWorkspace ?? null;
  const workspaceEntryKey = input.workspaceEntryKey ?? 0;

  const presenceKey = buildPresenceKey(input, presence);

  useEffect(() => {
    if (workspaceEntry) return;
    if (librarySrc) {
      setSrc(librarySrc);
      return;
    }
    setSrc(resolvePresenceSrc(presence, available, presenceKey, input));
  }, [workspaceEntry, presence, available, catalog.revision, presenceKey, librarySrc, input.presenceSurface, input.presenceImageId]);

  /** Clear My Mind™ / My Thoughts™ — rotate on each workspace entry. */
  useEffect(() => {
    if (!workspaceEntry || workspaceEntryKey <= 0) return;
    if (!available.length) return;

    const pick = pickWorkspaceEntryPhoto(workspaceEntry, available);
    logCompanionPresenceDebug(workspaceEntry, available, pick);
    setSrc(pick.src);
  }, [workspaceEntry, workspaceEntryKey, available, catalog.revision]);

  useEffect(() => {
    if (input.isThinking) {
      frozenSrc.current = frozenSrc.current ?? src;
      return;
    }
    frozenSrc.current = null;
  }, [input.isThinking, src]);

  useEffect(() => {
    if (
      input.isThinking ||
      workspaceEntry ||
      !presence.rotate ||
      available.length <= 1
    ) {
      return;
    }

    const id = window.setInterval(() => {
      setSrc((current) =>
        pickNextCompanionPhoto(
          current,
          presence.photoContext,
          available,
          presenceKey,
        ),
      );
    }, SHARI_PHOTO_ROTATION_MS);

    return () => window.clearInterval(id);
  }, [
    input.isThinking,
    workspaceEntry,
    presence.rotate,
    presence.photoContext,
    available,
    presenceKey,
  ]);

  const resolvedSrc =
    input.isThinking && frozenSrc.current ? frozenSrc.current : src;

  const versionedSrc = companionPhotoSrcWithVersion(resolvedSrc, cacheVersion);

  return {
    ...presence,
    src: versionedSrc,
  };
}
