/**
 * P0.20 — Visual Thinking Studio continuation
 * Path B menu offers and selection handling.
 */

import type { FrictionlessPendingAction } from "./frictionlessActionLayer";
import {
  clearFrictionlessPending,
  saveFrictionlessPending,
} from "./frictionlessActionLayer";
import {
  isVisualRecommendationOfferMessage,
  resolveVisualRecommendationSelection,
  visualRecommendationPendingFromReply,
  type VisualRecommendationPendingAction,
} from "./visualRecommendationEngine";
import {
  buildVisualThinkingMenuOffer,
  detectConversionTargetView,
  detectExplicitVisualView,
  isVisualConversionRequest,
  mapMenuSelectionToViewId,
  recommendVisualStructures,
  studioModeForViewId,
  type VisualThinkingMenuOffer,
  type VisualThinkingViewId,
  visualThinkingMenuAck,
} from "./visualThinkingStudio";

export type VisualThinkingPendingAction = FrictionlessPendingAction & {
  type: "visual_thinking_menu" | "visual_recommendation";
  target: "visual-focus";
  viewId?: VisualThinkingViewId;
  viewTitle?: string;
  menuOffer?: VisualThinkingMenuOffer;
};

export function isVisualThinkingPendingAction(
  pending: FrictionlessPendingAction,
): pending is VisualThinkingPendingAction {
  return (
    pending.type === "visual_thinking_menu" ||
    pending.type === "visual_recommendation"
  );
}

const PENDING_KEY = "companion-visual-thinking-menu-v1";

const LEGACY_MENU_OFFER_RE =
  /\b(?:which one would you like|which one would help most|pick one|choose one|recommended:)\b/i;

export function isVisualThinkingMenuOfferMessage(assistantText: string): boolean {
  const t = assistantText.trim();
  if (!t) return false;
  if (isVisualRecommendationOfferMessage(t)) return true;
  return (
    LEGACY_MENU_OFFER_RE.test(t) &&
    /\b(?:mind map|project map|funnel|visual thinking|hierarchy|flowchart)\b/i.test(t)
  );
}

export function buildVisualThinkingMenuPendingAction(input: {
  initialPrompt: string;
  offeredAtTurn: number;
  sourceContent?: string;
  lastAssistantText?: string;
}): VisualThinkingPendingAction {
  return visualRecommendationPendingFromReply({
    userText: input.initialPrompt,
    context: {
      lastAssistantText: input.sourceContent ?? input.lastAssistantText,
    },
    offeredAtTurn: input.offeredAtTurn,
  });
}

export function saveVisualThinkingMenuPending(
  action: VisualThinkingPendingAction,
): void {
  clearFrictionlessPending();
  saveFrictionlessPending(action);
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(action));
  } catch {
    /* ignore */
  }
}

export function loadVisualThinkingMenuPending(): VisualThinkingPendingAction | null {
  if (typeof window !== "undefined") {
    try {
      const raw = window.sessionStorage.getItem(PENDING_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as VisualThinkingPendingAction;
        if (
          parsed?.type === "visual_thinking_menu" ||
          parsed?.type === "visual_recommendation"
        ) {
          return parsed;
        }
      }
    } catch {
      /* ignore */
    }
  }
  const frictionless = loadFrictionlessPendingFromLayer();
  if (
    frictionless?.type === "visual_thinking_menu" ||
    frictionless?.type === "visual_recommendation"
  ) {
    return frictionless;
  }
  return null;
}

function loadFrictionlessPendingFromLayer(): VisualThinkingPendingAction | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("companion-frictionless-pending-v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VisualThinkingPendingAction;
    if (
      parsed?.type === "visual_thinking_menu" ||
      parsed?.type === "visual_recommendation"
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function clearVisualRecommendationPending(): void {
  clearFrictionlessPending();
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

export function clearVisualThinkingMenuPending(): void {
  clearVisualRecommendationPending();
}

export function registerVisualThinkingMenuFromAssistant(input: {
  assistantText: string;
  priorUserText: string;
  offeredAtTurn: number;
  lastAssistantText?: string;
}): VisualThinkingPendingAction | null {
  if (!isVisualThinkingMenuOfferMessage(input.assistantText)) return null;
  return visualRecommendationPendingFromReply({
    userText: input.priorUserText,
    context: { lastAssistantText: input.lastAssistantText },
    offeredAtTurn: input.offeredAtTurn,
  });
}

export function resolveVisualMenuSelection(
  userText: string,
  pending: VisualThinkingPendingAction,
): { viewId: VisualThinkingViewId; mode: ReturnType<typeof studioModeForViewId> } | null {
  if (pending.type === "visual_recommendation") {
    return resolveVisualRecommendationSelection(
      userText,
      pending as VisualRecommendationPendingAction,
    );
  }

  const offer =
    pending.menuOffer ?? buildVisualThinkingMenuOffer(pending.initialPrompt ?? userText);
  const viewId = mapMenuSelectionToViewId(userText, offer);
  if (!viewId) return null;
  return { viewId, mode: studioModeForViewId(viewId) };
}

export function visualMenuSelectionAck(viewId: VisualThinkingViewId): string {
  return visualThinkingMenuAck(viewId);
}

export function recoverVisualThinkingMenuFromChat(input: {
  userText: string;
  lastAssistantText: string;
  priorUserText?: string;
  lastAssistantContent?: string;
  currentTurn?: number;
}): VisualThinkingPendingAction | null {
  if (!isVisualThinkingMenuOfferMessage(input.lastAssistantText)) return null;
  const prompt = input.priorUserText?.trim() ?? "";
  if (!prompt) return null;
  return buildVisualThinkingMenuPendingAction({
    initialPrompt: prompt,
    offeredAtTurn: Math.max(1, (input.currentTurn ?? 1) - 1),
    lastAssistantText: input.lastAssistantContent,
  });
}

export function buildConversionPendingAction(input: {
  userText: string;
  sourceContent: string;
  offeredAtTurn: number;
}): VisualThinkingPendingAction | null {
  if (!isVisualConversionRequest(input.userText)) return null;
  const view = detectConversionTargetView(input.userText);
  if (!view) return null;
  return {
    type: "visual_thinking_menu",
    target: "visual-focus",
    context: "visual-conversion",
    viewId: view.id,
    viewTitle: view.title,
    initialPrompt: input.sourceContent.trim() || input.userText.trim(),
    offeredAtTurn: input.offeredAtTurn,
    offerSummary: `Open ${view.title}`,
  };
}

export function recommendVisualStructuresFromText(text: string) {
  return recommendVisualStructures(text);
}

export { detectExplicitVisualView, isVisualConversionRequest };
