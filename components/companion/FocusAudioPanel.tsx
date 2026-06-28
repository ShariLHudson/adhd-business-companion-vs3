"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addMyAudioLink,
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
import { MyPlacesEstatePanel } from "@/components/companion/peacefulPlaces/MyPlacesEstatePanel";
import { PathwayPhotoSign } from "@/components/companion/peacefulPlaces/PathwayPhotoSign";
import { PathwayPhotoSignsLayer } from "@/components/companion/peacefulPlaces/PathwayPhotoSignsLayer";
import { PeacefulPlacesLandingShell } from "@/components/companion/peacefulPlaces/PeacefulPlacesLandingShell";
import { PeacefulPlacesSignpostPortal } from "@/components/companion/peacefulPlaces/PeacefulPlacesSignpostPortal";
import {
  enterPeacefulPlace,
  peacefulPlaceDisplayName,
  peacefulPlaceDestinationFromSoundscape,
  ESTATE_LEFT_SIGNS,
  ESTATE_RIGHT_SIGNS,
  PATHWAY_SIGN_ANCHORS,
  type PeacefulPlaceDestination,
} from "@/lib/peacefulPlaces";
import { readMyPlaceAudioFile } from "@/lib/peacefulPlaces/myPlaceAudioUpload";
import type { EstateSignId } from "@/lib/peacefulPlaces/signpostLayout";
import {
  resolveSoundscapeScrollTarget,
  soundscapeById,
  soundscapePlaybackFrom,
  soundscapesForMood,
  type Soundscape,
  type SoundscapePlayback,
} from "@/lib/soundscapes";

const PATHWAY_SIGNS = [...ESTATE_LEFT_SIGNS, ...ESTATE_RIGHT_SIGNS] as const;

