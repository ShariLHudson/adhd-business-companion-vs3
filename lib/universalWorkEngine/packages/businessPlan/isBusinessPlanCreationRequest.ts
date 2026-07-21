/**
 * Business Plan domain detection for Create / Anywhere-Origin (201–202).
 * Matches crafter Business Blueprints — not bare "business plan" document create.
 */

const BUSINESS_PLAN_RE =
  /\b(craft\s+show\s+(?:business|blueprint)|handmade\s+online\s+store|handmade\s+(?:business|shop|store)|maker\s+business|etsy\s+(?:shop|store)|art\s+fair\s+business|vendor\s+market\s+business|business\.craft_show|business\.handmade_online_store)\b/i;

/**
 * True when the request should resolve through UWE Business Plan Work Type.
 * Leaves generic document "business plan" alone.
 */
export function isBusinessPlanCreationRequest(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  return BUSINESS_PLAN_RE.test(t);
}
