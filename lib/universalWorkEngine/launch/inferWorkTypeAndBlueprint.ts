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
import { MARKETING_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/marketingPlanMap";
import { MARKETING_PLAN_SIMPLE_BLUEPRINT_ID } from "../packages/marketingPlan/marketingPlanBlueprint";
import {
  NETWORKING_EVENT_BLUEPRINT_ID,
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
  "bp-marketing-plan": MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
  "bp-simple-marketing-plan": MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
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
    re: /\b(networking\s+event|business\s+mixer|networking\s+mixer|speed\s+networking)\b/i,
    blueprintId: NETWORKING_EVENT_BLUEPRINT_ID,
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
    re: /\b(three[-\s]?day\s+retreat|retreat\s+blueprint|retreat)\b/i,
    blueprintId: "bp-event-three-day-retreat",
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

  // Default Event Work Type when message clearly asks for event planning
  if (
    !workTypeId &&
    message &&
    /\b(event|workshop|retreat|luncheon|signing|networking|mixer)\b/i.test(
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
