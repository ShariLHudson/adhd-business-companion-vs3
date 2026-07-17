/**
 * Estate Command Router — execution layer after Estate Intelligence + Matcher.
 * Routes direct commands, intent-based navigation, and hybrid journeys.
 * Always passes Estate Memory forward on transitions.
 *
 * **Phase C:** Direct navigation must flow through `resolveEstatePlace` → `goToPlace`
 * (via `estateDirectRoomResolve`). Intent routing must not override exact place navigation.
 *
 * @see lib/estate/goToPlace.ts
 * @see docs/estate/PHASE_C_GOTOPLACE_REPORT.md
 */

import type { AppSection } from "@/lib/companionUi";
import type { WorkspaceOffer } from "@/lib/workspaceMode";
import {
  getEstateMemory,
  recordEstateRoomTransition,
  type EstateMemory,
} from "@/lib/estateMemory";
import {
  resolveDirectRoomDestination,
  resolveDirectRoomFromRoomId,
} from "@/lib/estate/estateDirectRoomResolve";
import {
  extractRoomPhraseFromNavigation,
  messageNamesExactEstateRoom,
  resolveEstateRoomAliasExact,
} from "@/lib/estate/estateRoomAliasRegistry";
import { estateArrivalShariGreeting } from "@/lib/estate/estateArrivalExperience";
import { getEstateRoomById } from "@/lib/estate/estateRoomRegistry";
import { evaluateEstateIntelligence } from "./estateIntelligence";
import { estateRegistryEntryById } from "./estateRegistry";
import { matchEstateCapabilities } from "./estateMatcher";
import {
  buildEstateInvitation,
  memberAlreadyInEstateDestination,
} from "./estateRouter";
import { workspaceOfferFromEstateEvaluation } from "./estateOffer";
import type { EstateConversationTurnEvaluation } from "./estateConversationPipeline";
import type { EstateRegistryEntry } from "./types";
import { estateSectionForEntryId } from "@/lib/estateMemory/estateSectionMap";
import { shouldSuppressEstateIntentWhileVisiting } from "@/lib/estate/estateRoomInConversation";
import { resolveEstatePlace, shouldNavigateFromResolution } from "@/lib/estate/resolveEstatePlace";
import { getCanonicalEstatePlaceById } from "@/lib/estate/canonicalEstateRegistry";
import {
  isAnotherRoomRequest,
  isEstateRoomListOrMapRequest,
} from "@/lib/estate/estateMetaNavigationPhrases";
import { isConversationOnlyTurn } from "@/lib/estate/estateConversationGuard";
import {
  isPhysicalQuietPlaceRequest,
  isPlaceSuggestionRequest,
} from "@/lib/estate/resolveEstatePlace";
import { isSubstantiveConversationHelpRequest } from "@/lib/estate/substantiveConversationHelp";
import { resolveSingleCanonicalPlaceMentionedInText } from "@/lib/estate/estatePlaceIdentityLock";
import {
  chamberMemberShortLabel,
  resolveChamberMemberFromText,
} from "@/lib/chamber/chamberMemberAliases";
import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import { getChamberMemberById } from "@/lib/chamber/chamberMemberRegistry";
import {
  buildChamberNavigateShariLine,
  mayNavigateToChamberMember,
} from "@/lib/conversationStabilization/chamberNavigateGate";

export type EstateCommandKind = "direct" | "intent" | "hybrid" | "none";

export type EstateCommandDecision = {
  kind: EstateCommandKind;
  executeImmediately: boolean;
  entryId: string;
  entry: EstateRegistryEntry;
  section: AppSection;
  workspaceOffer: WorkspaceOffer;
  roomId?: string;
  pendingJourneyEntryIds?: string[];
  clarifyQuestion?: string;
  backgroundImageOverride?: string | null;
};

