/**
 * resolveEstateAction — the ONLY decision point for member input routing.
 *
 * Priority (strict): NAVIGATE → CAPTURE → AUDIO → MENU → CHAT
 * Pure logic — no LLM, no async, no side effects.
 */

import { detectAudioRequest } from "@/lib/audioSuggestions";
import { classifyCaptureIntent } from "@/lib/capture/classifyCaptureIntent";
import type { CaptureType } from "@/lib/capture/types";
import { isReflectionRequest } from "@/lib/memory/reflection/createReflectionReport";
import {
  canClaimAlreadyHere,
  getLiveShellPlaceId,
  getVisualRoom,
  isNonPlaceShellSection,
  resolvePlaceFromShell,
  setRequestedRoom,
  syncEstateRoomAwareness,
} from "@/lib/estate/roomAwareness";
import { evaluateEstatePlaceTurn } from "../estatePlaceNavigation";
import { evaluateEstateRoomAction } from "../roomContext/evaluateEstateRoomAction";
import { estateRoomsEquivalent } from "../roomContext/roomIds";
import { evaluateLibraryConversationReply } from "../libraryConversationIntents";
import {
  evaluateInRoomConversationReply,
  formatAlreadyHereReply,
} from "../estateInRoomConversationIntents";
import { isEstateSoundscapeNavigationRequest } from "../estateSoundscapeNavigation";
import type {
  EstateActionResult,
  MemoryLibraryTargetTab,
  ResolveEstateActionContext,
} from "./types";

