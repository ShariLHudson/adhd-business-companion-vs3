/**
 * Strategies hub — separates ADHD (apply now) from Business (create plans).
 */

import type { AppSection } from "./companionUi";
import { compareDropdownLabels } from "./dropdownSort";
import {
  STRATEGY_CATEGORIES,
  STRATEGIES,
  getCategory,
  groupForStrategy,
  resolveSubcat,
  type Strategy,
} from "./strategySystem";

export type AdhdStrategyRoute =
  | { kind: "builtin"; strategyId: string }
  | { kind: "activity"; activityId: string }
  | { kind: "section"; section: AppSection };

export type AdhdStrategyHubEntry = {
  id: string;
  label: string;
  route: AdhdStrategyRoute;
};

/** ADHD strategies — tools and techniques to apply right now. */
const ADHD_STRATEGY_HUB_RAW: AdhdStrategyHubEntry[] = [
  {
    id: "body-double",
    label: "Body Double",
    route: { kind: "builtin", strategyId: "body-double" },
  },
  {
    id: "shrink-first-step",
    label: "Shrink the First Step",
    route: { kind: "builtin", strategyId: "shrink-first-step" },
  },
  {
    id: "start-ugly",
    label: "Start Ugly",
    route: { kind: "builtin", strategyId: "ugly-first-draft" },
  },
  {
    id: "brain-parking-lot",
    label: "Brain Parking Lot",
    route: { kind: "activity", activityId: "brain-parking-lot" },
  },
  {
    id: "clear-my-mind",
    label: "Clear My Mind",
    route: { kind: "section", section: "brain-dump" },
  },
  {
    id: "decision-helper",
    label: "Decision Helper",
    route: { kind: "activity", activityId: "decision-compass" },
  },
  {
    id: "first-physical-step",
    label: "First Physical Step",
    route: { kind: "activity", activityId: "first-step-finder" },
  },
  {
    id: "momentum-builder",
    label: "Momentum Builder",
    route: { kind: "activity", activityId: "momentum-restart" },
  },
  {
    id: "safe-for-today",
    label: "Safe For Today",
    route: { kind: "activity", activityId: "safe-for-today" },
  },
  {
    id: "time-blindness-reset",
    label: "Time Blindness Reset",
    route: { kind: "activity", activityId: "time-block-builder" },
  },
  {
    id: "tiny-step-challenge",
    label: "Tiny Step Challenge",
    route: { kind: "builtin", strategyId: "first-tiny-step" },
  },
  {
    id: "waiting-mode-rescue",
    label: "Waiting Mode Rescue",
    route: { kind: "activity", activityId: "what-can-wait" },
  },
];

export const ADHD_STRATEGY_HUB: AdhdStrategyHubEntry[] = [...ADHD_STRATEGY_HUB_RAW].sort(
  (a, b) => compareDropdownLabels(a.label, b.label),
);

export const BUSINESS_STRATEGY_TEMPLATES = [
  "Content Strategy",
  "Launch Strategy",
  "Marketing Strategy",
  "Product Strategy",
  "Sales Strategy",
  "Visibility Strategy",
  "Other Strategy",
] as const;

export type BusinessStrategyTemplate = (typeof BUSINESS_STRATEGY_TEMPLATES)[number];

export const STRATEGIES_HUB = {
  adhd: {
    title: "ADHD Strategies",
    description: "Tools and techniques that help you work with your brain.",
  },
  business: {
    title: "Business Strategies",
    description: "Plans and systems that help grow your business.",
  },
  recommended: {
    title: "Recommended For You",
    description: "Personalized suggestions to try next.",
  },
  saved: {
    title: "Saved Strategies",
    description: "Strategies you created or saved.",
  },
} as const;

export function adhdHubEntry(id: string): AdhdStrategyHubEntry | undefined {
  return ADHD_STRATEGY_HUB.find((e) => e.id === id);
}

export type AdhdDropdownOption =
  | { kind: "builtin"; hubId: string; strategyId: string; label: string }
  | { kind: "hub"; hubId: string; entry: AdhdStrategyHubEntry; label: string };

/** ADHD strategies grouped by category, categories A–Z, options A–Z within. */
export function adhdStrategyDropdownGroups(
  filter?: string,
): { category: string; options: AdhdDropdownOption[] }[] {
  const q = filter?.trim().toLowerCase() ?? "";
  const byStrategyId = new Map<string, AdhdDropdownOption>();

  for (const entry of ADHD_STRATEGY_HUB) {
    if (q && !entry.label.toLowerCase().includes(q)) continue;
    if (entry.route.kind === "builtin") {
      byStrategyId.set(entry.route.strategyId, {
        kind: "builtin",
        hubId: entry.id,
        strategyId: entry.route.strategyId,
        label: entry.label,
      });
    } else {
      byStrategyId.set(`hub:${entry.id}`, {
        kind: "hub",
        hubId: entry.id,
        entry,
        label: entry.label,
      });
    }
  }

  const categoryLabel = (strategy: Strategy) => {
    const sub = resolveSubcat(strategy);
    return (
      STRATEGY_CATEGORIES.find((c) => c.id === sub)?.label ?? "Strategies"
    );
  };

  const groups = new Map<string, AdhdDropdownOption[]>();
  for (const opt of byStrategyId.values()) {
    let cat = "Tools & Activities";
    if (opt.kind === "builtin") {
      const s = STRATEGIES.find((x) => x.id === opt.strategyId);
      if (s) cat = categoryLabel(s);
    }
    const list = groups.get(cat) ?? [];
    list.push(opt);
    groups.set(cat, list);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => compareDropdownLabels(a, b))
    .map(([category, options]) => ({
      category,
      options: [...options].sort((a, b) =>
        compareDropdownLabels(a.label, b.label),
      ),
    }));
}

export type BusinessDropdownOption = {
  strategyId: string;
  label: string;
};

/** Built-in business coaching strategies, grouped by category A–Z. */
export function businessStrategyDropdownGroups(
  filter?: string,
): { category: string; options: BusinessDropdownOption[] }[] {
  const q = filter?.trim().toLowerCase() ?? "";
  const groups = new Map<string, BusinessDropdownOption[]>();

  for (const s of STRATEGIES) {
    if (groupForStrategy(s) !== "business") continue;
    const sub = resolveSubcat(s);
    const cat = getCategory(sub);
    const category = cat?.label ?? "Business";
    const label = s.title;
    if (
      q &&
      !label.toLowerCase().includes(q) &&
      !category.toLowerCase().includes(q)
    ) {
      continue;
    }
    const list = groups.get(category) ?? [];
    list.push({ strategyId: s.id, label });
    groups.set(category, list);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => compareDropdownLabels(a, b))
    .map(([category, options]) => ({
      category,
      options: [...options].sort((a, b) =>
        compareDropdownLabels(a.label, b.label),
      ),
    }));
}

export function businessBuiltinStrategyCount(): number {
  return STRATEGIES.filter((s) => groupForStrategy(s) === "business").length;
}
