/**
 * Visual Thinking Studio — member-facing destination.
 * Legacy technical identifiers (cartographersStudio, focus-studio, asset path)
 * remain for compatibility. Do not leak them into UI labels.
 *
 * @see docs/estate/recognition/library/195_CARTOGRAPHERS_STUDIO_ARCHITECTURE.md
 * @see docs/cartography/VISUAL_THINKING_STUDIO_RENAME_AND_RESEARCH_COMPLETION_STANDARD.md
 */

export const CARTOGRAPHERS_STUDIO_BACKGROUND =
  "/backgrounds/cartoghraphers-studio-background.png" as const;

export const CARTOGRAPHERS_STUDIO_PLACE_ID = "focus-studio" as const;

/** Official user-facing destination name. */
export const VISUAL_THINKING_STUDIO_OFFICIAL_NAME =
  "Visual Thinking Studio" as const;

/**
 * @deprecated Compatibility alias — use VISUAL_THINKING_STUDIO_OFFICIAL_NAME.
 * Value is the current user-facing name (not legacy Cartography).
 */
export const CARTOGRAPHERS_STUDIO_OFFICIAL_NAME =
  VISUAL_THINKING_STUDIO_OFFICIAL_NAME;

/** Quiet confirmation after continuous save — never a software "Auto Saved" badge. */
export const CARTOGRAPHERS_ATLAS_SAVE_LINE =
  "Your work has been safely added to your Visual Thinking Studio." as const;

/** Estate-themed chrome labels (room immersion). */
export const CARTOGRAPHERS_RETURN_TO_ESTATE = "Return to Estate" as const;
export const CARTOGRAPHERS_RESUME_PREVIOUS =
  "Continue Previous Visual Thinking Work" as const;
export const CARTOGRAPHERS_CONTINUE_MAPPING = "Continue Previous Work" as const;
export const VISUAL_THINKING_RETURN_TO_STUDIO =
  "Return to Visual Thinking Studio" as const;
export const VISUAL_THINKING_PREVIOUS_WORK_LABEL =
  "Previous Visual Thinking Work" as const;
export const CARTOGRAPHERS_HELP = "Help" as const;
/** Navigation to map types — never labeled Help (Prompt 140). */
export const CARTOGRAPHERS_BROWSE_MAP_TYPES = "Browse Map Types" as const;
export const CARTOGRAPHERS_EXIT = "Exit" as const;
export const CARTOGRAPHERS_UPDATE_MAP = "Update Map" as const;
export const CARTOGRAPHERS_ASK_SHARI = "Ask Shari" as const;
