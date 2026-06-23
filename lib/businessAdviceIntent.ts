/**
 * Detect when the user is asking for business-strategy advice that should
 * be grounded in Business / Audience / Offer profiles.
 */

export type BusinessAdviceDomain =
  | "revenue"
  | "marketing"
  | "sales"
  | "audience"
  | "offer"
  | "content_strategy";

const REVENUE_RE =
  /\b(?:revenue|income|profit|moneti[sz]e|make (?:more )?money|pricing strategy|price (?:my|this)|subscription model|recurring revenue|cash flow)\b/i;

const MARKETING_RE =
  /\b(?:marketing(?: plan| strategy)?|funnel|lead magnet|ads?|promotion|visibility|brand(?:ing)?|seo|social media strategy|launch strategy|go-?to-?market)\b/i;

const SALES_RE =
  /\b(?:sales(?: call| page| script| strategy| funnel)?|close (?:the )?deal|conversion|prospect|outreach|pitch|objection|sell (?:more|this|my))\b/i;

const AUDIENCE_RE =
  /\b(?:ideal (?:client|customer)|target audience|audience profile|who (?:am i|should i) (?:serving|targeting)|niche|icp|buyer persona|client avatar)\b/i;

const OFFER_RE =
  /\b(?:my offer|offer structure|create an offer|package (?:my|this)|productize|what (?:should i|do i) sell|offer that sells|signature (?:program|offer))\b/i;

const CONTENT_STRATEGY_RE =
  /\b(?:content strategy|content plan|what (?:should i|to) (?:post|write|create)|newsletter strategy|content calendar|editorial plan|what content)\b/i;

const APPLY_TO_BUSINESS_RE =
  /\b(?:for my business|in my business|apply to my|my business|my brand)\b/i;

const ADVICE_VERB_RE =
  /\b(?:how (?:do|can|should) i|help me|advise|recommend|what(?:'s| is) the best|strategy for|plan for)\b/i;

export function detectBusinessAdviceDomains(text: string): BusinessAdviceDomain[] {
  const t = text.trim();
  if (!t) return [];

  const domains: BusinessAdviceDomain[] = [];
  if (REVENUE_RE.test(t)) domains.push("revenue");
  if (MARKETING_RE.test(t)) domains.push("marketing");
  if (SALES_RE.test(t)) domains.push("sales");
  if (AUDIENCE_RE.test(t)) domains.push("audience");
  if (OFFER_RE.test(t)) domains.push("offer");
  if (CONTENT_STRATEGY_RE.test(t)) domains.push("content_strategy");

  return domains;
}

/** True when companion should run the business intelligence confidence check. */
export function isBusinessAdviceRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;

  const domains = detectBusinessAdviceDomains(t);
  if (!domains.length) return false;

  if (ADVICE_VERB_RE.test(t) || APPLY_TO_BUSINESS_RE.test(t) || /\?/.test(t)) {
    return true;
  }

  return domains.length >= 1 && t.length > 24;
}

export function primaryBusinessAdviceDomain(
  text: string,
): BusinessAdviceDomain | null {
  const domains = detectBusinessAdviceDomains(text);
  return domains[0] ?? null;
}
