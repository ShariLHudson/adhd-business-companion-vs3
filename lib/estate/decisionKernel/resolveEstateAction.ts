/**
 * resolveEstateAction™ — the ONLY decision point for member input routing.
 *
 * Priority (strict): NAVIGATE → CAPTURE → AUDIO → MENU → CHAT
 * Pure logic — no LLM, no async, no side effects.
 */

import { detectAudioRequest } from "@/lib/audioSuggestions";
import { classifyCaptureIntent } from "@/lib/capture/classifyCaptureIntent";
import type { CaptureType } from "@/lib/capture/types";
import { isReflectionRequest } from "@/lib/memory/reflection/createReflectionReport";
import { evaluateEstatePlaceTurn } from "../estatePlaceNavigation";
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

  const placeTurn = evaluateEstatePlaceTurn({
    userText,
    currentPlaceId: context.currentPlaceId ?? null,
    lastAssistantText: context.lastAssistantText ?? null,
  });

  // 1. NAVIGATE — explicit place, menu pick, canonical name
  if (placeTurn.type === "navigate") {
    return {
      action: "NAVIGATE",
      userText,
      target: { kind: "place", command: placeTurn.command },
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

  // 5. CHAT — default
  return { action: "CHAT", userText };
}
