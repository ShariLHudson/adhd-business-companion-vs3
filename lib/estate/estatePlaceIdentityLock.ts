/**
 * Estate Place Identity Lock
 *
 * Shari may ONLY reference canonical Estate place names (registry officialName).
 * Descriptive invented locations are mapped internally — never echoed member-facing.
 *
 * @see docs/estate/ESTATE_PLACE_IDENTITY_LOCK.md
 */

import {
  CANONICAL_ESTATE_REGISTRY,
  getCanonicalEstatePlaceById,
  resolveCanonicalPlaceIdFromAlias,
} from "./canonicalEstateRegistry";
import {
  NO_CANONICAL_PLACE_SUGGESTIONS_LINE,
  suggestCanonicalPlaceIds,
} from "./canonicalPlaceSuggestions";
import {
  consolidateChamberPlaceIdsForMenu,
  resolveChamberMemberFacingName,
} from "./chamberOfMomentumIdentity";
import { resolveEstateIntent } from "./estateIntentBridge";
import { isPlaceSuggestionRequest, resolveEstatePlace } from "./resolveEstatePlace";
import { isSubstantiveConversationHelpRequest } from "./substantiveConversationHelp";

export const ESTATE_PLACE_IDENTITY_MAX_CHOICES = 3;

export const QUIET_PLACE_SUGGESTION_ORDER = [
  "reading-nook",
  "greenhouse",
  "back-deck",
] as const;

export const ESTATE_PLACE_SUGGESTION_INTRO =
  "A few ideas:";

export const ESTATE_PLACE_SUGGESTION_CLOSER =
  "Just tell me which one — or name another room if you're picturing somewhere else.";

/** Stable member-facing order for quiet/restorative suggestion menus. */
export function pinQuietSuggestionOrder(placeIds: readonly string[]): string[] {
  const pinned = QUIET_PLACE_SUGGESTION_ORDER.filter((id) =>
    placeIds.includes(id),
  );
  const rest = placeIds.filter(
    (id) =>
      !QUIET_PLACE_SUGGESTION_ORDER.includes(
        id as (typeof QUIET_PLACE_SUGGESTION_ORDER)[number],
      ),
  );
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of [...pinned, ...rest]) {
    if (!id || seen.has(id) || !getCanonicalEstatePlaceById(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= ESTATE_PLACE_IDENTITY_MAX_CHOICES) break;
  }
  return out;
}

/** Member-facing blurbs for canonical places only — never invented locations. */
export const CANONICAL_PLACE_SUGGESTION_BLURBS: Readonly<
  Record<string, string>
> = {
  "reading-nook": "quiet, reflective space",
  "peaceful-places": "gentle gardens and quiet paths",
  conservatory: "glass, greenery, butterfly-light calm",
  "back-deck": "open air, grounding space",
  "seat-at-pond": "still water, quiet breath",
  "garden-path": "slow walk among living things",
  "woodland-path": "trees, trail, open air",
  "apple-orchard": "open sky, unhurried air",
  greenhouse: "light, nature, calm energy",
  "coffee-house": "soft company, warm cup",
  library: "quiet shelves, unhurried thought",
  "momentum-institute": "calm focus, gentle learning",
  gardens: "quiet garden paths, unhurried green",
  observatory: "wide sky, room to think",
  "creative-studio": "make, draft, build with focus",
  "music-room": "sound that opens imagination",
  "porch-swing": "easy sway, unhurried rest",
  "momentum-builder": "clear table, momentum without rush",
  journal: "private pages, unhurried reflection",
};

export function canonicalPlaceSuggestionBlurb(
  placeId: string,
  primaryFeeling?: string,
): string {
  const fixed = CANONICAL_PLACE_SUGGESTION_BLURBS[placeId];
  if (fixed) return fixed;
  if (primaryFeeling?.trim()) {
    const feeling = primaryFeeling.trim();
    const clause = feeling.split(",")[0]!.trim();
    return `${clause.charAt(0).toUpperCase()}${clause.slice(1)}.`;
  }
  return "A named place on the Estate when you need it.";
}

