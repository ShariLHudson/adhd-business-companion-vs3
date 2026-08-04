/**
 * P0.51 — Map-aware Work With Shari™ prompts for Visual Thinking™.
 */

import type { VisualThinkingHomeTypeId } from "./visualThinkingHome";
import { resolveHomeTypeForMap } from "./visualThinkingHome";
import type { VisualFocusMode } from "./visualFocus/types";
import { VISUAL_FOCUS_SHARI_PROMPT } from "./visualFocus/studioCards";

const MAP_AWARE_PROMPTS: Partial<Record<VisualThinkingHomeTypeId, string>> = {
  "brand-canvas":
    "I'm in Brand Canvas™. Help me with audience, positioning, messaging, and differentiation. Ask one focused question at a time.",
  "offer-canvas":
    "I'm in Offer Canvas™. Help me clarify my offer, transformation, outcome, and pricing. Ask one focused question at a time.",
  "sales-funnel":
    "I'm in Sales Funnel™. Help me map how strangers become customers — awareness, nurture, conversion. Ask one focused question at a time.",
  "customer-journey":
    "I'm in Customer Journey™. Help me map touchpoints from first contact to loyal fan. Ask one focused question at a time.",
  "content-calendar":
    "I'm in Content Calendar™. Help me plan platforms, frequency, content pillars, and campaigns. Ask one focused question at a time.",
  "pinterest-planner":
    "I'm in Pinterest Planner™. Help me batch boards, pin ideas, and visual themes. Ask one focused question at a time.",
  "content-ecosystem":
    "I'm in Content Ecosystem™. Help me turn one piece of content into many across blog, email, social, and more. Ask one focused question at a time.",
  "project-map":
    "I'm in Project Map™. Help me break this project into stages and a realistic first step. Ask one focused question at a time.",
  timeline:
    "I'm in Timeline™. Help me place milestones in order and spot what's unrealistic. Ask one focused question at a time.",
  "decision-tree":
    "I'm in Decision Tree™. Help me explore options, risks, tradeoffs, and likely outcomes. Ask one focused question at a time.",
  "comparison-map":
    "I'm in Comparison Map™. Help me compare options fairly — criteria, pros, cons, and what matters most. Ask one focused question at a time.",
  "priority-matrix":
    "I'm in Priority Matrix™. Help me score items by impact and effort and choose what to do first. Ask one focused question at a time.",
  "mind-map":
    "I'm in Mind Map™. Help me brainstorm and branch ideas without forcing linear order. Ask one focused question at a time.",
};

export function shariPromptForVisualContext(input: {
  homeTypeId?: VisualThinkingHomeTypeId;
  mode?: VisualFocusMode;
  mapTitle?: string;
  fromHub?: boolean;
}): string {
  if (input.fromHub) {
    return VISUAL_FOCUS_SHARI_PROMPT;
  }

  const homeType = input.homeTypeId
    ? resolveHomeTypeForMap({
        homeTypeId: input.homeTypeId,
        mode: input.mode ?? "mind-map",
        title: input.mapTitle,
      })
    : input.mode
      ? resolveHomeTypeForMap({ mode: input.mode, title: input.mapTitle })
      : null;

  const specific = homeType ? MAP_AWARE_PROMPTS[homeType.id] : undefined;
  if (specific) {
    const title = input.mapTitle?.trim();
    return title ? `${specific}\n\nMy map is titled: "${title}".` : specific;
  }

  return VISUAL_FOCUS_SHARI_PROMPT;
}
