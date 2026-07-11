/**
 * resolveUserIntent — delegates to Estate Decision Kernel (legacy adapter).
 * @deprecated Prefer resolveEstateAction from decisionKernel directly.
 */

import {
  resolveEstateAction,
} from "./decisionKernel/resolveEstateAction";
import type { EstatePlaceTurnResult } from "./estatePlaceNavigation";

export type UserIntentKind =
  | "conversation"
  | "navigate"
  | "soundscape"
  | "input-send";

export type UserIntentDelivery = "keyboard" | "mic-commit" | "send-button" | "text";

export type ResolveUserIntentInput = {
  userText: string;
  lastAssistantText?: string | null;
  currentPlaceId?: string | null;
  delivery?: UserIntentDelivery;
  soundscapeCategoryId?: string | null;
};

export type ResolvedUserIntent =
  | { kind: "input-send"; userText: string }
  | { kind: "conversation"; userText: string }
  | { kind: "soundscape"; userText: string; categoryId: string }
  | {
      kind: "navigate";
      userText: string;
      placeTurn: Exclude<EstatePlaceTurnResult, { type: "none" }>;
    };

function toLegacyNavigate(
  userText: string,
  placeTurn: Exclude<EstatePlaceTurnResult, { type: "none" }>,
): ResolvedUserIntent {
  return { kind: "navigate", userText, placeTurn };
}

/**
 * Legacy adapter — maps kernel decision to prior ResolvedUserIntent shape.
 * CAPTURE / memory NAVIGATE / capture MENU collapse to conversation here;
 * callers must use resolveEstateAction for the full decision set.
 */
export function resolveUserIntent(
  input: ResolveUserIntentInput,
): ResolvedUserIntent {
  const decision = resolveEstateAction({
    userText: input.userText,
    lastAssistantText: input.lastAssistantText,
    currentPlaceId: input.currentPlaceId,
    soundscapeCategoryId: input.soundscapeCategoryId,
  });

  if (decision.action === "AUDIO") {
    return {
      kind: "soundscape",
      userText: input.userText.trim(),
      categoryId: decision.categoryId,
    };
  }

  const userText = input.userText.trim();
  if (!userText) {
    return { kind: "input-send", userText: "" };
  }

  switch (decision.action) {
    case "NAVIGATE":
      if (decision.target.kind === "place") {
        return toLegacyNavigate(userText, {
          type: "navigate",
          command: decision.target.command,
        });
      }
      return { kind: "conversation", userText };
    case "MENU":
      if (decision.menuKind === "place") {
        return toLegacyNavigate(userText, {
          type: "offer",
          line: decision.line,
          placeIds: decision.placeIds,
        });
      }
      return { kind: "conversation", userText };
    case "CAPTURE":
    case "CHAT":
    default:
      if (decision.action === "CHAT" && decision.immediateReply) {
        return { kind: "conversation", userText };
      }
      return { kind: "conversation", userText };
  }
}
