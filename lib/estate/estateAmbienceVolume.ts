/**
 * Estate ambience volume — master slider scales Layer 1 + Layer 2.
 */

import {
  effectiveEstateLayerVolume,
  getEstateMasterVolume,
  patchEstateAudioSettings,
} from "./estateAudioSettings";

export function clampAmbienceVolume(volume: number): number {
  return Math.min(1, Math.max(0, volume));
}

export function getEstateAmbienceVolume(): number {
  return getEstateMasterVolume();
}

export function setEstateAmbienceVolume(volume: number): void {
  patchEstateAudioSettings({ masterVolume: clampAmbienceVolume(volume) });
}

export function effectiveAmbienceVolume(baseVolume: number): number {
  return effectiveEstateLayerVolume(baseVolume);
}