function normalizePlaceMenuLabel(label: string): string {
  return label
    .trim()
    .replace(/\u2122/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/** Pull canonical place ids from any numbered assistant menu (LLM or system). */
export function extractPlaceIdsFromNumberedAssistantMenu(text: string): string[] {
  const lines = [...text.matchAll(/^\s*\d+[.)]\s+(.+)$/gm)];
  if (lines.length < 1) return [];

  const seen = new Set<string>();
  const out: string[] = [];
  for (const match of lines) {
    const body = match[1]!.trim();
    const namePart = body.split(" — ")[0]!.replace(/\u2122/g, "").trim();
    const placeId = resolveCanonicalPlaceIdFromAlias(namePart);
    if (!placeId || seen.has(placeId)) continue;
    seen.add(placeId);
    out.push(placeId);
    if (out.length >= ESTATE_PLACE_IDENTITY_MAX_CHOICES) break;
  }
  return out;
}

export function assistantContainsNumberedPlaceMenu(text: string): boolean {
  return extractPlaceIdsFromNumberedAssistantMenu(text).length >= 2;
}

/**
 * Remove canonical numbered Estate place menus from assistant copy.
 * Used when an active task lock must not surface room routing.
 */
export function stripEstatePlaceMenuFromAssistantCopy(text: string): {
  text: string;
  strippedMenu: boolean;
} {
  const trimmed = text.trim();
  if (!trimmed) return { text, strippedMenu: false };

  const hadIntro = trimmed.includes(ESTATE_PLACE_SUGGESTION_INTRO);
  const hadNumberedMenu = assistantContainsNumberedPlaceMenu(trimmed);
  if (!hadIntro && !hadNumberedMenu) {
    return { text, strippedMenu: false };
  }

  let out = trimmed;
  if (hadIntro) {
    const introPattern = ESTATE_PLACE_SUGGESTION_INTRO.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
    const closerPattern = ESTATE_PLACE_SUGGESTION_CLOSER.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
    out = out
      .replace(
        new RegExp(`${introPattern}[\\s\\S]*?${closerPattern}`, "i"),
        "",
      )
      .trim();
  }

  if (assistantContainsNumberedPlaceMenu(out)) {
    const lines = out.split(/\r?\n/);
    out = lines
      .filter((line) => {
        if (!/^\s*\d+[.)]\s+/.test(line)) return true;
        const namePart = line
          .replace(/^\s*\d+[.)]\s+/, "")
          .split(" — ")[0]!
          .replace(/\u2122/g, "")
          .trim();
        return !resolveCanonicalPlaceIdFromAlias(namePart);
      })
      .join("\n")
      .trim();
  }

  out = out.replace(/\n{3,}/g, "\n\n").trim();
  return { text: out, strippedMenu: true };
}

/** True when numbered lines use canonical registry place names. */
export function isCanonicalPlaceSuggestionMenu(text: string): boolean {
  if (!text.includes(ESTATE_PLACE_SUGGESTION_INTRO)) return false;
  const entries = [...text.matchAll(/^\s*\d+[.)]\s+.+ — .+$/gm)];
  if (entries.length < 1 || entries.length > ESTATE_PLACE_IDENTITY_MAX_CHOICES) {
    return false;
  }
  return entries.every((m) => {
    const namePart = m[0]!.replace(/^\s*\d+[.)]\s+/, "").split(" — ")[0]!;
    const name = normalizePlaceMenuLabel(namePart);
    return Boolean(resolveCanonicalPlaceIdFromAlias(name));
  });
}

/** Forbidden invented-location patterns in member-facing copy. */
export const INVENTED_ESTATE_PLACE_PATTERNS: readonly RegExp[] = [
  /\bquiet corner(?:\s+by(?:\s+the)?\s+pond)?\b/i,
  /\bcorner by the pond\b/i,
  /\bquiet nook by the pond\b/i,
  /\bnook by the (?:pond|water)\b/i,
  /\bpeaceful garden area\b/i,
  /\bsome spot in the garden\b/i,
  /\ba lovely place outside\b/i,
  /\bspot in the garden\b/i,
  /\bplace outside\b/i,
  /\bsomewhere (?:quiet|peaceful|nice|lovely|outside)\b/i,
  /\b(?:a|some) (?:quiet|peaceful|lovely) (?:spot|corner|nook|area)\b/i,
  /\b(?:lovely|nice|perfect) (?:spot|corner|nook)\b/i,
  /\b(?:old oak tree|under the old oak)\b/i,
  /\b(?:hammock by the garden|meditation corner|bench near the creek)\b/i,
  /\bnear the pond\b/i,
  /\bthe little bench\b/i,
];

export function canonicalPlaceOfficialName(placeId: string): string | null {
  const chamberName = resolveChamberMemberFacingName(placeId);
  if (chamberName) return chamberName;
  return getCanonicalEstatePlaceById(placeId)?.officialName ?? null;
}

export function textContainsCanonicalPlaceName(text: string): boolean {
  const lower = text.toLowerCase();
  for (const place of CANONICAL_ESTATE_REGISTRY) {
    const official = place.officialName.toLowerCase();
    const withoutMark = official.replace(/\u2122/g, "").trim();
    const withoutThe = withoutMark.replace(/^the\s+/, "");
    if (
      lower.includes(official) ||
      lower.includes(withoutMark) ||
      (withoutThe.length >= 4 && lower.includes(withoutThe))
    ) {
      return true;
    }
  }
  return false;
}

