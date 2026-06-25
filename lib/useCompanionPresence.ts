"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ASSETS } from "@/lib/companionUi";
import {
  pickCompanionPhoto,
  pickNextCompanionPhoto,
  probeAvailableCompanionPhotos,
} from "@/lib/companionPhotoLibrary";
import {
  SHARI_IMAGE_ASSETS,
} from "@/lib/shariImageState";
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

  useEffect(() => {
    let cancelled = false;
    void probeAvailableCompanionPhotos().then((found) => {
      if (cancelled) return;
      setAvailable(found);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (input.isThinking) {
      frozenSrc.current =
        frozenSrc.current ?? resolvePresenceSrc(presence, available);
      return;
    }
    frozenSrc.current = null;
    setSrc(resolvePresenceSrc(presence, available));
  }, [presence, available, input.isThinking]);

  useEffect(() => {
    if (input.isThinking || !presence.rotate || available.length <= 1) {
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
