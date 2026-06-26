import { imageContextById } from "./imageContextRegistry";
import {
  COMPANION_PRESENCE_WELCOME_IMAGE_ID,
} from "@/lib/companionPresenceLibrary/sceneCatalog";

/** Master Living Room™ — canonical first-page photograph until a new asset is approved. */
export const COMPANION_PRESENCE_WELCOME_FALLBACK_IMAGE_ID = COMPANION_PRESENCE_WELCOME_IMAGE_ID;

export type WelcomeImageCapabilities = {
  openWindow: boolean;
  mugBakedIn: boolean;
  suppressHospitalitySteam: boolean;
  suppressCurtains: boolean;
  artObjectPosition: string;
  artObjectFit: "cover" | "contain";
};

const DEFAULT_CAPS: WelcomeImageCapabilities = {
  openWindow: true,
  mugBakedIn: false,
  suppressHospitalitySteam: false,
  suppressCurtains: false,
  artObjectPosition: "14% center",
  artObjectFit: "cover",
};

const BY_IMAGE: Record<string, Partial<WelcomeImageCapabilities>> = {
  "shari-i-am-here-2": {
    openWindow: false,
    mugBakedIn: true,
    suppressHospitalitySteam: true,
    suppressCurtains: true,
    artObjectPosition: "14% center",
    artObjectFit: "cover",
  },
};

export function welcomeImageCapabilities(
  photographId?: string,
): WelcomeImageCapabilities {
  const id = photographId ?? COMPANION_PRESENCE_WELCOME_IMAGE_ID;
  return { ...DEFAULT_CAPS, ...BY_IMAGE[id] };
}

/** First-page Living Room always uses the canonical photograph — no silent swap. */
export function effectiveWelcomePhotographId(photographId?: string): string {
  return photographId ?? COMPANION_PRESENCE_WELCOME_IMAGE_ID;
}
