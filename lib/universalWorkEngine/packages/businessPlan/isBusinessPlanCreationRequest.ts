/**
 * Business Plan domain detection for Create / Anywhere-Origin (201–214).
 * Matches handmade + service/expert + creator/knowledge Business Blueprints —
 * not bare "business plan".
 */

const BUSINESS_PLAN_RE =
  /\b(craft\s+show\s+(?:business|blueprint)|handmade\s+online\s+store|handmade\s+(?:business|shop|store)|maker\s+business|etsy\s+(?:shop|store|business|blueprint)|product\s+photography(?:\s+(?:studio|blueprint))?|inventory\s+(?:and\s+)?pricing|holiday\s+product\s+planner|holiday\s+(?:collection|planner)|seasonal\s+(?:product\s+)?planner|art\s+fair\s+business|vendor\s+market\s+business|speaker\s+business|speaking\s+business|speaker\s+blueprint|coaching\s+business|coach\s+business|coaching\s+blueprint|consulting\s+business|consultant\s+business|consulting\s+blueprint|service\s+business(?:\s+operating)?|service\s+operating\s+blueprint|service\s+business\s+blueprint|author\s+business|author\s+blueprint|course\s+creator(?:\s+business)?|course\s+business|online\s+course\s+business|membership\s+business|membership\s+blueprint|content\s+creator\s+business|creator\s+business(?:\s+blueprint)?|business\.(?:craft_show|handmade_online_store|etsy|product_photography|inventory_pricing|holiday_planner|speaker|coaching|consulting|service|author|course_creator|membership|content_creator))\b/i;

/**
 * True when the request should resolve through UWE Business Plan Work Type.
 * Leaves generic document "business plan" alone.
 */
export function isBusinessPlanCreationRequest(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  return BUSINESS_PLAN_RE.test(t);
}
