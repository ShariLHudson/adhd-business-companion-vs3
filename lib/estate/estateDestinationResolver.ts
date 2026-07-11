/**
 * Ambiguous Estate Destination Resolution
 *
 * When a broad place name maps to several valid destinations, offer numbered
 * choices — never guess blindly or surface unknown-place errors.
 */

import { getCanonicalEstatePlaceById } from "./canonicalEstateRegistry";
import { extractEstateDestinationPhrase } from "./estateRoomAliasRegistry";
import { normalizeSpokenPlaceText } from "./estateSpokenPlaceNormalize";
import { resolvePlaceId } from "./placeIdAliases";
import { parseOptionSelection } from "@/lib/workspaceSop";

export const ESTATE_DESTINATION_MAX_CHOICES = 4;

export type EstateDestinationChoice = {
  label: string;
  destinationId: string;
  displayName: string;
  shortDescription: string;
  confidence: "high" | "medium" | "low";
  reasonMatched: string;
};

export type EstateDestinationExactMatch = {
  kind: "exact_match";
  destinationId: string;
  displayName: string;
  confidence: "high" | "medium" | "low";
  reasonMatched: string;
};

export type EstateDestinationAmbiguousMatch = {
  kind: "ambiguous_match";
  queryPhrase: string;
  intro: string;
  choices: EstateDestinationChoice[];
};

export type EstateDestinationNoMatch = {
  kind: "no_match";
  queryPhrase: string;
};

export type EstateDestinationResolution =
  | EstateDestinationExactMatch
  | EstateDestinationAmbiguousMatch
  | EstateDestinationNoMatch;

export type PendingNavigationChoices = {
  queryPhrase: string;
  choices: EstateDestinationChoice[];
  offeredAtTurn?: number;
};

type DestinationOptionDef = {
  destinationId: string;
  displayName: string;
  shortDescription: string;
  exclusivePhrases?: readonly string[];
  sortKeywords?: readonly string[];
};

type AmbiguityGroupDef = {
  id: string;
  patterns: readonly RegExp[];
  intro: string;
  options: readonly DestinationOptionDef[];
  /** Optional extra options when learning / study intent is present */
  learningOptions?: readonly DestinationOptionDef[];
};

const PENDING_NAVIGATION_KEY = "companion-pending-navigation-choices-v1";

let memoryPendingNavigation: PendingNavigationChoices | null = null;

const EXCLUSIVE_PHRASE_DESTINATIONS: Readonly<Record<string, string>> = {
  "celebration garden": "gardens",
  "the celebration garden": "gardens",
  "estate garden": "estate-gardens",
  "the estate garden": "estate-gardens",
  "estate gardens": "estate-gardens",
  "the estate gardens": "estate-gardens",
  "butterfly conservatory": "butterfly-house",
  "the butterfly conservatory": "butterfly-house",
  "butterfly house": "butterfly-house",
  "the butterfly house": "butterfly-house",
  "aquarium room": "conservatory",
  "the aquarium room": "conservatory",
  "personal library": "personal-library",
  "the personal library": "personal-library",
  "estate library": "library",
  "the estate library": "library",
  "reading nook by the window": "window-seat",
  "the reading nook by the window": "window-seat",
  "stairway reading nook": "stairway-reading-nook",
  "the stairway reading nook": "stairway-reading-nook",
  "back deck": "fireside-deck",
  "the back deck": "fireside-deck",
  "personal deck": "personal-deck",
  "the personal deck": "personal-deck",
  "fireside deck": "fireside-deck",
  "the fireside deck": "fireside-deck",
  "seat at the pond": "seat-at-pond",
  "reflection pond": "seat-at-pond",
  "the reflection pond": "seat-at-pond",
  "music room": "music-room",
  "the music room": "music-room",
  pool: "summer-terrace",
  "the pool": "summer-terrace",
  "swimming pool": "summer-terrace",
  "the swimming pool": "summer-terrace",
  "boardroom": "round-table",
  "the boardroom": "round-table",
  "board room": "round-table",
  "the board room": "round-table",
  "study hall": "study-hall",
  "the study hall": "study-hall",
  "strategy studio": "strategy-studio",
  "the strategy studio": "strategy-studio",
  "creative studio": "creative-studio",
  "the creative studio": "creative-studio",
  "art studio": "art-studio",
  "the art studio": "art-studio",
  "journal gazebo": "journal",
  "the journal gazebo": "journal",
  "gazebo journal": "journal",
};

