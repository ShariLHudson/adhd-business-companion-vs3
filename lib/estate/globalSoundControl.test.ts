import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Global Sound Control — one shared Estate Sounds home", () => {
  it("mounts only once in EstateTopRightChrome", () => {
    const chrome = read("components/companion/estate/EstateTopRightChrome.tsx");
    const mounts = chrome.match(/<GlobalSoundControl\b/g) ?? [];
    expect(mounts.length).toBe(1);
    expect(chrome).toContain(
      'from "@/components/companion/estate/GlobalSoundControl"',
    );
    expect(chrome).toContain("onOpenSoundscapes={onOpenSoundscapes}");
    expect(chrome).toContain(
      "onOpenPeacefulMoments={onOpenPeacefulPlaces ?? onOpenFocusAudio}",
    );
  });

  it("exposes On / Pause / Resume / Off plus separate Peaceful Moments and Soundscapes", () => {
    const control = read(
      "components/companion/estate/GlobalSoundControl.tsx",
    );
    const transport = read("lib/estate/estateSoundsTransport.ts");
    expect(control).toContain("data-canonical-audio-controller");
    expect(control).toContain("snap.closedLabel");
    expect(transport).toContain('"Sounds On"');
    expect(transport).toContain('"Sounds Paused"');
    expect(transport).toContain('"Sounds Off"');
    expect(control).toContain("Estate Sounds");
    expect(control).toContain("global-sound-pause");
    expect(control).toContain("global-sound-resume");
    expect(control).toContain("global-sound-off");
    expect(control).toContain("global-sound-on");
    expect(control).toContain("global-sound-peaceful-moments");
    expect(control).toContain("global-sound-soundscapes");
    expect(control).toContain("global-sound-change-sounds");
    expect(control).toContain("Peaceful Moments");
    expect(control).toContain("Soundscapes");
    expect(control).toContain("Current Mix");
    expect(control).toContain("pauseEstateSounds");
    expect(control).toContain("resumeEstateSounds");
    expect(control).toContain("turnOffEstateSounds");
    expect(control).toContain("turnOnEstateSounds");
  });

  it("does not expose duplicate master transport on the main surface", () => {
    const control = read(
      "components/companion/estate/GlobalSoundControl.tsx",
    );
    expect(control).not.toContain("Stop All Sound");
    expect(control).not.toContain("Audio Settings");
    expect(control).not.toContain("global-sound-volume");
    expect(control).not.toContain("Environment Sounds");
    expect(control).not.toMatch(/new AudioEngine|createAudioManager/);
  });

  it("uses accessible text labels (not icon-only)", () => {
    const control = read(
      "components/companion/estate/GlobalSoundControl.tsx",
    );
    expect(control).toContain("aria-label");
    expect(control).toContain("aria-live");
    expect(control).toContain("Sounds are on");
    expect(control).toContain("Sounds are paused");
    expect(control).toContain("Sounds are off");
    expect(control).not.toContain("SpeakerGlyph");
  });

  it("styles the control as persistently visible chrome", () => {
    const css = read("app/companion/estate-top-right-chrome.css");
    expect(css).toContain(".global-sound-control");
    expect(css).toContain(".global-sound-control__trigger--playing");
    expect(css).toContain(".global-sound-control__catalog");
  });

  it("routes Peaceful Moments Play into the shared transport", () => {
    const room = read(
      "components/companion/peacefulPlaces/PeacefulMomentsRoom.tsx",
    );
    expect(room).toContain("noteEstateSoundsStarted");
    expect(room).not.toContain("data-canonical-audio-controller");
    expect(room).not.toContain("GlobalSoundControl");
  });

  it("keeps Settings and Experience Controls as prefs — not a second player", () => {
    const settings = read(
      "components/companion/estate/EstateAudioSettings.tsx",
    );
    const experience = read(
      "components/companion/estate/ExperienceControlsOverlay.tsx",
    );
    expect(settings).not.toContain("data-canonical-audio-controller");
    expect(experience).not.toContain("data-canonical-audio-controller");
    expect(settings).toContain("turnOffEstateSounds");
    expect(experience).toContain("turnOffEstateSounds");
    expect(settings).not.toContain("pauseEstateSounds");
    expect(experience).not.toContain("pauseEstateSounds");
  });

  it("Soundscape selection is contextual — not a second global controller", () => {
    const overlay = read(
      "components/companion/estate/SoundscapeSelectionOverlay.tsx",
    );
    expect(overlay).toContain("Use This Sound");
    expect(overlay).toContain("Estate Sounds");
    expect(overlay).not.toContain("data-canonical-audio-controller");
    expect(overlay).not.toContain("global-sound-pause");
    expect(overlay).not.toContain("global-sound-off");
  });
});
