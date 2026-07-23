/**
 * Plan & Voice offers — member-facing labels and payment links.
 * Prices are not hard-coded here; paid tiers require an additional monthly subscription.
 */

import type { Plan } from "@/lib/companionStore";

export type VoicePlanOfferId = Plan;

export const VOICE_PLAN_PAYMENT_LINKS = {
  "voice-lite":
    "https://link.fastpaydirect.com/payment-link/69ff6b3034d67b041e7e886e",
  "voice-pro":
    "https://link.fastpaydirect.com/payment-link/69ff6b81c43a7488828c26be",
} as const;

export const VOICE_PLAN_COPY = {
  sectionTitle: "Plan & Voice",
  sectionLead: "Your current voice access",
  essentialLabel: "Essential Voice",
  liteLabel: "Voice Lite",
  proLabel: "Voice Pro",
  includedWithPlan: "Included with your plan",
  additionalMonthlyRequired: "Additional monthly subscription required",
  currentVoicePlan: "Current Voice Plan",
  chooseLite: "Choose Voice Lite",
  choosePro: "Choose Voice Pro",
  subscribeLiteAria: "Subscribe to Voice Lite",
  subscribeProAria: "Subscribe to Voice Pro",
  pendingPayment:
    "Complete your subscription on the secure payment page. Your Voice plan will be updated after payment is confirmed.",
  unableToDetermine: "We’re not sure which Voice plan is active right now.",
} as const;

export function paymentLinkForVoicePlan(
  plan: "voice-lite" | "voice-pro",
): string {
  return VOICE_PLAN_PAYMENT_LINKS[plan];
}