function normalizeMentionText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[®.,!?]+/g, " ")
    .replace(/\s+/g, " ");
}

/** Distinct canonical place ids mentioned in prose (longest alias wins per place). */
export function extractCanonicalPlaceIdsMentionedInText(text: string): string[] {
  const normalized = normalizeMentionText(text);
  if (!normalized) return [];

  const longestAliasByPlace = new Map<string, number>();
  for (const place of CANONICAL_ESTATE_REGISTRY) {
    const candidates = [place.officialName, ...place.aliases];
    for (const alias of candidates) {
      const normalizedAlias = normalizeMentionText(alias);
      if (normalizedAlias.length < 3) continue;
      if (!normalized.includes(normalizedAlias)) continue;
      const prev = longestAliasByPlace.get(place.id) ?? 0;
      if (normalizedAlias.length > prev) {
        longestAliasByPlace.set(place.id, normalizedAlias.length);
      }
    }
  }

  return [...longestAliasByPlace.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([placeId]) => placeId);
}

/** When assistant named exactly one canonical place, return its id. */
export function resolveSingleCanonicalPlaceMentionedInText(
  text: string,
): string | null {
  const ids = extractCanonicalPlaceIdsMentionedInText(text);
  if (ids.length !== 1) return null;
  return ids[0] ?? null;
}

export function containsInventedPlaceLanguage(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return INVENTED_ESTATE_PLACE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function memberDescribesNonCanonicalPlace(userText: string): boolean {
  const text = userText.trim();
  if (!text) return false;
  if (isSubstantiveConversationHelpRequest(text)) return false;
  if (textContainsCanonicalPlaceName(text)) return false;
  const resolution = resolveEstatePlace(text);
  if (resolution.kind !== "none") return true;
  const intent = resolveEstateIntent({ text });
  return intent.suggestedPlaceIds.length > 0 || intent.confidence >= 0.5;
}

export function mapMemberDescriptionToCanonicalIds(
  userText: string,
): string[] {
  const text = userText.trim();
  if (!text) return [];
  if (isSubstantiveConversationHelpRequest(text)) return [];

  const registryIds = suggestCanonicalPlaceIds(text);
  if (registryIds.length > 0) {
    return pinQuietSuggestionOrder(registryIds);
  }

  const resolution = resolveEstatePlace(text);
  if (resolution.placeId) {
    return pinQuietSuggestionOrder([resolution.placeId]);
  }

  const intent = resolveEstateIntent({ text });
  const ids: string[] = [];
  if (intent.primaryPlaceId) ids.push(intent.primaryPlaceId);
  if (intent.suggestedPlaceIds.length) ids.push(...intent.suggestedPlaceIds);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (!id || seen.has(id) || !getCanonicalEstatePlaceById(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= ESTATE_PLACE_IDENTITY_MAX_CHOICES) break;
  }
  return pinQuietSuggestionOrder(out);
}

export function formatCanonicalPlaceMappingLine(placeId: string): string {
  const name = canonicalPlaceOfficialName(placeId);
  if (!name) {
    return "I'm still with you — we can stay here or try a named place on the Estate.";
  }
  return `${name} would be perfect for that kind of quiet reflection.`;
}

/** Mandatory numbered Estate place suggestion format (PATH B). */
export function formatEstatePlaceSuggestionMenu(
  placeIds: readonly string[],
  opts?: { intro?: string; closer?: string },
): string {
  const ordered = pinQuietSuggestionOrder(
    consolidateChamberPlaceIdsForMenu(placeIds),
  );
  const places = ordered
    .map((id) => getCanonicalEstatePlaceById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, ESTATE_PLACE_IDENTITY_MAX_CHOICES);

  if (places.length === 0) {
    return NO_CANONICAL_PLACE_SUGGESTIONS_LINE;
  }

  const lines = places.map((place, index) => {
    const blurb = canonicalPlaceSuggestionBlurb(
      place.id,
      place.primaryFeeling,
    );
    return `${index + 1}. ${place.officialName} — ${blurb}`;
  });

  const intro = opts?.intro ?? ESTATE_PLACE_SUGGESTION_INTRO;
  const closer = opts?.closer ?? ESTATE_PLACE_SUGGESTION_CLOSER;

  return `${intro}\n${lines.join("\n")}\n${closer}`;
}

/** @deprecated Use formatEstatePlaceSuggestionMenu */
export function formatCanonicalPlaceSuggestionMenu(
  _userText: string,
  placeIds: readonly string[],
): string {
  return formatEstatePlaceSuggestionMenu(placeIds);
}

/** @deprecated Use formatEstatePlaceSuggestionMenu */
export function formatCanonicalPlaceChoiceMenu(
  placeIds: readonly string[],
): string {
  return formatEstatePlaceSuggestionMenu(placeIds);
}

function isSystemEstatePlaceChoiceMenuFromText(text: string): boolean {
  return isCanonicalPlaceSuggestionMenu(text);
}

/** Replace LLM-invented numbered place lists with canonical registry names. */
export function repairInventedEstatePlaceList(
  text: string,
  userText?: string,
): string {
  const numbered = text.match(/^\s*\d+[.)]\s+/gm) ?? [];
  if (numbered.length < 2) return text;
  if (isSystemEstatePlaceChoiceMenuFromText(text)) return text;

  const source = userText?.trim() || text;
  // Never rewrite strategy / marketing / planning answers into room menus.
  if (isSubstantiveConversationHelpRequest(source)) return text;
  if (
    userText?.trim() &&
    !isPlaceSuggestionRequest(userText) &&
    resolveEstatePlace(userText).kind === "none" &&
    resolveEstateIntent({ text: userText }).suggestedPlaceIds.length === 0
  ) {
    return text;
  }

  const placeIds = mapMemberDescriptionToCanonicalIds(source);
  if (placeIds.length === 0) return text;

  return formatEstatePlaceSuggestionMenu(placeIds);
}

