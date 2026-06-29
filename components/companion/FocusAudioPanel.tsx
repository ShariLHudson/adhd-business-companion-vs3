"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addMyAudioLink,
  deleteAudioLink,
  getAudioLinks,
  myAudioLinks,
  rememberAudioSelection,
  updateAudioLink,
  type AudioLink,
} from "@/lib/audioPlaylists";
import type { EmotionalState } from "@/lib/companionEmotions";
import { FocusAudioPlayerModal } from "@/components/companion/FocusAudioPlayerModal";
import { PeacefulPlaceSession } from "@/components/companion/PeacefulPlaceSession";
import { HangingDestinationMenu } from "@/components/companion/peacefulPlaces/HangingDestinationMenu";
import { MyPeacefulPlacesWorkspace } from "@/components/companion/peacefulPlaces/MyPeacefulPlacesWorkspace";
import { PathwayEstateSignposts } from "@/components/companion/peacefulPlaces/PathwayEstateSignposts";
import { PathwayPhotoSignsLayer } from "@/components/companion/peacefulPlaces/PathwayPhotoSignsLayer";
import { PeacefulPlaceWebFrame } from "@/components/companion/peacefulPlaces/PeacefulPlaceWebFrame";
import { PeacefulPlacesLandingShell } from "@/components/companion/peacefulPlaces/PeacefulPlacesLandingShell";
import { PeacefulPlacesSignpostPortal } from "@/components/companion/peacefulPlaces/PeacefulPlacesSignpostPortal";
import {
  enterPeacefulPlace,
  peacefulPlaceDestinationFromSoundscape,
  type PeacefulPlaceDestination,
} from "@/lib/peacefulPlaces";
import { gardenBannerMenuFor } from "@/lib/peacefulPlaces/gardenBannerMenu";
import {
  crossfadeGardenFlagAmbience,
  stopGardenFlagAmbience,
} from "@/lib/peacefulPlaces/gardenFlagAmbience";
import {
  delayMs,
  gardenFlagHoverSide,
  GARDEN_PATH_FADE_MS,
  GARDEN_PATH_WALK_MS,
} from "@/lib/peacefulPlaces/gardenFlagPresence";
import { resolveInAppAudioPlayback } from "@/lib/focusAudio/inAppAudioPlayback";
import type { EstateSignId } from "@/lib/peacefulPlaces/signpostLayout";
import type { AppSection } from "@/lib/companionUi";
import {
  resolveSoundscapeScrollTarget,
  soundscapeById,
  soundscapePlaybackFrom,
  type Soundscape,
  type SoundscapePlayback,
} from "@/lib/soundscapes";

function isLikelyAudioUrl(url: string): boolean {
  return /\.(mp3|wav|ogg|m4a|aac|flac|webm)(\?|$)/i.test(url) || /^data:audio\//i.test(url);
}

