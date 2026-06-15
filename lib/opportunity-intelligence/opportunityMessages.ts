/**
 * Opportunity messages — gentle, no FOMO or pressure.
 */

import type { Opportunity, OpportunityType } from "./types";

const TITLES: Partial<Record<OpportunityType, (topic: string) => string>> = {
  content_opportunity: (t) => `Content idea: ${t}`,
  lead_magnet_opportunity: (t) => `Lead magnet from: ${t}`,
  workshop_opportunity: (t) => `Workshop on ${t}`,
  offer_opportunity: (t) => `Offer concept: ${t}`,
  relationship_opportunity: (t) => `Nurture connection: ${t}`,
  referral_opportunity: (t) => `Referral path: ${t}`,
  product_opportunity: (t) => `Product improvement: ${t}`,
  workflow_opportunity: (t) => `Template/SOP for ${t}`,
  retention_opportunity: (t) => `Retention support: ${t}`,
  founder_action_opportunity: (t) => `Founder action: ${t}`,
  custom: (t) => `Opportunity: ${t}`,
};

const STEPS: Record<OpportunityType, string> = {
  content_opportunity: "Draft a short outline — bullets only.",
  lead_magnet_opportunity: "Name one question people keep asking.",
  workshop_opportunity: "Sketch a 30-minute session outline.",
  offer_opportunity: "Write a one-sentence offer hypothesis.",
  relationship_opportunity: "Plan a low-pressure check-in.",
  referral_opportunity: "Thank the referrer and note next step.",
  product_opportunity: "Capture the friction in one sentence.",
  workflow_opportunity: "List the repeat steps once.",
  retention_opportunity: "Identify one small win to reinforce.",
  founder_action_opportunity: "Pick one founder experiment to try.",
  custom: "Name the smallest next step.",
};

const OFFERS: Record<OpportunityType, string> = {
  content_opportunity:
    "I noticed this topic keeps coming up. Would you like to turn it into a post, guide, or workshop idea?",
  lead_magnet_opportunity:
    "This question seems to surface often. Would you like to explore a simple lead magnet around it?",
  workshop_opportunity:
    "This could make a helpful workshop theme. Want to explore it gently?",
  offer_opportunity:
    "There may be an offer hiding in what you've been working on. Want to sketch it together?",
  relationship_opportunity:
    "This connection looks worth nurturing. Want to explore a gentle follow-up?",
  referral_opportunity:
    "A referral thread may be open here. Want to explore it when you're ready?",
  product_opportunity:
    "This friction point keeps appearing. Worth capturing as a product improvement idea?",
  workflow_opportunity:
    "You seem to repeat this workflow. Want to turn it into a template or SOP?",
  retention_opportunity:
    "Something here could help people stay supported. Want to explore it?",
  founder_action_opportunity:
    "A founder-side experiment might help here. Want to explore it?",
  custom:
    "Something here might be worth exploring. Want to take a look together?",
};

export function buildOpportunityTitle(
  type: OpportunityType,
  topic: string,
): string {
  const fn = TITLES[type] ?? TITLES.custom!;
  const clean = topic.replace(/_/g, " ").trim();
  return fn(clean || "recurring theme");
}

export function suggestedStepForType(type: OpportunityType): string {
  return STEPS[type] ?? STEPS.custom;
}

export function buildCompanionOffer(opportunity: Opportunity): string {
  return OFFERS[opportunity.opportunityType] ?? OFFERS.custom;
}

export function explorePrompt(opportunity: Opportunity): string {
  return `Let's explore this opportunity: ${opportunity.title}. ${opportunity.suggestedNextStep}`;
}
