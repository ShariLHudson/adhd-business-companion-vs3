/**
 * @vitest-environment jsdom
 *
 * Settings Fix 2 — the "Shari Voice" checkbox must actually govern spoken
 * responses: turning it off must stop any speech already playing, and its
 * persisted state must be what playTTS (CompanionPageClient.tsx) reads
 * before starting a new one. This file covers the toggle's own behavior;
 * CompanionPageClient.playTTSShariVoiceGate.test.ts covers the gate itself
 * (playTTS is a private closure inside a component too large to mount).
 */
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExperienceControlsOverlay } from "./ExperienceControlsOverlay";
import {
  getExperienceControlPrefs,
  patchExperienceControlPrefs,
} from "@/lib/estate/experienceControlPrefs";
import { markChatAssistantAudioElement } from "@/lib/welcomeHome";

let container: HTMLDivElement;
let root: Root;

// jsdom does not implement HTMLMediaElement's real playback state, so
// `.paused` never reacts to a `.pause()` call on its own. Spy on the
// prototype method instead of relying on that state to prove the stop
// mechanism (pauseChatAssistantAudio) actually reaches the element.
let pauseSpy: ReturnType<typeof vi.spyOn>;

/** Simulates the audio element playTTS creates and tags mid-speech. */
function mountFakeSpeakingAudio(): HTMLAudioElement {
  const audio = document.createElement("audio");
  markChatAssistantAudioElement(audio);
  document.body.appendChild(audio);
  return audio;
}

beforeEach(() => {
  localStorage.clear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  pauseSpy = vi
    .spyOn(HTMLMediaElement.prototype, "pause")
    .mockImplementation(() => {});
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
  document.querySelectorAll("audio[data-spark-chat-tts]").forEach((el) => el.remove());
  pauseSpy.mockRestore();
});

describe("ExperienceControlsOverlay — Shari Voice", () => {
  it("defaults to enabled", () => {
    expect(getExperienceControlPrefs().shariVoiceEnabled).toBe(true);
  });

  it("turning Shari Voice off persists the preference and stops speech already playing", async () => {
    const speaking = mountFakeSpeakingAudio();
    speaking.currentTime = 12.5;

    await act(async () => {
      root.render(
        <ExperienceControlsOverlay open onClose={() => {}} roomId="home" />,
      );
    });

    const checkbox = container.querySelector(
      "[data-testid='experience-controls-shari-voice']",
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
    expect(pauseSpy).not.toHaveBeenCalled();

    await act(async () => {
      checkbox.click();
    });

    expect(getExperienceControlPrefs().shariVoiceEnabled).toBe(false);
    expect(checkbox.checked).toBe(false);
    // pauseChatAssistantAudio must reach the tagged element and reset it.
    expect(pauseSpy).toHaveBeenCalledTimes(1);
    expect(pauseSpy.mock.instances[0]).toBe(speaking);
    expect(speaking.currentTime).toBe(0);
  });

  it("turning Shari Voice back on allows future speech without resuming anything", async () => {
    patchExperienceControlPrefs({ shariVoiceEnabled: false });
    const idle = mountFakeSpeakingAudio();

    await act(async () => {
      root.render(
        <ExperienceControlsOverlay open onClose={() => {}} roomId="home" />,
      );
    });

    const checkbox = container.querySelector(
      "[data-testid='experience-controls-shari-voice']",
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    await act(async () => {
      checkbox.click();
    });

    expect(getExperienceControlPrefs().shariVoiceEnabled).toBe(true);
    expect(checkbox.checked).toBe(true);
    // Turning back on is permission for the *next* reply — it must not call
    // .play() (or anything else) on a previously-paused element.
    expect(idle.paused).toBe(true);
    expect(pauseSpy).not.toHaveBeenCalled();
  });

  it("does not touch place ambience or volume when toggled", async () => {
    patchExperienceControlPrefs({ estateSoundsEnabled: true, volume: 0.6 });

    await act(async () => {
      root.render(
        <ExperienceControlsOverlay open onClose={() => {}} roomId="home" />,
      );
    });
    const checkbox = container.querySelector(
      "[data-testid='experience-controls-shari-voice']",
    ) as HTMLInputElement;
    await act(async () => {
      checkbox.click();
    });

    const prefs = getExperienceControlPrefs();
    expect(prefs.estateSoundsEnabled).toBe(true);
    expect(prefs.volume).toBe(0.6);
  });

  it("preference persists across a fresh read (simulated reload)", () => {
    patchExperienceControlPrefs({ shariVoiceEnabled: false });
    // getExperienceControlPrefs() always re-reads localStorage — no cache to
    // go stale, which is exactly what a reload exercises.
    expect(getExperienceControlPrefs().shariVoiceEnabled).toBe(false);
    patchExperienceControlPrefs({ shariVoiceEnabled: true });
    expect(getExperienceControlPrefs().shariVoiceEnabled).toBe(true);
  });
});
