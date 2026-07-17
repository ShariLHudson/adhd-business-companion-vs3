import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Global Sound Control (140)", () => {
  it("mounts in EstateTopRightChrome for every primary destination", () => {
    const chrome = read("components/companion/estate/EstateTopRightChrome.tsx");
    expect(chrome).toContain("GlobalSoundControl");
    expect(chrome).toContain("onOpenAudioSettings");
  });

  it("Sound Off calls stopAllAudio with silenceEstate and persists mute", () => {
    const control = read("components/companion/estate/GlobalSoundControl.tsx");
    expect(control).toContain("stopAllAudio");
    expect(control).toContain("silenceEstate: true");
    expect(control).toContain("setEstateSilenced");
    expect(control).toContain("global-sound-off");
    expect(control).toContain("global-stop-all-sound");
    expect(control).toContain("Sound Off");
    expect(control).toContain("Sound On");
    expect(control).toContain("Sound Playing");
  });

  it("uses one stopAllAudio owner — no second audio engine", () => {
    const control = read("components/companion/estate/GlobalSoundControl.tsx");
    expect(control).toContain('from "@/lib/estate/stopAllAudio"');
    expect(control).toContain('from "@/lib/estate/estateAudioSettings"');
    expect(control).not.toMatch(/new AudioEngine|createAudioManager/);
  });

  it("styles the control as persistently visible chrome", () => {
    const css = read("app/companion/estate-top-right-chrome.css");
    expect(css).toContain(".global-sound-control");
    expect(css).toContain(".global-sound-control__trigger--playing");
  });
});
