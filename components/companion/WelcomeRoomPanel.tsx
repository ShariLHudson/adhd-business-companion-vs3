"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { WelcomeRoomTopBar } from "@/components/companion/WelcomeRoomTopBar";
import { useWelcomeAudioExperience } from "@/lib/welcomeAudio";
import { unlockBrowserAudioFromClick } from "@/lib/welcomeAudio/audioUnlock";
import {
  recordWelcomeRoomVisit,
  resolveWelcomeRoomSeason,
  setWelcomeRoomWelcomeMode,
  WELCOME_ROOM_ASSET,
  WELCOME_ROOM_LETTER,
  WELCOME_ROOM_VOICE_CONTROLS,
  useWelcomeRoomArrival,
} from "@/lib/welcomeRoom";

type Props = {
  onBackToChat: () => void;
  onContinue?: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
};

/**
 * Welcome Room — full sunroom; letter only on request, narrow rail on the right.
 */
export function WelcomeRoomPanel({
  onBackToChat,
  onContinue,
  registerBack,
}: Props) {
  const season = useMemo(() => resolveWelcomeRoomSeason(), []);
  const [readingFocus, setReadingFocus] = useState(false);
  const [cinematicActive, setCinematicActive] = useState(false);
  const [cinematicPaused, setCinematicPaused] = useState(false);
  const letterScrollRef = useRef<HTMLDivElement>(null);
  const visitedRef = useRef(false);
  const continueFn = onContinue ?? onBackToChat;

  const arrival = useWelcomeRoomArrival({
    frozen: readingFocus,
    cinematicActive: cinematicActive && !readingFocus,
    cinematicPaused,
  });

  const {
    musicMuted,
    voiceMuted,
    ambienceAvailable,
    audioUnlocked,
    toggleMusic,
    toggleVoice,
    voiceState,
    progress,
    playExperience,
    pauseExperience,
    stopExperience,
    restartExperience,
  } = useWelcomeAudioExperience({
    profileId: "welcome-room",
    active: true,
    immersive: !readingFocus,
    paused: readingFocus || cinematicPaused,
  });

  const needsAudioUnlock = !readingFocus && !audioUnlocked;

  const beginListenExperience = useCallback(() => {
    unlockBrowserAudioFromClick();
    setReadingFocus(false);
    setWelcomeRoomWelcomeMode("immersive");
    setCinematicActive(true);
    setCinematicPaused(false);
    void playExperience();
  }, [playExperience]);

  const openRead = useCallback(() => {
    pauseExperience();
    setCinematicPaused(true);
    setReadingFocus(true);
    setWelcomeRoomWelcomeMode("read");
    letterScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [pauseExperience]);

  const closeRead = useCallback(() => {
    setReadingFocus(false);
    setWelcomeRoomWelcomeMode("immersive");
    setCinematicPaused(false);
  }, []);

  const openListen = useCallback(() => {
    beginListenExperience();
  }, [beginListenExperience]);

  const handlePlay = useCallback(() => {
    beginListenExperience();
  }, [beginListenExperience]);

  const handlePause = useCallback(() => {
    setCinematicPaused(true);
    pauseExperience();
  }, [pauseExperience]);

  const handleStop = useCallback(async () => {
    setCinematicActive(false);
    setCinematicPaused(false);
    arrival.resetCinematic();
    await stopExperience();
  }, [arrival, stopExperience]);

  const handleRestart = useCallback(async () => {
    arrival.resetCinematic();
    setReadingFocus(false);
    setWelcomeRoomWelcomeMode("immersive");
    setCinematicActive(true);
    setCinematicPaused(false);
    unlockBrowserAudioFromClick();
    await restartExperience();
  }, [arrival, restartExperience]);

  const handleStepInside = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      beginListenExperience();
    },
    [beginListenExperience],
  );

  useEffect(() => {
    if (visitedRef.current) return;
    visitedRef.current = true;
    recordWelcomeRoomVisit();
  }, []);

  useEffect(() => {
    if (readingFocus || audioUnlocked) return;
    if (voiceState === "playing" || voiceState === "paused") {
      setCinematicActive(true);
    }
  }, [audioUnlocked, readingFocus, voiceState]);

  useEffect(() => {
    registerBack?.(() => {
      onBackToChat();
      return true;
    });
    return () => registerBack?.(null);
  }, [registerBack, onBackToChat]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const roomSettled = arrival.walkComplete || arrival.phase === "settled";

  return (
    <div
      className={`welcome-room welcome-room--masterpiece welcome-room--${arrival.phase} ${roomSettled ? "welcome-room--still-frame" : ""} ${readingFocus ? "welcome-room--reading" : "welcome-room--listening"} ${needsAudioUnlock ? "welcome-room--invite" : ""} ${season.atmosphereClass}`}
      data-testid="welcome-room-panel"
      data-arrival={arrival.phase}
      data-mode={readingFocus ? "read" : "listen"}
      data-season={season.season}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome Room"
    >
      <div className="welcome-room__stage">
        <WelcomeRoomTopBar
          onGoToChat={onBackToChat}
          onContinue={continueFn}
          onOpenRead={openRead}
          onOpenListen={openListen}
          onCloseRead={closeRead}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
          onRestart={handleRestart}
          voiceState={voiceState}
          progress={progress}
          musicMuted={musicMuted}
          voiceMuted={voiceMuted}
          ambienceAvailable={ambienceAvailable}
          onToggleMusic={toggleMusic}
          onToggleVoice={toggleVoice}
          readingFocus={readingFocus}
          audioUnlocked={audioUnlocked}
        />

        <div
          className="welcome-room__viewport"
          style={{ opacity: arrival.fadeOpacity }}
        >
          <div className="welcome-room__dolly-rig">
            <div
              className="welcome-room__dolly-stage"
              style={{ transform: `translateZ(${arrival.dolly.translateZ}px)` }}
            >
              <div className="welcome-room__hero">
                <div
                  className="welcome-room__photo-plane"
                  style={{
                    transform: `scale(${arrival.dolly.photoScale})`,
                    transformOrigin: "50% 40%",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={WELCOME_ROOM_ASSET}
                    alt=""
                    className="welcome-room__photo"
                    style={{ objectPosition: arrival.dolly.objectPosition }}
                  />
                  <div
                    className="welcome-room__ambient"
                    data-visible=""
                    aria-hidden="true"
                  >
                    <div className="welcome-room__sunlight" />
                    <div className="welcome-room__tree-shadow" />
                    <div className="welcome-room__branches" />
                    <div className="welcome-room__curtains" />
                    <div className="welcome-room__foliage" />
                    <div className="welcome-room__dust" />
                    <div className="welcome-room__kinsey" aria-hidden="true">
                      <span className="welcome-room__kinsey-ear" />
                      <span className="welcome-room__kinsey-tail" />
                    </div>
                    <div className="welcome-room__iced-tea" />
                    <div className="welcome-room__butterfly" />
                    <div className="welcome-room__lamplight" />
                  </div>
                  <div className="welcome-room__vignette" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="welcome-room__dark-curtain"
          style={{ opacity: arrival.darkOpacity }}
          aria-hidden={arrival.darkOpacity <= 0}
        />

        {readingFocus ? (
          <div
            className="welcome-room__letter-scrim"
            role="presentation"
            onClick={closeRead}
            aria-hidden="true"
          />
        ) : null}

        {readingFocus ? (
          <div
            className="welcome-room__letter-shell"
            aria-label="Welcome letter"
            data-testid="welcome-room-letter-rail"
          >
            <div
              ref={letterScrollRef}
              className="welcome-room__letter-panel"
              data-testid="welcome-room-letter"
            >
              <div className="welcome-room__letter-body">
                {WELCOME_ROOM_LETTER.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {needsAudioUnlock ? (
          <button
            type="button"
            className="welcome-room__audio-unlock"
            onClick={handleStepInside}
            onPointerDown={handleStepInside}
            data-testid="welcome-room-enter"
            aria-label={WELCOME_ROOM_VOICE_CONTROLS.stepInside}
          >
            <span className="welcome-room__enter-label">
              {WELCOME_ROOM_VOICE_CONTROLS.stepInside}
            </span>
            <span className="welcome-room__enter-hint">
              {WELCOME_ROOM_VOICE_CONTROLS.stepInsideHint}
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
