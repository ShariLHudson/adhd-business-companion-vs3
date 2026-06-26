import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";
import type { HospitalityMotionId } from "@/lib/companionHospitalityPrototype";

export type LivingMotionEntry = {
  id: HospitalityMotionId;
  label: string;
  placement: "outsideWindow" | "windowGlass" | "interior" | "ambient";
  seasons: WelcomeSeason[] | "all";
  naturalBehavior: string;
  loops: false;
};

/**
 * Living Motion Library™ — every movement behaves like nature.
 * Nothing loops obviously; irregular timing lives in CSS.
 */
export const LIVING_MOTION_LIBRARY: LivingMotionEntry[] = [
  { id: "steam", label: "Steam", placement: "interior", seasons: ["autumn", "winter"], naturalBehavior: "Rises slowly, fades", loops: false },
  { id: "candle", label: "Candle", placement: "interior", seasons: "all", naturalBehavior: "Breathing glow", loops: false },
  { id: "rain", label: "Rain", placement: "windowGlass", seasons: "all", naturalBehavior: "Falls at varied angles", loops: false },
  { id: "snow", label: "Snow", placement: "outsideWindow", seasons: ["winter"], naturalBehavior: "Drifts outside only", loops: false },
  { id: "foliage", label: "Trees", placement: "outsideWindow", seasons: ["spring", "summer"], naturalBehavior: "Branch sway", loops: false },
  { id: "leaves", label: "Leaves", placement: "outsideWindow", seasons: ["autumn"], naturalBehavior: "Fall and drift", loops: false },
  { id: "birds", label: "Birds", placement: "outsideWindow", seasons: ["spring", "summer"], naturalBehavior: "Pass once, not orbit", loops: false },
  { id: "cardinal", label: "Cardinal", placement: "outsideWindow", seasons: ["winter"], naturalBehavior: "Brief feeder visit", loops: false },
  { id: "butterflies", label: "Butterflies", placement: "outsideWindow", seasons: ["spring", "summer"], naturalBehavior: "Drift, not swarm", loops: false },
  { id: "fireflies", label: "Fireflies", placement: "outsideWindow", seasons: ["summer"], naturalBehavior: "Dusk pulse", loops: false },
  { id: "clouds", label: "Clouds", placement: "outsideWindow", seasons: "all", naturalBehavior: "Slow sky drift", loops: false },
  { id: "sunlight", label: "Light rays", placement: "ambient", seasons: "all", naturalBehavior: "47s sun drift", loops: false },
  { id: "lamplight", label: "Lamp glow", placement: "interior", seasons: "all", naturalBehavior: "Warm breathe", loops: false },
  { id: "curtains", label: "Curtains", placement: "interior", seasons: "all", naturalBehavior: "Gentle sway", loops: false },
  { id: "fireplace", label: "Fireplace", placement: "interior", seasons: ["autumn", "winter"], naturalBehavior: "Irregular flicker", loops: false },
  { id: "thunder", label: "Thunder", placement: "ambient", seasons: "all", naturalBehavior: "Rare flash", loops: false },
  { id: "shimmer", label: "Heat shimmer", placement: "ambient", seasons: ["summer"], naturalBehavior: "Rare celebration glint", loops: false },
];

export function motionById(id: HospitalityMotionId): LivingMotionEntry | undefined {
  return LIVING_MOTION_LIBRARY.find((entry) => entry.id === id);
}
