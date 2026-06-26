import type { PlanDayItem, PlanLifeDomain } from "./types";
import { getLifeAreaById } from "@/lib/companionBrain/lifeAreas";
import {
  resolvePlanItemLegacyDomain,
  resolvePlanItemLifeAreaId,
  resolvePlanItemLifeAreaName,
} from "./lifeAreaBridge";

export const NEUTRAL_PLAN_ITEM_STYLE = {
  color: "#d4cdc3",
  tint: "#ffffff",
  border: "#e7dfd4",
  rail: "#e7dfd4",
  label: "Task",
} as const;

export const PLAN_DOMAIN_PALETTE: Record<
  PlanLifeDomain,
  { color: string; tint: string; label: string }
> = {
  business: { color: "#4a6fa5", tint: "#e8f0fa", label: "Business" },
  health: { color: "#2e8b57", tint: "#e8f5ec", label: "Health" },
  learning: { color: "#9a6fb0", tint: "#f3ebf8", label: "Learning" },
  personal: { color: "#e8954a", tint: "#fdf3e8", label: "Personal" },
  relationships: { color: "#d4688a", tint: "#faeef2", label: "Relationships" },
};

/** @deprecated Use Life Area selector — kept for legacy references */
export const PLAN_CATEGORY_OPTIONS: {
  value: PlanLifeDomain | "auto";
  label: string;
}[] = [
  { value: "auto", label: "Let Shari decide" },
  ...(
    Object.entries(PLAN_DOMAIN_PALETTE) as [
      PlanLifeDomain,
      (typeof PLAN_DOMAIN_PALETTE)[PlanLifeDomain],
    ][]
  ).map(([value, { label }]) => ({ value, label })),
];

const DOMAIN_KEYWORDS: Record<PlanLifeDomain, RegExp> = {
  business: /\b(business|email|marketing|client|sales|launch|adhd app|work|proposal|invoice)\b/i,
  health: /\b(health|bike|exercise|walk|gym|yoga|meditat|sleep|doctor)\b/i,
  learning: /\b(research|learn|study|course|read|training|webinar)\b/i,
  personal: /\b(personal|hobby|break|rest|chore|home|errand)\b/i,
  relationships: /\b(family|friend|relationship|call|mom|dad|partner|network)\b/i,
};

/** @deprecated Prefer resolvePlanItemLegacyDomain */
export function inferPlanLifeDomain(title: string): PlanLifeDomain {
  const t = title.trim();
  for (const domain of Object.keys(DOMAIN_KEYWORDS) as PlanLifeDomain[]) {
    if (DOMAIN_KEYWORDS[domain].test(t)) return domain;
  }
  return "business";
}

function tintFromColor(hex: string): string {
  return `${hex}22`;
}

export function planItemStyle(
  item: Pick<PlanDayItem, "title" | "category" | "lifeAreaId">,
  colorCoding = true,
) {
  const domain = resolvePlanItemLegacyDomain(item as PlanDayItem);
  const lifeAreaId = resolvePlanItemLifeAreaId(item as PlanDayItem);
  const lifeArea = getLifeAreaById(lifeAreaId);
  const label = resolvePlanItemLifeAreaName(item as PlanDayItem);

  if (!colorCoding) {
    return {
      domain,
      lifeAreaId,
      ...NEUTRAL_PLAN_ITEM_STYLE,
      label,
    };
  }

  const color = lifeArea?.color ?? PLAN_DOMAIN_PALETTE[domain].color;
  const tint = lifeArea?.color ? tintFromColor(color) : PLAN_DOMAIN_PALETTE[domain].tint;

  return {
    domain,
    lifeAreaId,
    color,
    tint,
    border: color,
    rail: color,
    label,
  };
}

/** @deprecated Prefer planItemStyle(item) */
export function planDomainStyle(title: string) {
  return planItemStyle({ title });
}
