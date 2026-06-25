"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ASSETS } from "@/lib/companionUi";
import {
  logCompanionPresenceDebug,
  pickCompanionPhoto,
  pickNextCompanionPhoto,
  pickWorkspaceEntryPhoto,
  resolveAvailableCompanionPhotos,
} from "@/lib/companionPhotoLibrary";
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
): string {
  const dedicated = SHARI_IMAGE_ASSETS[presence.shariImageState];
  if (dedicated && dedicated !== ASSETS.profile) {
    return dedicated;
  }
  return pickCompanionPhoto(presence.photoContext, {
    available,
    preferSessionContinuity: !presence.rotate,
  });
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
    ],
  );

  const [available, setAvailable] = useState<string[]>([ASSETS.profile]);
  const [src, setSrc] = useState<string>(ASSETS.profile);
  const frozenSrc = useRef<string | null>(null);
  const workspaceEntry = input.presenceWorkspace ?? null;
  const workspaceEntryKey = input.workspaceEntryKey ?? 0;

  useEffect(() => {
    if (workspaceEntry) return;
    let cancelled = false;
    void resolveAvailableCompanionPhotos().then((found) => {
      if (!cancelled) setAvailable(found);
    });
    return () => {
      cancelled = true;
    };
  }, [workspaceEntry]);

  /** Clear My Mind™ / My Thoughts™ — rotate on each workspace entry. */
  useEffect(() => {
    if (!workspaceEntry || workspaceEntryKey <= 0) return;

    let cancelled = false;
    void resolveAvailableCompanionPhotos({ forceRefresh: true }).then(
      (found) => {
        if (cancelled) return;
        setAvailable(found);
        const pick = pickWorkspaceEntryPhoto(workspaceEntry, found);
        logCompanionPresenceDebug(workspaceEntry, found, pick);
        setSrc(pick.src);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [workspaceEntry, workspaceEntryKey]);

  /** Standard presence for home and other surfaces. */
  useEffect(() => {
    if (workspaceEntry || available.length === 0) return;
    setSrc(resolvePresenceSrc(presence, available));
  }, [workspaceEntry, presence, available]);

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
        pickNextCompanionPhoto(current, presence.photoContext, available),
      );
    }, SHARI_PHOTO_ROTATION_MS);

    return () => window.clearInterval(id);
  }, [
    input.isThinking,
    workspaceEntry,
    presence.rotate,
    presence.photoContext,
    available,
  ]);

  const resolvedSrc =
    input.isThinking && frozenSrc.current ? frozenSrc.current : src;

  return {
    ...presence,
    src: input.compact ? ASSETS.profile : resolvedSrc,
  };
}
