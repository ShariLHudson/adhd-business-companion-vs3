import type { MomentumNeedId } from "../momentumGames";
import { getMomentumNeedCategory } from "../momentumGames";

const USAGE_KEY = "companion-momentum-games-usage-v1";

export type MomentumGamesUsage = {
  lastNeed?: MomentumNeedId;
  lastNeedAt?: string;
  visitCount: number;
  lastVisitAt?: string;
};

function readUsage(): MomentumGamesUsage {
  if (typeof window === "undefined") {
    return { visitCount: 0 };
  }
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return { visitCount: 0 };
    const parsed = JSON.parse(raw) as MomentumGamesUsage;
    return {
      visitCount: parsed.visitCount ?? 0,
      lastNeed: parsed.lastNeed,
      lastNeedAt: parsed.lastNeedAt,
      lastVisitAt: parsed.lastVisitAt,
    };
  } catch {
    return { visitCount: 0 };
  }
}

function writeUsage(usage: MomentumGamesUsage) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  } catch {
    /* noop */
  }
}

export function recordMomentumGamesVisit() {
  const prev = readUsage();
  writeUsage({
    ...prev,
    visitCount: (prev.visitCount ?? 0) + 1,
    lastVisitAt: new Date().toISOString(),
  });
}

export function recordMomentumGamesCategory(need: MomentumNeedId) {
  const prev = readUsage();
  writeUsage({
    ...prev,
    lastNeed: need,
    lastNeedAt: new Date().toISOString(),
    visitCount: prev.visitCount ?? 0,
    lastVisitAt: prev.lastVisitAt,
  });
}

export function getMomentumGamesUsage(): MomentumGamesUsage {
  return readUsage();
}

function daysSince(iso?: string): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86400000);
}

/** Gentle companion line — aware without intruding. */
export function composeMomentumGamesWelcome(
  usage: MomentumGamesUsage = getMomentumGamesUsage(),
): string | null {
  const returning = (usage.visitCount ?? 0) > 1;
  const lastNeed = usage.lastNeed;
  const daysAgo = daysSince(usage.lastNeedAt);

  if (lastNeed && daysAgo === 0) {
    const cat = getMomentumNeedCategory(lastNeed);
    return `${cat.title} helped you earlier today. Would you like to continue there?`;
  }

  if (lastNeed && daysAgo === 1) {
    const cat = getMomentumNeedCategory(lastNeed);
    return `${cat.title} helped you yesterday. Want to pick up where you left off?`;
  }

  if (returning) {
    return "Welcome back. Let's give your brain something fun to do.";
  }

  return null;
}
