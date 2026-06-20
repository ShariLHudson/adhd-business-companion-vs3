import type { PlanDayItem, PlanLifeDomain } from "./types";

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

export const PLAN_CATEGORY_OPTIONS: {
  value: PlanLifeDomain | "auto";
  label: string;
}[] = [
  { value: "auto", label: "Auto-detect" },
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

export function inferPlanLifeDomain(title: string): PlanLifeDomain {
  const t = title.trim();
  for (const domain of Object.keys(DOMAIN_KEYWORDS) as PlanLifeDomain[]) {
    if (DOMAIN_KEYWORDS[domain].test(t)) return domain;
  }
  return "business";
}

export function planItemStyle(
  item: Pick<PlanDayItem, "title" | "category">,
  colorCoding = true,
) {
  const domain = item.category ?? inferPlanLifeDomain(item.title);
  if (!colorCoding) {
    return {
      domain,
      ...NEUTRAL_PLAN_ITEM_STYLE,
      label: PLAN_DOMAIN_PALETTE[domain].label,
    };
  }
  const palette = PLAN_DOMAIN_PALETTE[domain];
  return {
    domain,
    ...palette,
    border: palette.color,
    rail: palette.color,
  };
}

/** @deprecated Prefer planItemStyle(item) */
export function planDomainStyle(title: string) {
  return planItemStyle({ title });
}
