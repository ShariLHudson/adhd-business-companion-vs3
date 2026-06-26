/**
 * Plan My Day bridge — resolves Life Areas on items without reasoning in UI.
 */

import type { PlanDayItem, PlanLifeDomain } from "./types";
import {
  classifyLifeArea,
} from "@/lib/companionBrain/classifyLifeArea";
import type { ClassifyLifeAreaInput } from "@/lib/companionBrain/lifeAreas/types";
import {
  getAllLifeAreas,
  getLifeAreaById,
  readLifeAreaCorrections,
  recordLifeAreaCorrection,
  touchRecentLifeArea,
} from "@/lib/companionBrain/lifeAreas";
import type { LifeAreaClassificationResult } from "@/lib/companionBrain/lifeAreas/types";

const LEGACY_DOMAIN_TO_LIFE_AREA: Record<PlanLifeDomain, string> = {
  business: "sys:business",
  health: "sys:health",
  learning: "sys:learning",
  personal: "sys:personal-growth",
  relationships: "sys:relationships-networking",
};

export function legacyDomainToLifeAreaId(domain: PlanLifeDomain): string {
  return LEGACY_DOMAIN_TO_LIFE_AREA[domain];
}

export function migratePlanItemLifeArea(item: PlanDayItem): PlanDayItem {
  if (item.lifeAreaId) return item;
  if (item.category) {
    return {
      ...item,
      lifeAreaId: legacyDomainToLifeAreaId(item.category),
    };
  }
  return item;
}

export function resolvePlanItemLifeAreaId(item: PlanDayItem): string {
  const migrated = migratePlanItemLifeArea(item);
  if (migrated.lifeAreaId) return migrated.lifeAreaId;
  const classification = classifyTaskLifeArea(migrated.title);
  return classification?.primaryLifeAreaId ?? "sys:business";
}

export function resolvePlanItemLifeAreaName(item: PlanDayItem): string {
  const id = resolvePlanItemLifeAreaId(item);
  return getLifeAreaById(id)?.name ?? "Business";
}

export function resolvePlanItemLegacyDomain(item: PlanDayItem): PlanLifeDomain {
  const id = resolvePlanItemLifeAreaId(item);
  const area = getLifeAreaById(id);
  return area?.legacyDomain ?? "business";
}

export function classifyTaskLifeArea(
  taskText: string,
  extra?: Partial<ClassifyLifeAreaInput>,
): LifeAreaClassificationResult | null {
  return classifyLifeArea(
    {
      taskText,
      previousCorrections: readLifeAreaCorrections(),
      ...extra,
    },
    getAllLifeAreas(),
  );
}

export function confirmLifeAreaForTask(
  taskText: string,
  lifeAreaId: string,
): void {
  recordLifeAreaCorrection(taskText, lifeAreaId);
  touchRecentLifeArea(lifeAreaId);
}

export { getAllLifeAreas, getLifeAreaById };
