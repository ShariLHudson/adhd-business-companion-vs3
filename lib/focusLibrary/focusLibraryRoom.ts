import { FOCUS_LIBRARY_BG } from "@/lib/supportExperiences/supportExperienceRegistry";
import type { FocusHubAction } from "@/lib/focusHub";

/** Focus Library — dedicated tea-room scene; never the shared conservatory. */
export const FOCUS_LIBRARY_ROOM_BG = FOCUS_LIBRARY_BG;

export type FocusLibraryCategoryId =
  | "music-sounds"
  | "guided-focus"
  | "timers"
  | "saved-favorites";

export type FocusLibraryCategory = {
  id: FocusLibraryCategoryId;
  label: string;
  description: string;
  icon: string;
  /** Dispatched through the shared Focus hub action handler — undefined = shown inline instead. */
  action?: FocusHubAction;
};

/**
 * Focus Library resource collection — music, sounds, guided focus, timers,
 * and saved favorites. Deliberately excludes Clear My Mind — Focus Library
 * never falls back to it.
 */
export const FOCUS_LIBRARY_CATEGORIES: FocusLibraryCategory[] = [
  {
    id: "music-sounds",
    label: "Music & Sounds",
    description: "Peaceful places and calming sound when you need stillness.",
    icon: "🎵",
    action: { kind: "audio", categoryId: "soundscapes", toolId: "focus-library-music" },
  },
  {
    id: "guided-focus",
    label: "Guided Focus",
    description: "A softer, structured pace when your mind needs space.",
    icon: "🧭",
    action: {
      kind: "section",
      section: "guided-exercises",
      toolId: "focus-library-guided",
    },
  },
  {
    id: "timers",
    label: "Timers",
    description: "A gentle timer when you are ready to re-enter the work.",
    icon: "⏱️",
    action: { kind: "tool", tool: "focus-timer", toolId: "focus-library-timers" },
  },
  {
    id: "saved-favorites",
    label: "Saved Favorites",
    description: "Your favorite calming sounds and sessions, once you save one.",
    icon: "⭐",
    // No action yet — shown inline (honest empty state, no fabricated feature).
  },
];
