import type { AppSection } from "@/lib/companionUi";
import { applySharisPresenceToEngine } from "@/lib/sharisPresence";
import type { CompanionPlaceId } from "./types";
import { placeById } from "./libraries/placeLibrary";
import { placeForSection } from "./companionLayoutSystem";

/**
 * Companion Presence Engine
 *
 * Before rendering a room, Companion Brain asks:
 * "Would Shari naturally stay with this guest here, or would she
 * thoughtfully prepare the room and give them privacy?"
 */

export type CompanionPresenceLevel = 1 | 2 | 3 | 4 | 5;

export type CompanionExperienceId =
  | "living-room"
  | "main-chat"
  | "welcome"
  | "voice-conversation"
  | "coaching"
  | "window-seat"
  | "clear-my-mind"
  | "plan-my-day"
  | "focus-buddy"
  | "focus-audio"
  | "breathing"
  | "meditation"
  | "games"
  | "pomodoro"
  | "sleep"
  | "calm-mode"
  | "creative-studio"
  | "business-office"
  | "reading-nook"
  | "garden"
  | "greenhouse"
  | "back-deck"
  | "library"
  | "workshop"
  | "focus-studio"
  | "kitchen-table"
  | "planning-table";

export type PresenceActivityModifier =
  /** Clear My Mind — guest is writing; only the room remains. */
  | "writing-active"
  /** Optional note before entering — still level 2, not Shari visible. */
  | "arrival-note-only"
  | "voice-conversation"
  | "coaching-session"
  | "strategy-discussion"
  | "body-doubling";

export const PRESENCE_LEVEL_META: Record<
  CompanionPresenceLevel,
  { name: string; purpose: string }
> = {
  5: {
    name: "Fully Present",
    purpose: "Relationship — conversation is the experience",
  },
  4: {
    name: "Working Together",
    purpose: "Partnership — Shari helps alongside the guest",
  },
  3: {
    name: "Nearby",
    purpose: "Support without interruption",
  },
  2: {
    name: "Recently Here",
    purpose: "Hospitality — evidence she prepared the room",
  },
  1: {
    name: "Invisible",
    purpose: "Protect attention — Shari intentionally steps back",
  },
};

export type ResolvedCompanionPresence = {
  level: CompanionPresenceLevel;
  levelName: string;
  purpose: string;
  experienceId: CompanionExperienceId;
  experienceLabel: string;
  /** Shari's photograph in the environment layer. */
  showShariImage: boolean;
  /** Subtle posture or ambient motion (Focus Buddy). */
  allowAmbientPresenceMotion: boolean;
  /** Mug, note, blanket — she was here recently. */
  showEvidenceObjects: boolean;
  evidenceObjects: readonly string[];
  /** Conversation / voice is the primary experience. */
  conversationPrimary: boolean;
  /** Host decision in plain language. */
  hostDecision: string;
  /** The orchestration question this answer resolves. */
  hostQuestion: string;
  rationale: string;
};

const HOST_QUESTION =
  "Would Shari naturally stay with this guest here, or would she thoughtfully prepare the room and give them privacy?";

type ExperiencePresenceRule = {
  id: CompanionExperienceId;
  label: string;
  level: CompanionPresenceLevel;
  /** Level may shift with activity (e.g. Clear My Mind 2 → 1 when writing). */
  levelWhenWriting?: CompanionPresenceLevel;
  levelWhenStrategy?: CompanionPresenceLevel;
  evidence?: readonly string[];
  rationale: string;
};

