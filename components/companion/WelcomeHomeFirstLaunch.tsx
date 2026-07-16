"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { WelcomeHomeFrostedChatPanel } from "@/components/companion/WelcomeHomeFrostedChatPanel";
import { WelcomeHomeIntroDevPanel } from "@/components/companion/WelcomeHomeIntroDevPanel";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import { destroyWelcomeHomeAudioManager } from "@/lib/welcomeAudio";
import { markWelcomeIntroSeen } from "@/lib/welcomeHome/firstLaunchPersistence";
import { setWelcomeHomeIntroAudioBlocked } from "@/lib/welcomeHome/introAudioGuard";
import {
  WELCOME_HOME_CHAT_REVEAL_DELAY_MS,
  WELCOME_HOME_FALLBACK_DOLLY_MS,
  WELCOME_HOME_INTRO_SCREEN_READY_MS,
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
  // Spoken welcome plays only on FirstLoginWelcomeGate — never again here.
  return plan.visitorKind === "first_visit";
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

  // Silent cinematic — spoken welcome is owned by FirstLoginWelcomeGate only.
  useEffect(() => {
    destroyWelcomeHomeAudioManager();
  }, []);

  const dollyDurationMs = WELCOME_HOME_FALLBACK_DOLLY_MS;
  const walkPaused = introActive && !screenReady;

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
    if (!introPlaybackReady) return;
    if (experience.visitorKind === "first_visit") {
      markWelcomeIntroSeen();
    }
  }, [introPlaybackReady, experience.visitorKind]);

  const introBeatComplete =
    skippedIntro ||
    !firstVisitCinematic ||
    arrival.walkComplete;

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
    if (experience.visitorKind === "first_visit") {
      markWelcomeIntroSeen();
    }
    onIntroComplete();
  }, [experience.visitorKind, onIntroComplete]);

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

        {introActive ? (
          <div className="welcome-home-page__intro-controls">
            <button
              type="button"
              className="welcome-home-page__stop-btn"
              onClick={handleStopIntro}
              data-testid="welcome-home-stop-intro"
              aria-label="Skip intro and continue to Welcome Home"
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
            voiceState="off"
            audioUnlocked={false}
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