export function formatPlaceIdentityReply(
  _userText: string,
  placeIds: readonly string[],
): string {
  return formatEstatePlaceSuggestionMenu(placeIds);
}

function replaceInventedPhrasesWithCanonical(
  text: string,
  placeId: string,
): string {
  const name = canonicalPlaceOfficialName(placeId);
  if (!name) return text;
  let out = text;
  for (const pattern of INVENTED_ESTATE_PLACE_PATTERNS) {
    out = out.replace(pattern, name);
  }
  return out;
}

/**
 * Last gate: assistant copy must not invent Estate place names.
 * Maps to canonical registry names only.
 */
export function enforceCanonicalPlaceIdentityInCopy(
  text: string,
  opts?: { userText?: string },
): string {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const repairedList = repairInventedEstatePlaceList(trimmed, opts?.userText);
  if (repairedList !== trimmed) return repairedList;

  const invented = containsInventedPlaceLanguage(trimmed);
  const hasCanonical = textContainsCanonicalPlaceName(trimmed);

  if (!invented && hasCanonical) return text;
  if (!invented && !hasCanonical) return text;

  const source = opts?.userText?.trim() || trimmed;
  const placeIds = mapMemberDescriptionToCanonicalIds(source);

  if (invented && !hasCanonical && placeIds.length > 0) {
    if (placeIds.length === 1) {
      return formatCanonicalPlaceMappingLine(placeIds[0]!);
    }
    return formatPlaceIdentityReply(source, placeIds);
  }

  if (invented && placeIds.length > 0) {
    return replaceInventedPhrasesWithCanonical(trimmed, placeIds[0]!);
  }

  if (invented) {
    let scrubbed = trimmed;
    for (const pattern of INVENTED_ESTATE_PLACE_PATTERNS) {
      scrubbed = scrubbed.replace(pattern, "").replace(/\s{2,}/g, " ").trim();
    }
    return scrubbed || trimmed;
  }

  return text;
}

export function estatePlaceIdentityHintForChat(userText: string): string {
  if (isSubstantiveConversationHelpRequest(userText)) {
    return [
      "ESTATE PLACE IDENTITY LOCK:",
      "This turn is a substantive help / strategy request — answer in conversation.",
      "Do NOT offer Estate room menus, place suggestions, or navigation.",
    ].join("\n");
  }

  const mapped = mapMemberDescriptionToCanonicalIds(userText);
  const canonicalExamples = mapped
    .map((id) => canonicalPlaceOfficialName(id))
    .filter((n): n is string => Boolean(n))
    .slice(0, 3);

  const lines = [
    "ESTATE PLACE IDENTITY LOCK (mandatory):",
    "Estate is a named world — use ONLY canonical registry place names in replies.",
    "FORBIDDEN: inventing, paraphrasing, or softening place names (e.g. corner by the pond, quiet nook, peaceful garden area).",
    "Map member descriptions to the closest canonical place internally; speak ONLY the official name.",
  ];

  if (canonicalExamples.length === 1) {
    lines.push(
      `This turn maps to: ${canonicalExamples[0]}.`,
      `Example line: "${formatCanonicalPlaceMappingLine(mapped[0]!)}".`,
      "Do NOT echo the member's descriptive phrase as a location.",
    );
  } else if (canonicalExamples.length > 1) {
    lines.push(
      `Offer ONLY these canonical names (numbered if offering choices): ${canonicalExamples.join(" · ")}.`,
      "No invented variations.",
    );
  } else {
    lines.push(
      "No place mapping for this turn — answer in conversation; do not invent room menus.",
    );
  }

  lines.push("Navigation always uses canonical place ids via goToPlace — never descriptive strings.");
  return lines.join("\n");
}