export function FocusAudioPanel({
  onDone,
  initialCategory,
  arrivalActive = false,
  onArrivalComplete,
}: {
  onDone?: () => void;
  emotion?: EmotionalState;
  initialCategory?: string;
  arrivalActive?: boolean;
  onArrivalComplete?: () => void;
}) {
  const scrollTarget = resolveSoundscapeScrollTarget(initialCategory);
  const sceneRef = useRef<HTMLDivElement>(null);
  const signpostsRef = useRef<HTMLDivElement>(null);
  const [openSign, setOpenSign] = useState<EstateSignId | null>(() =>
    scrollTarget !== "top" ? scrollTarget : null,
  );
  const [links, setLinks] = useState<AudioLink[]>([]);
  const [player, setPlayer] = useState<SoundscapePlayback | null>(null);
  const [activeDestination, setActiveDestination] =
    useState<PeacefulPlaceDestination | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [myName, setMyName] = useState("");
  const [myUrl, setMyUrl] = useState("");
  const [myFile, setMyFile] = useState<File | null>(null);
  const [myFileName, setMyFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [savingMyPlace, setSavingMyPlace] = useState(false);

  const refresh = useCallback(() => setLinks(getAudioLinks()), []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (scrollTarget === "top") return;
    setOpenSign(scrollTarget);
  }, [scrollTarget]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenSign(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (sceneRef.current?.contains(target) || signpostsRef.current?.contains(target)) {
        return;
      }
      if (
        target instanceof Element &&
        target.closest(
          "[data-peaceful-places-signpost-portal], .pathway-photo-sign__dropdown, .pathway-photo-sign__hit, .hanging-destination-menu__item, .my-places-estate-panel",
        )
      ) {
        return;
      }
      setOpenSign(null);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const savedLinks = useMemo(() => myAudioLinks(links), [links]);

  function resetMyPlacesForm() {
    setEditingId(null);
    setMyName("");
    setMyUrl("");
    setMyFile(null);
    setMyFileName(null);
    setUploadError(null);
    setSavingMyPlace(false);
  }

  function toggleSign(signId: EstateSignId) {
    if (openSign === signId) {
      setOpenSign(null);
      if (signId === "my-places") resetMyPlacesForm();
      return;
    }
    setOpenSign(signId);
    if (signId === "my-places") {
      setUploadError(null);
    } else {
      resetMyPlacesForm();
    }
  }

  function handleEnterPeacefulPlace(destination: PeacefulPlaceDestination) {
    enterPeacefulPlace(destination);
    setActiveDestination(destination);
    setPlayer(null);
    setOpenSign(null);
  }

  function enterSoundscape(soundscape: Soundscape) {
    const destination = peacefulPlaceDestinationFromSoundscape(soundscape);
    if (destination) {
      handleEnterPeacefulPlace(destination);
      return;
    }
    setActiveDestination(null);
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

  function enterSaved(link: AudioLink) {
    setActiveDestination(null);
    setPlayer({
      id: link.id,
      label: link.name,
      description: link.name,
      environment: "Added by You",
      playbackUrl: link.url,
    });
    rememberAudioSelection("focus-audio", link.category ?? "other", link.id);
    setOpenSign(null);
  }

  async function saveCustomPlace() {
    const name = myName.trim();
    const urlInput = myUrl.trim();
    if (!name || (!urlInput && !myFile)) return;

    setSavingMyPlace(true);
    setUploadError(null);

    try {
      const url = myFile ? await readMyPlaceAudioFile(myFile) : urlInput;
      if (editingId) {
        updateAudioLink(editingId, { name, url, category: "other" });
        setEditingId(null);
      } else {
        addMyAudioLink(name, url, "other");
      }
      resetMyPlacesForm();
      refresh();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not save that audio.");
      setSavingMyPlace(false);
    }
  }

  function handleMyPlaceFileChange(file: File | null) {
    setMyFile(file);
    setMyFileName(file?.name ?? null);
    setUploadError(null);
    if (file && !myName.trim()) {
      setMyName(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim());
    }
  }

  function renderDestinationMenu(moodId: EstateSignId) {
    if (moodId === "my-places") return null;
    const items = soundscapesForMood(moodId);
    return (
      <HangingDestinationMenu
        items={items.map((soundscape) => ({
          id: soundscape.id,
          name: peacefulPlaceDisplayName(soundscape.destinationName),
        }))}
        onSelect={(id) => {
          const soundscape = soundscapeById(id);
          if (soundscape) enterSoundscape(soundscape);
        }}
      />
    );
  }

  function renderSignMenu(signId: EstateSignId) {
    if (signId === "my-places") {
      return (
        <MyPlacesEstatePanel
          savedLinks={savedLinks}
          myName={myName}
          myUrl={myUrl}
          myFileName={myFileName}
          uploadError={uploadError}
          saving={savingMyPlace}
          editingId={editingId}
          onNameChange={setMyName}
          onUrlChange={setMyUrl}
          onFileChange={handleMyPlaceFileChange}
          onSave={() => void saveCustomPlace()}
          onSelectSaved={enterSaved}
        />
      );
    }
    return renderDestinationMenu(signId);
  }

  const signpostLayer = (
    <PeacefulPlacesSignpostPortal>
      {openSign ? (
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
        {PATHWAY_SIGNS.map((sign) => (
          <PathwayPhotoSign
            key={sign.id}
            id={sign.id}
            label={sign.label}
            anchor={PATHWAY_SIGN_ANCHORS[sign.id]}
            open={openSign === sign.id}
            onToggle={() => toggleSign(sign.id)}
          >
            {renderSignMenu(sign.id)}
          </PathwayPhotoSign>
        ))}
      </PathwayPhotoSignsLayer>
    </PeacefulPlacesSignpostPortal>
  );

  return (
    <>
      {!activeDestination ? (
        <PeacefulPlacesLandingShell
          bakedInTitle
          arrivalActive={arrivalActive}
          onArrivalComplete={onArrivalComplete}
        >
          <div
            className="peaceful-places-pathway-scene peaceful-places-pathway-scene--photo-signs"
            data-sign-open={openSign ?? undefined}
          >
            {signpostLayer}
            <div ref={sceneRef} className="peaceful-places-pathway-scene__chrome">
              {onDone ? (
                <div className="peaceful-places-pathway-scene__leave">
                  <button type="button" onClick={() => onDone()} className="peaceful-places-pathway-scene__leave-btn">
                    Leave the pathway
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </PeacefulPlacesLandingShell>
      ) : null}

      <FocusAudioPlayerModal playback={player} onClose={() => setPlayer(null)} />

      {activeDestination ? (
        <PeacefulPlaceSession
          destination={activeDestination}
          onLeave={() => setActiveDestination(null)}
        />
      ) : null}
    </>
  );
}
