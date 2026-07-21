/**
 * Infer Work Type + UWE Blueprint from message / contract hints.
 * Never falls through to legacy Create template IDs as Work Blueprints.
 */

import {
  getBlueprint,
  isBlueprintCompatibleWithWorkType,
  listBlueprints,
} from "../blueprints/registry";
import { EVENT_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { MARKETING_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/marketingPlanMap";
import { MARKETING_PLAN_SIMPLE_BLUEPRINT_ID } from "../packages/marketingPlan/marketingPlanBlueprint";
import {
  AUTHOR_BUSINESS_BLUEPRINT_ID,
  COACHING_BUSINESS_BLUEPRINT_ID,
  CONSULTING_BUSINESS_BLUEPRINT_ID,
  CONTENT_CREATOR_BUSINESS_BLUEPRINT_ID,
  COURSE_CREATOR_BUSINESS_BLUEPRINT_ID,
  CRAFT_SHOW_BUSINESS_BLUEPRINT_ID,
  DIGITAL_INFORMATION_ORGANIZING_BLUEPRINT_ID,
  ETSY_BUSINESS_BLUEPRINT_ID,
  HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID,
  HOLIDAY_PRODUCT_PLANNER_BUSINESS_BLUEPRINT_ID,
  INVENTORY_PRICING_BUSINESS_BLUEPRINT_ID,
  MEMBERSHIP_BUSINESS_BLUEPRINT_ID,
  OPERATIONAL_PROCEDURAL_ORGANIZING_BLUEPRINT_ID,
  PHYSICAL_SPACE_ORGANIZING_BLUEPRINT_ID,
  PRODUCT_PHOTOGRAPHY_BUSINESS_BLUEPRINT_ID,
  PROFESSIONAL_ORGANIZING_BUSINESS_BLUEPRINT_ID,
  ECOMMERCE_BUSINESS_BLUEPRINT_ID,
  HOSPITALITY_BUSINESS_BLUEPRINT_ID,
  PRODUCT_BASED_BUSINESS_BLUEPRINT_ID,
  RESTAURANT_BUSINESS_BLUEPRINT_ID,
  RETAIL_INVENTORY_PURCHASING_VENDOR_BLUEPRINT_ID,
  RETAIL_MERCHANDISING_PROMOTIONS_CX_BLUEPRINT_ID,
  RETAIL_STORE_BUSINESS_BLUEPRINT_ID,
  RETAIL_STORE_MANAGEMENT_BLUEPRINT_ID,
  SERVICE_BUSINESS_BLUEPRINT_ID,
  SUBSCRIPTION_COMMERCE_BUSINESS_BLUEPRINT_ID,
  TRAVEL_TOURISM_BUSINESS_BLUEPRINT_ID,
  VENUE_EXPERIENCE_BUSINESS_BLUEPRINT_ID,
  WHOLESALE_BUSINESS_BLUEPRINT_ID,
  SPEAKER_BUSINESS_BLUEPRINT_ID,
  STRATEGIC_MANAGEMENT_ORGANIZING_BLUEPRINT_ID,
} from "../packages/businessPlan/businessBlueprintDefinitions";
import {
  BOOK_LAUNCH_EVENT_BLUEPRINT_ID,
  CHALLENGE_EVENT_BLUEPRINT_ID,
  CONFERENCE_EVENT_BLUEPRINT_ID,
  FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
  MASTERCLASS_EVENT_BLUEPRINT_ID,
  NETWORKING_EVENT_BLUEPRINT_ID,
  PRODUCT_LAUNCH_EVENT_BLUEPRINT_ID,
  RETREAT_EVENT_BLUEPRINT_ID,
  SUMMIT_EVENT_BLUEPRINT_ID,
  WEBINAR_EVENT_BLUEPRINT_ID,
  WORKSHOP_EVENT_BLUEPRINT_ID,
} from "../packages/eventPlan/eventBlueprintDefinitions";
import type { UniversalLaunchContract } from "./types";

/** Map legacy platformIntent CreateBlueprint ids → Universal Blueprint ids. */
const LEGACY_CREATE_BP_TO_UWE: Record<string, string> = {
  "bp-retreat-event": "bp-event-three-day-retreat",
  "bp-workshop": "bp-event-online-workshop",
  "bp-event-plan": "bp-event-business-luncheon",
  "bp-online-workshop": "bp-event-online-workshop",
  "bp-one-day-workshop": "bp-event-one-day-workshop",
  "bp-book-signing": "bp-event-book-signing",
  "bp-business-luncheon": "bp-event-business-luncheon",
  "bp-three-day-retreat": "bp-event-three-day-retreat",
  "bp-networking-event": NETWORKING_EVENT_BLUEPRINT_ID,
  "bp-networking": NETWORKING_EVENT_BLUEPRINT_ID,
  "bp-workshop-event": WORKSHOP_EVENT_BLUEPRINT_ID,
  "bp-event-workshop": WORKSHOP_EVENT_BLUEPRINT_ID,
  "bp-webinar": WEBINAR_EVENT_BLUEPRINT_ID,
  "bp-event-webinar": WEBINAR_EVENT_BLUEPRINT_ID,
  "bp-webinar-event": WEBINAR_EVENT_BLUEPRINT_ID,
  "bp-event-retreat": RETREAT_EVENT_BLUEPRINT_ID,
  "bp-general-retreat": RETREAT_EVENT_BLUEPRINT_ID,
  "bp-conference": CONFERENCE_EVENT_BLUEPRINT_ID,
  "bp-event-conference": CONFERENCE_EVENT_BLUEPRINT_ID,
  "bp-conference-event": CONFERENCE_EVENT_BLUEPRINT_ID,
  "bp-summit": SUMMIT_EVENT_BLUEPRINT_ID,
  "bp-event-summit": SUMMIT_EVENT_BLUEPRINT_ID,
  "bp-summit-event": SUMMIT_EVENT_BLUEPRINT_ID,
  "bp-product-launch": PRODUCT_LAUNCH_EVENT_BLUEPRINT_ID,
  "bp-event-product-launch": PRODUCT_LAUNCH_EVENT_BLUEPRINT_ID,
  "bp-product-launch-event": PRODUCT_LAUNCH_EVENT_BLUEPRINT_ID,
  "bp-book-launch": BOOK_LAUNCH_EVENT_BLUEPRINT_ID,
  "bp-event-book-launch": BOOK_LAUNCH_EVENT_BLUEPRINT_ID,
  "bp-book-launch-event": BOOK_LAUNCH_EVENT_BLUEPRINT_ID,
  "bp-challenge": CHALLENGE_EVENT_BLUEPRINT_ID,
  "bp-event-challenge": CHALLENGE_EVENT_BLUEPRINT_ID,
  "bp-challenge-event": CHALLENGE_EVENT_BLUEPRINT_ID,
  "bp-masterclass": MASTERCLASS_EVENT_BLUEPRINT_ID,
  "bp-event-masterclass": MASTERCLASS_EVENT_BLUEPRINT_ID,
  "bp-masterclass-event": MASTERCLASS_EVENT_BLUEPRINT_ID,
  "bp-fundraiser-gala": FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
  "bp-event-fundraiser-gala": FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
  "bp-fundraiser": FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
  "bp-gala": FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
  "bp-marketing-plan": MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
  "bp-simple-marketing-plan": MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
  "bp-craft-show-business": CRAFT_SHOW_BUSINESS_BLUEPRINT_ID,
  "bp-craft-show": CRAFT_SHOW_BUSINESS_BLUEPRINT_ID,
  "bp-handmade-online-store": HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID,
  "bp-handmade-store": HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID,
  "bp-etsy-business": ETSY_BUSINESS_BLUEPRINT_ID,
  "bp-etsy": ETSY_BUSINESS_BLUEPRINT_ID,
  "bp-product-photography": PRODUCT_PHOTOGRAPHY_BUSINESS_BLUEPRINT_ID,
  "bp-product-photography-studio": PRODUCT_PHOTOGRAPHY_BUSINESS_BLUEPRINT_ID,
  "bp-inventory-pricing": INVENTORY_PRICING_BUSINESS_BLUEPRINT_ID,
  "bp-inventory-and-pricing": INVENTORY_PRICING_BUSINESS_BLUEPRINT_ID,
  "bp-holiday-product-planner": HOLIDAY_PRODUCT_PLANNER_BUSINESS_BLUEPRINT_ID,
  "bp-holiday-planner": HOLIDAY_PRODUCT_PLANNER_BUSINESS_BLUEPRINT_ID,
  "bp-speaker-business": SPEAKER_BUSINESS_BLUEPRINT_ID,
  "bp-speaker": SPEAKER_BUSINESS_BLUEPRINT_ID,
  "bp-coaching-business": COACHING_BUSINESS_BLUEPRINT_ID,
  "bp-coaching": COACHING_BUSINESS_BLUEPRINT_ID,
  "bp-consulting-business": CONSULTING_BUSINESS_BLUEPRINT_ID,
  "bp-consulting": CONSULTING_BUSINESS_BLUEPRINT_ID,
  "bp-service-business": SERVICE_BUSINESS_BLUEPRINT_ID,
  "bp-service-operating": SERVICE_BUSINESS_BLUEPRINT_ID,
  "bp-author-business": AUTHOR_BUSINESS_BLUEPRINT_ID,
  "bp-author": AUTHOR_BUSINESS_BLUEPRINT_ID,
  "bp-course-creator": COURSE_CREATOR_BUSINESS_BLUEPRINT_ID,
  "bp-course-creator-business": COURSE_CREATOR_BUSINESS_BLUEPRINT_ID,
  "bp-membership-business": MEMBERSHIP_BUSINESS_BLUEPRINT_ID,
  "bp-membership": MEMBERSHIP_BUSINESS_BLUEPRINT_ID,
  "bp-content-creator": CONTENT_CREATOR_BUSINESS_BLUEPRINT_ID,
  "bp-content-creator-business": CONTENT_CREATOR_BUSINESS_BLUEPRINT_ID,
  "bp-professional-organizing": PROFESSIONAL_ORGANIZING_BUSINESS_BLUEPRINT_ID,
  "bp-organizing-business": PROFESSIONAL_ORGANIZING_BUSINESS_BLUEPRINT_ID,
  "bp-physical-space-organizing": PHYSICAL_SPACE_ORGANIZING_BLUEPRINT_ID,
  "bp-digital-information-organizing": DIGITAL_INFORMATION_ORGANIZING_BLUEPRINT_ID,
  "bp-operational-organizing": OPERATIONAL_PROCEDURAL_ORGANIZING_BLUEPRINT_ID,
  "bp-strategic-organizing": STRATEGIC_MANAGEMENT_ORGANIZING_BLUEPRINT_ID,
  "bp-retail-store": RETAIL_STORE_BUSINESS_BLUEPRINT_ID,
  "bp-retail-store-business": RETAIL_STORE_BUSINESS_BLUEPRINT_ID,
  "bp-retail-store-management": RETAIL_STORE_MANAGEMENT_BLUEPRINT_ID,
  "bp-retail-inventory": RETAIL_INVENTORY_PURCHASING_VENDOR_BLUEPRINT_ID,
  "bp-retail-purchasing": RETAIL_INVENTORY_PURCHASING_VENDOR_BLUEPRINT_ID,
  "bp-retail-merchandising": RETAIL_MERCHANDISING_PROMOTIONS_CX_BLUEPRINT_ID,
  "bp-ecommerce": ECOMMERCE_BUSINESS_BLUEPRINT_ID,
  "bp-ecommerce-business": ECOMMERCE_BUSINESS_BLUEPRINT_ID,
  "bp-product-based": PRODUCT_BASED_BUSINESS_BLUEPRINT_ID,
  "bp-product-based-business": PRODUCT_BASED_BUSINESS_BLUEPRINT_ID,
  "bp-wholesale": WHOLESALE_BUSINESS_BLUEPRINT_ID,
  "bp-wholesale-business": WHOLESALE_BUSINESS_BLUEPRINT_ID,
  "bp-subscription-commerce": SUBSCRIPTION_COMMERCE_BUSINESS_BLUEPRINT_ID,
  "bp-hospitality": HOSPITALITY_BUSINESS_BLUEPRINT_ID,
  "bp-hospitality-business": HOSPITALITY_BUSINESS_BLUEPRINT_ID,
  "bp-restaurant": RESTAURANT_BUSINESS_BLUEPRINT_ID,
  "bp-restaurant-business": RESTAURANT_BUSINESS_BLUEPRINT_ID,
  "bp-travel-tourism": TRAVEL_TOURISM_BUSINESS_BLUEPRINT_ID,
  "bp-travel-business": TRAVEL_TOURISM_BUSINESS_BLUEPRINT_ID,
  "bp-venue-experience": VENUE_EXPERIENCE_BUSINESS_BLUEPRINT_ID,
  "bp-venue-business": VENUE_EXPERIENCE_BUSINESS_BLUEPRINT_ID,
};

const MESSAGE_BLUEPRINT_PATTERNS: {
  re: RegExp;
  blueprintId: string;
  workTypeId: string;
}[] = [
  {
    re: /\b(simple\s+)?marketing\s+plan\b|\bmarketing\s+blueprint\b|\bmarket(?:ing)?\s+this\s+offer\b/i,
    blueprintId: MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
    workTypeId: MARKETING_PLAN_WORK_TYPE_ID,
  },
  {
    // Business Blueprints before Event "show"/"launch" language
    re: /\b(craft\s+show\s+business|craft\s+show\s+blueprint|business\.craft_show)\b/i,
    blueprintId: CRAFT_SHOW_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    // Etsy-specific before multi-marketplace handmade store
    re: /\b(etsy\s+(?:business|blueprint|shop|store)|business\.etsy)\b/i,
    blueprintId: ETSY_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(product\s+photography(?:\s+(?:studio|blueprint))?|photography\s+studio\s+blueprint|business\.product_photography)\b/i,
    blueprintId: PRODUCT_PHOTOGRAPHY_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    // Wholesale (sell into stores) before brick-and-mortar retail store OS
    re: /\b(wholesale(?:\s+(?:and\s+retail\s+)?(?:partnership|business|blueprint))?|line\s+sheet|sell\s+to\s+stores|business\.wholesale)\b/i,
    blueprintId: WHOLESALE_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    // Retail delivery before generic retail store business and before handmade inventory pricing
    re: /\b(retail\s+store\s+management|store\s+operations\s+manual|store\s+opening\s+(?:and\s+)?closing|retail\.store_management)\b/i,
    blueprintId: RETAIL_STORE_MANAGEMENT_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(retail\s+inventory|inventory\s+purchasing|purchasing\s+(?:and\s+)?vendor|vendor\s+scorecards|retail\.inventory_purchasing_vendor)\b/i,
    blueprintId: RETAIL_INVENTORY_PURCHASING_VENDOR_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(visual\s+merchandising|retail\s+merchandising|merchandising\s+(?:and\s+)?promotions|retail\s+customer\s+experience|retail\.merchandising_promotions_cx)\b/i,
    blueprintId: RETAIL_MERCHANDISING_PROMOTIONS_CX_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(retail\s+store(?:\s+business)?|brick[\s-]?and[\s-]?mortar(?:\s+store|\s+business)?|retail\s+business(?:\s+blueprint)?|business\.retail_store)\b/i,
    blueprintId: RETAIL_STORE_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(inventory\s+(?:and\s+)?pricing(?:\s+blueprint)?|pricing\s+and\s+inventory|business\.inventory_pricing)\b/i,
    blueprintId: INVENTORY_PRICING_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    // Holiday product planner before Event product launch language
    re: /\b(holiday\s+product\s+planner|holiday\s+(?:collection|planner)|seasonal\s+(?:product\s+)?planner|christmas\s+collection\s+planner|business\.holiday_planner)\b/i,
    blueprintId: HOLIDAY_PRODUCT_PLANNER_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(handmade\s+online\s+store|handmade\s+(?:business|shop|store)|maker\s+business|business\.handmade_online_store)\b/i,
    blueprintId: HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    // Speaker / coaching / consulting before generic service operating
    re: /\b(speaker\s+business|speaking\s+business|speaker\s+blueprint|business\.speaker)\b/i,
    blueprintId: SPEAKER_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(coaching\s+business|coach\s+business|coaching\s+blueprint|business\.coaching)\b/i,
    blueprintId: COACHING_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(consulting\s+business|consultant\s+business|consulting\s+blueprint|business\.consulting)\b/i,
    blueprintId: CONSULTING_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(service\s+business(?:\s+operating)?|service\s+operating\s+blueprint|service\s+business\s+blueprint|business\.service)\b/i,
    blueprintId: SERVICE_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    // Author before Event book launch language
    re: /\b(author\s+business|author\s+blueprint|business\.author)\b/i,
    blueprintId: AUTHOR_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    // Course creator before membership / content creator
    re: /\b(course\s+creator(?:\s+business)?|course\s+business|online\s+course\s+business|business\.course_creator)\b/i,
    blueprintId: COURSE_CREATOR_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    // Subscription commerce before community membership
    re: /\b(subscription\s+commerce|subscription\s+box|replenishment\s+subscription|subscription\s+business(?:\s+blueprint)?|business\.subscription_commerce)\b/i,
    blueprintId: SUBSCRIPTION_COMMERCE_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(membership\s+business|membership\s+blueprint|membership\s+community\s+business|business\.membership)\b/i,
    blueprintId: MEMBERSHIP_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    // Product-based before general ecommerce
    re: /\b(product[\s-]?based(?:\s+business)?|product\s+line\s+business|product\s+business\s+blueprint|business\.product_based)\b/i,
    blueprintId: PRODUCT_BASED_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    // Ecommerce after handmade/Etsy-specific patterns (those appear earlier)
    re: /\b(ecommerce(?:\s+business)?|e[\s-]?commerce(?:\s+business)?|online\s+store\s+business|dtc(?:\s+store|\s+business)?|shopify\s+(?:store|business)|business\.ecommerce)\b/i,
    blueprintId: ECOMMERCE_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    // Hospitality delivery before generic hospitality business; before Event retreat language
    re: /\b(restaurant(?:\s+(?:and\s+food\s+service|business|blueprint))?|food\s+(?:truck|service)\s+business|café\s+business|cafe\s+business|bakery\s+business|catering\s+business|business\.restaurant)\b/i,
    blueprintId: RESTAURANT_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(travel\s+(?:and\s+)?tourism(?:\s+business)?|tour\s+operator(?:\s+business)?|travel\s+agency(?:\s+business)?|tourism\s+business|business\.travel_tourism)\b/i,
    blueprintId: TRAVEL_TOURISM_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(venue\s+(?:and\s+)?experience(?:\s+business)?|venue\s+business(?:\s+blueprint)?|experience\s+venue\s+business|business\.venue_experience)\b/i,
    blueprintId: VENUE_EXPERIENCE_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(hospitality(?:\s+business)?|hotel\s+business|bed\s+and\s+breakfast(?:\s+business)?|b\s*&\s*b\s+business|vacation\s+rental(?:\s+business)?|inn\s+business|business\.hospitality)\b/i,
    blueprintId: HOSPITALITY_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(content\s+creator\s+business|creator\s+business(?:\s+blueprint)?|business\.content_creator)\b/i,
    blueprintId: CONTENT_CREATOR_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    // Delivery organizing before generic organizing business
    re: /\b(physical\s+space\s+organiz(?:e|ing)|home\s+organiz(?:e|ing)|room\s+organiz(?:e|ing)|office\s+organiz(?:e|ing)|organizing\.physical_space)\b/i,
    blueprintId: PHYSICAL_SPACE_ORGANIZING_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(digital\s+(?:and\s+)?information\s+organiz(?:e|ing)|digital\s+organiz(?:e|ing)|file\s+organiz(?:e|ing)|organizing\.digital_information)\b/i,
    blueprintId: DIGITAL_INFORMATION_ORGANIZING_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(operational\s+(?:and\s+)?procedural\s+organiz(?:e|ing)|sop\s+organiz(?:e|ing)|workflow\s+organiz(?:e|ing)|organizing\.operational_procedural)\b/i,
    blueprintId: OPERATIONAL_PROCEDURAL_ORGANIZING_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(strategic\s+(?:and\s+)?management\s+organiz(?:e|ing)|management\s+organiz(?:e|ing)|strategic\s+organiz(?:e|ing)|organizing\.strategic_management)\b/i,
    blueprintId: STRATEGIC_MANAGEMENT_ORGANIZING_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(professional\s+organizing(?:\s+business)?|organizing\s+business|organizer\s+business|business\.professional_organizing)\b/i,
    blueprintId: PROFESSIONAL_ORGANIZING_BUSINESS_BLUEPRINT_ID,
    workTypeId: BUSINESS_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(networking\s+event|business\s+mixer|networking\s+mixer|speed\s+networking)\b/i,
    blueprintId: NETWORKING_EVENT_BLUEPRINT_ID,
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  },
  {
    // Challenge before bare workshop/webinar so "7-day challenge" etc. stay here
    re: /\b(\d+[-\s]?day\s+challenge|(?:habit|business|health|community)\s+challenge|challenge\s+(?:event|blueprint|series)|(?:plan|host|run|design)\s+a\s+challenge)\b/i,
    blueprintId: CHALLENGE_EVENT_BLUEPRINT_ID,
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  },
  {
    // Masterclass before workshop/webinar so premium teaching language stays here
    re: /\b(master\s*class|masterclass)\b/i,
    blueprintId: MASTERCLASS_EVENT_BLUEPRINT_ID,
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(fundraiser|fundraising\s+(?:gala|dinner|event)|charity\s+gala|benefit\s+(?:dinner|concert|gala)|silent\s+auction|live\s+auction|giving\s+day|donor\s+appreciation|capital\s+campaign\s+event|\bgala\b)\b/i,
    blueprintId: FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  },
  {
    // Book launch before product launch / launch event so book language stays distinct
    re: /\b(book\s+launch|launch\s+(?:a|my|the)\s+book|author\s+launch|bookstore\s+launch|library\s+launch|vip\s+reader\s+launch)\b/i,
    blueprintId: BOOK_LAUNCH_EVENT_BLUEPRINT_ID,
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  },
  {
    // Product launch before bare webinar so "webinar launch" stays on this Blueprint
    re: /\b(product\s+launch|launch\s+event|webinar\s+launch|hybrid\s+launch|(?:software|service|membership|course|consumer)\s+launch|vip\s+preview|public\s+launch|launch\s+(?:a|my|the)\s+(?:product|offer|course|membership|service))\b/i,
    blueprintId: PRODUCT_LAUNCH_EVENT_BLUEPRINT_ID,
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\bwebinar\b/i,
    blueprintId: WEBINAR_EVENT_BLUEPRINT_ID,
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\bconference\b/i,
    blueprintId: CONFERENCE_EVENT_BLUEPRINT_ID,
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\bsummit\b/i,
    blueprintId: SUMMIT_EVENT_BLUEPRINT_ID,
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(business\s+luncheon|luncheon)\b/i,
    blueprintId: "bp-event-business-luncheon",
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(online\s+workshop|virtual\s+workshop)\b/i,
    blueprintId: "bp-event-online-workshop",
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(one[-\s]?day\s+workshop)\b/i,
    blueprintId: "bp-event-one-day-workshop",
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(three[-\s]?day\s+retreat)\b/i,
    blueprintId: "bp-event-three-day-retreat",
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  },
  {
    // Bare "retreat" → general Retreat Blueprint (three-day specialty pattern above wins)
    re: /\bretreat\b/i,
    blueprintId: RETREAT_EVENT_BLUEPRINT_ID,
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(book[-\s]?signing)\b/i,
    blueprintId: "bp-event-book-signing",
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  },
  {
    re: /\b(workshop\s+blueprint|workshop\s+plan|half[-\s]?day\s+workshop|full[-\s]?day\s+workshop|host\s+a\s+workshop|plan\s+a\s+workshop|design\s+a\s+workshop)\b/i,
    blueprintId: WORKSHOP_EVENT_BLUEPRINT_ID,
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  },
  {
    // Bare "workshop" → general Workshop Blueprint (specific online/one-day patterns above win)
    re: /\bworkshop\b/i,
    blueprintId: WORKSHOP_EVENT_BLUEPRINT_ID,
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  },
];

export function mapLegacyCreateBlueprintToUwe(
  legacyId: string | null | undefined,
): string | null {
  if (!legacyId?.trim()) return null;
  const id = legacyId.trim();
  if (getBlueprint(id)) return id;
  return LEGACY_CREATE_BP_TO_UWE[id] ?? null;
}

export function inferWorkTypeAndBlueprint(contract: UniversalLaunchContract): {
  workTypeId: string | null;
  blueprintId: string | null;
  fromLegacyAlias: boolean;
} {
  let fromLegacyAlias = false;
  let blueprintId = contract.candidateBlueprintId?.trim() || null;
  let workTypeId = contract.candidateWorkTypeId?.trim() || null;

  if (blueprintId) {
    const mapped = mapLegacyCreateBlueprintToUwe(blueprintId);
    if (mapped && mapped !== blueprintId) {
      fromLegacyAlias = true;
      blueprintId = mapped;
    }
    if (blueprintId && !getBlueprint(blueprintId)) {
      // Unknown Blueprint — fail visible later; do not invent.
      return { workTypeId, blueprintId: null, fromLegacyAlias };
    }
  }

  const message = [
    contract.originalUserMessage,
    contract.userIntent,
  ]
    .filter(Boolean)
    .join(" ");

  if (!blueprintId && message) {
    for (const pattern of MESSAGE_BLUEPRINT_PATTERNS) {
      if (pattern.re.test(message)) {
        blueprintId = pattern.blueprintId;
        workTypeId = workTypeId ?? pattern.workTypeId;
        break;
      }
    }
  }

  if (blueprintId && !workTypeId) {
    const bp = getBlueprint(blueprintId);
    workTypeId = bp?.compatibleWorkTypeIds[0] ?? null;
  }

  if (
    blueprintId &&
    workTypeId &&
    !isBlueprintCompatibleWithWorkType(blueprintId, workTypeId)
  ) {
    return { workTypeId, blueprintId: null, fromLegacyAlias };
  }

  // Default Marketing Plan when message clearly asks for marketing planning
  if (
    !workTypeId &&
    message &&
    /\b(marketing\s+plan|market(?:ing)?\s+this\s+offer)\b/i.test(message)
  ) {
    workTypeId = MARKETING_PLAN_WORK_TYPE_ID;
  }

  // Default Business Plan when message clearly asks for Business Blueprints
  if (
    !workTypeId &&
    message &&
    /\b(craft\s+show\s+business|handmade\s+online\s+store|handmade\s+(?:business|shop|store)|maker\s+business|etsy\s+(?:shop|store|business)|product\s+photography|inventory\s+(?:and\s+)?pricing|holiday\s+product\s+planner|holiday\s+(?:collection|planner)|seasonal\s+(?:product\s+)?planner|speaker\s+business|speaking\s+business|coaching\s+business|coach\s+business|consulting\s+business|consultant\s+business|service\s+business(?:\s+operating)?|author\s+business|course\s+creator|course\s+business|membership\s+business|content\s+creator\s+business|creator\s+business|professional\s+organizing|organizing\s+business|physical\s+space\s+organiz|digital\s+organiz|sop\s+organiz|strategic\s+organiz|management\s+organiz)\b/i.test(
      message,
    )
  ) {
    workTypeId = BUSINESS_PLAN_WORK_TYPE_ID;
  }

  // Default Event Work Type when message clearly asks for event planning
  if (
    !workTypeId &&
    message &&
    /\b(event|workshop|retreat|luncheon|signing|networking|mixer|webinar|conference|summit|launch|challenge|masterclass|master\s*class|fundraiser|gala|auction)\b/i.test(
      message,
    )
  ) {
    workTypeId = EVENT_PLAN_WORK_TYPE_ID;
  }

  return { workTypeId, blueprintId, fromLegacyAlias };
}

export function listCompatibleBlueprintIds(workTypeId: string): string[] {
  return listBlueprints({ workTypeId }).map((b) => b.blueprintId);
}