const AMBIGUITY_GROUPS: readonly AmbiguityGroupDef[] = [
  {
    id: "garden",
    patterns: [/^(?:the\s+)?garden$/i, /^(?:the\s+)?gardens$/i],
    intro: "We have a few garden spaces. Which one would you like?",
    options: [
      {
        destinationId: "estate-gardens",
        displayName: "Estate Garden",
        shortDescription: "peaceful outdoor garden",
        exclusivePhrases: ["estate garden", "estate gardens"],
        sortKeywords: ["peaceful", "outdoor", "grounds", "paths"],
      },
      {
        destinationId: "gardens",
        displayName: "Celebration Garden",
        shortDescription: "for wins and milestones",
        exclusivePhrases: ["celebration garden"],
        sortKeywords: ["celebration", "wins", "milestones"],
      },
      {
        destinationId: "conservatory",
        displayName: "Butterfly Conservatory",
        shortDescription: "quiet beauty and reset",
        exclusivePhrases: ["butterfly conservatory", "conservatory"],
        sortKeywords: ["butterfly", "glass", "quiet", "conservatory"],
      },
      {
        destinationId: "greenhouse",
        displayName: "Greenhouse",
        shortDescription: "light, nature, and calm growth",
        exclusivePhrases: ["greenhouse", "kitchen garden"],
        sortKeywords: ["greenhouse", "kitchen", "plants", "growth"],
      },
    ],
  },
  {
    id: "library",
    patterns: [/^(?:the\s+)?library$/i],
    intro: "We have a couple of library spaces. Which one would you like?",
    options: [
      {
        destinationId: "library",
        displayName: "Estate Library",
        shortDescription: "quiet shelves and shared learning",
        exclusivePhrases: ["estate library"],
        sortKeywords: ["estate", "shared", "shelves"],
      },
      {
        destinationId: "personal-library",
        displayName: "Personal Library",
        shortDescription: "your own quiet reading room",
        exclusivePhrases: ["personal library"],
        sortKeywords: ["personal", "private", "mine", "my own"],
      },
    ],
    learningOptions: [
      {
        destinationId: "study-hall",
        displayName: "Study Hall",
        shortDescription: "quiet focus for learning",
        exclusivePhrases: ["study hall"],
        sortKeywords: ["study", "learn", "classroom", "focus"],
      },
    ],
  },
  {
    id: "reading-nook",
    patterns: [/^(?:the\s+)?reading nook$/i, /^(?:the\s+)?nook$/i],
    intro: "We have a couple of reading nooks. Which one would you like?",
    options: [
      {
        destinationId: "reading-nook",
        displayName: "Reading Nook",
        shortDescription: "quiet nook under the stairs",
        sortKeywords: ["stairs", "stairway", "arched"],
      },
      {
        destinationId: "stairway-reading-nook",
        displayName: "Stairway Reading Nook",
        shortDescription: "tucked-away hush on the stairs",
        exclusivePhrases: ["stairway reading nook"],
        sortKeywords: ["stairway", "stairs"],
      },
      {
        destinationId: "window-seat",
        displayName: "Reading Nook by Window",
        shortDescription: "soft light and a garden view",
        exclusivePhrases: ["reading nook by the window", "window seat"],
        sortKeywords: ["window", "light", "view"],
      },
    ],
  },
  {
    id: "deck",
    patterns: [/^(?:the\s+)?deck$/i],
    intro: "We have a few deck spaces. Which one would you like?",
    options: [
      {
        destinationId: "personal-deck",
        displayName: "Personal Deck",
        shortDescription: "private balcony and quiet air",
        exclusivePhrases: ["personal deck"],
        sortKeywords: ["personal", "private", "balcony"],
      },
      {
        destinationId: "fireside-deck",
        displayName: "Fireside Deck",
        shortDescription: "firelight and gathered warmth",
        exclusivePhrases: ["fireside deck", "back deck"],
        sortKeywords: ["fire", "fireside", "warm", "back", "evening"],
      },
    ],
  },
  {
    id: "pond",
    patterns: [/^(?:the\s+)?pond$/i],
    intro: "The pond seat is a quiet spot by the water.",
    options: [
      {
        destinationId: "seat-at-pond",
        displayName: "Seat at Pond / Dock",
        shortDescription: "still water and quiet breath",
        exclusivePhrases: [
          "reflection pond",
          "pond seat",
          "quiet pond",
          "pond dock",
          "peaceful water",
        ],
        sortKeywords: ["seat", "sit", "dock", "reflection", "quiet"],
      },
    ],
  },
  {
    id: "study",
    patterns: [/^(?:the\s+)?study$/i],
    intro: "A few quiet study spaces might fit. Which one would you like?",
    options: [
      {
        destinationId: "study-hall",
        displayName: "Study Hall",
        shortDescription: "quiet focus and learning",
        sortKeywords: ["study", "learn", "classroom"],
      },
      {
        destinationId: "library",
        displayName: "Estate Library",
        shortDescription: "shelves, reading, and thought",
        sortKeywords: ["library", "read", "books"],
      },
      {
        destinationId: "discovery-room",
        displayName: "Discovery Room",
        shortDescription: "look something up in calm focus",
        sortKeywords: ["discover", "research", "look up"],
      },
    ],
  },
  {
    id: "workroom",
    patterns: [/^(?:the\s+)?workroom$/i, /^(?:the\s+)?work room$/i],
    intro: "We have a few workrooms. Which one would you like?",
    options: [
      {
        destinationId: "strategy-studio",
        displayName: "Strategy Studio",
        shortDescription: "planning and focused work",
        sortKeywords: ["strategy", "plan", "work"],
      },
      {
        destinationId: "creative-studio",
        displayName: "Creative Studio",
        shortDescription: "make, draft, and build",
        sortKeywords: ["create", "creative", "make"],
      },
      {
        destinationId: "art-studio",
        displayName: "Art Studio",
        shortDescription: "visual making and craft",
        sortKeywords: ["art", "artist", "visual"],
      },
    ],
  },
];

