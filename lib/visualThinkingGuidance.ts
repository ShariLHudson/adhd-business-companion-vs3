/**
 * P0.51 — Visual Thinking™ guidance layer and recommendation engine.
 */

import type { VisualThinkingHomeTypeId } from "./visualThinkingHome";
import { getVisualThinkingHomeType } from "./visualThinkingHome";

export type VisualThinkingIntentId =
  | "head-full"
  | "make-decision"
  | "need-plan"
  | "marketing-help"
  | "organize-content"
  | "something-else";

export type VisualThinkingFollowUpId =
  | "marketing-clarify-business"
  | "marketing-clarify-offer"
  | "marketing-create-content"
  | "marketing-customer-journey"
  | "decision-compare-options"
  | "decision-pick-one-path"
  | "plan-launch"
  | "plan-project"
  | "plan-schedule-content"
  | "content-repurpose"
  | "content-batch-pins"
  | "head-capture"
  | "head-organize"
  | "other-describe";

export type VisualThinkingRecommendation = {
  homeTypeId: VisualThinkingHomeTypeId;
  reason: string;
};

export const VISUAL_THINKING_INTENTS: {
  id: VisualThinkingIntentId;
  label: string;
  emoji: string;
}[] = [
  { id: "head-full", label: "My head feels full", emoji: "💭" },
  { id: "make-decision", label: "I need to make a decision", emoji: "⚖️" },
  { id: "need-plan", label: "I need a plan", emoji: "📋" },
  { id: "marketing-help", label: "I need help with marketing", emoji: "📣" },
  {
    id: "organize-content",
    label: "I need help organizing content",
    emoji: "📝",
  },
  { id: "something-else", label: "Something else", emoji: "✨" },
];

export function followUpsForIntent(
  intent: VisualThinkingIntentId,
): { id: VisualThinkingFollowUpId; label: string }[] {
  switch (intent) {
    case "marketing-help":
      return [
        { id: "marketing-clarify-business", label: "Clarify my business" },
        { id: "marketing-clarify-offer", label: "Clarify my offer" },
        { id: "marketing-create-content", label: "Create content" },
        { id: "marketing-customer-journey", label: "Build a customer journey" },
      ];
    case "make-decision":
      return [
        { id: "decision-compare-options", label: "Compare a few options" },
        { id: "decision-pick-one-path", label: "Explore what happens next" },
      ];
    case "need-plan":
      return [
        { id: "plan-launch", label: "Plan a launch" },
        { id: "plan-project", label: "Break down a big project" },
        { id: "plan-schedule-content", label: "Schedule content" },
      ];
    case "organize-content":
      return [
        { id: "content-repurpose", label: "Turn one piece into many" },
        { id: "content-batch-pins", label: "Batch Pinterest or visual content" },
        { id: "plan-schedule-content", label: "Plan a content calendar" },
      ];
    case "head-full":
      return [
        { id: "head-capture", label: "Capture everything first" },
        { id: "head-organize", label: "Organize what I already know" },
      ];
    case "something-else":
      return [{ id: "other-describe", label: "I'll describe it in chat" }];
    default:
      return [];
  }
}

export function recommendVisualTool(input: {
  intent: VisualThinkingIntentId;
  followUp?: VisualThinkingFollowUpId;
}): VisualThinkingRecommendation {
  const { intent, followUp } = input;

  if (followUp) {
    const byFollowUp: Record<
      VisualThinkingFollowUpId,
      VisualThinkingRecommendation
    > = {
      "marketing-clarify-business": {
        homeTypeId: "brand-canvas",
        reason:
          "Brand Canvas™ is built for audience, positioning, and messaging — without starting from scratch.",
      },
      "marketing-clarify-offer": {
        homeTypeId: "offer-canvas",
        reason:
          "Offer Canvas™ maps what you sell, who it's for, and why it matters.",
      },
      "marketing-create-content": {
        homeTypeId: "content-calendar",
        reason:
          "Content Calendar™ lays out what to publish and when — visually, not in a spreadsheet.",
      },
      "marketing-customer-journey": {
        homeTypeId: "customer-journey",
        reason:
          "Customer Journey™ shows how people move from first touch to loyal fan.",
      },
      "decision-compare-options": {
        homeTypeId: "comparison-map",
        reason:
          "Comparison Map™ puts options side by side so you can weigh them without a wall of text.",
      },
      "decision-pick-one-path": {
        homeTypeId: "decision-tree",
        reason:
          "Decision Tree™ explores paths and outcomes before you commit.",
      },
      "plan-launch": {
        homeTypeId: "sales-funnel",
        reason:
          "Sales Funnel™ shows how strangers become customers step by step.",
      },
      "plan-project": {
        homeTypeId: "project-map",
        reason:
          "Project Map™ breaks a big initiative into stages you can actually start.",
      },
      "plan-schedule-content": {
        homeTypeId: "content-calendar",
        reason:
          "Content Calendar™ is the visual home for what ships when.",
      },
      "content-repurpose": {
        homeTypeId: "content-ecosystem",
        reason:
          "Content Ecosystem™ maps how one piece becomes blog, email, social, and more.",
      },
      "content-batch-pins": {
        homeTypeId: "pinterest-planner",
        reason:
          "Pinterest Planner™ batches boards, pins, and visual themes ahead of time.",
      },
      "head-capture": {
        homeTypeId: "mind-map",
        reason:
          "Mind Map™ captures scattered thoughts and branches them without forcing order first.",
      },
      "head-organize": {
        homeTypeId: "priority-matrix",
        reason:
          "Priority Matrix™ sorts what matters by impact and effort — one item at a time.",
      },
      "other-describe": {
        homeTypeId: "mind-map",
        reason:
          "Mind Map™ is a flexible starting point when you're not sure yet which framework fits.",
      },
    };
    return byFollowUp[followUp];
  }

  const byIntent: Record<VisualThinkingIntentId, VisualThinkingRecommendation> =
    {
      "head-full": {
        homeTypeId: "mind-map",
        reason:
          "When your head is full, a Mind Map™ gets ideas out and visible before you organize.",
      },
      "make-decision": {
        homeTypeId: "decision-tree",
        reason:
          "Decision Tree™ helps you see paths and outcomes before choosing.",
      },
      "need-plan": {
        homeTypeId: "project-map",
        reason:
          "Project Map™ turns a big goal into visual stages you can start from.",
      },
      "marketing-help": {
        homeTypeId: "brand-canvas",
        reason:
          "Most marketing questions start with clarity — Brand Canvas™ anchors audience and message.",
      },
      "organize-content": {
        homeTypeId: "content-ecosystem",
        reason:
          "Content Ecosystem™ shows how pieces connect across platforms.",
      },
      "something-else": {
        homeTypeId: "mind-map",
        reason:
          "Mind Map™ is a safe default when you're still finding the right framework.",
      },
    };

  return byIntent[intent];
}

export function recommendationTitle(homeTypeId: VisualThinkingHomeTypeId): string {
  return getVisualThinkingHomeType(homeTypeId).title;
}