/** Companion Presence Map — experience-first, not control-first. */
export const EXPERIENCE_PRESENCE_MAP: readonly ExperiencePresenceRule[] = [
  {
    id: "living-room",
    label: "Living Room",
    level: 5,
    rationale: "Welcome and relationship — Shari is in the room",
  },
  {
    id: "main-chat",
    label: "Main Chat",
    level: 5,
    rationale: "Deep conversation — Shari faces the guest",
  },
  {
    id: "welcome",
    label: "Welcome",
    level: 5,
    rationale: "Arrival — host is present",
  },
  {
    id: "voice-conversation",
    label: "Voice Conversation",
    level: 5,
    rationale: "Voice is relationship",
  },
  {
    id: "coaching",
    label: "Coaching",
    level: 5,
    rationale: "Coaching requires full presence",
  },
  {
    id: "plan-my-day",
    label: "Plan My Day",
    level: 4,
    rationale: "Planning together at the table",
  },
  {
    id: "planning-table",
    label: "Planning Table",
    level: 4,
    rationale: "Shared planning surface",
  },
  {
    id: "focus-buddy",
    label: "Focus Buddy",
    level: 4,
    rationale: "Body doubling — present, quiet, working alongside",
  },
  {
    id: "creative-studio",
    label: "Creative Studio",
    level: 4,
    rationale: "Creating together",
  },
  {
    id: "back-deck",
    label: "Back Deck",
    level: 4,
    rationale: "Evening conversation together",
  },
  {
    id: "kitchen-table",
    label: "Kitchen Table",
    level: 4,
    rationale: "Morning start together — tea and gentle planning",
  },
  {
    id: "business-office",
    label: "Business Office",
    level: 3,
    levelWhenStrategy: 4,
    rationale: "Nearby for long work; closer when discussing strategy",
  },
  {
    id: "workshop",
    label: "Workshop",
    level: 3,
    rationale: "Hands-on work — support without interruption",
  },
  {
    id: "library",
    label: "Library",
    level: 3,
    rationale: "Quiet reference work — Shari ambient nearby",
  },
  {
    id: "focus-studio",
    label: "Focus Studio",
    level: 2,
    evidence: ["coffee mug", "open journal"],
    rationale:
      "Sunroom prepared for regulated attention — pond anchors focus; Shari nearby without supervising",
  },
  {
    id: "window-seat",
    label: "Window Seat",
    level: 2,
    evidence: ["handwritten note", "tea", "blanket"],
    rationale: "Prepared for reflection — no Shari image",
  },
  {
    id: "clear-my-mind",
    label: "Clear My Mind",
    level: 2,
    levelWhenWriting: 1,
    evidence: ["handwritten note", "tea", "blanket"],
    rationale: "Hospitality before capture; privacy once writing begins",
  },
  {
    id: "reading-nook",
    label: "Reading Nook",
    level: 2,
    evidence: ["open notebook", "reading glasses", "sweater on chair"],
    rationale: "Evidence she was here — not Shari herself",
  },
  {
    id: "garden",
    label: "Garden",
    level: 2,
    evidence: ["garden basket", "fresh flowers"],
    rationale: "Nature is the companion; quiet preparation remains",
  },
  {
    id: "greenhouse",
    label: "Greenhouse",
    level: 2,
    evidence: ["watering can", "seedling tray"],
    rationale: "Growth space — recently tended",
  },
  {
    id: "focus-audio",
    label: "Focus Audio",
    level: 1,
    rationale: "No Shari — environment supports concentration",
  },
  {
    id: "breathing",
    label: "Breathing",
    level: 1,
    rationale: "Breathing animation only",
  },
  {
    id: "meditation",
    label: "Meditation",
    level: 1,
    rationale: "Reduced stimulation",
  },
  {
    id: "games",
    label: "Games",
    level: 1,
    rationale: "Playful without another person watching",
  },
  {
    id: "pomodoro",
    label: "Pomodoro",
    level: 1,
    rationale: "Timer protects attention",
  },
  {
    id: "sleep",
    label: "Sleep",
    level: 1,
    rationale: "Rest — host steps fully back",
  },
  {
    id: "calm-mode",
    label: "Calm Mode",
    level: 1,
    rationale: "Minimum stimulation",
  },
];

const EXPERIENCE_BY_ID = new Map(
  EXPERIENCE_PRESENCE_MAP.map((rule) => [rule.id, rule]),
);

const PLACE_TO_EXPERIENCE: Partial<Record<CompanionPlaceId, CompanionExperienceId>> =
  {
    "living-room": "living-room",
    "window-seat": "window-seat",
    "kitchen-table": "kitchen-table",
    "planning-table": "plan-my-day",
    "business-office": "business-office",
    "creative-studio": "creative-studio",
    "workshop": "workshop",
    "focus-studio": "focus-studio",
    "sunroom-over-pond": "focus-studio",
    "reading-nook": "reading-nook",
    garden: "garden",
    "garden-path": "garden",
    greenhouse: "greenhouse",
    "back-deck": "back-deck",
    library: "library",
    "front-porch": "living-room",
    barn: "workshop",
    "outlook-point": "garden",
    "adventure-room": "living-room",
    "future-wings": "living-room",
    "fire-circle": "back-deck",
  };