const LEARN_INTENT_RE =
  /\b(?:learn|study|research|read up|understand more|teach me|classroom)\b/i;

const CLEAR_PENDING_RE =
  /\b(?:nevermind|never mind|forget it|cancel that|not anymore|stay here|stay right here)\b/i;

function normalizePhrase(phrase: string): string {
  return normalizeSpokenPlaceText(phrase)
    .trim()
    .toLowerCase()
    .replace(/[®.!?]+$/g, "")
    .replace(/\s+/g, " ");
}

function destinationExists(destinationId: string): boolean {
  const canonical = resolvePlaceId(destinationId);
  return Boolean(getCanonicalEstatePlaceById(canonical));
}

function buildChoice(
  option: DestinationOptionDef,
  reasonMatched: string,
  confidence: EstateDestinationChoice["confidence"] = "medium",
): EstateDestinationChoice | null {
  const canonical = resolvePlaceId(option.destinationId);
  if (!destinationExists(option.destinationId)) return null;
  return {
    label: "",
    destinationId: option.destinationId,
    displayName: option.displayName,
    shortDescription: option.shortDescription,
    confidence,
    reasonMatched: `${reasonMatched} → ${canonical}`,
  };
}

function findExclusiveExactMatch(
  phrase: string,
): EstateDestinationExactMatch | null {
  const normalized = normalizePhrase(phrase);
  if (!normalized) return null;

  const direct = EXCLUSIVE_PHRASE_DESTINATIONS[normalized];
  if (direct && destinationExists(direct)) {
    const option = findOptionDefForDestination(direct);
    return {
      kind: "exact_match",
      destinationId: direct,
      displayName: option?.displayName ?? displayNameForDestination(direct),
      confidence: "high",
      reasonMatched: `exclusive phrase "${normalized}"`,
    };
  }

  for (const group of AMBIGUITY_GROUPS) {
    for (const option of [...group.options, ...(group.learningOptions ?? [])]) {
      for (const exclusive of option.exclusivePhrases ?? []) {
        if (normalizePhrase(exclusive) !== normalized) continue;
        if (!destinationExists(option.destinationId)) continue;
        return {
          kind: "exact_match",
          destinationId: option.destinationId,
          displayName: option.displayName,
          confidence: "high",
          reasonMatched: `exclusive phrase "${normalized}"`,
        };
      }
    }
  }

  return null;
}

