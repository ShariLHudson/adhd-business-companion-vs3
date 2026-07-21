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
};

const MESSAGE_BLUEPRINT_PATTERNS: {
  re: RegExp;
  blueprintId: string;
  workTypeId: string;
}[] = [
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
    re: /\b(online\s+workshop)\b/i,
    blueprintId: "bp-event-online-workshop",
    workTypeId: EVENT_PLAN_WORK_TYPE_ID,
  },
  {
    // Bare "workshop" only when not already a more specific event phrase
    re: /\bworkshop\b/i,
    blueprintId: "bp-event-online-workshop",
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

  // Default Event Work Type when message clearly asks for event planning
  if (
    !workTypeId &&
    message &&
    /\b(event|workshop|retreat|luncheon|signing)\b/i.test(message)
  ) {
    workTypeId = EVENT_PLAN_WORK_TYPE_ID;
  }

  return { workTypeId, blueprintId, fromLegacyAlias };
}

export function listCompatibleBlueprintIds(workTypeId: string): string[] {
  return listBlueprints({ workTypeId }).map((b) => b.blueprintId);
}
