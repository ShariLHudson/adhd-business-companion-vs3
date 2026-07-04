/**
 * Estate Place Navigation Policy™ — PATH B only.
 *
 * PATH A (conversation) returns { type: "none" } — never guess toward routing.
 * PATH B: canonical registry · numbered menus · immediate selection → goToPlace.
 */

import { getCanonicalEstatePlaceById } from "./canonicalEstateRegistry";
import {
  formatEstatePlaceSuggestionMenu,
  pinQuietSuggestionOrder,
  extractPlaceIdsFromNumberedAssistantMenu,
  assistantContainsNumberedPlaceMenu,
  resolveSingleCanonicalPlaceMentionedInText,
  extractCanonicalPlaceIdsMentionedInText,
  textContainsCanonicalPlaceName,
} from "./estatePlaceIdentityLock";
import {
  formatEstateWanderMenu,
  formatVagueWanderClusterMenu,
} from "./estateWanderNavigation";
import {
  matchAmbiguousDestinationCluster,
  matchVaguePlaceCluster,
} from "./estatePlaceClusters";
import {
  clearPendingNavigationChoices,
  formatEstateDestinationChoiceMenu,
  loadPendingNavigationChoices,
  pendingNavigationPlaceIds,
  resolveEstateDestination,
  resolvePendingNavigationChoice,
  savePendingNavigationChoices,
  shouldClearPendingNavigationChoices,
  type EstateDestinationAmbiguousMatch,
} from "./estateDestinationResolver";
import {
  decodeSceneViewPlaceToken,
  encodeSceneViewPlaceToken,
  extractSceneViewTokensFromNumberedMenu,
  formatSceneViewMenuLine,
  listSceneViewsForPlace,
  placeHasSceneViewChoice,
  resolveSceneViewBackgroundUrl,
  sceneViewIdFromUserText,
  sceneViewTokensForPlace,
} from "./estatePlaceSceneViews";
import { isConversationOnlyTurn } from "./estateConversationGuard";
import { isCaptureWriteTurn } from "@/lib/capture/classifyCaptureIntent";
import { resolveDirectRoomFromRoomId } from "./estateDirectRoomResolve";
import {
  isPlaceSuggestionRequest,
  isPhysicalQuietPlaceRequest,
  resolveEstatePlace,
  shouldNavigateFromResolution,
  type EstatePlaceResolution,
} from "./resolveEstatePlace";
import { evaluateConversationEnvironmentNeed, isConversationEnvironmentOffer } from "./conversationDrivesNavigation";
import { isEstateTransitionOfferMessage } from "@/lib/estateMemory/estatePendingTransition";
import { extractRoomPhraseFromNavigation, resolveEstatePlaceIdFromUserText, messageNamesExactEstateRoom, findAmbiguousPlaceMatches } from "./estateRoomAliasRegistry";
import type { ImpliedEstatePlaceMatch } from "./impliedEstatePlaceMatch";
import {
  formatCelebrationSoundsReply,
  formatSwimmingPoolOfferLine,
  isCelebrationSoundsIntent,
  isVagueSwimmingActivityRequest,
  SWIMMING_POOL_ALTERNATIVE_PLACE_IDS,
} from "./estatePlaceNavigationIntents";
import {
  isDeckCorrectionTurn,
} from "./estateInRoomConversationIntents";
import {
  evaluateMetaEstateNavigationTurn,
  formatEstateRoomPickerLine,
  hasHardEstateNavigationIntent,
  isAnotherRoomRequest,
  isEstateRoomListOrMapRequest,
  pickExploratoryPlaceIds,
} from "./estateMetaNavigation";
import { parseOptionSelection } from "@/lib/workspaceSop";
import {
  detectDirectCommand,
  estateNavigateCommandForPlace,
  type EstateCommandDecision,
} from "@/lib/estateIntelligence/estateCommandRouter";

