"use client";

import {
  WELCOME_ROOM_AMBIENCE_CREDIT,
  WELCOME_ROOM_LEAVE_INVITATION,
  WELCOME_ROOM_VOICE_CONTROLS,
} from "@/lib/welcomeRoom";
import type {
  WelcomePlaybackProgress,
  WelcomeVoiceTransportState,
} from "@/lib/welcomeAudio/types";

type Props = {
  onGoToChat: () => void;
  onContinue: () => void;
  onOpenRead: () => void;
  onOpenListen: () => void;
  onCloseRead: () => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRestart: () => void;
  voiceState: WelcomeVoiceTransportState;
  progress: WelcomePlaybackProgress;
  musicMuted: boolean;
  voiceMuted: boolean;
  ambienceAvailable: boolean;
  onToggleMusic: () => void;
  onToggleVoice: () => void;
  readingFocus: boolean;
  audioUnlocked: boolean;
  roomMediaActive: boolean;
};

function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Quiet top chrome — present but never competes with the sunroom.
 */
export function WelcomeRoomTopBar({
  onGoToChat,
  onContinue,
  onOpenRead,
  onOpenListen,
  onCloseRead,
  onPlay,
  onPause,
  onStop,
  onRestart,
  voiceState,
  progress,
  musicMuted,
  voiceMuted,
  ambienceAvailable,
  onToggleMusic,
  onToggleVoice,
  readingFocus,
  audioUnlocked,
  roomMediaActive,
}: Props) {
  const isPlaying = voiceState === "playing";
  const progressPercent = Math.round(progress.ratio * 100);
  const elapsedLabel = formatAudioTime(progress.currentSeconds);
  const totalLabel =
    progress.totalSeconds > 0
      ? formatAudioTime(progress.totalSeconds)
      : "—:——";
  const inviteQuiet = false;

  return (
    <header
      className={`welcome-room__top-bar ${inviteQuiet ? "welcome-room__top-bar--invite" : ""} ${readingFocus ? "welcome-room__top-bar--reading" : ""} ${roomMediaActive ? "welcome-room__top-bar--media-active" : ""}`}
      data-testid="welcome-room-top-bar"
      aria-label="Welcome Room controls"
    >
      <div className="welcome-room__top-bar-row">
        <button
          type="button"
          className="welcome-room__top-btn welcome-room__top-btn--chat"
          onClick={onGoToChat}
          data-testid="welcome-room-go-chat"
        >
          {WELCOME_ROOM_VOICE_CONTROLS.goToChat}
        </button>

        {roomMediaActive ? (
          <button
            type="button"
            className="welcome-room__top-btn welcome-room__top-btn--stop"
            onClick={onStop}
            data-testid="welcome-room-stop"
            aria-label={WELCOME_ROOM_VOICE_CONTROLS.stopRoom}
          >
            {WELCOME_ROOM_VOICE_CONTROLS.stop}
          </button>
        ) : null}

        {readingFocus ? (
          <>
            <button
              type="button"
              className="welcome-room__top-btn welcome-room__top-btn--active"
              onClick={onOpenListen}
              data-testid="welcome-room-listen-instead"
            >
              {WELCOME_ROOM_VOICE_CONTROLS.listenInstead}
            </button>
            <button
              type="button"
              className="welcome-room__top-btn welcome-room__top-btn--quiet"
              onClick={onCloseRead}
              data-testid="welcome-room-close-read"
            >
              {WELCOME_ROOM_VOICE_CONTROLS.closeRead}
            </button>
          </>
        ) : inviteQuiet ? null : (
          <>
            <div
              className="welcome-room__top-player"
              role="group"
              aria-label="Welcome audio"
              data-testid="welcome-room-player"
            >
              <button
                type="button"
                className="welcome-room__top-btn welcome-room__top-btn--transport"
                onClick={isPlaying ? onPause : onPlay}
                disabled={voiceState === "loading"}
                aria-label={
                  isPlaying
                    ? WELCOME_ROOM_VOICE_CONTROLS.pause
                    : WELCOME_ROOM_VOICE_CONTROLS.play
                }
                data-testid="welcome-room-play-pause"
              >
                {voiceState === "loading"
                  ? WELCOME_ROOM_VOICE_CONTROLS.loading
                  : isPlaying
                    ? WELCOME_ROOM_VOICE_CONTROLS.pause
                    : WELCOME_ROOM_VOICE_CONTROLS.play}
              </button>
              <button
                type="button"
                className="welcome-room__top-btn welcome-room__top-btn--transport"
                onClick={onRestart}
                aria-label={WELCOME_ROOM_VOICE_CONTROLS.restart}
                data-testid="welcome-room-restart"
              >
                {WELCOME_ROOM_VOICE_CONTROLS.restart}
              </button>

              {voiceState === "playing" || voiceState === "paused" ? (
                <>
                  <div
                    className="welcome-room__top-progress"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progressPercent}
                    aria-label="Welcome narration progress"
                  >
                    <div
                      className="welcome-room__top-progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="welcome-room__top-time" aria-live="off">
                    {elapsedLabel}
                    <span className="welcome-room__top-time-sep">/</span>
                    {totalLabel}
                  </span>
                </>
              ) : null}
            </div>

            <button
              type="button"
              className="welcome-room__top-btn welcome-room__top-btn--quiet"
              onClick={onToggleVoice}
              aria-pressed={!voiceMuted}
              data-testid="welcome-room-voice-toggle"
            >
              {voiceMuted
                ? WELCOME_ROOM_VOICE_CONTROLS.unmuteVoice
                : WELCOME_ROOM_VOICE_CONTROLS.muteVoice}
            </button>

            {ambienceAvailable ? (
              <button
                type="button"
                className="welcome-room__top-btn welcome-room__top-btn--quiet"
                onClick={onToggleMusic}
                aria-pressed={!musicMuted}
                data-testid="welcome-room-ambience-toggle"
                title={WELCOME_ROOM_AMBIENCE_CREDIT}
              >
                {musicMuted
                  ? WELCOME_ROOM_VOICE_CONTROLS.unmuteMusic
                  : WELCOME_ROOM_VOICE_CONTROLS.muteMusic}
              </button>
            ) : null}

            <button
              type="button"
              className="welcome-room__top-btn welcome-room__top-btn--quiet"
              onClick={onOpenRead}
              data-testid="welcome-room-read-welcome"
            >
              {WELCOME_ROOM_VOICE_CONTROLS.readWelcome}
            </button>
          </>
        )}

        <button
          type="button"
          className="welcome-room__top-btn welcome-room__top-btn--continue"
          onClick={onContinue}
          data-testid="welcome-room-continue-ecosystem"
        >
          {WELCOME_ROOM_LEAVE_INVITATION.buttonLabel}
        </button>
      </div>

      {voiceState === "loading" ? (
        <p className="welcome-room__top-status" aria-live="polite">
          {WELCOME_ROOM_VOICE_CONTROLS.loading}
        </p>
      ) : null}
    </header>
  );
}
