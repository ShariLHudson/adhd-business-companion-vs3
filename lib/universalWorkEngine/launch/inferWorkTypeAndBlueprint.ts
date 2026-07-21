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
  CRAFT_SHOW_BUSINESS_BLUEPRINT_ID,
  HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID,
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
    re: /\b(handmade\s+online\s+store|handmade\s+(?:business|shop|store)|maker\s+business|etsy\s+(?:shop|store)|business\.handmade_online_store)\b/i,
    blueprintId: HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID,
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

  // Default Business Plan when message clearly asks for crafter business blueprints
  if (
    !workTypeId &&
    message &&
    /\b(craft\s+show\s+business|handmade\s+online\s+store|handmade\s+(?:business|shop|store)|maker\s+business|etsy\s+(?:shop|store))\b/i.test(
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
