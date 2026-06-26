import type { HospitalityResponse, RealityEmotionalTone } from "./types";

export function resolveHospitalityResponse(
  tone: RealityEmotionalTone,
): HospitalityResponse {
  return {
    showBlanket: tone === "low" || tone === "heavy" || tone === "flooded",
    showMugSteam: tone === "okay" || tone === "spark" || tone === "celebration",
    warmLamp:
      tone === "low" ||
      tone === "heavy" ||
      tone === "flooded" ||
      tone === "grief",
    closeCurtains: tone === "flooded" || tone === "grief",
  };
}
