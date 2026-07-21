/**
 * Business Plan domain detection for Create / Anywhere-Origin (201–240).
 * Matches handmade + service/expert + creator/knowledge + organizing + retail + commerce + hospitality —
 * not bare "business plan".
 */

const BUSINESS_PLAN_RE =
  /\b(craft\s+show\s+(?:business|blueprint)|handmade\s+online\s+store|handmade\s+(?:business|shop|store)|maker\s+business|etsy\s+(?:shop|store|business|blueprint)|product\s+photography(?:\s+(?:studio|blueprint))?|inventory\s+(?:and\s+)?pricing|holiday\s+product\s+planner|holiday\s+(?:collection|planner)|seasonal\s+(?:product\s+)?planner|art\s+fair\s+business|vendor\s+market\s+business|speaker\s+business|speaking\s+business|speaker\s+blueprint|coaching\s+business|coach\s+business|coaching\s+blueprint|consulting\s+business|consultant\s+business|consulting\s+blueprint|service\s+business(?:\s+operating)?|service\s+operating\s+blueprint|service\s+business\s+blueprint|author\s+business|author\s+blueprint|course\s+creator(?:\s+business)?|course\s+business|online\s+course\s+business|membership\s+business|membership\s+blueprint|content\s+creator\s+business|creator\s+business(?:\s+blueprint)?|professional\s+organizing(?:\s+business)?|organizing\s+business|organizer\s+business|physical\s+space\s+organiz(?:e|ing)|home\s+organiz(?:e|ing)|digital\s+(?:and\s+)?information\s+organiz(?:e|ing)|digital\s+organiz(?:e|ing)|operational\s+(?:and\s+)?procedural\s+organiz(?:e|ing)|sop\s+organiz(?:e|ing)|workflow\s+organiz(?:e|ing)|strategic\s+(?:and\s+)?management\s+organiz(?:e|ing)|management\s+organiz(?:e|ing)|strategic\s+organiz(?:e|ing)|retail\s+store(?:\s+business|\s+management)?|retail\s+business|brick[\s-]?and[\s-]?mortar|retail\s+inventory|inventory\s+purchasing|purchasing\s+(?:and\s+)?vendor|visual\s+merchandising|retail\s+merchandising|merchandising\s+(?:and\s+)?promotions|retail\s+customer\s+experience|ecommerce(?:\s+business)?|e[\s-]?commerce(?:\s+business)?|online\s+store\s+business|dtc(?:\s+store|\s+business)?|shopify\s+(?:store|business)|product[\s-]?based(?:\s+business)?|product\s+line\s+business|wholesale(?:\s+(?:and\s+retail\s+)?(?:partnership|business|blueprint))?|line\s+sheet|subscription\s+commerce|subscription\s+box|replenishment\s+subscription|subscription\s+business|hospitality(?:\s+business)?|hotel\s+business|vacation\s+rental(?:\s+business)?|bed\s+and\s+breakfast|restaurant(?:\s+business)?|food\s+(?:truck|service)\s+business|café\s+business|cafe\s+business|bakery\s+business|catering\s+business|travel\s+(?:and\s+)?tourism(?:\s+business)?|tour\s+operator(?:\s+business)?|travel\s+agency(?:\s+business)?|tourism\s+business|venue\s+(?:and\s+)?experience(?:\s+business)?|venue\s+business|business\.(?:craft_show|handmade_online_store|etsy|product_photography|inventory_pricing|holiday_planner|speaker|coaching|consulting|service|author|course_creator|membership|content_creator|professional_organizing|retail_store|ecommerce|product_based|wholesale|subscription_commerce|hospitality|restaurant|travel_tourism|venue_experience)|organizing\.(?:physical_space|digital_information|operational_procedural|strategic_management)|retail\.(?:store_management|inventory_purchasing_vendor|merchandising_promotions_cx))\b/i;

/**
 * True when the request should resolve through UWE Business Plan Work Type.
 * Leaves generic document "business plan" alone.
 */
export function isBusinessPlanCreationRequest(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  return BUSINESS_PLAN_RE.test(t);
}