const SECTION_TO_EXPERIENCE: Partial<Record<AppSection, CompanionExperienceId>> = {
  home: "living-room",
  today: "living-room",
  "brain-dump": "clear-my-mind",
  "plan-my-day": "plan-my-day",
  focus: "focus-studio",
  "visual-focus": "focus-buddy",
  "content-generator": "creative-studio",
  "my-work": "creative-studio",
  "business-profile": "business-office",
  "decision-compass": "business-office",
  "how-do-i": "library",
  growth: "reading-nook",
  "my-journey": "reading-nook",
  projects: "workshop",
};

export function experienceForPlace(placeId: CompanionPlaceId): CompanionExperienceId {
  return PLACE_TO_EXPERIENCE[placeId] ?? "living-room";
}

export function experienceForSection(section: AppSection): CompanionExperienceId {
  return SECTION_TO_EXPERIENCE[section] ?? experienceForPlace(placeForSection(section));
}

function hostDecisionForLevel(level: CompanionPresenceLevel): string {
  switch (level) {
    case 5:
      return "Shari stays — her presence improves this experience.";
    case 4:
      return "Shari works alongside the guest — partnership, not performance.";
    case 3:
      return "Shari is nearby — available without crowding the work.";
    case 2:
      return "Shari prepared the room and stepped away — evidence remains.";
    default:
      return "Shari gives privacy — the environment holds the guest.";
  }
}

function resolveLevel(
  rule: ExperiencePresenceRule,
  modifiers: PresenceActivityModifier[],
): CompanionPresenceLevel {
  if (modifiers.includes("writing-active") && rule.levelWhenWriting) {
    return rule.levelWhenWriting;
  }
  if (modifiers.includes("strategy-discussion") && rule.levelWhenStrategy) {
    return rule.levelWhenStrategy;
  }
  if (
    modifiers.includes("voice-conversation") ||
    modifiers.includes("coaching-session")
  ) {
    return 5;
  }
  if (modifiers.includes("body-doubling")) {
    return 4;
  }
  return rule.level;
}

/**
 * Resolve presence before rendering a room.
 * This is an orchestration layer — UI surfaces consume the result.
 */
export function evaluateCompanionPresenceEngine(input: {
  experienceId?: CompanionExperienceId;
  placeId?: CompanionPlaceId;
  section?: AppSection;
  modifiers?: PresenceActivityModifier[];
}): ResolvedCompanionPresence {
  const experienceId =
    input.experienceId ??
    (input.section
      ? experienceForSection(input.section)
      : experienceForPlace(input.placeId ?? "living-room"));

  const rule =
    EXPERIENCE_BY_ID.get(experienceId) ??
    EXPERIENCE_BY_ID.get("living-room")!;

  const modifiers = input.modifiers ?? [];
  const level = resolveLevel(rule, modifiers);
  const meta = PRESENCE_LEVEL_META[level];

  const showShariImage = level >= 5;
  const allowAmbientPresenceMotion = level === 4;
  const showEvidenceObjects = level === 2 || modifiers.includes("arrival-note-only");
  const evidenceObjects = showEvidenceObjects ? (rule.evidence ?? []) : [];
  const conversationPrimary = level >= 5;

  const placeName = input.placeId
    ? placeById(input.placeId).name
    : rule.label;

  const base: ResolvedCompanionPresence = {
    level,
    levelName: meta.name,
    purpose: meta.purpose,
    experienceId: rule.id,
    experienceLabel: rule.label,
    showShariImage,
    allowAmbientPresenceMotion,
    showEvidenceObjects,
    evidenceObjects,
    conversationPrimary,
    hostDecision: hostDecisionForLevel(level),
    hostQuestion: HOST_QUESTION,
    rationale: `${rule.rationale} (${placeName})`,
  };

  return applySharisPresenceToEngine(base, {
    experienceId: rule.id,
    placeId: input.placeId,
    section: input.section,
    writingActive: modifiers.includes("writing-active"),
    voiceConversation:
      modifiers.includes("voice-conversation") ||
      modifiers.includes("coaching-session"),
  });
}

export function presenceLevelFromLegacy(
  legacy: import("./types").ShariPresenceLevel,
): CompanionPresenceLevel {
  switch (legacy) {
    case "full":
      return 5;
    case "nearby":
      return 3;
    case "ambient":
      return 2;
    case "minimal":
      return 1;
    case "absent":
      return 1;
    default:
      return 3;
  }
}

export function legacyPresenceMatchesEngine(placeId: CompanionPlaceId): boolean {
  const place = placeById(placeId);
  const engine = evaluateCompanionPresenceEngine({ placeId });
  const legacyLevel = presenceLevelFromLegacy(place.shariPresenceLevel);
  return Math.abs(engine.level - legacyLevel) <= 1;
}
