"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { WelcomeRoomTopBar } from "@/components/companion/WelcomeRoomTopBar";
import { useWelcomeAudioExperience } from "@/lib/welcomeAudio";
import {
  isWelcomeAudioSessionUnlocked,
  unlockBrowserAudioFromClick,
} from "@/lib/welcomeAudio/audioUnlock";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import {
  recordWelcomeRoomVisit,
  resolveWelcomeRoomSeason,
  setWelcomeRoomWelcomeMode,
  WELCOME_ROOM_ASSET,
  WELCOME_ROOM_LETTER,
  useWelcomeRoomArrival,
} from "@/lib/welcomeRoom";

type Props = {
  onBackToChat: () => void;
  onContinue?: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
};

/**
 * Welcome Room — full sunroom; Shari welcomes you in voice. Letter opens only via Read welcome.
 */
export function WelcomeRoomPanel({
  onBackToChat,
  onContinue,
  registerBack,
}: Props) {
  const season = useMemo(() => resolveWelcomeRoomSeason(), []);
  const [readingFocus, setReadingFocus] = useState(false);
  const [cinematicActive, setCinematicActive] = useState(true);
  const [cinematicPaused, setCinematicPaused] = useState(false);
  const letterScrollRef = useRef<HTMLDivElement>(null);
  const visitedRef = useRef(false);
  const autoStartedRef = useRef(false);
  const continueFn = onContinue ?? onBackToChat;

  const arrival = useWelcomeRoomArrival({
    frozen: readingFocus,
    walkPaused: cinematicPaused,
    skipIntro: true,
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

  const experienceLive =
    cinematicActive ||
    audioUnlocked ||
    isWelcomeAudioSessionUnlocked() ||
    voiceState === "loading" ||
    voiceState === "playing" ||
    voiceState === "paused";

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
    if (voiceState === "paused") {
      setCinematicActive(true);
    }
  }, [voiceState]);

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
    await restartExperience();
  }, [arrival, restartExperience]);

  useLayoutEffect(() => {
    if (autoStartedRef.current) return;
    autoStartedRef.current = true;
    beginListenExperience();
  }, [beginListenExperience]);

  useEffect(() => {
    preloadRoomBackground(WELCOME_ROOM_ASSET);
  }, []);

  useEffect(() => {
    if (visitedRef.current) return;
    visitedRef.current = true;
    recordWelcomeRoomVisit();
  }, []);

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
      className={`welcome-room welcome-room--masterpiece welcome-room--${arrival.phase} ${roomSettled ? "welcome-room--still-frame" : ""} ${readingFocus ? "welcome-room--reading" : "welcome-room--listening"} ${season.atmosphereClass}`}
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
          audioUnlocked={audioUnlocked || experienceLive}
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
                    transform: arrival.dolly.imageTransform,
                    transformOrigin: arrival.dolly.transformOrigin,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={WELCOME_ROOM_ASSET}
                    alt=""
                    className="welcome-room__photo"
                    style={{
                      objectPosition: arrival.dolly.objectPosition,
                      objectFit: arrival.dolly.objectFit,
                    }}
                  />
                  <div
                    className="welcome-room__ambient"
                    data-visible={experienceLive ? "" : undefined}
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
          >
            <div
              ref={letterScrollRef}
              className="welcome-room__letter-panel"
            >
              <div className="welcome-room__letter-body">
                {WELCOME_ROOM_LETTER.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.text.slice(0, 40)}
                    className={
                      paragraph.emphasis ? "welcome-room__letter-emphasis" : undefined
                    }
                  >
                    {paragraph.text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
