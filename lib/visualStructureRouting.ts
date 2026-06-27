/**
 * P0.17.2 / P0.20 — Visual Structure Routing
 * Mind maps, decision trees, and visual maps are thinking surfaces — not Create documents.
 */

import type { AppSection } from "./companionUi";
import type { WorkspaceOffer } from "./workspaceMode";
import type { VisualFocusMode } from "./visualFocus/types";
import {
  detectExplicitVisualView,
  detectConversionTargetView,
  immediateVisualOpenAck,
  isExplicitVisualStructureRequest,
  isVisualConversionRequest,
  shouldRouteBusinessStrategyToCreate,
  studioModeForViewId,
  getVisualThinkingView,
  type VisualThinkingViewId,
  visualThinkingViewTitle,
} from "./visualThinkingStudio";
import {
  isExplicitVisualThinkingRequest,
  shouldBlockVisualThinking,
} from "./visualThinkingOverreach";
import { shouldSuppressVisualThinkingForLearn } from "./visualLearnBoundary";
import {
  isViewIdAvailable,
  resolveUnavailableVisualTypeReply,
} from "./visualTypeAvailability";
import { shouldOfferVisualRecommendation } from "./visualRecommendationEngine";

export type VisualStructureKind = VisualThinkingViewId;

const DECISION_STRUCTURE_RE =
  /\b(?:should i|compare (?:these |the )?options|evaluate (?:my )?choices|pros and cons|which (?:one|option) should|can'?t decide|help me decide|stuck between|torn between)\b/i;

export function containsVisualStructurePhrase(text: string): boolean {
  return detectExplicitVisualView(text) !== null;
}

export function detectVisualStructureKind(
  text: string,
): VisualStructureKind | null {
  return detectExplicitVisualView(text)?.id ?? null;
}

export function visualFocusModeForKind(
  kind: VisualStructureKind,
): VisualFocusMode {
  return studioModeForViewId(kind);
}

export function isVisualStructureExecution(text: string): boolean {
  if (shouldRouteBusinessStrategyToCreate(text)) return false;
  if (shouldSuppressVisualThinkingForLearn(text)) return false;
  if (resolveUnavailableVisualTypeReply(text)) return false;
  if (shouldBlockVisualThinking(text)) return false;
  return (
    isExplicitVisualStructureRequest(text) ||
    isVisualConversionRequest(text) ||
    isExplicitVisualThinkingRequest(text)
  );
}

export function isDecisionStructureExecution(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isVisualStructureExecution(t)) return false;
  if (shouldRouteBusinessStrategyToCreate(t)) return false;
  return DECISION_STRUCTURE_RE.test(t);
}

export function needsVisualThinkingRecommendation(text: string): boolean {
  return shouldOfferVisualRecommendation(text);
}

export type VisualStructureRoute = {
  section: AppSection;
  visualFocusMode?: VisualFocusMode;
  viewId?: VisualThinkingViewId;
  viewTitle?: string;
  label: string;
  immediate?: boolean;
};

export function resolveVisualStructureRoute(
  text: string,
): VisualStructureRoute | null {
  const t = text.trim();
  if (!t || shouldRouteBusinessStrategyToCreate(t)) return null;

  if (isVisualConversionRequest(t)) {
    const view = detectConversionTargetView(t);
    if (!view || !isViewIdAvailable(view.id)) return null;
    return {
      section: "visual-focus",
      visualFocusMode: view.mode,
      viewId: view.id,
      viewTitle: view.title,
      label: "Visual Thinking",
      immediate: true,
    };
  }

  const view = detectExplicitVisualView(t);
  if (view && isExplicitVisualStructureRequest(t) && isViewIdAvailable(view.id)) {
    return {
      section: "visual-focus",
      visualFocusMode: view.mode,
      viewId: view.id,
      viewTitle: view.title,
      label: "Visual Thinking",
      immediate: true,
    };
  }

  if (isExplicitVisualThinkingRequest(t)) {
    const fallback =
      detectExplicitVisualView(t) ??
      detectConversionTargetView(t) ??
      getVisualThinkingView("mind-map");
    if (!fallback || !isViewIdAvailable(fallback.id)) return null;
    return {
      section: "visual-focus",
      visualFocusMode: fallback.mode,
      viewId: fallback.id,
      viewTitle: fallback.title,
      label: "Visual Thinking",
      immediate: true,
    };
  }

  return null;
}

/** Decision Compass routing for compare/should-I turns (not frictionless direct_action). */
export function resolveDecisionStructureWorkspaceOffer(
  text: string,
): WorkspaceOffer | null {
  if (!isDecisionStructureExecution(text)) return null;
  return {
    section: "decision-compass",
    buttonLabel: "Open Decision Compass",
    line: buildVisualStructureOfferLine(
      { section: "decision-compass", label: "Decision Compass" },
      null,
    ),
  };
}

export function buildVisualStructureOfferLine(
  route: VisualStructureRoute,
  kind: VisualStructureKind | null,
): string {
  if (route.section === "decision-compass") {
    return "This sounds like a Decision Compass conversation. Would you like to open Decision Compass?";
  }
  if (route.immediate && (route.viewTitle || kind)) {
    const title = route.viewTitle ?? (kind ? visualThinkingViewTitle(kind) : "Visual Thinking");
    return immediateVisualOpenAck({
      id: route.viewId ?? kind ?? "mind-map",
      title,
      category: "brainstorming",
      mode: route.visualFocusMode ?? "mind-map",
      aliases: [],
    });
  }
  if (kind === "decision-tree" || kind === "process-flow" || kind === "workflow-map") {
    return "Visual Thinking can map that as a decision tree. Would you like to open Visual Thinking?";
  }
  if (kind === "mind-map" || kind === "concept-map") {
    return "I can open Visual Thinking for that. Would you like to create a mind map there?";
  }
  if (kind === "project-map") {
    return "A project map works best in Visual Thinking. Would you like to open Visual Thinking?";
  }
  return "Visual Thinking is the right place for this. Would you like to open Visual Thinking?";
}

export function resolveVisualStructureWorkspaceOffer(
  text: string,
): WorkspaceOffer | null {
  const route = resolveVisualStructureRoute(text);
  if (!route || route.section !== "visual-focus") return null;
  if (!isVisualStructureExecution(text)) return null;

  const kind = detectVisualStructureKind(text);
  return {
    section: route.section,
    buttonLabel: route.immediate ? "Open Visual Thinking" : "Open Visual Thinking",
    line: buildVisualStructureOfferLine(route, kind),
    visualFocusMode: route.visualFocusMode,
  };
}

export function visualStructureRoutingHintForChat(): string {
  return [
    "VISUAL STRUCTURE ROUTING (P0.17.2 / P0.20):",
    "Mind maps, flowcharts, decision trees, and visual maps are Visual Thinking — NOT Create documents.",
    "Path B: when the user names a structure, open Visual Thinking immediately.",
    "Path A: when unsure, recommend structures and offer a numbered menu.",
    "Decision comparisons (should I, pros/cons) → Decision Compass unless they asked for a visual map.",
    "FORBIDDEN: routing visual structures to Create / Documents / Strategies.",
  ].join("\n");
}
