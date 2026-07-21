"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { CompanionLoginBackground } from "@/components/companion/CompanionLoginBackground";
import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";
import { SparkLoadingState } from "@/components/companion/SparkThinkingFlame";
import { isCompanionAuthBypassed } from "@/lib/companionAuthBypass";
import {
  isEstateSilenced,
  isWelcomeGreetingAudioEnabled,
} from "@/lib/estate/estateAudioSettings";
import { stopAllEstateEnvironmentalAudio } from "@/lib/estate/estateEnvironmentalAudio";
import {
  FIRST_LOGIN_HOW_THIS_WORKS,
  FIRST_LOGIN_WELCOME_MESSAGE,
  FIRST_LOGIN_WELCOME_PRIMARY,
  FIRST_LOGIN_WELCOME_SECONDARY,
  FIRST_LOGIN_WELCOME_SKIP_AUDIO,
  FIRST_LOGIN_WELCOME_STOP,
  FIRST_LOGIN_WELCOME_TITLE,
  isWelcomeCompleted,
  loadFirstLoginWelcomeRecord,
  markWelcomeAudioPlayed,
  markWelcomeCompleted,
  type FirstLoginWelcomeState,
} from "@/lib/firstLoginWelcome";
import { unlockBrowserAudioFromClick } from "@/lib/welcomeAudio/audioUnlock";
import {
  destroyWelcomeHomeAudioManager,
  useWelcomeAudioExperience,
} from "@/lib/welcomeAudio";
import { prefersReducedMotion } from "@/lib/welcomeRoom/arrival";

type Props = {
  children: ReactNode;
};

/**
 * After auth, gate Estate behind a one-time Shari welcome with controllable audio.
 * Plays only for a brand-new account’s first visit — never on later logins.
 */
export function FirstLoginWelcomeGate({ children }: Props) {
  if (isCompanionAuthBypassed()) {
    return <>{children}</>;
  }
  return <FirstLoginWelcomeGateInner>{children}</FirstLoginWelcomeGateInner>;
}

