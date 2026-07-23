import { describe, expect, it } from "vitest";
import {
  duckingMultipliersForVoiceActive,
  effectiveEnvironmentVolume,
  effectiveMusicVolume,
} from "./volumes";
import { VOICE_DUCK_ENVIRONMENT, VOICE_DUCK_MUSIC } from "./constants";

describe("layered audio volumes", () => {
  it("scales each environment track by master without rewriting selected volumes", () => {
    const rainSelected = 0.6;
    const birdsSelected = 0.25;
    const master = 0.5;
    expect(
      effectiveEnvironmentVolume({
        selectedVolume: rainSelected,
        environmentMasterVolume: master,
        duckingMultiplier: 1,
      }),
    ).toBeCloseTo(0.3);
    expect(
      effectiveEnvironmentVolume({
        selectedVolume: birdsSelected,
        environmentMasterVolume: master,
        duckingMultiplier: 1,
      }),
    ).toBeCloseTo(0.125);
  });

  it("ducks environment tracks proportionally", () => {
    const rain = effectiveEnvironmentVolume({
      selectedVolume: 0.6,
      environmentMasterVolume: 1,
      duckingMultiplier: VOICE_DUCK_ENVIRONMENT,
    });
    const birds = effectiveEnvironmentVolume({
      selectedVolume: 0.25,
      environmentMasterVolume: 1,
      duckingMultiplier: VOICE_DUCK_ENVIRONMENT,
    });
    expect(rain / birds).toBeCloseTo(0.6 / 0.25);
  });

  it("ducks music when voice is active", () => {
    expect(duckingMultipliersForVoiceActive(true).music).toBe(VOICE_DUCK_MUSIC);
    expect(duckingMultipliersForVoiceActive(true).environment).toBe(
      VOICE_DUCK_ENVIRONMENT,
    );
    expect(
      effectiveMusicVolume({
        selectedVolume: 0.5,
        duckingMultiplier: VOICE_DUCK_MUSIC,
      }),
    ).toBeCloseTo(0.5 * VOICE_DUCK_MUSIC);
  });
});
