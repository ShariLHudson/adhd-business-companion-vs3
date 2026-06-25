import type { CompanionPhotoContext } from "@/lib/companionPhotoLibrary";
import type { CompanionHomeState } from "@/lib/arrivalIntelligence/homeState";
import type { CompanionPresenceExpression } from "./types";

export type HomePresenceMapping = {
  photoContext: CompanionPhotoContext;
  expression: CompanionPresenceExpression;
  rotate: boolean;
};

export function homeStatePresenceMapping(
  homeState: CompanionHomeState,
): HomePresenceMapping {
  switch (homeState) {
    case "FIRST_VISIT":
      return {
        photoContext: "welcome",
        expression: "warm_welcome",
        rotate: false,
      };
    case "RETURNING_ACTIVE":
      return {
        photoContext: "returning",
        expression: "thoughtful",
        rotate: true,
      };
    case "QUIET_PRESENCE":
      return {
        photoContext: "returning",
        expression: "quiet_presence",
        rotate: false,
      };
  }
}