const AMBIGUOUS_CAPTURE_RE =
  /\b(?:save|store|add)\b.{0,40}\b(?:something|somewhere|not sure|don't know where)\b/i;

const CAPTURE_MENU_LINE =
  "Where should this go?\n1. Journal\n2. Portfolio\n3. Evidence Vault\nSay a number or name.";

function captureTypeToMemoryTab(captureType: CaptureType): MemoryLibraryTargetTab {
  if (captureType === "evidence-vault") return "evidence";
  return captureType;
}

function reflectionMemoryTarget(
  userText: string,
): EstateActionResult {
  return {
    action: "NAVIGATE",
    userText,
    target: { kind: "memory", tab: "reflection" },
  };
}

function captureViewMemoryTarget(
  userText: string,
  captureType: CaptureType,
): EstateActionResult {
  return {
    action: "NAVIGATE",
    userText,
    target: { kind: "memory", tab: captureTypeToMemoryTab(captureType) },
  };
}

/**
 * Resolve member input to exactly one estate action.
 * When uncertain after MENU checks → CHAT (never guess NAVIGATE or CAPTURE).
 */
export function resolveEstateAction(
  context: ResolveEstateActionContext,
): EstateActionResult {
  if (context.soundscapeCategoryId?.trim()) {
    return {
      action: "AUDIO",
      userText: context.userText.trim(),
      categoryId: context.soundscapeCategoryId.trim(),
    };
  }

  const userText = context.userText.trim();
  if (!userText) {
    return { action: "CHAT", userText: "" };
  }

  // Sync live shell first. Section map / non-place tools beat stale memory.
  // Exception: direct visits keep section=home while placeId is the visited room —
  // do not wipe those to welcome-home.
  const section = context.activeSection?.trim() ?? null;
  const callerPlace = context.currentPlaceId?.trim() || null;
  if (section) {
    const shellPlace = resolvePlaceFromShell({ section });
    const directVisitOnHome =
      section === "home" &&
      callerPlace &&
      !estateRoomsEquivalent(callerPlace, "welcome-home");
    if (directVisitOnHome) {
      syncEstateRoomAwareness({ placeId: callerPlace, section });
    } else if (shellPlace) {
      syncEstateRoomAwareness({ placeId: shellPlace, section });
    } else if (isNonPlaceShellSection(section)) {
      syncEstateRoomAwareness({ section, clearVisual: true });
    } else {
      syncEstateRoomAwareness({ placeId: callerPlace, section });
    }
  } else if (callerPlace) {
    syncEstateRoomAwareness({ placeId: callerPlace });
  }

  // Live shell wins over stale visual; then caller-provided place; then visual.
  const liveShell = getLiveShellPlaceId();
  const visualRoom = getVisualRoom();
  const currentPlaceId =
    liveShell ?? context.currentPlaceId ?? visualRoom ?? null;

  const inRoomAction = evaluateEstateRoomAction({
    userText,
    currentPlaceId,
  });
  if (inRoomAction) {
    return {
      action: "ROOM_ACTION",
      userText,
      currentPlaceId: inRoomAction.currentRoomId,
      roomAction: inRoomAction.action,
      immediateReply: inRoomAction.reply,
    };
  }

  const placeTurn = evaluateEstatePlaceTurn({
    userText,
    currentPlaceId,
    lastAssistantText: context.lastAssistantText ?? null,
  });

  if (placeTurn.type === "reply") {
    return {
      action: "CHAT",
      userText,
      immediateReply: placeTurn.line,
    };
  }

  // 1. NAVIGATE — explicit place, menu pick, canonical name
  if (placeTurn.type === "navigate") {
    const destId =
      placeTurn.command.roomId ?? placeTurn.command.entryId ?? null;
    if (destId) {
      setRequestedRoom(destId);
    }
    if (
      destId &&
      currentPlaceId &&
      estateRoomsEquivalent(destId, currentPlaceId) &&
      canClaimAlreadyHere(destId)
    ) {
      const sameRoomAction = evaluateEstateRoomAction({
        userText,
        currentPlaceId,
      });
      if (sameRoomAction) {
        return {
          action: "ROOM_ACTION",
          userText,
          currentPlaceId: sameRoomAction.currentRoomId,
          roomAction: sameRoomAction.action,
          immediateReply: sameRoomAction.reply,
        };
      }
      // Experience rooms (Clear My Mind) must still open — never chat-only already-here.
      if (estateRoomsEquivalent(destId, "clear-my-mind")) {
        return {
          action: "NAVIGATE",
          userText,
          target: { kind: "place", command: placeTurn.command },
          navigationLine: placeTurn.navigationLine,
          impliedPlaceMatch: placeTurn.impliedPlaceMatch,
        };
      }
      return {
        action: "CHAT",
        userText,
        immediateReply: formatAlreadyHereReply(currentPlaceId),
      };
    }

    // Same id in memory but visual unconfirmed → navigate (do not claim already here)
    if (
      destId &&
      currentPlaceId &&
      estateRoomsEquivalent(destId, currentPlaceId) &&
      !canClaimAlreadyHere(destId)
    ) {
      // Keep navigating so visual_room can catch up via goToPlace
    }

    return {
      action: "NAVIGATE",
      userText,
      target: { kind: "place", command: placeTurn.command },
      navigationLine: placeTurn.navigationLine,
      impliedPlaceMatch: placeTurn.impliedPlaceMatch,
    };
  }

  if (isReflectionRequest(userText)) {
    return reflectionMemoryTarget(userText);
  }

  // 2. CAPTURE — journal / portfolio / evidence / save-this
  const captureIntent = classifyCaptureIntent(userText);
  if (captureIntent.kind === "write") {
    return {
      action: "CAPTURE",
      userText,
      captureType: captureIntent.captureType,
      content: captureIntent.content,
    };
  }

  // 3. AUDIO — soundscape / music / ambient (after place + capture)
  if (isEstateSoundscapeNavigationRequest(userText)) {
    const { categoryId } = detectAudioRequest(userText);
    return { action: "AUDIO", userText, categoryId };
  }

  // 4. MENU — unclear place, ambiguous capture, quiet-without-clarity offers
  if (placeTurn.type === "offer") {
    return {
      action: "MENU",
      userText,
      menuKind: "place",
      line: placeTurn.line,
      placeIds: [...placeTurn.placeIds],
    };
  }

  if (captureIntent.kind === "view") {
    return captureViewMemoryTarget(userText, captureIntent.captureType);
  }

  if (AMBIGUOUS_CAPTURE_RE.test(userText)) {
    return {
      action: "MENU",
      userText,
      menuKind: "capture",
      line: CAPTURE_MENU_LINE,
      captureOptions: ["journal", "portfolio", "evidence-vault"],
    };
  }

  if (placeTurn.type === "unknown_place") {
    return {
      action: "CHAT",
      userText,
      immediateReply: placeTurn.line,
    };
  }

  const libraryReply = evaluateLibraryConversationReply(
    userText,
    context.currentPlaceId ?? null,
  );
  if (libraryReply) {
    return {
      action: "CHAT",
      userText,
      immediateReply: libraryReply,
    };
  }

  const inRoomReply = evaluateInRoomConversationReply(
    userText,
    context.currentPlaceId ?? null,
  );
  if (inRoomReply) {
    return {
      action: "CHAT",
      userText,
      immediateReply: inRoomReply,
    };
  }

  // 5. CHAT — default
  return { action: "CHAT", userText };
}
