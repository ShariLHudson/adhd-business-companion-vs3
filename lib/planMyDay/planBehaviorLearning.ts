/**
 * Plan My Day behavior learning — supportive observations for Companion Intelligence.
 */

export type PlanBehaviorKind = "completed" | "deferred" | "snoozed";

export type PlanBehaviorEvent = {
  id: string;
  kind: PlanBehaviorKind;
  planItemId: string;
  title: string;
  theme: string | null;
  at: string;
};

const STORE_KEY = "companion-plan-behavior-events-v1";
const MAX_EVENTS = 400;
const WEEK_MS = 7 * 86_400_000;

const THEME_RULES: { id: string; label: string; re: RegExp }[] = [
  {
    id: "marketing",
    label: "marketing",
    re: /\b(marketing|content|post|pin|email sequence|social|newsletter)\b/i,
  },
  {
    id: "followup",
    label: "follow-up",
    re: /\b(follow.?up|outreach|call|discovery|proposal|sales)\b/i,
  },
  {
    id: "planning",
    label: "planning",
    re: /\b(plan|organize|brainstorm|strategy|outline)\b/i,
  },
  {
    id: "build",
    label: "building",
    re: /\b(build|launch|website|page|funnel|course)\b/i,
  },
];

function uid(): string {
  return `pbe-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function themeForPlanTitle(title: string): string | null {
  for (const rule of THEME_RULES) {
    if (rule.re.test(title)) return rule.id;
  }
  return null;
}

function readEvents(): PlanBehaviorEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PlanBehaviorEvent[];
  } catch {
    return [];
  }
}

function writeEvents(events: PlanBehaviorEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
  } catch {
    /* ignore */
  }
}

export function recordPlanBehaviorEvent(input: {
  kind: PlanBehaviorKind;
  planItemId: string;
  title: string;
}): void {
  const event: PlanBehaviorEvent = {
    id: uid(),
    kind: input.kind,
    planItemId: input.planItemId,
    title: input.title.trim(),
    theme: themeForPlanTitle(input.title),
    at: new Date().toISOString(),
  };
  writeEvents([event, ...readEvents()]);
}

export function buildCompanionPlanObservations(now = Date.now()): string[] {
  const cutoff = now - WEEK_MS;
  const recent = readEvents().filter(
    (e) => new Date(e.at).getTime() >= cutoff,
  );
  const observations: string[] = [];

  const postponed = recent.filter(
    (e) => e.kind === "deferred" || e.kind === "snoozed",
  );
  const byTheme = new Map<string, number>();
  for (const e of postponed) {
    if (!e.theme) continue;
    byTheme.set(e.theme, (byTheme.get(e.theme) ?? 0) + 1);
  }
  for (const [theme, count] of byTheme) {
    if (count >= 3) {
      const label = THEME_RULES.find((r) => r.id === theme)?.label ?? theme;
      observations.push(
        `You've moved ${label} items aside several times this week — want to pick one smaller piece for today?`,
      );
    }
  }

  const completed = recent.filter((e) => e.kind === "completed");
  const morning = completed.filter((e) => new Date(e.at).getHours() < 12).length;
  if (completed.length >= 4 && morning / completed.length >= 0.6) {
    observations.push(
      "You tend to finish plan items in the morning — that might be a good window for important work.",
    );
  }

  const planningPostponed = byTheme.get("planning") ?? 0;
  const followupPostponed = byTheme.get("followup") ?? 0;
  const planningDone = completed.filter((e) => e.theme === "planning").length;
  const followupDone = completed.filter((e) => e.theme === "followup").length;
  if (
    planningDone >= 2 &&
    followupPostponed >= 2 &&
    followupDone === 0 &&
    !observations.some((o) => o.includes("follow-up"))
  ) {
    observations.push(
      "You finish planning tasks quickly but follow-up work keeps getting pushed — want help sizing one follow-up for today?",
    );
  }

  return observations.slice(0, 2);
}

export function resetPlanBehaviorForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORE_KEY);
}