export function FocusAudioPanel({
  onDone,
  backLabel = "Return to Companion",
  initialCategory,
  arrivalActive = false,
  onArrivalComplete,
  onLaunchActivity,
  onLaunchSection,
}: {
  onDone?: () => void;
  backLabel?: string;
  emotion?: EmotionalState;
  initialCategory?: string;
  arrivalActive?: boolean;
  onArrivalComplete?: () => void;
  onLaunchActivity?: (activityId: string) => void;
  onLaunchSection?: (section: AppSection) => void;
}) {
  const scrollTarget = resolveSoundscapeScrollTarget(initialCategory);
  const sceneRef = useRef<HTMLDivElement>(null);
  const signpostsRef = useRef<HTMLDivElement>(null);
  const [openSign, setOpenSign] = useState<EstateSignId | null>(() =>
    scrollTarget !== "top" ? scrollTarget : null,
  );
  const [hoveredSign, setHoveredSign] = useState<EstateSignId | null>(null);
  const [selectedSign, setSelectedSign] = useState<EstateSignId | null>(null);
  const [pathWalking, setPathWalking] = useState(false);
  const [pathDeparting, setPathDeparting] = useState(false);
  const [links, setLinks] = useState<AudioLink[]>([]);
  const [player, setPlayer] = useState<SoundscapePlayback | null>(null);
  const [activeDestination, setActiveDestination] =
    useState<PeacefulPlaceDestination | null>(null);
  const [webPlace, setWebPlace] = useState<AudioLink | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [myName, setMyName] = useState("");
  const [myUrl, setMyUrl] = useState("");
  const [myNote, setMyNote] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingMyPlace, setSavingMyPlace] = useState(false);
  const [myPlacesWorkspaceOpen, setMyPlacesWorkspaceOpen] = useState(false);
  const menuPinnedRef = useRef(false);
  const closeMenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(() => setLinks(getAudioLinks()), []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    return () => {
      if (closeMenuTimerRef.current) clearTimeout(closeMenuTimerRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      void stopGardenFlagAmbience();
    };
  }, []);

  useEffect(() => {
    if (scrollTarget === "top") return;
    setOpenSign(scrollTarget);
  }, [scrollTarget]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (myPlacesWorkspaceOpen) {
        closeMyPlacesWorkspace();
        return;
      }
      setOpenSign(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [myPlacesWorkspaceOpen]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (sceneRef.current?.contains(target) || signpostsRef.current?.contains(target)) {
        return;
      }
      if (
        target instanceof Element &&
        target.closest(
          "[data-peaceful-places-signpost-portal], [data-garden-banner-dropdown], .hanging-estate-sign__plaque, .hanging-estate-sign__dropdown, .hanging-destination-menu__sign-board, .my-peaceful-places-workspace",
        )
      ) {
        return;
      }
      if (openSign !== "my-places" || !myPlacesWorkspaceOpen) {
        setOpenSign(null);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [openSign, myPlacesWorkspaceOpen]);

  const savedPlaces = useMemo(() => myAudioLinks(links), [links]);

  function resetMyPlacesForm() {
    setEditingId(null);
    setMyName("");
    setMyUrl("");
    setMyNote("");
    setSaveError(null);
    setSavingMyPlace(false);
  }

  function closeMyPlacesWorkspace() {
    setMyPlacesWorkspaceOpen(false);
    setOpenSign(null);
    resetMyPlacesForm();
  }

  function openMyPlacesWorkspace(mode: "add" | "saved" | "manage") {
    if (mode === "add") {
      resetMyPlacesForm();
    } else {
      setSaveError(null);
    }
    setMyPlacesWorkspaceOpen(true);
    setOpenSign(null);
  }

  function clearCloseMenuTimer() {
    if (closeMenuTimerRef.current) {
      clearTimeout(closeMenuTimerRef.current);
      closeMenuTimerRef.current = null;
    }
  }

  function scheduleCloseMenu() {
    clearCloseMenuTimer();
    closeMenuTimerRef.current = setTimeout(() => {
      if (!menuPinnedRef.current) {
        setOpenSign(null);
      }
    }, 420);
  }

  function handleMenuPointerEnter() {
    menuPinnedRef.current = true;
    clearCloseMenuTimer();
  }

  function handleMenuPointerLeave() {
    menuPinnedRef.current = false;
    scheduleCloseMenu();
  }

  function toggleSign(signId: EstateSignId) {
    clearCloseMenuTimer();
    if (openSign === signId) {
      setOpenSign(null);
      if (signId === "my-places") {
        setMyPlacesWorkspaceOpen(false);
        resetMyPlacesForm();
      }
      return;
    }
    setOpenSign(signId);
    if (signId !== "my-places") {
      resetMyPlacesForm();
      setMyPlacesWorkspaceOpen(false);
    } else {
      setSaveError(null);
    }
  }

  function handleEnterPeacefulPlace(destination: PeacefulPlaceDestination) {
    void stopGardenFlagAmbience();
    enterPeacefulPlace(destination);
    setActiveDestination(destination);
    setPlayer(null);
    setWebPlace(null);
    setOpenSign(null);
    setSelectedSign(null);
    setPathWalking(false);
    setPathDeparting(false);
  }

  async function enterWithGardenWalk(signId: EstateSignId, enter: () => void) {
    setSelectedSign(signId);
    setPathWalking(true);
    await delayMs(GARDEN_PATH_WALK_MS);
    setPathDeparting(true);
    await delayMs(GARDEN_PATH_FADE_MS);
    enter();
  }

  function handleHoverSign(signId: EstateSignId | null) {
    setHoveredSign(signId);
    void crossfadeGardenFlagAmbience(signId);
    clearCloseMenuTimer();
    if (signId) {
      setOpenSign(signId);
      return;
    }
    if (!menuPinnedRef.current) {
      scheduleCloseMenu();
    }
  }

  function enterSoundscape(soundscape: Soundscape) {
    void stopGardenFlagAmbience();
    const destination = peacefulPlaceDestinationFromSoundscape(soundscape);
    if (destination) {
      handleEnterPeacefulPlace(destination);
      return;
    }
    setActiveDestination(null);
    setWebPlace(null);
    setPlayer(soundscapePlaybackFrom(soundscape));
    rememberAudioSelection("focus-audio", soundscape.mood, soundscape.id);
    void import("@/lib/ecosystem/eventTrackingEngine").then(({ trackEcosystemEvent }) => {
      trackEcosystemEvent({
        eventType: "feature.focus_audio_started",
        feature: "focus-audio",
        metadata: {
          categoryId: soundscape.mood,
          trackId: soundscape.id,
          playback: "in-app",
          soundscape: true,
          peacefulPlace: false,
          peacefulPlacesDirectory: true,
          estateSignpost: true,
        },
      });
    });
    setOpenSign(null);
  }

  function openSavedPlace(link: AudioLink) {
    setActiveDestination(null);
    setOpenSign(null);
    rememberAudioSelection("focus-audio", link.category ?? "other", link.id);

    const inApp = resolveInAppAudioPlayback(link);
    if (inApp || isLikelyAudioUrl(link.url)) {
      setWebPlace(null);
      setPlayer({
        id: link.id,
        label: link.name,
        description: link.note?.trim() || link.name,
        environment: "My Peaceful Places",
        playbackUrl: link.url,
      });
      return;
    }

    setPlayer(null);
    setWebPlace(link);
  }

  function saveCustomPlace() {
    const name = myName.trim();
    const url = myUrl.trim();
    const note = myNote.trim();
    if (!name || !url) return;

    setSavingMyPlace(true);
    setSaveError(null);

    try {
      const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      if (editingId) {
        updateAudioLink(editingId, {
          name,
          url: normalizedUrl,
          category: "other",
          note,
        });
        setEditingId(null);
      } else {
        addMyAudioLink(name, normalizedUrl, "other", note);
      }
      resetMyPlacesForm();
      refresh();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save that place.");
      setSavingMyPlace(false);
    }
  }

  function startEditPlace(place: AudioLink) {
    setEditingId(place.id);
    setMyName(place.name);
    setMyUrl(place.url);
    setMyNote(place.note ?? "");
    setSaveError(null);
  }

  function deletePlace(place: AudioLink) {
    deleteAudioLink(place.id);
    if (editingId === place.id) resetMyPlacesForm();
    refresh();
  }

  function renderDestinationMenu(moodId: EstateSignId) {
    const menuItems = gardenBannerMenuFor(moodId);
    return (
      <HangingDestinationMenu
        items={menuItems.map((item) => ({
          id: item.id,
          name: item.label,
        }))}
        onSelect={(id) => {
          const item = menuItems.find((entry) => entry.id === id);
          if (!item) return;

          if (item.kind === "my-places" && item.myPlacesAction) {
            openMyPlacesWorkspace(item.myPlacesAction);
            return;
          }

          if (item.kind === "activity" && item.activityId) {
            void enterWithGardenWalk(moodId, () => {
              setOpenSign(null);
              setSelectedSign(null);
              setPathWalking(false);
              setPathDeparting(false);
              onLaunchActivity?.(item.activityId!);
            });
            return;
          }

          if (item.kind === "section" && item.section) {
            void enterWithGardenWalk(moodId, () => {
              setOpenSign(null);
              setSelectedSign(null);
              setPathWalking(false);
              setPathDeparting(false);
              onLaunchSection?.(item.section!);
            });
            return;
          }

          if (item.kind === "soundscape" && item.soundscapeId) {
            const soundscape = soundscapeById(item.soundscapeId);
            if (!soundscape) return;
            void enterWithGardenWalk(moodId, () => enterSoundscape(soundscape));
          }
        }}
      />
    );
  }

  const signpostLayer = (
    <PeacefulPlacesSignpostPortal>
      {openSign && !myPlacesWorkspaceOpen ? (
        <button
          type="button"
          className="peaceful-places-pathway-scene__backdrop peaceful-places-pathway-scene__backdrop--open"
          aria-label="Close open signs"
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenSign(null);
          }}
        />
      ) : null}
      <PathwayPhotoSignsLayer ref={signpostsRef}>
        <PathwayEstateSignposts
          openSign={openSign}
          hoveredSign={hoveredSign}
          selectedSign={selectedSign}
          onHoverSign={handleHoverSign}
          onToggleSign={toggleSign}
          onMenuPointerEnter={handleMenuPointerEnter}
          onMenuPointerLeave={handleMenuPointerLeave}
          renderDestinationMenu={renderDestinationMenu}
        />
      </PathwayPhotoSignsLayer>
    </PeacefulPlacesSignpostPortal>
  );

  return (
    <>
      {!activeDestination ? (
        <PeacefulPlacesLandingShell
          bakedInTitle
          maskBakedSigns
          arrivalActive={arrivalActive}
          onArrivalComplete={onArrivalComplete}
          flagHover={hoveredSign}
          flagHoverSide={gardenFlagHoverSide(hoveredSign)}
          pathWalking={pathWalking}
          pathDeparting={pathDeparting}
        >
          <div
            className="peaceful-places-pathway-scene peaceful-places-pathway-scene--photo-signs"
            data-sign-open={openSign ?? undefined}
          >
            {signpostLayer}
            <div ref={sceneRef} className="peaceful-places-pathway-scene__chrome">
              {onDone ? (
                <div className="peaceful-places-pathway-scene__return">
                  <button
                    type="button"
                    onClick={() => onDone()}
                    className="peaceful-places-pathway-scene__return-link"
                  >
                    <span aria-hidden="true">← </span>
                    {backLabel}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </PeacefulPlacesLandingShell>
      ) : null}

      <MyPeacefulPlacesWorkspace
        open={myPlacesWorkspaceOpen}
        savedPlaces={savedPlaces}
        placeName={myName}
        placeUrl={myUrl}
        placeNote={myNote}
        saving={savingMyPlace}
        editingId={editingId}
        error={saveError}
        onPlaceNameChange={setMyName}
        onPlaceUrlChange={setMyUrl}
        onPlaceNoteChange={setMyNote}
        onSave={saveCustomPlace}
        onCancel={closeMyPlacesWorkspace}
        onOpenPlace={openSavedPlace}
        onEditPlace={startEditPlace}
        onDeletePlace={deletePlace}
      />

      <FocusAudioPlayerModal playback={player} onClose={() => setPlayer(null)} />

      {webPlace ? (
        <PeacefulPlaceWebFrame
          title={webPlace.name}
          url={webPlace.url}
          onClose={() => setWebPlace(null)}
        />
      ) : null}

      {activeDestination ? (
        <PeacefulPlaceSession
          destination={activeDestination}
          onLeave={() => setActiveDestination(null)}
        />
      ) : null}
    </>
  );
}