function findOptionDefForDestination(
  destinationId: string,
): DestinationOptionDef | undefined {
  const canonical = resolvePlaceId(destinationId);
  for (const group of AMBIGUITY_GROUPS) {
    for (const option of [...group.options, ...(group.learningOptions ?? [])]) {
      if (resolvePlaceId(option.destinationId) === canonical) return option;
    }
  }
  return undefined;
}

function displayNameForDestination(destinationId: string): string {
  const option = findOptionDefForDestination(destinationId);
  if (option) return option.displayName;
  return (
    getCanonicalEstatePlaceById(resolvePlaceId(destinationId))?.officialName.replace(
      //g,
      "",
    ) ?? destinationId
  );
}

function sortChoices(
  choices: EstateDestinationChoice[],
  context?: { currentPlaceId?: string | null; userText?: string },
): EstateDestinationChoice[] {
  const current = context?.currentPlaceId
    ? resolvePlaceId(context.currentPlaceId)
    : null;
  const userText = (context?.userText ?? "").toLowerCase();

  const score = (choice: EstateDestinationChoice): number => {
    let points = 0;
    const option = findOptionDefForDestination(choice.destinationId);
    const keywords = option?.sortKeywords ?? [];
    for (const keyword of keywords) {
      if (userText.includes(keyword)) points += 2;
    }
    if (current && choice.destinationId === current) points -= 5;
    return points;
  };

  return [...choices]
    .sort((a, b) => score(b) - score(a))
    .slice(0, ESTATE_DESTINATION_MAX_CHOICES)
    .map((choice, index) => ({ ...choice, label: String(index + 1) }));
}

function buildAmbiguousMatch(
  group: AmbiguityGroupDef,
  queryPhrase: string,
  context?: { currentPlaceId?: string | null; userText?: string },
): EstateDestinationAmbiguousMatch | null {
  const options = [
    ...group.options,
    ...(context?.userText && LEARN_INTENT_RE.test(context.userText)
      ? (group.learningOptions ?? [])
      : []),
  ];

  const choices = options
    .map((option) =>
      buildChoice(option, `ambiguous bucket "${group.id}"`, "medium"),
    )
    .filter((choice): choice is EstateDestinationChoice => Boolean(choice));

  const unique = dedupeChoices(choices);
  if (unique.length < 2) return null;

  const sorted = sortChoices(unique, context);
  return {
    kind: "ambiguous_match",
    queryPhrase,
    intro: group.intro,
    choices: sorted,
  };
}

function dedupeChoices(
  choices: EstateDestinationChoice[],
): EstateDestinationChoice[] {
  const seen = new Set<string>();
  const out: EstateDestinationChoice[] = [];
  for (const choice of choices) {
    if (seen.has(choice.destinationId)) continue;
    seen.add(choice.destinationId);
    out.push(choice);
  }
  return out;
}

function findAmbiguityGroup(phrase: string): AmbiguityGroupDef | null {
  const normalized = normalizePhrase(phrase);
  if (!normalized) return null;
  for (const group of AMBIGUITY_GROUPS) {
    if (group.patterns.some((pattern) => pattern.test(normalized))) {
      return group;
    }
  }
  return null;
}

export function resolveEstateDestination(input: {
  userText: string;
  destinationPhrase?: string | null;
  currentPlaceId?: string | null;
}): EstateDestinationResolution {
  const phrase =
    input.destinationPhrase?.trim() ||
    extractEstateDestinationPhrase(input.userText) ||
    input.userText.trim();
  const normalized = normalizePhrase(phrase);
  if (!normalized) {
    return { kind: "no_match", queryPhrase: phrase };
  }

  const exclusive = findExclusiveExactMatch(normalized);
  if (exclusive) return exclusive;

  const group = findAmbiguityGroup(normalized);
  if (group) {
    const ambiguous = buildAmbiguousMatch(group, normalized, {
      currentPlaceId: input.currentPlaceId,
      userText: input.userText,
    });
    if (ambiguous) return ambiguous;

    if (group.options.length === 1) {
      const only = buildChoice(group.options[0]!, `single option in "${group.id}"`, "high");
      if (only) {
        return {
          kind: "exact_match",
          destinationId: only.destinationId,
          displayName: only.displayName,
          confidence: "high",
          reasonMatched: only.reasonMatched,
        };
      }
    }
  }

  return { kind: "no_match", queryPhrase: normalized };
}