export type EstateCommandRouterInput = {
  userText: string;
  activeSection: AppSection | null;
  workspacePanel?: string | null;
  estateTurn?: EstateConversationTurnEvaluation | null;
  emotionalState?: string | null;
  overwhelmed?: boolean;
  lastAssistantText?: string | null;
  /** When set, intent-based auto-navigation is suppressed — member is already in a room. */
  activeDirectVisitRoomId?: string | null;
};

const DIRECT_VERB_RE =
  /\b(?:go to|take me to|bring me to|(?:take\s+)?me to|open|show me|let(?:'s| us) (?:go to|visit)|head to|visit)\b/i;

/** "Where are the stables?" — member wants to get there, not a lecture. */
const WHERE_ROOM_RE =
  /\bwhere(?:'s| is| are)\s+(?:the\s+)?(.+?)(?:\?|$)/i;

const INTENT_EXPRESSION_RE =
  /\b(?:i want(?:\s+to)?|i need(?:\s+to)?|i'd like(?:\s+to)?|i would like(?:\s+to)?|i feel|i'm feeling|help me)\b/i;

const HYBRID_PATTERNS: { pattern: RegExp; sequence: string[] }[] = [
  {
    pattern:
      /\b(?:take me to|go to|visit|open)\b.*\bconservator(?:y|ies)\b.*\b(?:and\s+)?(?:help me\s+)?clear (?:my )?mind\b/i,
    sequence: ["conservatory", "clear-my-mind"],
  },
  {
    pattern: /\bcalm(?:\s+down)?\s+and\s+organize(?:\s+my\s+thoughts)?\b/i,
    sequence: ["clear-my-mind", "momentum-builder"],
  },
  {
    pattern: /\breflect\b.*\b(?:and\s+)?then\b.*\bplan\b/i,
    sequence: ["growth-journal", "momentum-builder"],
  },
  {
    pattern: /\borganize.*\bthoughts\b.*\b(?:and\s+)?then\b/i,
    sequence: ["clear-my-mind", "momentum-builder"],
  },
];

function extractWhereRoomPhrase(text: string): string | null {
  if (/\bwhat(?:'s| is| are)\b/i.test(text) && !WHERE_ROOM_RE.test(text)) {
    return null;
  }
  const match = text.match(WHERE_ROOM_RE);
  if (!match?.[1]?.trim()) return null;
  return match[1].trim().replace(/[®.!?]+$/g, "");
}

function extractBareDestinationPhrase(text: string): string | null {
  const normalized = text.trim().replace(/[®.!?]+$/g, "");
  if (!normalized || normalized.split(/\s+/).length > 8) return null;
  if (resolveEstateRoomAliasExact(normalized)) return normalized;
  if (resolveEstateRoomAliasExact(`the ${normalized}`)) return normalized;
  return null;
}

function extractLookLikeRoomPhrase(text: string): string | null {
  const match = text.match(/\bwhat does (?:the\s+)?(.+?)\s+look like\b/i);
  if (!match?.[1]?.trim()) return null;
  return match[1].trim().replace(/[®.!?]+$/g, "");
}

function extractDirectDestinationPhrase(text: string): string | null {
  const fromNavigation = extractRoomPhraseFromNavigation(text);
  if (fromNavigation) return fromNavigation;

  const lookLike = extractLookLikeRoomPhrase(text);
  if (lookLike) return lookLike;

  const wherePhrase = extractWhereRoomPhrase(text);
  if (wherePhrase) return wherePhrase;

  // Explicit activity destinations (not incidental room name mentions).
  if (/\b(?:clear\s+(?:my\s+)?mind|brain\s*dump)\b/i.test(text)) {
    return "clear my mind";
  }
  if (/\bplan\s+my\s+day\b/i.test(text)) {
    return "plan my day";
  }

  // Bare exact place names only ("Apple Orchard"). Do NOT use bounded
  // substring aliases here — chatting about a room must not become a
  // direct navigation command (Arrival / relationship chat stay in chat).
  return extractBareDestinationPhrase(text);
}

function detectContextualGoThere(
  userText: string,
  lastAssistantText?: string | null,
): EstateCommandDecision | null {
  if (!lastAssistantText?.trim()) return null;
  const confirms =
    /\b(?:go there|just go(?: there)?|head there|take me there|let'?s go(?: there)?)\b/i.test(
      userText,
    ) ||
    /\bthat one\b/i.test(userText) ||
    /^(?:yes|yep|yeah|yup|sure|ok(?:ay)?|please|do it|go ahead|sounds good|that works|perfect|great)\.?!?$/i.test(
      userText.trim(),
    ) ||
    (/\b(?:yes|yeah|yep|yup|sure|ok(?:ay)?)\b/i.test(userText) &&
      /\b(?:let'?s go|go there|take me|i would|i'?d love|would love|please|sounds good|that works)\b/i.test(
        userText,
      ));
  if (!confirms) return null;

  const singleMention = resolveSingleCanonicalPlaceMentionedInText(
    lastAssistantText,
  );
  if (singleMention) {
    const resolved = resolveDestinationEntryId(singleMention, lastAssistantText);
    if (resolved) return buildCommandDecision("direct", resolved, true);
  }

  const phrase =
    extractDirectDestinationPhrase(lastAssistantText) ??
    extractBareDestinationPhrase(lastAssistantText);
  if (!phrase) return null;
  const resolved = resolveDestinationEntryId(phrase, lastAssistantText);
  if (!resolved) return null;
  return buildCommandDecision("direct", resolved, true);
}

function syntheticEntry(
  entryId: string,
  section: AppSection,
  displayName: string,
): EstateRegistryEntry {
  return {
    id: entryId,
    name: displayName,
    category: "room",
    purpose: displayName,
    memberDescription: displayName,
    primarySection: section,
    keywords: [],
    problemsSolved: [],
    outcomes: [],
    journeyRole: "think",
    status: "live",
  };
}

function resolveDestinationEntryId(phrase: string, userText?: string): {
  entryId: string;
  roomId?: string;
  section?: AppSection;
  menuActionId?: WorkspaceOffer["estateMenuActionId"];
  displayName?: string;
} | null {
  const direct = resolveDirectRoomDestination(phrase, userText);
  if (direct) {
    return {
      entryId: direct.entryId,
      roomId: direct.roomId,
      section: direct.section ?? undefined,
      menuActionId: direct.menuActionId,
      displayName: direct.displayName,
    };
  }

  const alias = resolveEstateRoomAliasExact(phrase);
  if (alias) {
    const roomResolved = resolveDirectRoomFromRoomId(alias);
    if (roomResolved) {
      return {
        entryId: roomResolved.entryId,
        roomId: roomResolved.roomId,
        section: roomResolved.section ?? undefined,
        menuActionId: roomResolved.menuActionId,
        displayName: roomResolved.displayName,
      };
    }
    return { entryId: alias, roomId: alias };
  }

  const matches = matchEstateCapabilities({ userText: phrase });
  if (
    matches[0] &&
    (matches[0].confidence === "high" || matches[0].confidence === "medium")
  ) {
    return { entryId: matches[0].entry.id };
  }

  return null;
}

function isDefinitionalRequest(text: string): boolean {
  return (
    /\bwhat(?:'s| is| are)\b/i.test(text) && !DIRECT_VERB_RE.test(text)
  );
}

function workspaceOfferFromEntry(
  entry: EstateRegistryEntry,
  invitation?: string,
  opts?: {
    section?: AppSection;
    estateMenuActionId?: WorkspaceOffer["estateMenuActionId"];
  },
): WorkspaceOffer | null {
  const section = opts?.section ?? entry.primarySection;
  if (!section && !opts?.estateMenuActionId) return null;
  const labels: Partial<Record<string, string>> = {
    "peaceful-places": "Peaceful Places",
    "momentum-builder": "Open Momentum",
    "clear-my-mind": "Clear My Mind",
    conservatory: "Conservatory",
    "decision-compass": "Decision Compass",
    observatory: "Observatory",
    library: "Library",
    "creative-studio": "Create Studio",
    "growth-journal": "Journal",
    stables: "Stables",
  };
  return {
    section: section ?? "home",
    buttonLabel: labels[entry.id] ?? `Open ${entry.name}`,
    line: invitation ?? buildEstateInvitation(entry),
    estateMenuActionId: opts?.estateMenuActionId,
  };
}

function buildCommandDecision(
  kind: EstateCommandKind,
  resolved: NonNullable<ReturnType<typeof resolveDestinationEntryId>>,
  executeImmediately: boolean,
  opts?: {
    pendingJourneyEntryIds?: string[];
    clarifyQuestion?: string;
  },
): EstateCommandDecision | null {
  const entry =
    estateRegistryEntryById(resolved.entryId) ??
    syntheticEntry(
      resolved.entryId,
      resolved.section ?? "home",
      resolved.displayName ?? resolved.entryId,
    );
  const section =
    resolved.section ??
    (resolved.roomId
      ? resolveDirectRoomFromRoomId(resolved.roomId)?.section
      : null) ??
    entry.primarySection ??
    estateSectionForEntryId(resolved.roomId ?? resolved.entryId);
  if (!section && !resolved.menuActionId) return null;

  const offer = workspaceOfferFromEntry(entry, undefined, {
    section: section ?? "home",
    estateMenuActionId: resolved.menuActionId,
  });
  if (!offer) return null;

  return {
    kind,
    executeImmediately,
    entryId: resolved.roomId ?? resolved.entryId,
    entry,
    section: section ?? offer.section,
    workspaceOffer: offer,
    roomId: resolved.roomId,
    pendingJourneyEntryIds: opts?.pendingJourneyEntryIds,
    clarifyQuestion: opts?.clarifyQuestion,
  };
}

/** Build an immediate direct navigation command for a canonical place id. */
export function estateNavigateCommandForPlace(
  placeId: string,
  userText?: string,
  _opts?: { explicitActivityRequested?: boolean },
): EstateCommandDecision | null {
  const resolved = resolveDirectRoomFromRoomId(placeId);
  if (!resolved) {
    const alias = resolveEstateRoomAliasExact(placeId);
    if (!alias) return null;
    const fromAlias = resolveDirectRoomFromRoomId(alias);
    if (!fromAlias) return null;
    return buildCommandDecision(
      "direct",
      {
        entryId: fromAlias.entryId,
        roomId: fromAlias.roomId,
        section: fromAlias.section ?? undefined,
        menuActionId: fromAlias.menuActionId,
        displayName: fromAlias.displayName,
      },
      true,
    );
  }
  return buildCommandDecision(
    "direct",
    {
      entryId: resolved.entryId,
      roomId: resolved.roomId,
      section: resolved.section ?? undefined,
      menuActionId: resolved.menuActionId,
      displayName: resolved.displayName,
    },
    true,
  );
}

export function isDirectEstateRoomRequest(userText: string): boolean {
  return detectDirectCommand(userText) !== null;
}

export function detectDirectCommand(
  userText: string,
  context?: { lastAssistantText?: string | null },
): EstateCommandDecision | null {
  const trimmed = userText.trim();
  if (
    isAnotherRoomRequest(trimmed) ||
    isEstateRoomListOrMapRequest(trimmed)
  ) {
    return null;
  }
  // Coaching / strategy questions and place-suggestion asks are not direct nav.
  if (isSubstantiveConversationHelpRequest(trimmed)) return null;
  if (isPlaceSuggestionRequest(trimmed) || isPhysicalQuietPlaceRequest(trimmed)) {
    return null;
  }

  const contextual = detectContextualGoThere(
    userText,
    context?.lastAssistantText,
  );
  if (contextual) return contextual;

  const phrase = extractDirectDestinationPhrase(userText);
  if (!phrase) return null;
  const resolved = resolveDestinationEntryId(phrase, userText);
  if (!resolved) return null;
  return buildCommandDecision("direct", resolved, true);
}

export function detectHybridCommand(
  userText: string,
): EstateCommandDecision | null {
  for (const { pattern, sequence } of HYBRID_PATTERNS) {
    if (!pattern.test(userText)) continue;
    const [primary, ...rest] = sequence;
    if (!primary) continue;
    const resolved = resolveDestinationEntryId(primary, userText);
    if (!resolved) continue;
    return buildCommandDecision("hybrid", resolved, true, {
      pendingJourneyEntryIds: rest,
    });
  }

  if (!/\b(?:and then|,\s*then)\b/i.test(userText)) return null;
  const parts = userText
    .split(/\band then\b|,\s*then\b/i)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length < 2) return null;

  const ids: string[] = [];
  for (const part of parts) {
    const resolved = resolveDestinationEntryId(part, userText);
    const id = resolved?.entryId;
    if (id && ids[ids.length - 1] !== id) ids.push(id);
  }
  if (ids.length < 2) return null;
  const [primary, ...rest] = ids;
  const primaryResolved = resolveDestinationEntryId(primary!, userText);
  if (!primaryResolved) return null;
  return buildCommandDecision("hybrid", primaryResolved, true, {
    pendingJourneyEntryIds: rest,
  });
}

export function detectIntentCommand(
  userText: string,
  estateTurn: EstateConversationTurnEvaluation | null,
  estate = estateTurn?.estate,
): EstateCommandDecision | null {
  if (isDefinitionalRequest(userText)) return null;
  if (messageNamesExactEstateRoom(userText)) return null;

  const placeResolution = resolveEstatePlace(userText);
  if (placeResolution.kind === "suggestion") return null;
  if (shouldNavigateFromResolution(placeResolution)) return null;

  const strongEmotion =
    /\b(?:overwhelm|stuck|anxious|stress|relax|peace|reflect|create|research)\b/i.test(
      userText,
    );
  if (!INTENT_EXPRESSION_RE.test(userText) && !strongEmotion) return null;

  const evaluation =
    estate ??
    evaluateEstateIntelligence({
      userText,
      activeSection: null,
    });

  if (evaluation.suppressed || !evaluation.bestMatch) return null;
  const conf = evaluation.bestMatch.confidence;
  if (conf === "none" || conf === "low") return null;

  const offer = workspaceOfferFromEstateEvaluation(evaluation);
  if (!offer) {
    if (conf === "medium") {
      return null;
    }
    return null;
  }

  return {
    kind: "intent",
    executeImmediately: conf === "high",
    entryId: evaluation.bestMatch.entry.id,
    entry: evaluation.bestMatch.entry,
    section: offer.section,
    workspaceOffer: offer,
    clarifyQuestion: undefined,
  };
}

function buildChamberMemberNavigateCommand(
  memberId: ChamberMemberId,
): EstateCommandDecision | null {
  const member = getChamberMemberById(memberId);
  const label = chamberMemberShortLabel(memberId);
  const entry = syntheticEntry(
    "chamber-of-momentum",
    "chamber-of-momentum",
    member?.displayName ?? label,
  );
  const offer = workspaceOfferFromEntry(entry, undefined, {
    section: "chamber-of-momentum",
  });
  if (!offer) return null;
  offer.chamberMemberId = memberId;
  offer.buttonLabel = `Talk with ${label}`;
  offer.line = `Opening ${label} in the Chamber of Momentum.`;

  return {
    kind: "direct",
    executeImmediately: true,
    entryId: "chamber-of-momentum",
    entry,
    section: "chamber-of-momentum",
    workspaceOffer: offer,
    roomId: "chamber-of-momentum",
  };
}

export function detectChamberMemberCommand(
  userText: string,
  opts?: { menuSelectedMemberId?: string | null },
): EstateCommandDecision | null {
  // CB-022 — bare aliases inside domain questions must not auto-NAVIGATE.
  const gate = mayNavigateToChamberMember({
    userText,
    menuSelectedMemberId: opts?.menuSelectedMemberId,
  });

  if (gate.allow && opts?.menuSelectedMemberId) {
    return buildChamberMemberNavigateCommand(
      opts.menuSelectedMemberId as ChamberMemberId,
    );
  }

  const resolved = resolveChamberMemberFromText(userText);
  if (resolved.kind === "none") return null;

  if (resolved.kind === "ambiguous") {
    const entry = syntheticEntry(
      "chamber-of-momentum",
      "chamber-of-momentum",
      "Chamber of Momentum",
    );
    const offer = workspaceOfferFromEntry(entry, undefined, {
      section: "chamber-of-momentum",
    });
    if (!offer) return null;
    return {
      kind: "intent",
      executeImmediately: false,
      entryId: "chamber-of-momentum",
      entry,
      section: "chamber-of-momentum",
      workspaceOffer: offer,
      roomId: "chamber-of-momentum",
      clarifyQuestion: resolved.clarifyQuestion,
    };
  }

  // CB-022 — only explicit / menu / bare-name requests navigate.
  if (!gate.allow) {
    return null;
  }

  return buildChamberMemberNavigateCommand(resolved.match.memberId);
}

export function evaluateEstateCommand(
  input: EstateCommandRouterInput,
): EstateCommandDecision | null {
  const text = input.userText.trim();
  if (!text) return null;
  if (isConversationOnlyTurn(text)) return null;

  // Priority 1: specific Chamber member (or clarify when two fit equally)
  const chamberMember = detectChamberMemberCommand(text);
  if (chamberMember?.workspaceOffer.chamberMemberId) {
    return chamberMember;
  }
  if (chamberMember?.clarifyQuestion) {
    return chamberMember;
  }

  const hybrid = detectHybridCommand(text);
  if (hybrid) return hybrid;

  // Priority 2: general Chamber / other rooms
  const direct = detectDirectCommand(text, {
    lastAssistantText: input.lastAssistantText,
  });
  if (direct) return direct;

  if (shouldSuppressEstateIntentWhileVisiting(input.activeDirectVisitRoomId, text)) {
    return null;
  }

  return detectIntentCommand(text, input.estateTurn ?? null);
}

export function shouldExecuteEstateCommand(
  command: EstateCommandDecision,
  activeSection: AppSection | null,
  workspacePanel?: string | null,
  activeDirectVisitRoomId?: string | null,
): boolean {
  if (!command.executeImmediately) return false;
  if (command.workspaceOffer.estateMenuActionId) return true;
  if (command.kind === "direct" || command.kind === "hybrid") {
    const targetId = command.roomId ?? command.entryId;
    if (activeDirectVisitRoomId && targetId !== activeDirectVisitRoomId) {
      return true;
    }
    const currentId = getEstateMemory().currentRoom?.entryId;
    if (currentId !== targetId) return true;
  }
  return !memberAlreadyInEstateDestination(
    activeSection,
    workspacePanel,
    command.entry,
  );
}

/** Record transition + return updated memory (for pipeline hooks). */
export function executeEstateCommandMemoryHandoff(
  command: EstateCommandDecision,
  input: {
    userText: string;
    fromSection?: AppSection | null;
    reason?: string;
    shariGreeting?: string;
    playArrival?: boolean;
    playAmbience?: boolean;
  },
): EstateMemory {
  const reason =
    input.reason ??
    (command.kind === "direct"
      ? "direct room command"
      : command.kind === "hybrid"
        ? "estate journey"
        : "intent-based routing");

  return recordEstateRoomTransition({
    toSection: command.section,
    toEntryId: command.roomId ?? command.entryId,
    fromSection: input.fromSection ?? null,
    reason,
    userText: input.userText,
    pendingJourneyEntryIds: command.pendingJourneyEntryIds,
    preserveChat: true,
    expectedNextStep: estateDirectCommandArrivalLine(
      command.entryId,
      command.roomId,
    ),
    shariGreeting:
      input.shariGreeting ??
      (command.kind === "direct" && isDirectEstateRoomRequest(input.userText)
        ? undefined
        : estateArrivalShariGreeting(command.roomId ?? command.entryId) ??
          undefined),
    playArrival: input.playArrival,
    playAmbience: input.playAmbience,
  });
}

function displayNameForCommand(
  entryId: string,
  roomId?: string,
): string {
  const id = roomId ?? entryId;
  const room = getEstateRoomById(id);
  if (room) return room.trademark ?? room.name;
  const canonical = getCanonicalEstatePlaceById(id);
  if (canonical) return canonical.officialName;
  return estateRegistryEntryById(entryId)?.name ?? entryId;
}

/** Heading line when navigating — "Of course. Let's head to…" */
export function estateDirectCommandHeadingLine(
  entryId: string,
  roomId?: string,
): string {
  const name = displayNameForCommand(entryId, roomId);
  return `Of course. Let's head to ${name}.`;
}

/** Arrival line after the room opens — neutral; never pre-assign room activity. */
export function estateDirectCommandArrivalLine(
  entryId: string,
  roomId?: string,
): string {
  const id = roomId ?? entryId;
  if (id === "clear-my-mind" || entryId === "clear-my-mind") {
    return "Tell me everything that’s on your mind. Nothing has to be organized yet. As you type, I’ll safely capture your thoughts. When you’re finished, I’ll place them into a clear list while preserving your words, and you can quickly adjust anything I separated incorrectly.";
  }
  const name = displayNameForCommand(entryId, roomId);
  return `We're in ${name} now.`;
}

/** LLM guard when a navigation request still reaches the model (safety net). */
export function directEstateNavigationHintForChat(
  userText: string,
): string | null {
  const command = detectDirectCommand(userText);
  if (!command) return null;
  const name = displayNameForCommand(command.entryId, command.roomId);
  return [
    "DIRECT ESTATE NAVIGATION (mandatory — member named a destination):",
    `Destination: ${name}. The app navigates immediately — no permission question.`,
    "FORBIDDEN: explaining what this room is for, assigning an activity (creative, learning, etc.), curiosity openers ('what caught my attention', 'more going on'), asking what to explore/do/focus on before or during arrival, or offering choices before the member arrives.",
    "If you must speak before the transition finishes: one brief line only — e.g. 'Of course — heading there now.' — then stop.",
    "After arrival the app shows the room — do not ask what they want to do; the member will decide.",
  ].join("\n");
}

export function estateCommandAckLine(command: EstateCommandDecision): string {
  const memberId = command.workspaceOffer.chamberMemberId;
  if (memberId) {
    // CB-022 — Shari-owned navigate line; never specialist “Of course — here's …”.
    return buildChamberNavigateShariLine(memberId);
  }
  if (command.kind === "direct") {
    const id = command.roomId ?? command.entryId;
    /** Clear My Mind Mode — capture greeting only; no navigation chatter. */
    if (id === "clear-my-mind" || command.entryId === "clear-my-mind") {
      return estateDirectCommandArrivalLine(command.entryId, command.roomId);
    }
    return [
      estateDirectCommandHeadingLine(command.entryId, command.roomId),
      estateDirectCommandArrivalLine(command.entryId, command.roomId),
    ].join("\n\n");
  }
  if (command.kind === "hybrid") {
    return "There we go — we'll take the next step when you're ready.";
  }
  return "There we go.";
}