function FirstLoginWelcomeGateInner({ children }: Props) {
  const { user, sessionChecked, loading } = useCompanionAuth();
  const userId = user?.id ?? null;
  const [phase, setPhase] = useState<FirstLoginWelcomeState>("checking");
  const [showHow, setShowHow] = useState(false);
  const audioMarkedRef = useRef(false);
  const autoplayAttemptedRef = useRef(false);
  const titleId = useId();

  const welcomeRequired =
    phase === "ready" ||
    phase === "audio_blocked" ||
    phase === "playing" ||
    phase === "muted" ||
    phase === "stopped";

  const {
    voiceState,
    playExperience,
    stopExperience,
    voiceMuted,
    toggleVoice,
    audioUnlocked,
  } = useWelcomeAudioExperience({
    profileId: "welcome-home",
    enabled: welcomeRequired,
    active: welcomeRequired,
    immersive: welcomeRequired,
    // Do not read `voiceMuted` here — it comes from this same destructure (TDZ crash).
    paused: !welcomeRequired || phase === "stopped" || phase === "muted",
  });

  const metadataCompletedAt =
    typeof user?.user_metadata?.welcome_completed_at === "string"
      ? user.user_metadata.welcome_completed_at
      : null;

  useEffect(() => {
    if (!sessionChecked || loading) return;
    if (!userId) {
      setPhase("checking");
      return;
    }

    let cancelled = false;
    // Do not flash the welcome shell when we already know this account is done.
    setPhase((prev) =>
      prev === "not_required" || prev === "completed" ? prev : "checking",
    );
    void (async () => {
      try {
        const record = await loadFirstLoginWelcomeRecord(
          userId,
          user?.user_metadata as Record<string, unknown> | undefined,
          { accountCreatedAt: user?.created_at ?? null },
        );
        if (cancelled) return;

        // Already finished once — never show or play again.
        if (isWelcomeCompleted(record)) {
          setPhase("not_required");
          return;
        }

        // Heard or stopped once but left before Continue — finish quietly
        // so subsequent logins never re-open this welcome.
        if (record.welcomeAudioPlayedAt) {
          await markWelcomeCompleted(userId);
          if (!cancelled) setPhase("not_required");
          return;
        }

        setPhase("ready");
      } catch {
        // Never block Estate behind a welcome-record failure.
        if (!cancelled) setPhase("not_required");
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally omit full user_metadata object — only completion timestamp.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- userId + metadataCompletedAt gate reloads
  }, [sessionChecked, loading, userId, metadataCompletedAt]);

  const markAudioOnce = useCallback(async () => {
    if (!userId || audioMarkedRef.current) return;
    audioMarkedRef.current = true;
    await markWelcomeAudioPlayed(userId);
  }, [userId]);

  useEffect(() => {
    if (voiceState === "playing") {
      setPhase((prev) => (prev === "muted" ? "muted" : "playing"));
      void markAudioOnce();
    }
  }, [voiceState, markAudioOnce]);

  useEffect(() => {
    if (!welcomeRequired) return;
    stopAllEstateEnvironmentalAudio();
    return () => {
      destroyWelcomeHomeAudioManager();
    };
  }, [welcomeRequired]);

  useEffect(() => {
    if (phase !== "ready") return;
    if (autoplayAttemptedRef.current) return;
    autoplayAttemptedRef.current = true;

    if (
      isEstateSilenced() ||
      !isWelcomeGreetingAudioEnabled() ||
      prefersReducedMotion()
    ) {
      setPhase("audio_blocked");
      return;
    }

    let cancelled = false;
    void (async () => {
      const record = userId
        ? await loadFirstLoginWelcomeRecord(userId)
        : null;
      if (cancelled) return;
      // Never autoplay if this account already started welcome once.
      if (record?.welcomeAudioPlayedAt || record?.welcomeCompletedAt) {
        setPhase("audio_blocked");
        return;
      }
      unlockBrowserAudioFromClick();
      const started = await playExperience();
      if (cancelled) return;
      if (started) {
        setPhase("playing");
        void markAudioOnce();
      } else {
        setPhase("audio_blocked");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [phase, playExperience, markAudioOnce, userId]);

  const handlePlay = useCallback(async () => {
    if (!isWelcomeGreetingAudioEnabled()) {
      setPhase("audio_blocked");
      return;
    }
    unlockBrowserAudioFromClick();
    if (voiceMuted) toggleVoice();
    const started = await playExperience();
    if (started) {
      setPhase("playing");
      void markAudioOnce();
    } else {
      setPhase("audio_blocked");
    }
  }, [playExperience, voiceMuted, toggleVoice, markAudioOnce]);

  const finishWelcome = useCallback(
    async (skipped: boolean) => {
      if (!userId) return;
      void stopExperience();
      destroyWelcomeHomeAudioManager();
      await markWelcomeCompleted(userId, {
        skipped,
        platformVersion:
          process.env.NEXT_PUBLIC_APP_VERSION?.trim() ||
          process.env.npm_package_version?.trim() ||
          "0.1.0",
      });
      setPhase("completed");
    },
    [userId, stopExperience],
  );

  const handleEnter = useCallback(async () => {
    await finishWelcome(false);
  }, [finishWelcome]);

  /** Stop the recording and go straight to Welcome Home — one-time welcome ends. */
  const handleStopAndContinue = useCallback(async () => {
    void markAudioOnce();
    await finishWelcome(true);
  }, [markAudioOnce, finishWelcome]);

  /** Skip listening entirely — still ends the one-time welcome for this account. */
  const handleContinueWithoutAudio = useCallback(async () => {
    void stopExperience();
    void markAudioOnce();
    await finishWelcome(true);
  }, [stopExperience, markAudioOnce, finishWelcome]);

  const handleMute = useCallback(() => {
    const nextMuted = !voiceMuted;
    toggleVoice();
    setPhase(
      nextMuted ? "muted" : voiceState === "playing" ? "playing" : "ready",
    );
  }, [voiceMuted, toggleVoice, voiceState]);

  if (!sessionChecked || loading || phase === "checking") {
    return <SparkLoadingState fullPage message="Loading your space…" size="lg" />;
  }

  if (phase === "not_required" || phase === "completed" || phase === "error") {
    return <>{children}</>;
  }

  const greetingAudioAllowed = isWelcomeGreetingAudioEnabled();
  const showPlay =
    greetingAudioAllowed &&
    (phase === "audio_blocked" ||
      phase === "stopped" ||
      phase === "ready" ||
      (!audioUnlocked && voiceState !== "playing" && voiceState !== "loading"));

  return (
    <main
      className="companion-login-page companion-login-page--welcome-bg relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8"
      data-testid="first-login-welcome"
      data-welcome-state={phase}
      aria-labelledby={titleId}
    >
      <CompanionLoginBackground />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/45 bg-[#faf7f2]/92 px-6 py-7 shadow-sm backdrop-blur-md sm:px-8 sm:py-8">
        <h1
          id={titleId}
          className="text-center text-2xl font-bold tracking-tight text-[#2f261f] sm:text-3xl"
        >
          {FIRST_LOGIN_WELCOME_TITLE}
        </h1>

        <p
          className="mt-5 whitespace-pre-line text-center text-lg leading-relaxed text-[#3d342c] sm:text-xl"
          data-testid="first-login-welcome-transcript"
        >
          {FIRST_LOGIN_WELCOME_MESSAGE}
        </p>

        <div
          className="mt-6 flex flex-wrap items-center justify-center gap-2"
          role="group"
          aria-label="Welcome audio controls"
        >
          {showPlay ? (
            <button
              type="button"
              onClick={() => void handlePlay()}
              className="rounded-xl border border-[#1e4f4f]/35 bg-white/90 px-4 py-2.5 text-base font-semibold text-[#1e4f4f]"
              data-testid="first-login-play-welcome"
            >
              Play Welcome
            </button>
          ) : null}
          {greetingAudioAllowed &&
          (phase === "playing" || phase === "muted") ? (
            <button
              type="button"
              onClick={() => void handleStopAndContinue()}
              className="rounded-xl border border-[#1e4f4f]/40 bg-[#1e4f4f]/10 px-4 py-2.5 text-base font-semibold text-[#1e4f4f]"
              data-testid="first-login-stop-welcome"
            >
              {FIRST_LOGIN_WELCOME_STOP}
            </button>
          ) : null}
          {greetingAudioAllowed ? (
            <button
              type="button"
              onClick={handleMute}
              aria-pressed={voiceMuted}
              className="rounded-xl border border-[#d4cdc3] bg-white/80 px-4 py-2.5 text-base font-semibold text-[#2f261f]"
              data-testid="first-login-mute-welcome"
            >
              {voiceMuted ? "Unmute" : "Mute"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void handleContinueWithoutAudio()}
            className="rounded-xl border border-[#d4cdc3] bg-white/90 px-4 py-2.5 text-base font-semibold text-[#2f261f]"
            data-testid="first-login-skip-welcome-audio"
          >
            {FIRST_LOGIN_WELCOME_SKIP_AUDIO}
          </button>
        </div>

        <p className="sr-only" aria-live="polite">
          {phase === "playing"
            ? "Welcome audio playing"
            : phase === "muted"
              ? "Welcome audio muted"
              : phase === "stopped"
                ? "Welcome audio stopped"
                : phase === "audio_blocked"
                  ? "Play Welcome available"
                  : ""}
        </p>

        {showHow ? (
          <p className="mt-5 rounded-2xl border border-[#d4cdc3]/80 bg-white/70 px-4 py-3 text-center text-base leading-relaxed text-[#3d342c]">
            {FIRST_LOGIN_HOW_THIS_WORKS}
          </p>
        ) : null}

        <div className="mt-7 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void handleEnter()}
            className="min-h-12 w-full rounded-xl bg-[#1e4f4f] px-5 py-3.5 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-[#174040]"
            data-testid="first-login-enter-estate"
          >
            {FIRST_LOGIN_WELCOME_PRIMARY}
          </button>
          <button
            type="button"
            onClick={() => setShowHow((v) => !v)}
            className="w-full rounded-xl border border-[#c4a35a]/50 bg-[#c4a35a]/12 px-5 py-3 text-base font-semibold text-[#2f261f]"
            data-testid="first-login-how-this-works"
          >
            {FIRST_LOGIN_WELCOME_SECONDARY}
          </button>
        </div>
      </div>
    </main>
  );
}
