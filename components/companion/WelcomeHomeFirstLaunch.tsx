"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { WelcomeHomeFrostedChatPanel } from "@/components/companion/WelcomeHomeFrostedChatPanel";
import { WelcomeHomeIntroDevPanel } from "@/components/companion/WelcomeHomeIntroDevPanel";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import {
  destroyWelcomeHomeAudioManager,
  useWelcomeAudioExperience,
} from "@/lib/welcomeAudio";
import { unlockBrowserAudioFromClick } from "@/lib/welcomeAudio/audioUnlock";
import {
  WELCOME_HOME_BEGIN_HINT,
  WELCOME_HOME_BEGIN_LABEL,
} from "@/lib/welcomeHome/content";
import { markWelcomeIntroSeen } from "@/lib/welcomeHome/firstLaunchPersistence";
import { setWelcomeHomeIntroAudioBlocked } from "@/lib/welcomeHome/introAudioGuard";
import { markWelcomeRoomOpenedWithGesture } from "@/lib/welcomeRoom/welcomeRoomGesture";
import {
  WELCOME_HOME_CHAT_REVEAL_DELAY_MS,
  WELCOME_HOME_FALLBACK_DOLLY_MS,
  WELCOME_HOME_INTRO_SCREEN_READY_MS,
  WELCOME_HOME_MIN_DOLLY_MS,
} from "@/lib/welcomeHome/introTiming";
import type { WelcomeHomeExperiencePlan } from "@/lib/sparkExperienceEngine";
import { prefersReducedMotion, useWelcomeRoomArrival } from "@/lib/welcomeRoom";
import { useChatBackdropRevision } from "@/lib/chatBackdrop";
import { resolveWelcomeHomeHeroImageUrl } from "@/lib/welcomeHome/resolveWelcomeHomeHeroImageUrl";
import {
  welcomeRoomCinematicDollyProgress,
  welcomeRoomDollyFrame,
  welcomeRoomWalkElapsedMs,
} from "@/lib/welcomeRoom/arrival";

type Props = {
  experience: WelcomeHomeExperiencePlan;
  onIntroComplete: () => void;
  onIntroActiveChange?: (active: boolean) => void;
  welcomeMessage: string | null;
  showWelcomeLine: boolean;
  showConversation: boolean;
  /** ARCH-018 companion decision area — rendered with the welcome line. */
  welcomeSlot?: ReactNode;
  thread: ReactNode;
  footer: ReactNode;
  conversationScrollKey?: string | number;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  registerBack?: (fn: (() => boolean) | null) => void;
};

type Phase = "intro" | "pause" | "chat";

function shouldRunFirstVisitCinematic(plan: WelcomeHomeExperiencePlan): boolean {
  if (prefersReducedMotion()) return false;
  if (!plan.showIntro) return false;
  return (
    plan.visitorKind === "first_visit" || plan.visitorKind === "replay"
  );
}

