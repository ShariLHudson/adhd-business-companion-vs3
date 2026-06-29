import type { SignatureIconDef, SignatureIconId } from "./types";
import { SIGNATURE_ICON_IDS } from "./types";

export const SIGNATURE_ICON_REGISTRY: Record<SignatureIconId, SignatureIconDef> = {
  "home-cottage": {
    id: "home-cottage",
    label: "Home — cozy cottage with lit window",
    animation: "window-glow",
  },
  "clear-mind-brain": {
    id: "clear-mind-brain",
    label: "Clear My Mind — glowing brain with clearing sparkles",
    animation: "sparkle-drift",
  },
  "plan-my-day": {
    id: "plan-my-day",
    label: "Plan My Day — planner with one checkmark",
    animation: "none",
  },
  "focus-lantern-brain": {
    id: "focus-lantern-brain",
    label: "Focus My Brain — lantern illuminating a brain",
    animation: "lantern-glow",
  },
  "peaceful-path": {
    id: "peaceful-path",
    label: "Peaceful Places — garden path into trees",
    animation: "path-brighten",
  },
  "momentum-blocks": {
    id: "momentum-blocks",
    label: "Momentum Games — tipping wooden blocks",
    animation: "block-tip",
  },
  "library-journal": {
    id: "library-journal",
    label: "Library — open journal with warm pages",
    animation: "page-glow",
  },
  "study-lamp": {
    id: "study-lamp",
    label: "Study — reading lamp over notebook",
    animation: "lamp-glow",
  },
  "journal-pen": {
    id: "journal-pen",
    label: "Journal — fountain pen on open page",
    animation: "none",
  },
  "voice-waves": {
    id: "voice-waves",
    label: "Voice Reflection — microphone with sound waves",
    animation: "sound-wave",
  },
  "community-chairs": {
    id: "community-chairs",
    label: "Community — chairs in a welcoming circle",
    animation: "none",
  },
  "learn-grow-tree": {
    id: "learn-grow-tree",
    label: "Learn & Grow — sprout from open book",
    animation: "leaf-sway",
  },
  "support-hands": {
    id: "support-hands",
    label: "Support — gently clasped hands",
    animation: "none",
  },
  "decision-compass": {
    id: "decision-compass",
    label: "Decision Compass — brass compass with glow",
    animation: "compass-turn",
  },
  "adhd-toolkit": {
    id: "adhd-toolkit",
    label: "ADHD Toolkit — wooden organizer of helpful tools",
    animation: "none",
  },
  "settings-key-gear": {
    id: "settings-key-gear",
    label: "Settings — vintage key and warm gear",
    animation: "none",
  },
};

/** Companion Object ids → signature icon (navigation form). */
export const OBJECT_SIGNATURE_ICON: Record<string, SignatureIconId> = {
  messages: "home-cottage",
  "clear-my-mind": "clear-mind-brain",
  "plan-my-day": "plan-my-day",
  "focus-my-brain": "focus-lantern-brain",
  "focus-audio": "peaceful-path",
  games: "momentum-blocks",
  help: "library-journal",
  learning: "study-lamp",
  reading: "study-lamp",
  journal: "journal-pen",
  voice: "voice-waves",
  community: "community-chairs",
  growth: "learn-grow-tree",
  support: "support-hands",
  "decision-compass": "decision-compass",
  strategies: "adhd-toolkit",
  "other-tools": "adhd-toolkit",
  settings: "settings-key-gear",
  breathing: "clear-mind-brain",
  "welcome-room": "home-cottage",
};

export function signatureIconForObject(objectId: string): SignatureIconId | null {
  return OBJECT_SIGNATURE_ICON[objectId] ?? null;
}

export function signatureIconDef(
  iconId: SignatureIconId,
): SignatureIconDef | undefined {
  return SIGNATURE_ICON_REGISTRY[iconId];
}

export function allSignatureIconIds(): SignatureIconId[] {
  return [...SIGNATURE_ICON_IDS];
}
