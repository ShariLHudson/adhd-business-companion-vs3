import type { FounderDailyBrief } from "../types";
import { sampleBriefRepository } from "../repositories";

const MAX_PRIORITIES = 3;
const MAX_SIGNALS = 3;
const MAX_IGNORE = 3;
const MAX_TRENDS = 3;

function capBrief(brief: FounderDailyBrief): FounderDailyBrief {
  return {
    ...brief,
    priorities: brief.priorities.slice(0, MAX_PRIORITIES),
    customerSignals: brief.customerSignals.slice(0, MAX_SIGNALS),
    ignoreItems: brief.ignoreItems.slice(0, MAX_IGNORE),
    trends: brief.trends.slice(0, MAX_TRENDS),
  };
}

/** FIRE entry point — today's executive brief for Founder Studio home. */
export function getTodayBrief(): FounderDailyBrief {
  return capBrief(sampleBriefRepository.getTodayBrief());
}

export function getBriefByDate(date: string): FounderDailyBrief | null {
  const brief = sampleBriefRepository.getBriefByDate(date);
  return brief ? capBrief(brief) : null;
}