export function WelcomeHomePage({
  experience,
  onIntroComplete,
  onIntroActiveChange,
  welcomeMessage,
  showWelcomeLine,
  showConversation,
  welcomeSlot,
  thread,
  footer,
  conversationScrollKey,
  inputRef,
  registerBack,
}: Props) {
  const firstVisitCinematic = shouldRunFirstVisitCinematic(experience);

  const [phase, setPhase] = useState<Phase>(() =>
    firstVisitCinematic ? "intro" : "chat",
  );
  const [skippedIntro, setSkippedIntro] = useState(false);
  const [voiceHasPlayed, setVoiceHasPlayed] = useState(false);
  const [screenReady, setScreenReady] = useState(false);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const backdropRevision = useChatBackdropRevision();
  const heroImageUrl = useMemo(() => {
    void backdropRevision;
    return resolveWelcomeHomeHeroImageUrl();
  }, [backdropRevision]);

  const introActive = firstVisitCinematic && phase === "intro";
  const introPlaybackReady = introActive && screenReady;
  const chatVisible = phase === "chat";
  const chromeHiddenDuringWelcome =
    firstVisitCinematic && phase !== "chat";

  const {
    voiceState,
    stopExperience,
    progress,
    playExperience,
    audioUnlocked,
  } = useWelcomeAudioExperience({
    profileId: "welcome-home",
    enabled: firstVisitCinematic,
    active: introPlaybackReady,
    immersive: introPlaybackReady,
    paused: !introPlaybackReady,
  });

  const dollyDurationMs = useMemo(() => {
    if (!introPlaybackReady) return WELCOME_HOME_FALLBACK_DOLLY_MS;
    const fromVoice =
      progress.totalSeconds > 0
        ? Math.round(progress.totalSeconds * 1000)
        : WELCOME_HOME_FALLBACK_DOLLY_MS;
    return Math.max(WELCOME_HOME_MIN_DOLLY_MS, fromVoice);
  }, [introPlaybackReady, progress.totalSeconds]);

  const walkPaused =
    (introActive && !screenReady) ||
    (introPlaybackReady && !audioUnlocked && !skippedIntro) ||
    (introPlaybackReady &&
      !skippedIntro &&
      !voiceHasPlayed &&
      voiceState !== "playing" &&
      voiceState !== "loading" &&
      voiceState !== "ended");

  const arrival = useWelcomeRoomArrival({
    skipIntro: true,
    frozen: false,
    dollyDurationMs: introPlaybackReady ? dollyDurationMs : undefined,
    walkPaused: firstVisitCinematic ? walkPaused : false,
  });

  const cinematicProgress = introPlaybackReady
    ? welcomeRoomCinematicDollyProgress(
        welcomeRoomWalkElapsedMs(arrival.elapsedMs),
      )
    : 1;

  const roomDolly = firstVisitCinematic
    ? arrival.dolly
    : welcomeRoomDollyFrame(1);
  const imageScale = roomDolly.imageScale;

  useEffect(() => {
    if (!firstVisitCinematic) {
      destroyWelcomeHomeAudioManager();
    }
  }, [firstVisitCinematic]);

  useEffect(() => {
    if (!heroImageLoaded || !introActive) return;
    const timer = window.setTimeout(() => {
      setScreenReady(true);
    }, WELCOME_HOME_INTRO_SCREEN_READY_MS);
    return () => window.clearTimeout(timer);
  }, [heroImageLoaded, introActive]);

  useEffect(() => {
    onIntroActiveChange?.(chromeHiddenDuringWelcome);
    setWelcomeHomeIntroAudioBlocked(chromeHiddenDuringWelcome);
    return () => {
      onIntroActiveChange?.(false);
      setWelcomeHomeIntroAudioBlocked(false);
    };
  }, [chromeHiddenDuringWelcome, onIntroActiveChange]);

  useEffect(() => {
    if (voiceState === "playing") {
      setVoiceHasPlayed(true);
      // Persist as soon as narration starts so a refresh never re-autoplays.
      // Manual "Listen to Shari's Welcome" uses visitorKind "replay" and may play again.
      if (experience.visitorKind === "first_visit") {
        markWelcomeIntroSeen();
      }
    }
  }, [voiceState, experience.visitorKind]);

  const narrationComplete =
    skippedIntro ||
    !firstVisitCinematic ||
    (voiceHasPlayed &&
      (voiceState === "ended" || voiceState === "idle" || voiceState === "error")) ||
    (voiceState === "error" && arrival.walkComplete);

  const introBeatComplete =
    narrationComplete && (arrival.walkComplete || skippedIntro);

  useEffect(() => {
    if (phase !== "intro" || !introBeatComplete) return;
    setPhase("pause");
  }, [phase, introBeatComplete]);

  useEffect(() => {
    if (phase !== "pause") return;
    const timer = window.setTimeout(() => {
      setPhase("chat");
      onIntroComplete();
    }, WELCOME_HOME_CHAT_REVEAL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [phase, onIntroComplete]);

  useEffect(() => {
    preloadRoomBackground(heroImageUrl);
  }, [heroImageUrl]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Spark Estate";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const handleStopIntro = useCallback(() => {
    setSkippedIntro(true);
    setPhase("chat");
    void stopExperience();
    if (experience.visitorKind === "first_visit") {
      markWelcomeIntroSeen();
    }
    onIntroComplete();
  }, [experience.visitorKind, onIntroComplete, stopExperience]);

  useEffect(() => {
    registerBack?.(() => {
      if (introActive) {
        handleStopIntro();
        return true;
      }
      return false;
    });
    return () => registerBack?.(null);
  }, [registerBack, introActive, handleStopIntro]);

  const beginIntroAudio = useCallback(() => {
    unlockBrowserAudioFromClick();
    markWelcomeRoomOpenedWithGesture();
    void playExperience();
  }, [playExperience]);

  const handleIntroPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!introPlaybackReady || audioUnlocked) return;
      if (event.button !== 0) return;
      beginIntroAudio();
    },
    [introPlaybackReady, audioUnlocked, beginIntroAudio],
  );

  const showBeginWelcome =
    introPlaybackReady &&
    !audioUnlocked &&
    !skippedIntro &&
    voiceState !== "playing" &&
    voiceState !== "loading";

  useLayoutEffect(() => {
    if (!chatVisible || !inputRef) return;
    const delayMs = firstVisitCinematic ? 450 : 0;
    const timer = window.setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [chatVisible, inputRef, firstVisitCinematic]);

  const [portalReady, setPortalReady] = useState(false);

  useLayoutEffect(() => {
    setPortalReady(true);
    document.documentElement.classList.add("companion-welcome-home-mode");
    document.body.classList.add("companion-welcome-home-mode");
    return () => {
      document.documentElement.classList.remove("companion-welcome-home-mode");
      document.body.classList.remove("companion-welcome-home-mode");
    };
  }, []);

  const page = (
    <div
      className={`welcome-home-page welcome-home-page--${phase}${
        introActive ? " welcome-home-page--intro" : ""
      }`}
      data-testid="welcome-home-page"
      data-welcome-visitor={experience.visitorKind}
    >
      <div className="welcome-home-page__stage">
        <div
          className="welcome-home-page__viewport"
          style={{ opacity: arrival.fadeOpacity }}
          onPointerDown={handleIntroPointerDown}
        >
          <div className="welcome-room__dolly-rig welcome-home-page__photo-rig">
            <div className="welcome-room__dolly-stage">
              <div className="welcome-room__hero">
                <div
                  className="welcome-room__photo-plane"
                  style={{
                    transform: roomDolly.imageTransform,
                    transformOrigin: roomDolly.transformOrigin,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImageUrl}
                    alt=""
                    className="welcome-room__photo welcome-home-page__photo"
                    style={{
                      objectPosition: roomDolly.objectPosition,
                      objectFit: roomDolly.objectFit,
                    }}
                    onLoad={() => setHeroImageLoaded(true)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {arrival.darkOpacity > 0 ? (
          <div
            className="welcome-room__dark-curtain"
            style={{ opacity: arrival.darkOpacity }}
            aria-hidden="true"
          />
        ) : null}

        {showBeginWelcome ? (
          <button
            type="button"
            className="welcome-room__audio-unlock welcome-home-page__begin-welcome"
            onClick={beginIntroAudio}
            data-testid="welcome-home-begin-welcome"
          >
            <span className="welcome-room__enter-label">{WELCOME_HOME_BEGIN_LABEL}</span>
            <span className="welcome-room__enter-hint">{WELCOME_HOME_BEGIN_HINT}</span>
          </button>
        ) : null}

        {introActive ? (
          <div className="welcome-home-page__intro-controls">
            <button
              type="button"
              className="welcome-home-page__stop-btn"
              onClick={handleStopIntro}
              data-testid="welcome-home-stop-intro"
              aria-label="Stop welcome recording and continue to Welcome Home"
            >
              Stop &amp; Continue
            </button>
          </div>
        ) : null}

        {firstVisitCinematic ? (
          <WelcomeHomeIntroDevPanel
            phase={phase}
            screenReady={screenReady}
            introActive={introActive}
            voiceState={voiceState}
            audioUnlocked={audioUnlocked}
            walkPaused={walkPaused}
            cinematicProgress={cinematicProgress}
            scale={imageScale}
            visitorKind={experience.visitorKind}
          />
        ) : null}

        {chatVisible ? (
          <WelcomeHomeFrostedChatPanel
            welcomeMessage={welcomeMessage ?? undefined}
            welcomeSlot={welcomeSlot}
            showWelcomeLine={
              showWelcomeLine && Boolean(welcomeSlot ?? welcomeMessage)
            }
            showConversation={showConversation}
            thread={thread}
            footer={footer}
            conversationScrollKey={conversationScrollKey}
          />
        ) : null}
      </div>
    </div>
  );

  if (!portalReady) return page;

  return createPortal(page, document.body);
}

/** @deprecated Use WelcomeHomePage */
export const WelcomeHomeFirstLaunch = WelcomeHomePage;
