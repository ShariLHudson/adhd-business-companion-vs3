import {
  normalizeConversationDestinationId,
} from "./destinationPolicy";
import {
  getConversationDisplayPreference,
  setDestinationCompanionVisibility,
  setGlobalCompanionDefault,
} from "./preferenceStore";
import type {
  CompanionVisibility,
  CompanionVisibilitySource,
  SetCompanionVisibilityResult,
} from "./types";
import { patchExperienceControlPrefs } from "@/lib/estate/experienceControlPrefs";

/**
 * Canonical SET_COMPANION_VISIBILITY action.
 * Presentation only — never New Day, never deletes conversation or work.
 */
export function setCompanionVisibility(input: {
  visibility: CompanionVisibility;
  destinationId?: string | null;
  source: CompanionVisibilitySource;
  /** When true, also update global default (Settings). */
  updateGlobalDefault?: boolean;
}): SetCompanionVisibilityResult {
  const destinationId = normalizeConversationDestinationId(
    input.destinationId ?? null,
  );

  let preference = getConversationDisplayPreference();

  if (input.updateGlobalDefault || !destinationId) {
    preference = setGlobalCompanionDefault(input.visibility);
  }
  if (destinationId) {
    preference = setDestinationCompanionVisibility(
      destinationId,
      input.visibility,
    );
  }

  // Bridge legacy Experience Controls field (same semantic, not a second controller).
  try {
    patchExperienceControlPrefs({
      conversationVisibility:
        input.visibility === "on" ? "showing" : "hidden",
    });
  } catch {
    /* ignore */
  }

  return {
    visibility: input.visibility,
    destinationId,
    preference,
    abortInFlightResponse: input.visibility === "off",
    preserveConversation: true,
    preserveSavedWork: true,
  };
}

export function companionVisibilityLabel(
  visibility: CompanionVisibility,
): string {
  return visibility === "on" ? "Companion: On" : "Companion: Off";
}

export function companionVisibilityAriaLabel(
  visibility: CompanionVisibility,
): string {
  return visibility === "on"
    ? "Companion conversation on"
    : "Companion conversation off";
}
