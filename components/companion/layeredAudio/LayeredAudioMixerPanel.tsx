"use client";

import { useId, useState } from "react";
import {
  LAYERED_AUDIO_COPY,
  LAYERED_AUDIO_PRESETS,
  MAX_ENVIRONMENT_TRACKS,
  environmentCatalogTracks,
  musicCatalogTracks,
  useLayeredAudio,
  voiceCatalogTracks,
} from "@/lib/layeredAudio";
import { noteEstateSoundsStarted } from "@/lib/estate/estateSoundsTransport";
import { unlockBrowserAudioFromClick } from "@/lib/welcomeAudio/audioUnlock";

type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * Calm layered mixer: one Voice · up to three Environment · one Music.
 */
export function LayeredAudioMixerPanel({ open, onClose }: Props) {
  const titleId = useId();
  const { snapshot, engine } = useLayeredAudio();
  const [adjustMixOpen, setAdjustMixOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  if (!open) return null;

  const env = snapshot.environmentTracks;
  const atLimit = env.length >= MAX_ENVIRONMENT_TRACKS;
  const summary =
    env.length === 0
      ? "No environment sounds yet"
      : env.map((t) => t.title).join(" + ");

  return (
    <div
      className="layered-audio-mixer"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="layered-audio-mixer"
    >
      <div className="layered-audio-mixer__sheet">
        <header className="layered-audio-mixer__header">
          <div>
            <h2 id={titleId}>Change Sounds</h2>
            <p className="layered-audio-mixer__sub">
              One voice, up to three environment sounds, and one music track.
            </p>
          </div>
          <button
            type="button"
            className="layered-audio-mixer__close"
            aria-label="Close sound mixer"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        {snapshot.customized ? (
          <p
            className="layered-audio-mixer__badge"
            data-testid="layered-audio-customized"
          >
            {LAYERED_AUDIO_COPY.customized}
          </p>
        ) : null}

        <section
          className="layered-audio-mixer__section"
          aria-labelledby="layered-env-heading"
        >
          <div className="layered-audio-mixer__section-head">
            <h3 id="layered-env-heading">
              {LAYERED_AUDIO_COPY.environmentHeading}
            </h3>
            <p className="layered-audio-mixer__count">
              {LAYERED_AUDIO_COPY.ofSelected(env.length, MAX_ENVIRONMENT_TRACKS)}
            </p>
          </div>

          <div
            className="layered-audio-mixer__summary"
            data-testid="layered-env-summary"
          >
            <p className="layered-audio-mixer__summary-title">{summary}</p>
            <div className="layered-audio-mixer__summary-actions">
              <button
                type="button"
                className="layered-audio-mixer__btn"
                disabled={env.length === 0}
                onClick={() => setCatalogOpen(true)}
              >
                {LAYERED_AUDIO_COPY.changeEnvironment}
              </button>
              <button
                type="button"
                className="layered-audio-mixer__btn"
                disabled={env.length === 0}
                data-testid="layered-env-pause-all"
                onClick={() => void engine.pauseAllEnvironment()}
              >
                {LAYERED_AUDIO_COPY.pauseEnvironment}
              </button>
            </div>
          </div>

          {env.length > 0 ? (
            <ul
              className="layered-audio-mixer__active-list"
              aria-label="Active environment sounds"
            >
              {env.map((track) => (
                <li key={track.trackId} data-testid={`env-active-${track.trackId}`}>
                  <span className="layered-audio-mixer__track-title">
                    {track.title}
                  </span>
                  <span className="layered-audio-mixer__track-state">
                    {track.playing ? "Playing" : "Paused"}
                  </span>
                  <button
                    type="button"
                    className="layered-audio-mixer__btn layered-audio-mixer__btn--compact"
                    aria-label={
                      track.playing
                        ? `Pause ${track.title}`
                        : `Resume ${track.title}`
                    }
                    onClick={() =>
                      void (track.playing
                        ? engine.pauseEnvironmentTrack(track.trackId)
                        : engine.resumeEnvironmentTrack(track.trackId))
                    }
                  >
                    {track.playing ? "Pause" : "Resume"}
                  </button>
                  <button
                    type="button"
                    className="layered-audio-mixer__btn layered-audio-mixer__btn--compact"
                    aria-label={`Remove ${track.title}`}
                    onClick={() => engine.removeEnvironmentTrack(track.trackId)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <button
            type="button"
            className="layered-audio-mixer__btn layered-audio-mixer__btn--primary"
            data-testid="layered-env-add"
            aria-disabled={atLimit}
            disabled={atLimit}
            onClick={() => setCatalogOpen(true)}
          >
            {LAYERED_AUDIO_COPY.addASound}
          </button>

          {snapshot.environmentLimitMessage ? (
            <p
              className="layered-audio-mixer__notice"
              role="status"
              data-testid="layered-env-limit-message"
            >
              {snapshot.environmentLimitMessage}
            </p>
          ) : null}

          <button
            type="button"
            className="layered-audio-mixer__link"
            aria-expanded={adjustMixOpen}
            data-testid="layered-adjust-mix"
            onClick={() => setAdjustMixOpen((v) => !v)}
          >
            {LAYERED_AUDIO_COPY.adjustMix}
          </button>

          {adjustMixOpen ? (
            <div
              className="layered-audio-mixer__adjust"
              data-testid="layered-adjust-mix-panel"
            >
              {env.map((track) => (
                <label key={track.trackId} className="layered-audio-mixer__slider">
                  <span>{track.title}</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={track.selectedVolume}
                    aria-label={`${track.title} volume`}
                    onChange={(e) =>
                      engine.setEnvironmentTrackVolume(
                        track.trackId,
                        Number(e.target.value),
                      )
                    }
                  />
                </label>
              ))}
              <label className="layered-audio-mixer__slider">
                <span>Overall Environment</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={snapshot.environmentMasterVolume}
                  aria-label="Overall environment volume"
                  data-testid="layered-env-master"
                  onChange={(e) =>
                    engine.setEnvironmentMasterVolume(Number(e.target.value))
                  }
                />
              </label>
            </div>
          ) : null}

          {catalogOpen ? (
            <div
              className="layered-audio-mixer__catalog"
              data-testid="layered-env-catalog"
            >
              <p className="layered-audio-mixer__catalog-title">
                {LAYERED_AUDIO_COPY.buildEnvironment}
              </p>
              {atLimit ? (
                <p className="layered-audio-mixer__notice" role="status">
                  {LAYERED_AUDIO_COPY.environmentLimit}
                </p>
              ) : null}
              <ul>
                {environmentCatalogTracks().map((track) => {
                  const active = env.some((t) => t.trackId === track.id);
                  return (
                    <li key={track.id}>
                      <button
                        type="button"
                        className="layered-audio-mixer__catalog-item"
                        disabled={active || atLimit}
                        aria-label={
                          active
                            ? `${track.title} already selected`
                            : `Add ${track.title}`
                        }
                        onClick={() => {
                          unlockBrowserAudioFromClick();
                          void engine.addEnvironmentTrack(track.id).then(() => {
                            setCatalogOpen(false);
                          });
                        }}
                      >
                        <span>{track.title}</span>
                        <span className="layered-audio-mixer__muted">
                          {track.category}
                          {active ? " · Selected" : ""}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                className="layered-audio-mixer__btn"
                onClick={() => setCatalogOpen(false)}
              >
                Done
              </button>
            </div>
          ) : null}
        </section>

        <section className="layered-audio-mixer__section">
          <h3>Background Music</h3>
          <p className="layered-audio-mixer__current">
            {snapshot.music
              ? `${snapshot.music.title}${snapshot.music.playing ? "" : " (paused)"}`
              : "None"}
          </p>
          <div className="layered-audio-mixer__row">
            <button
              type="button"
              className="layered-audio-mixer__btn layered-audio-mixer__btn--primary"
              onClick={() => setMusicOpen((v) => !v)}
            >
              {snapshot.music ? "Change Music" : "Choose Music"}
            </button>
            {snapshot.music ? (
              <>
                <button
                  type="button"
                  className="layered-audio-mixer__btn"
                  onClick={() =>
                    void (snapshot.music?.playing
                      ? engine.pauseMusic()
                      : engine.resumeMusic())
                  }
                >
                  {snapshot.music.playing ? "Pause" : "Resume"}
                </button>
                <button
                  type="button"
                  className="layered-audio-mixer__btn"
                  onClick={() => engine.stopMusic()}
                >
                  Remove
                </button>
              </>
            ) : null}
          </div>
          {musicOpen ? (
            <ul className="layered-audio-mixer__catalog" data-testid="layered-music-catalog">
              {musicCatalogTracks().map((track) => (
                <li key={track.id}>
                  <button
                    type="button"
                    className="layered-audio-mixer__catalog-item"
                    aria-label={`Play ${track.title}`}
                    onClick={() => {
                      unlockBrowserAudioFromClick();
                      void engine.setMusic(track.id).then(() => setMusicOpen(false));
                    }}
                  >
                    {track.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="layered-audio-mixer__section">
          <h3>Voice</h3>
          <p className="layered-audio-mixer__current">
            {snapshot.voice
              ? `${snapshot.voice.title}${snapshot.voice.playing ? "" : " (paused)"}`
              : "None"}
          </p>
          <div className="layered-audio-mixer__row">
            <button
              type="button"
              className="layered-audio-mixer__btn layered-audio-mixer__btn--primary"
              onClick={() => setVoiceOpen((v) => !v)}
            >
              {snapshot.voice ? "Change Voice" : "Choose Voice"}
            </button>
            {snapshot.voice ? (
              <>
                <button
                  type="button"
                  className="layered-audio-mixer__btn"
                  data-testid="layered-voice-pause"
                  onClick={() =>
                    void (snapshot.voice?.playing
                      ? engine.pauseVoice()
                      : engine.resumeVoice())
                  }
                >
                  {snapshot.voice.playing ? "Pause" : "Resume"}
                </button>
                <button
                  type="button"
                  className="layered-audio-mixer__btn"
                  onClick={() => engine.stopVoice()}
                >
                  Remove
                </button>
              </>
            ) : null}
          </div>
          {voiceOpen ? (
            <ul className="layered-audio-mixer__catalog" data-testid="layered-voice-catalog">
              {voiceCatalogTracks().map((track) => (
                <li key={track.id}>
                  <button
                    type="button"
                    className="layered-audio-mixer__catalog-item"
                    aria-label={`Play ${track.title}`}
                    onClick={() => {
                      unlockBrowserAudioFromClick();
                      void engine.setVoice(track.id).then(() => setVoiceOpen(false));
                    }}
                  >
                    {track.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="layered-audio-mixer__section">
          <h3>Presets</h3>
          <ul className="layered-audio-mixer__presets">
            {LAYERED_AUDIO_PRESETS.map((preset) => (
              <li key={preset.id}>
                <button
                  type="button"
                  className="layered-audio-mixer__catalog-item"
                  data-testid={`layered-preset-${preset.id}`}
                  aria-label={`Start This Mix: ${preset.title}`}
                  onClick={() => {
                    unlockBrowserAudioFromClick();
                    void engine.applyPreset(preset.id).then((result) => {
                      if (result.ok) noteEstateSoundsStarted();
                    });
                  }}
                >
                  <span>{preset.title}</span>
                  <span className="layered-audio-mixer__muted">
                    Start This Mix · {preset.description}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <footer className="layered-audio-mixer__footer">
          <button
            type="button"
            className="layered-audio-mixer__btn"
            data-testid="layered-stop-all"
            onClick={() => engine.stopAll()}
          >
            Clear Mix
          </button>
        </footer>
      </div>
    </div>
  );
}