export function formatEstateDestinationChoiceMenu(
  resolution: EstateDestinationAmbiguousMatch,
): string {
  const lines = resolution.choices.map(
    (choice) =>
      `${choice.label}. ${choice.displayName} — ${choice.shortDescription}`,
  );
  return `${resolution.intro}\n${lines.join("\n")}`;
}

export function loadPendingNavigationChoices(): PendingNavigationChoices | null {
  if (typeof window === "undefined") return memoryPendingNavigation;
  try {
    const raw = window.sessionStorage.getItem(PENDING_NAVIGATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingNavigationChoices;
    if (!parsed?.choices?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePendingNavigationChoices(
  pending: PendingNavigationChoices,
): void {
  if (typeof window === "undefined") {
    memoryPendingNavigation = pending;
    return;
  }
  try {
    window.sessionStorage.setItem(PENDING_NAVIGATION_KEY, JSON.stringify(pending));
  } catch {
    /* ignore */
  }
}

export function clearPendingNavigationChoices(): void {
  memoryPendingNavigation = null;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PENDING_NAVIGATION_KEY);
  } catch {
    /* ignore */
  }
}

const DESCRIPTIVE_CUE_WORDS = [
  "personal",
  "private",
  "peaceful",
  "quiet",
  "calm",
  "celebration",
  "wins",
  "butterfly",
  "conservatory",
  "estate",
  "stairway",
  "stairs",
  "window",
  "swimming",
  "fire",
  "fireside",
  "reflection",
  "grand",
  "creative",
  "strategy",
  "art",
  "study",
  "discovery",
] as const;

function choiceSearchText(choice: EstateDestinationChoice): string {
  return `${choice.displayName} ${choice.shortDescription} ${choice.destinationId}`
    .toLowerCase()
    .replace(/-/g, " ");
}

export function resolvePendingNavigationChoice(
  userText: string,
  pending: PendingNavigationChoices,
): EstateDestinationChoice | null {
  const choices = pending.choices;
  if (!choices.length) return null;

  const idx = parseOptionSelection(userText, choices.length);
  if (idx !== null && choices[idx]) return choices[idx]!;

  const normalized = normalizePhrase(userText);

  for (const choice of choices) {
    const display = normalizePhrase(choice.displayName);
    if (display.length >= 3 && normalized.includes(display)) return choice;
    const idPhrase = choice.destinationId.replace(/-/g, " ");
    if (idPhrase.length >= 3 && normalized.includes(idPhrase)) return choice;
  }

  const theOne = normalized.match(/\b(?:the\s+)?(\w+)\s+one\b/);
  if (theOne?.[1]) {
    const cue = theOne[1]!.toLowerCase();
    const match = choices.find((choice) => choiceSearchText(choice).includes(cue));
    if (match) return match;
  }

  for (const cue of DESCRIPTIVE_CUE_WORDS) {
    if (!normalized.includes(cue)) continue;
    const matches = choices.filter((choice) => choiceSearchText(choice).includes(cue));
    if (matches.length === 1) return matches[0]!;
  }

  return null;
}

export function shouldClearPendingNavigationChoices(
  userText: string,
  hasPending: boolean,
): boolean {
  if (!hasPending) return false;
  const trimmed = userText.trim();
  if (!trimmed) return false;
  if (CLEAR_PENDING_RE.test(trimmed)) return true;

  const pending = loadPendingNavigationChoices();
  if (pending && resolvePendingNavigationChoice(trimmed, pending)) {
    return false;
  }

  if (parseOptionSelection(trimmed, pending?.choices.length ?? 0) !== null) {
    return false;
  }

  if (/\b(?:take me to|go to|visit|head to)\b/i.test(trimmed)) return false;

  if (trimmed.split(/\s+/).length >= 4) return true;

  return false;
}

export function pendingNavigationPlaceIds(
  pending: PendingNavigationChoices,
): string[] {
  return pending.choices.map((choice) => choice.destinationId);
}
