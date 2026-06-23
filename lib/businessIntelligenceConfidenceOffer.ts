/**
 * Offer copy + actions when business intelligence confidence is low.
 */

import type { AppSection } from "./companionUi";
import type { BusinessAdviceDomain } from "./businessAdviceIntent";
import type { BusinessIntelligenceConfidence } from "./businessIntelligenceConfidence";

export type BusinessConfidenceOffer = {
  confidence: BusinessIntelligenceConfidence;
  domain: BusinessAdviceDomain | null;
  message: string;
  updateSection: AppSection;
  updateLabel: string;
};

function monthsLabel(months: number): string {
  if (months < 2) return "about a month";
  if (months === 1) return "1 month";
  return `${months} months`;
}

export function buildBusinessConfidenceOffer(
  confidence: BusinessIntelligenceConfidence,
  domain: BusinessAdviceDomain | null,
): BusinessConfidenceOffer {
  const { primaryGap, freshnessMonths, isStale } = confidence;
  const topic = domain ? domain.replace(/_/g, " ") : "this";

  let message: string;
  let updateSection: AppSection = "business-profile";
  let updateLabel = "Update Business Profile";

  if (primaryGap === "audience") {
    message =
      `I can help with ${topic}, but your Audience Profile is still thin. ` +
      `Knowing who you serve makes marketing, content, and sales advice much sharper.`;
    updateSection = "client-avatars";
    updateLabel = "Update Audience Profile";
  } else if (primaryGap === "offer") {
    message =
      `I can help with ${topic}, but I'm not clear on what you sell yet. ` +
      `Adding your offer to your Business Profile keeps recommendations grounded.`;
  } else if (isStale && freshnessMonths !== null) {
    message =
      `I know your profile, but it hasn't been updated in ${monthsLabel(freshnessMonths)}. ` +
      `Has anything changed in your business, audience, or offer?`;
  } else if (primaryGap === "business" || !confidence.businessProfile.filled) {
    message =
      `I can help with ${topic}, but I don't know enough about your business yet. ` +
      `A quick Business Profile helps me give advice that actually fits you — not generic tips.`;
  } else {
    message =
      `I can help with ${topic}, but I'd give better guidance with a bit more context in your profiles.`;
  }

  return {
    confidence,
    domain,
    message,
    updateSection,
    updateLabel,
  };
}

export function businessConfidenceContinueAck(): string {
  return "Got it — I'll do my best with what we have. Tell me more about what you're trying to figure out.";
}
