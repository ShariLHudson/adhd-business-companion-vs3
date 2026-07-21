/**
 * Business Plan domain detection for Create / Anywhere-Origin (201–206).
 * Matches crafter / handmade Business Blueprints — not bare "business plan" document create.
 */

const BUSINESS_PLAN_RE =
  /\b(craft\s+show\s+(?:business|blueprint)|handmade\s+online\s+store|handmade\s+(?:business|shop|store)|maker\s+business|etsy\s+(?:shop|store|business|blueprint)|product\s+photography(?:\s+(?:studio|blueprint))?|inventory\s+(?:and\s+)?pricing|holiday\s+product\s+planner|holiday\s+(?:collection|planner)|seasonal\s+(?:product\s+)?planner|art\s+fair\s+business|vendor\s+market\s+business|business\.(?:craft_show|handmade_online_store|etsy|product_photography|inventory_pricing|holiday_planner))\b/i;

/**
 * True when the request should resolve through UWE Business Plan Work Type.
 * Leaves generic document "business plan" alone.
 */
export function isBusinessPlanCreationRequest(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  return BUSINESS_PLAN_RE.test(t);
}
