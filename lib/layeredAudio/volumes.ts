import { VOICE_DUCK_ENVIRONMENT, VOICE_DUCK_MUSIC } from "./constants";

export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

/**
 * Effective Environment playback volume.
 * Preserves relative balance: each track keeps its selectedVolume ratio
 * while master and ducking scale the whole mix.
 */
export function effectiveEnvironmentVolume(input: {
  selectedVolume: number;
  environmentMasterVolume: number;
  duckingMultiplier: number;
}): number {
  return clampVolume(
    input.selectedVolume *
      input.environmentMasterVolume *
      input.duckingMultiplier,
  );
}

export function effectiveMusicVolume(input: {
  selectedVolume: number;
  duckingMultiplier: number;
}): number {
  return clampVolume(input.selectedVolume * input.duckingMultiplier);
}

export function effectiveVoiceVolume(selectedVolume: number): number {
  return clampVolume(selectedVolume);
}

export function duckingMultipliersForVoiceActive(active: boolean): {
  environment: number;
  music: number;
} {
  if (!active) {
    return { environment: 1, music: 1 };
  }
  return {
    environment: VOICE_DUCK_ENVIRONMENT,
    music: VOICE_DUCK_MUSIC,
  };
}
