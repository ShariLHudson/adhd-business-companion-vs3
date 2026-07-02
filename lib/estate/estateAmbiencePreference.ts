/**
 * Estate ambience on/off — delegates to Estate Audio Settings™ (Layer 1).
 */

import {
  getEstateAudioSettings,
  isEstateAmbienceLayerEnabled,
  patchEstateAudioSettings,
} from "./estateAudioSettings";

export function isEstateAmbienceEnabled(): boolean {
  return isEstateAmbienceLayerEnabled();
}

export function setEstateAmbienceEnabled(enabled: boolean): void {
  patchEstateAudioSettings({ ambienceEnabled: enabled });
}

export function toggleEstateAmbienceEnabled(): boolean {
  const next = !getEstateAudioSettings().ambienceEnabled;
  setEstateAmbienceEnabled(next);
  return next;
}
