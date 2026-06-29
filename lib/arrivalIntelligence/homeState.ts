/**
 * Three-State Companion Home — Arrival Intelligence decides; UI renders.
 *
 * FIRST_VISIT       — build trust, one question, lead the conversation
 * RETURNING_ACTIVE  — contextual continuation, relationship picks up
 * QUIET_PRESENCE    — simply here, no pressure, established relationship
 */

import type { CompanionContinueResolution } from "@/lib/companionLedContinue";
import type { ArrivalVisitorKind } from "./arrivalTypes";

export type CompanionHomeState =
  | "FIRST_VISIT"
  | "RETURNING_ACTIVE"
  | "QUIET_PRESENCE";

export type HomeNavVisibility = "muted" | "normal" | "calm" | "hidden";

export type HomeChromeLayout = "welcome-scene" | "standard";

export type HomeChromeConfig = {
  navVisibility: HomeNavVisibility;
  layout: HomeChromeLayout;
  conversationInput: boolean;
  autoFocusInput: boolean;
  softenBackground: boolean;
};

export function isWelcomeSceneLayout(layout: HomeChromeLayout): boolean {
  return layout === "welcome-scene";
}

export function resolveCompanionHomeState(input: {
  visitorKind: ArrivalVisitorKind;
  continue: CompanionContinueResolution;
}): CompanionHomeState {
  if (input.visitorKind === "first_onboarding") {
    return "FIRST_VISIT";
  }

  if (
    input.continue.mode === "single" ||
    input.continue.mode === "choose"
  ) {
    return "RETURNING_ACTIVE";
  }

  return "QUIET_PRESENCE";
}

export function homeChromeForState(state: CompanionHomeState): HomeChromeConfig {
  switch (state) {
    case "FIRST_VISIT":
      return {
        navVisibility: "normal",
        layout: "standard",
        conversationInput: true,
        autoFocusInput: true,
        softenBackground: false,
      };
    case "RETURNING_ACTIVE":
      return {
        navVisibility: "normal",
        layout: "standard",
        conversationInput: true,
        autoFocusInput: true,
        softenBackground: false,
      };
    case "QUIET_PRESENCE":
      return {
        navVisibility: "calm",
        layout: "standard",
        conversationInput: true,
        autoFocusInput: true,
        softenBackground: false,
      };
  }
}

/** DOM-safe slug for data-home-state attributes. */
export function homeStateDataAttr(state: CompanionHomeState): string {
  return state.toLowerCase().replace(/_/g, "-");
}