const HARD_NAV_RE =
  /\b(?:take me to|go to|visit|head to|bring me to|let(?:'s| us) go to)\b/i;

/** Member affirms a place offer without naming it again. */
export const CONTEXTUAL_GO_THERE_RE =
  /\b(?:go there|just go(?: there)?|head there|take me there|let'?s go(?: there)?)\b/i;

export const THAT_ONE_SELECTION_RE = /\bthat one\b/i;

const SHORT_PLACE_AFFIRMATION_RE =
  /^(?:yes|yep|yeah|yup|sure|ok(?:ay)?|please|do it|go ahead|sounds good|that works|perfect|great)\.?!?$/i;

/** True when member confirms a place offer — not merely agreeing to chat. */
export function isPlaceNavigationConfirmation(userText: string): boolean {
  const trimmed = userText.trim();
  if (!trimmed) return false;
  if (CONTEXTUAL_GO_THERE_RE.test(trimmed)) return true;
  if (THAT_ONE_SELECTION_RE.test(trimmed)) return true;
  if (SHORT_PLACE_AFFIRMATION_RE.test(trimmed)) return true;
  if (
    /\b(?:yes|yeah|yep|yup|sure|ok(?:ay)?)\b/i.test(trimmed) &&
    /\b(?:let'?s go|go there|take me|i would|i'?d love|would love|please|sounds good|that works)\b/i.test(
      trimmed,
    )
  ) {
    return true;
  }
  return false;
}

/** Assistant (or pending menu) offered a navigable place. */
export function assistantOffersPlaceNavigation(
  lastAssistantText?: string | null,
  pending?: PendingEstatePlaceMenu | null,
): boolean {
  if (pending?.placeIds.length) return true;
  const last = lastAssistantText?.trim();
  if (!last) return false;
  if (extractPlaceIdsFromNumberedAssistantMenu(last).length >= 1) return true;
  if (resolveSingleCanonicalPlaceMentionedInText(last)) return true;
  if (
    textContainsCanonicalPlaceName(last) &&
    /\b(?:want to|try|head to|visit|take you|show you|might help|could go|suggest|would fit|good fit)\b/i.test(
      last,
    )
  ) {
    return true;
  }
  if (isEstateTransitionOfferMessage(last)) return true;
  return false;
}

function extractCanonicalPlaceIdsFromProseOnly(text: string): string[] {
  const prose = text
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line && !/^\d+[.)]\s+/.test(line))
    .join(" ");
  return extractCanonicalPlaceIdsMentionedInText(prose);
}

function resolveConfirmedPlaceId(
  userText: string,
  lastAssistantText: string,
  menuPlaceIds: readonly string[],
): string | null {
  const trimmed = userText.trim();

  if (THAT_ONE_SELECTION_RE.test(trimmed)) {
    const proseMentioned = extractCanonicalPlaceIdsFromProseOnly(lastAssistantText);
    const proseInMenu = proseMentioned.filter((id) => menuPlaceIds.includes(id));
    if (proseInMenu.length === 1) return proseInMenu[0]!;
    if (proseInMenu.length > 1) {
      return proseInMenu[proseInMenu.length - 1]!;
    }
    if (menuPlaceIds.length === 1) return menuPlaceIds[0]!;
    if (menuPlaceIds.length > 0) return menuPlaceIds[0]!;
  }

  const fromSelection = placeIdFromUserSelection(userText, menuPlaceIds);
  if (fromSelection) return fromSelection;

  if (!isPlaceNavigationConfirmation(userText)) return null;

  if (menuPlaceIds.length === 1) return menuPlaceIds[0]!;

  const proseMentioned = extractCanonicalPlaceIdsFromProseOnly(lastAssistantText);
  const proseInMenu = proseMentioned.filter((id) => menuPlaceIds.includes(id));
  if (proseInMenu.length === 1) return proseInMenu[0]!;

  const mentioned = extractCanonicalPlaceIdsMentionedInText(lastAssistantText);
  const inMenu = mentioned.filter((id) => menuPlaceIds.includes(id));
  if (inMenu.length === 1) return inMenu[0]!;

  const single = resolveSingleCanonicalPlaceMentionedInText(lastAssistantText);
  if (single && menuPlaceIds.includes(single)) return single;

  return null;
}

export const ESTATE_PLACE_MAX_CHOICES = 3;

export type PendingEstatePlaceMenu = {
  placeIds: string[];
  offeredAtTurn?: number;
};

export type EstatePlaceTurnResult =
  | { type: "none" }
  | {
      type: "navigate";
      command: EstateCommandDecision;
      impliedPlaceMatch?: ImpliedEstatePlaceMatch;
      navigationLine?: string;
    }
  | { type: "offer"; line: string; placeIds: string[]; impliedPlaceMatch?: ImpliedEstatePlaceMatch }
  | { type: "reply"; line: string }
  | { type: "unknown_place"; line: string };

const PENDING_MENU_KEY = "companion-pending-estate-place-menu-v1";

let memoryPendingMenu: PendingEstatePlaceMenu | null = null;

const EXPLICIT_FEATURE_REQUEST_RE =
  /\b(?:feature|module|tool|workspace|open (?:the )?(?:plan|create|generator|dashboard))\b/i;

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function loadPendingEstatePlaceMenu(): PendingEstatePlaceMenu | null {
  if (typeof window === "undefined") return memoryPendingMenu;
  try {
    const raw = window.sessionStorage.getItem(PENDING_MENU_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingEstatePlaceMenu;
    if (!parsed?.placeIds?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePendingEstatePlaceMenu(menu: PendingEstatePlaceMenu): void {
  if (typeof window === "undefined") {
    memoryPendingMenu = menu;
    return;
  }
  try {
    window.sessionStorage.setItem(PENDING_MENU_KEY, JSON.stringify(menu));
  } catch {
    /* ignore */
  }
}

export function clearPendingEstatePlaceMenu(): void {
  memoryPendingMenu = null;
  clearPendingNavigationChoices();
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PENDING_MENU_KEY);
  } catch {
    /* ignore */
  }
}

function saveAmbiguousDestinationOffer(
  resolution: EstateDestinationAmbiguousMatch,
  offeredAtTurn?: number,
): void {
  savePendingNavigationChoices({
    queryPhrase: resolution.queryPhrase,
    choices: resolution.choices,
    offeredAtTurn,
  });
  savePendingEstatePlaceMenu({
    placeIds: pendingNavigationPlaceIds({
      queryPhrase: resolution.queryPhrase,
      choices: resolution.choices,
    }),
    offeredAtTurn,
  });
}

function tryDestinationResolverTurn(
  userText: string,
  currentPlaceId?: string | null,
): EstatePlaceTurnResult | null {
  const trimmed = userText.trim();
  if (!trimmed) return null;

  const destinationPhrase =
    extractRoomPhraseFromNavigation(trimmed) ?? trimmed;
  const wordCount = destinationPhrase.split(/\s+/).filter(Boolean).length;
  const isBareCandidate =
    wordCount <= 4 && !isConversationOnlyTurn(trimmed);

  if (
    !hasHardEstateNavigationIntent(trimmed) &&
    !isBareCandidate &&
    !isPhysicalQuietPlaceRequest(trimmed)
  ) {
    return null;
  }

  const resolution = resolveEstateDestination({
    userText: trimmed,
    destinationPhrase,
    currentPlaceId,
  });

  if (resolution.kind === "exact_match") {
    if (
      hasHardEstateNavigationIntent(trimmed) ||
      messageNamesExactEstateRoom(trimmed) ||
      wordCount <= 4
    ) {
      clearPendingEstatePlaceMenu();
      const finalized = finalizePlaceNavigation(
        resolution.destinationId,
        trimmed,
      );
      if (finalized) return finalized;
    }
    return null;
  }

  if (resolution.kind === "ambiguous_match") {
    saveAmbiguousDestinationOffer(resolution);
    return {
      type: "offer",
      line: formatEstateDestinationChoiceMenu(resolution),
      placeIds: pendingNavigationPlaceIds({
        queryPhrase: resolution.queryPhrase,
        choices: resolution.choices,
      }),
    };
  }

  return null;
}

function resolvePendingDestinationTurn(
  userText: string,
  lastAssistantText?: string | null,
): EstatePlaceTurnResult | null {
  const pendingNav = loadPendingNavigationChoices();
  const pendingMenu = loadPendingEstatePlaceMenu();
  const hasPending =
    Boolean(pendingNav?.choices.length) || Boolean(pendingMenu?.placeIds.length);

  if (!hasPending) return null;

  if (shouldClearPendingNavigationChoices(userText, true)) {
    clearPendingEstatePlaceMenu();
    return { type: "none" };
  }

  if (pendingNav?.choices.length) {
    const selected = resolvePendingNavigationChoice(userText, pendingNav);
    if (selected) {
      clearPendingEstatePlaceMenu();
      const finalized = finalizePlaceNavigation(selected.destinationId, userText);
      if (finalized) return finalized;
    }
  }

  const menuPlaceIds = resolveActiveMenuPlaceIds(pendingMenu, lastAssistantText);
  if (menuPlaceIds.length >= 2) {
    const selected =
      resolveConfirmedPlaceId(userText, lastAssistantText ?? "", menuPlaceIds) ??
      placeIdFromUserSelection(userText, menuPlaceIds);
    if (selected) {
      clearPendingEstatePlaceMenu();
      const finalized = finalizePlaceNavigation(selected, userText);
      if (finalized) return finalized;
    }
  }

  return null;
}

export function formatEstatePlaceChoicesLine(placeIds: readonly string[]): string {
  return formatEstatePlaceSuggestionMenu(placeIds);
}

function uniquePlaceIds(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (!id || seen.has(id)) continue;
    if (!getCanonicalEstatePlaceById(id) && !resolveDirectRoomFromRoomId(id) && !decodeSceneViewPlaceToken(id)) {
      continue;
    }
    seen.add(id);
    out.push(id);
    if (out.length >= ESTATE_PLACE_MAX_CHOICES) break;
  }
  return out;
}

function placeIdFromUserSelection(
  userText: string,
  placeIds: readonly string[],
): string | null {
  const idx = parseOptionSelection(userText, placeIds.length);
  if (idx !== null && placeIds[idx]) return placeIds[idx]!;

  const normalized = normalize(userText);
  for (const placeId of placeIds) {
    const sceneToken = decodeSceneViewPlaceToken(placeId);
    if (sceneToken) {
      const view = listSceneViewsForPlace(sceneToken.placeId).find(
        (row) => row.viewId === sceneToken.viewId,
      );
      if (view) {
        const label = normalize(view.label.replace(/™/g, ""));
        if (normalized.includes(label) || normalized.includes(sceneToken.viewId)) {
          return placeId;
        }
      }
      continue;
    }
    const place = getCanonicalEstatePlaceById(placeId);
    if (!place) continue;
    const labels = [place.officialName, ...place.aliases];
    for (const label of labels) {
      const alias = normalize(label);
      if (alias.length >= 3 && normalized.includes(alias)) return placeId;
    }
  }
  return null;
}

function collectSuggestionPlaceIds(
  resolution: EstatePlaceResolution,
): string[] {
  const ids = resolution.suggestedPlaceIds ?? [];
  return pinQuietSuggestionOrder(uniquePlaceIds(ids));
}

function navigateCommandForPlace(
  placeId: string,
  userText: string,
  explicitActivityRequested?: boolean,
): EstateCommandDecision | null {
  return estateNavigateCommandForPlace(placeId, userText, {
    explicitActivityRequested,
  });
}

function sceneViewOfferIfNeeded(
  placeId: string,
  userText: string,
): EstatePlaceTurnResult | null {
  if (!placeHasSceneViewChoice(placeId)) return null;

  const specified = sceneViewIdFromUserText(placeId, userText);
  if (specified) {
    const command = navigateCommandForPlace(placeId, userText);
    if (!command) return null;
    return {
      type: "navigate",
      command: {
        ...command,
        backgroundImageOverride:
          resolveSceneViewBackgroundUrl(placeId, specified) ?? null,
      },
    };
  }

  return {
    type: "offer",
    line: formatSceneViewMenuLine(placeId),
    placeIds: sceneViewTokensForPlace(placeId),
  };
}

function finalizePlaceNavigation(
  placeOrToken: string,
  userText: string,
  explicitActivityRequested?: boolean,
): EstatePlaceTurnResult | null {
  const decoded = decodeSceneViewPlaceToken(placeOrToken);
  const placeId = decoded?.placeId ?? placeOrToken;

  if (!decoded && placeHasSceneViewChoice(placeId)) {
    return sceneViewOfferIfNeeded(placeId, userText);
  }

  if (decoded) {
    const command = navigateCommandForPlace(
      placeId,
      userText,
      explicitActivityRequested,
    );
    if (!command) return null;
    return {
      type: "navigate",
      command: {
        ...command,
        backgroundImageOverride:
          resolveSceneViewBackgroundUrl(decoded.placeId, decoded.viewId) ?? null,
      },
    };
  }

  const command = navigateCommandForPlace(
    placeId,
    userText,
    explicitActivityRequested,
  );
  if (!command) return null;
  return { type: "navigate", command };
}

function offerAmbiguousAliasMatches(
  destinationPhrase: string,
  excludePlaceId?: string | null,
): { line: string; placeIds: string[] } | null {
  const matches = findAmbiguousPlaceMatches(destinationPhrase).filter(
    (id) => id !== excludePlaceId,
  );
  if (matches.length < 2) return null;
  const placeIds = pinQuietSuggestionOrder(matches).slice(0, 3);
  return {
    line: formatEstatePlaceSuggestionMenu(placeIds, {
      intro: "A few places that could fit — which one did you mean?",
    }),
    placeIds,
  };
}

function tryNamedPlaceWhileMenuOpen(
  userText: string,
  pending: PendingEstatePlaceMenu | null,
  lastAssistantText?: string | null,
): EstatePlaceTurnResult | null {
  const hasMenu =
    (pending?.placeIds.length ?? 0) >= 2 ||
    assistantContainsNumberedPlaceMenu(lastAssistantText ?? "");
  if (!hasMenu) return null;

  const trimmed = userText.trim();
  if (!trimmed || /^\d+$/.test(trimmed)) return null;

  const namedPlace = resolveEstatePlaceIdFromUserText(trimmed);
  if (!namedPlace) return null;

  if (
    hasHardEstateNavigationIntent(trimmed) ||
    messageNamesExactEstateRoom(trimmed) ||
    trimmed.split(/\s+/).length <= 4
  ) {
    clearPendingEstatePlaceMenu();
    return finalizePlaceNavigation(namedPlace, trimmed);
  }

  return null;
}

function isContextualPlaceNavigationRequest(userText: string): boolean {
  return isPlaceNavigationConfirmation(userText);
}

/** Confirmed intent → immediate navigation (no chat delay). */
function resolveContextualPlaceNavigation(
  userText: string,
  lastAssistantText?: string | null,
): EstatePlaceTurnResult | null {
  if (!isPlaceNavigationConfirmation(userText)) return null;
  if (!lastAssistantText?.trim()) return null;
  if (!assistantOffersPlaceNavigation(lastAssistantText, loadPendingEstatePlaceMenu())) {
    return null;
  }

  const pending = loadPendingEstatePlaceMenu();
  const menuIds = resolveActiveMenuPlaceIds(pending, lastAssistantText);

  const confirmedId = menuIds.length
    ? resolveConfirmedPlaceId(userText, lastAssistantText, menuIds)
    : null;

  if (confirmedId) {
    clearPendingEstatePlaceMenu();
    const finalized = finalizePlaceNavigation(confirmedId, userText);
    if (finalized) return finalized;
  }

  const singleMention = resolveSingleCanonicalPlaceMentionedInText(
    lastAssistantText,
  );
  if (singleMention) {
    clearPendingEstatePlaceMenu();
    const finalized = finalizePlaceNavigation(singleMention, userText);
    if (finalized) return finalized;
  }

  const direct = detectDirectCommand(userText, {
    lastAssistantText,
  });
  if (direct?.executeImmediately) {
    clearPendingEstatePlaceMenu();
    return { type: "navigate", command: direct };
  }

  return null;
}

/** Member corrects a false unknown-place reply about cafe / coffee house. */
function detectCafePlaceCorrection(
  userText: string,
  lastAssistantText?: string | null,
): EstatePlaceTurnResult | null {
  const last = (lastAssistantText ?? "").toLowerCase();
  if (!/\b(?:don't have|we don't have)\b/.test(last)) return null;
  if (!/\b(?:cafe|café|coffee)\b/.test(last)) return null;
  if (
    !/\b(?:(?:there|it)'?s one|off property|off the property|yes there is|you do have|we do have|it exists|there is one)\b/i.test(
      userText,
    )
  ) {
    return null;
  }
  const command = navigateCommandForPlace("coffee-house", userText);
  if (!command) return null;
  return { type: "navigate", command };
}

export function formatUnknownEstatePlaceReply(requestedPhrase: string): string {
  const trimmed = requestedPhrase.trim().replace(/[.!?]+$/g, "");
  const bare = trimmed.replace(/^(?:the|a|an)\s+/i, "").trim();
  const label = bare
    ? bare.charAt(0).toUpperCase() + bare.slice(1)
    : "That place";
  return `We don't have ${label} on the Estate. Name a place from the map — or we can stay right here.`;
}

function resolveActiveMenuPlaceIds(
  pending: PendingEstatePlaceMenu | null,
  lastAssistantText?: string | null,
): string[] {
  const last = lastAssistantText?.trim() ?? "";
  const sceneFromAssistant = last
    ? uniquePlaceIds(extractSceneViewTokensFromNumberedMenu(last))
    : [];
  if (sceneFromAssistant.length >= 2) {
    savePendingEstatePlaceMenu({
      placeIds: sceneFromAssistant,
      offeredAtTurn: pending?.offeredAtTurn,
    });
    return sceneFromAssistant;
  }

  const fromAssistant = last
    ? uniquePlaceIds(extractPlaceIdsFromNumberedAssistantMenu(last))
    : [];

  if (fromAssistant.length >= 2) {
    const currentPending = uniquePlaceIds(pending?.placeIds ?? []);
    const sameOrder =
      currentPending.length === fromAssistant.length &&
      currentPending.every((id, index) => id === fromAssistant[index]);
    if (!sameOrder) {
      savePendingEstatePlaceMenu({
        placeIds: fromAssistant,
        offeredAtTurn: pending?.offeredAtTurn,
      });
    }
    return fromAssistant;
  }

  if (pending?.placeIds.length) {
    return uniquePlaceIds(pending.placeIds);
  }

  return fromAssistant;
}

function isLikelyPlaceMenuContinuation(
  userText: string,
  placeIds: readonly string[],
  lastAssistantText?: string | null,
): boolean {
  if (placeIds.length === 0 && lastAssistantText?.trim()) {
    const recovered = extractPlaceIdsFromNumberedAssistantMenu(lastAssistantText);
    if (recovered.length >= 2) {
      return isLikelyPlaceMenuContinuation(userText, recovered);
    }
  }
  if (placeIds.length === 0) return false;
  if (parseOptionSelection(userText, placeIds.length) !== null) return true;
  if (placeIdFromUserSelection(userText, placeIds)) return true;
  if (hasHardEstateNavigationIntent(userText)) return true;
  if (isContextualPlaceNavigationRequest(userText)) return true;
  return false;
}

/** PATH B gate — when false, caller must use conversation (PATH A). */
function isEstatePlaceNavigationTurn(
  text: string,
  lastAssistantText?: string | null,
): boolean {
  if (isConversationOnlyTurn(text)) return false;
  if (
    assistantContainsNumberedPlaceMenu(lastAssistantText ?? "") &&
    parseOptionSelection(text.trim(), 3) !== null
  ) {
    return true;
  }
  if (hasHardEstateNavigationIntent(text)) return true;
  if (isPlaceSuggestionRequest(text)) return true;
  if (isPhysicalQuietPlaceRequest(text)) return true;

  const resolution = resolveEstatePlace(text);
  if (shouldAutoNavigateFromResolution(text, resolution)) return true;
  if (resolution.kind === "suggestion") return true;
  return false;
}

function shouldAutoNavigateFromResolution(
  text: string,
  resolution: EstatePlaceResolution,
): resolution is EstatePlaceResolution & { placeId: string } {
  if (!shouldNavigateFromResolution(resolution)) return false;
  if (hasHardEstateNavigationIntent(text)) return true;
  if (
    resolution.kind === "explicit-object" ||
    resolution.kind === "explicit-activity"
  ) {
    return true;
  }
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (resolution.kind === "exact-place" && words <= 8) return true;
  return false;
}

function shouldEvaluatePlaceTurn(
  userText: string,
  hasPendingMenu: boolean,
  lastAssistantText?: string | null,
): boolean {
  if (!userText.trim()) return false;
  if (EXPLICIT_FEATURE_REQUEST_RE.test(userText)) return false;

  const pending = loadPendingEstatePlaceMenu();
  const menuPlaceIds = resolveActiveMenuPlaceIds(pending, lastAssistantText);

  if (hasPendingMenu || menuPlaceIds.length >= 2) {
    if (
      menuPlaceIds.length &&
      isLikelyPlaceMenuContinuation(userText, menuPlaceIds, lastAssistantText)
    ) {
      return true;
    }
    if (
      hasPendingMenu &&
      shouldClearPendingNavigationChoices(userText, true)
    ) {
      clearPendingEstatePlaceMenu();
    }
  }

  return isEstatePlaceNavigationTurn(userText, lastAssistantText);
}

function evaluateImpliedPlaceTurn(
  _userText: string,
): EstatePlaceTurnResult | null {
  // IMPLIED_NEED — frictionless conversation layer offers choices; no kernel auto-route.
  return null;
}

function detectDeckArrivalCorrection(
  userText: string,
  currentPlaceId?: string | null,
): EstatePlaceTurnResult | null {
  if (!isDeckCorrectionTurn(userText, currentPlaceId)) return null;
  const command = navigateCommandForPlace("back-deck", userText);
  if (!command) return null;
  return {
    type: "navigate",
    command,
    navigationLine: "You're right — let me take you to the Back Deck.",
  };
}

/**
 * Evaluate a member turn — PATH B Estate navigation only.
 * Returns { type: "none" } for PATH A conversation.
 */
export function evaluateEstatePlaceTurn(input: {
  userText: string;
  currentPlaceId?: string | null;
  lastAssistantText?: string | null;
}): EstatePlaceTurnResult {
  const text = input.userText.trim();
  if (!text) return { type: "none" };

  if (isCelebrationSoundsIntent(text)) {
    return { type: "reply", line: formatCelebrationSoundsReply() };
  }

  if (isVagueSwimmingActivityRequest(text)) {
    return {
      type: "offer",
      line: formatSwimmingPoolOfferLine(),
      placeIds: [...SWIMMING_POOL_ALTERNATIVE_PLACE_IDS],
    };
  }

  const metaNav = evaluateMetaEstateNavigationTurn({
    userText: text,
    currentPlaceId: input.currentPlaceId,
  });
  if (metaNav?.type === "navigate" && metaNav.command) {
    const placeId = metaNav.command.roomId ?? metaNav.command.entryId;
    const finalized = finalizePlaceNavigation(placeId, text);
    if (finalized) return finalized;
    return { type: "navigate", command: metaNav.command };
  }
  if (metaNav?.type === "offer") {
    return {
      type: "offer",
      line: metaNav.line,
      placeIds: metaNav.placeIds,
    };
  }

  const deckCorrection = detectDeckArrivalCorrection(
    text,
    input.currentPlaceId,
  );
  if (deckCorrection) return deckCorrection;

  if (isCaptureWriteTurn(text)) return { type: "none" };

  const lastAssistant = input.lastAssistantText ?? null;

  const pendingDestination = resolvePendingDestinationTurn(text, lastAssistant);
  if (pendingDestination) return pendingDestination;

  const cafeCorrection = detectCafePlaceCorrection(text, lastAssistant);
  if (cafeCorrection) return cafeCorrection;

  const contextualNav = resolveContextualPlaceNavigation(text, lastAssistant);
  if (contextualNav) return contextualNav;

  const impliedTurn = evaluateImpliedPlaceTurn(text);
  if (impliedTurn) return impliedTurn;

  const vagueCluster =
    matchVaguePlaceCluster(text, input.currentPlaceId) ??
    formatVagueWanderClusterMenu(text, input.currentPlaceId);
  if (vagueCluster) {
    return {
      type: "offer",
      line: vagueCluster.line,
      placeIds: vagueCluster.placeIds,
    };
  }

  const barePhrase = text.trim();
  if (barePhrase.split(/\s+/).length <= 4) {
    const destinationResolverTurn = tryDestinationResolverTurn(
      text,
      input.currentPlaceId,
    );
    if (destinationResolverTurn) return destinationResolverTurn;

    const ambiguousBare = matchAmbiguousDestinationCluster(
      barePhrase,
      input.currentPlaceId,
    );
    if (ambiguousBare) {
      return {
        type: "offer",
        line: ambiguousBare.line,
        placeIds: ambiguousBare.placeIds,
      };
    }
  }

  const pending = loadPendingEstatePlaceMenu();
  const namedWhileMenu = tryNamedPlaceWhileMenuOpen(
    text,
    pending,
    lastAssistant,
  );
  if (namedWhileMenu) return namedWhileMenu;

  if (!shouldEvaluatePlaceTurn(text, Boolean(pending), lastAssistant)) {
    return { type: "none" };
  }

  const menuPlaceIds = resolveActiveMenuPlaceIds(pending, lastAssistant);
  if (menuPlaceIds.length) {
    const selected =
      resolveConfirmedPlaceId(text, lastAssistant ?? "", menuPlaceIds) ??
      placeIdFromUserSelection(text, menuPlaceIds);
    if (selected) {
      clearPendingEstatePlaceMenu();
      const finalized = finalizePlaceNavigation(selected, text);
      if (finalized) return finalized;
    }
  }

  const resolution = resolveEstatePlace(text);

  if (resolution.kind === "audio-settings") {
    return { type: "reply", line: formatCelebrationSoundsReply() };
  }

  const resolverBeforeAutoNav = tryDestinationResolverTurn(
    text,
    input.currentPlaceId,
  );
  if (resolverBeforeAutoNav) return resolverBeforeAutoNav;

  if (shouldAutoNavigateFromResolution(text, resolution) && resolution.placeId) {
    clearPendingEstatePlaceMenu();
    const finalized = finalizePlaceNavigation(
      resolution.placeId,
      text,
      resolution.explicitActivityRequested,
    );
    if (finalized) return finalized;
  }

  if (
    hasHardEstateNavigationIntent(text) &&
    !shouldAutoNavigateFromResolution(text, resolution)
  ) {
    if (isAnotherRoomRequest(text) || isEstateRoomListOrMapRequest(text)) {
      const wander = formatEstateWanderMenu(input.currentPlaceId);
      return {
        type: "offer",
        line: wander.line,
        placeIds: wander.placeIds,
      };
    }
    clearPendingEstatePlaceMenu();
    const phrase = extractRoomPhraseFromNavigation(text) ?? text;
    const destinationResolverTurn = tryDestinationResolverTurn(
      phrase,
      input.currentPlaceId,
    );
    if (destinationResolverTurn) return destinationResolverTurn;

    const ambiguousCluster =
      matchAmbiguousDestinationCluster(phrase, input.currentPlaceId) ??
      offerAmbiguousAliasMatches(phrase, input.currentPlaceId);
    if (ambiguousCluster) {
      return {
        type: "offer",
        line: ambiguousCluster.line,
        placeIds: ambiguousCluster.placeIds,
      };
    }
    if (isAnotherRoomRequest(phrase) || isEstateRoomListOrMapRequest(phrase)) {
      const wander = formatEstateWanderMenu(input.currentPlaceId);
      return {
        type: "offer",
        line: wander.line,
        placeIds: wander.placeIds,
      };
    }
    return {
      type: "unknown_place",
      line: formatUnknownEstatePlaceReply(phrase),
    };
  }

  if (resolution.kind !== "suggestion") {
    return { type: "none" };
  }

  const placeIds = collectSuggestionPlaceIds(resolution);
  if (placeIds.length === 0) return { type: "none" };

  const environmentOffer = evaluateConversationEnvironmentNeed(text);
  const offerLine =
    isConversationEnvironmentOffer(environmentOffer) && environmentOffer.offerLine
      ? environmentOffer.offerLine
      : formatEstatePlaceSuggestionMenu(placeIds);

  return {
    type: "offer",
    line: offerLine,
    placeIds,
  };
}

/** After assistant shows a numbered place menu, persist ids for instant selection. */
export function registerPendingEstatePlaceMenuFromAssistant(
  assistantText: string,
  offeredAtTurn?: number,
): boolean {
  const sceneTokens = uniquePlaceIds(
    extractSceneViewTokensFromNumberedMenu(assistantText),
  );
  if (sceneTokens.length >= 2) {
    savePendingEstatePlaceMenu({ placeIds: sceneTokens, offeredAtTurn });
    return true;
  }

  const placeIds = uniquePlaceIds(
    extractPlaceIdsFromNumberedAssistantMenu(assistantText),
  );
  if (placeIds.length < 2) return false;
  savePendingEstatePlaceMenu({ placeIds, offeredAtTurn });
  return true;
}
