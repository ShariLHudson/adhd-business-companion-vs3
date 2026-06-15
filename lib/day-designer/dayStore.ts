/**
 * Local persistence for day plans — optional, user-controlled.
 */

import type { DayDesignerSession, DayPlan } from "./types";

const STORE_KEY = "companion-day-designer-v1";

export type DayDesignerStore = {
  plans: DayPlan[];
  founderSamples: {
    at: string;
    energy: string;
    cognitiveLoadLevel: string;
    activationState: string;
    blockCount: number;
    reducedLoad: boolean;
    planningBlocker: string | null;
  }[];
  activeSession: DayDesignerSession | null;
  dismissedOn: string | null;
};

const DEFAULT_STORE: DayDesignerStore = {
  plans: [],
  founderSamples: [],
  activeSession: null,
  dismissedOn: null,
};

export function getDayDesignerStore(): DayDesignerStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<DayDesignerStore>;
    return {
      ...DEFAULT_STORE,
      ...parsed,
      plans: Array.isArray(parsed.plans) ? parsed.plans : [],
      founderSamples: Array.isArray(parsed.founderSamples)
        ? parsed.founderSamples
        : [],
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

export function saveDayDesignerStore(
  update: Partial<DayDesignerStore>,
): DayDesignerStore {
  const next = { ...getDayDesignerStore(), ...update };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return next;
}

export function dayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function recordDayPlan(plan: DayPlan): void {
  const store = getDayDesignerStore();
  const today = plan.date;
  const withoutToday = store.plans.filter((p) => p.date !== today);
  const reducedLoad =
    plan.cognitiveLoadLevel === "heavy" ||
    plan.cognitiveLoadLevel === "overloaded" ||
    plan.suggestedBlocks.length <= 2;

  let planningBlocker: string | null = null;
  if (plan.activationState === "stuck" || plan.activationState === "frozen") {
    planningBlocker = "stuck_frozen";
  } else if (plan.cognitiveLoadLevel === "overloaded") {
    planningBlocker = "overloaded";
  } else if (plan.userEnergy === "low") {
    planningBlocker = "low_energy";
  }

  saveDayDesignerStore({
    plans: [...withoutToday, plan].slice(-30),
    founderSamples: [
      ...store.founderSamples,
      {
        at: plan.createdAt,
        energy: plan.userEnergy,
        cognitiveLoadLevel: plan.cognitiveLoadLevel,
        activationState: plan.activationState,
        blockCount: plan.suggestedBlocks.length,
        reducedLoad,
        planningBlocker,
      },
    ].slice(-500),
    activeSession: null,
  });
}

export function saveDayDesignerSession(
  session: DayDesignerSession | null,
): void {
  saveDayDesignerStore({ activeSession: session });
}

export function getDayDesignerSession(): DayDesignerSession | null {
  return getDayDesignerStore().activeSession;
}

export function dismissDayDesigner(now = new Date()): void {
  saveDayDesignerStore({
    dismissedOn: dayKey(now),
    activeSession: null,
  });
}

export function isDayDesignerDismissedToday(now = new Date()): boolean {
  return getDayDesignerStore().dismissedOn === dayKey(now);
}

export const DAY_DESIGNER_UPDATED_EVENT = "companion-day-designer-updated";

export function notifyDayDesignerUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DAY_DESIGNER_UPDATED_EVENT));
  }
}
