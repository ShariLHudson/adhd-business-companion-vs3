// Cost Intelligence — operating costs and profitability across the ecosystem.

import { getFounderSupabaseAdmin, founderSupabaseConfigured } from "@/lib/supabase/founderServer";

import {
  formatUsd,
  monthKeyFromDate,
  previousMonthKey,
  monthBounds,
} from "./revenueIntelligenceEngine";

export type CostCategory =
  | "openai"
  | "claude"
  | "vercel"
  | "supabase"
  | "ghl"
  | "google_workspace"
  | "postcraft"
  | "other_saas";

export const COST_CATEGORIES: CostCategory[] = [
  "openai",
  "claude",
  "vercel",
  "supabase",
  "ghl",
  "google_workspace",
  "postcraft",
  "other_saas",
];

export const COST_CATEGORY_LABELS: Record<CostCategory, string> = {
  openai: "OpenAI",
  claude: "Claude",
  vercel: "Vercel",
  supabase: "Supabase",
  ghl: "GHL",
  google_workspace: "Google Workspace",
  postcraft: "PostCraft",
  other_saas: "Other SaaS",
};

/** Variable costs treated as COGS for gross margin. */
export const COGS_CATEGORIES = new Set<CostCategory>([
  "openai",
  "claude",
  "postcraft",
]);

export type CostEventSource = "manual" | "api" | "estimate" | "invoice";

export type CostEvent = {
  id: string;
  category: CostCategory;
  amount: number;
  currency: string;
  occurredAt: string;
  source: CostEventSource;
  note?: string;
};

export type CostCategorySummary = {
  category: CostCategory;
  label: string;
  amount: number;
  sharePercent: number;
  growthPercent: number;
};

export type CostDashboardMetrics = {
  totalMonthlyCosts: number;
  biggestCost: CostCategory;
  biggestCostLabel: string;
  biggestCostAmount: number;
  fastestGrowingCost: CostCategory | null;
  fastestGrowingCostLabel: string | null;
  fastestGrowingCostPercent: number;
  profitEstimate: number;
};

export type CostTrendPoint = {
  monthKey: string;
  totalCosts: number;
  byCategory: Partial<Record<CostCategory, number>>;
};

export type FounderCostIntelligence = {
  dashboardMetrics: CostDashboardMetrics;
  categoryBreakdown: CostCategorySummary[];
  monthlyCosts: number;
  costGrowthPercent: number;
  costPerUser: number;
  costPerActiveUser: number;
  grossMarginPercent: number;
  netMarginPercent: number;
  profitEstimate: number;
  cogsTotal: number;
  opexTotal: number;
  monthlyRevenue: number;
  costTrend: CostTrendPoint[];
  generatedAt: string;
};

const COST_TABLE = "ecosystem_cost_events";
const costMemory: CostEvent[] = [];

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function roundPercent(n: number): number {
  return Math.round(n * 10) / 10;
}

export function readEnvCostEstimate(category: CostCategory): number {
  const key = `ECOSYSTEM_COST_${category.toUpperCase()}`;
  const raw = process.env[key]?.trim();
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function costEventsInMonth(events: CostEvent[], monthKey: string): CostEvent[] {
  const { start, end } = monthBounds(monthKey);
  return events.filter((e) => {
    const t = new Date(e.occurredAt).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
}

export function sumCostsByCategory(
  events: CostEvent[],
  monthKey: string,
): Record<CostCategory, number> {
  const totals = Object.fromEntries(
    COST_CATEGORIES.map((c) => [c, 0]),
  ) as Record<CostCategory, number>;

  for (const e of costEventsInMonth(events, monthKey)) {
    totals[e.category] = roundMoney(totals[e.category] + e.amount);
  }

  return totals;
}

export function totalMonthlyCosts(
  events: CostEvent[],
  monthKey: string,
): number {
  const byCat = sumCostsByCategory(events, monthKey);
  return roundMoney(COST_CATEGORIES.reduce((sum, c) => sum + byCat[c], 0));
}

export function computeCostGrowthPercent(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return roundMoney(((current - previous) / previous) * 100);
}

export function findBiggestCost(
  byCategory: Record<CostCategory, number>,
): { category: CostCategory; amount: number } {
  let category: CostCategory = "other_saas";
  let amount = 0;
  for (const c of COST_CATEGORIES) {
    if (byCategory[c] > amount) {
      amount = byCategory[c];
      category = c;
    }
  }
  return { category, amount };
}

export function findFastestGrowingCost(
  current: Record<CostCategory, number>,
  previous: Record<CostCategory, number>,
): { category: CostCategory | null; growthPercent: number } {
  let category: CostCategory | null = null;
  let growthPercent = 0;

  for (const c of COST_CATEGORIES) {
    const growth = computeCostGrowthPercent(current[c], previous[c]);
    if (growth > growthPercent && current[c] > 0) {
      growthPercent = growth;
      category = c;
    }
  }

  return { category, growthPercent };
}

export function computeCostPerUser(totalCosts: number, userCount: number): number {
  if (userCount <= 0) return 0;
  return roundMoney(totalCosts / userCount);
}

export function computeGrossMarginPercent(
  revenue: number,
  cogs: number,
): number {
  if (revenue <= 0) return 0;
  return roundPercent(((revenue - cogs) / revenue) * 100);
}

export function computeNetMarginPercent(
  revenue: number,
  totalCosts: number,
): number {
  if (revenue <= 0) return 0;
  return roundPercent(((revenue - totalCosts) / revenue) * 100);
}

export function computeProfitEstimate(revenue: number, totalCosts: number): number {
  return roundMoney(revenue - totalCosts);
}

export function buildCategoryBreakdown(
  current: Record<CostCategory, number>,
  previous: Record<CostCategory, number>,
  total: number,
): CostCategorySummary[] {
  return COST_CATEGORIES.map((category) => {
    const amount = current[category];
    return {
      category,
      label: COST_CATEGORY_LABELS[category],
      amount,
      sharePercent: total > 0 ? roundPercent((amount / total) * 100) : 0,
      growthPercent: computeCostGrowthPercent(amount, previous[category]),
    };
  }).sort((a, b) => b.amount - a.amount);
}

export function buildCostTrend(
  events: CostEvent[],
  months = 6,
  now: Date = new Date(),
): CostTrendPoint[] {
  const points: CostTrendPoint[] = [];
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(cursor);
    d.setUTCMonth(d.getUTCMonth() - i);
    const key = monthKeyFromDate(d);
    const byCategory = sumCostsByCategory(events, key);
    points.push({
      monthKey: key,
      totalCosts: totalMonthlyCosts(events, key),
      byCategory,
    });
  }

  return points;
}

export type BuildCostIntelligenceInput = {
  monthlyRevenue?: number;
  totalUsers?: number;
  activeUsers?: number;
};

export function buildFounderCostIntelligence(
  events: CostEvent[],
  input: BuildCostIntelligenceInput = {},
  now: Date = new Date(),
): FounderCostIntelligence {
  const currentKey = monthKeyFromDate(now);
  const prevKey = previousMonthKey(currentKey);

  const currentByCat = sumCostsByCategory(events, currentKey);
  const previousByCat = sumCostsByCategory(events, prevKey);

  const monthlyCosts = totalMonthlyCosts(events, currentKey);
  const previousMonthlyCosts = totalMonthlyCosts(events, prevKey);
  const costGrowthPercent = computeCostGrowthPercent(monthlyCosts, previousMonthlyCosts);

  const monthlyRevenue = input.monthlyRevenue ?? 0;
  const totalUsers = Math.max(1, input.totalUsers ?? 1);
  const activeUsers = Math.max(1, input.activeUsers ?? 1);

  const cogsTotal = roundMoney(
    COST_CATEGORIES.filter((c) => COGS_CATEGORIES.has(c)).reduce(
      (sum, c) => sum + currentByCat[c],
      0,
    ),
  );
  const opexTotal = roundMoney(monthlyCosts - cogsTotal);

  const profitEstimate = computeProfitEstimate(monthlyRevenue, monthlyCosts);
  const grossMarginPercent = computeGrossMarginPercent(monthlyRevenue, cogsTotal);
  const netMarginPercent = computeNetMarginPercent(monthlyRevenue, monthlyCosts);

  const biggest = findBiggestCost(currentByCat);
  const fastest = findFastestGrowingCost(currentByCat, previousByCat);

  const dashboardMetrics: CostDashboardMetrics = {
    totalMonthlyCosts: monthlyCosts,
    biggestCost: biggest.category,
    biggestCostLabel: COST_CATEGORY_LABELS[biggest.category],
    biggestCostAmount: biggest.amount,
    fastestGrowingCost: fastest.category,
    fastestGrowingCostLabel: fastest.category
      ? COST_CATEGORY_LABELS[fastest.category]
      : null,
    fastestGrowingCostPercent: fastest.growthPercent,
    profitEstimate,
  };

  return {
    dashboardMetrics,
    categoryBreakdown: buildCategoryBreakdown(
      currentByCat,
      previousByCat,
      monthlyCosts,
    ),
    monthlyCosts,
    costGrowthPercent,
    costPerUser: computeCostPerUser(monthlyCosts, totalUsers),
    costPerActiveUser: computeCostPerUser(monthlyCosts, activeUsers),
    grossMarginPercent,
    netMarginPercent,
    profitEstimate,
    cogsTotal,
    opexTotal,
    monthlyRevenue,
    costTrend: buildCostTrend(events, 6, now),
    generatedAt: now.toISOString(),
  };
}

export function answerCostFounderQuestion(
  question: string,
  intel: FounderCostIntelligence,
): { answer: string; nextStep: string } {
  const q = question.toLowerCase();
  const m = intel.dashboardMetrics;

  if (q.includes("increasing") || q.includes("rising")) {
    if (m.fastestGrowingCost) {
      return {
        answer: `${m.fastestGrowingCostLabel} is the fastest-growing cost (+${m.fastestGrowingCostPercent}% vs last month). Total costs ${intel.costGrowthPercent >= 0 ? "up" : "down"} ${Math.abs(intel.costGrowthPercent)}% overall.`,
        nextStep: `Review ${m.fastestGrowingCostLabel} usage and set a monthly cap if needed.`,
      };
    }
    return {
      answer: `Total monthly costs are ${formatUsd(m.totalMonthlyCosts)} (${intel.costGrowthPercent}% vs last month).`,
      nextStep: "Log this month's invoices for each SaaS vendor to improve accuracy.",
    };
  }

  if (q.includes("should i review") || q.includes("costs should")) {
    const top = intel.categoryBreakdown.filter((c) => c.amount > 0).slice(0, 3);
    const list = top.map((c) => `${c.label} (${formatUsd(c.amount)})`).join(", ");
    return {
      answer: list
        ? `Top costs to review: ${list}. Biggest line item: ${m.biggestCostLabel} at ${formatUsd(m.biggestCostAmount)}.`
        : "No cost data logged yet — add monthly estimates per vendor.",
      nextStep: "Compare API costs (OpenAI, Claude) against active user count.",
    };
  }

  if (q.includes("profit")) {
    return {
      answer: `Profit estimate this month: ${formatUsd(m.profitEstimate)} (revenue ${formatUsd(intel.monthlyRevenue)} − costs ${formatUsd(m.totalMonthlyCosts)}). Net margin ${intel.netMarginPercent}%, gross margin ${intel.grossMarginPercent}%.`,
      nextStep:
        m.profitEstimate < 0
          ? "Trim fastest-growing costs or focus on trial conversion this month."
          : "Protect margin — watch API spend per active user.",
    };
  }

  return {
    answer: `Monthly costs ${formatUsd(m.totalMonthlyCosts)}, ${formatUsd(intel.costPerActiveUser)} per active user. Profit estimate ${formatUsd(m.profitEstimate)}.`,
    nextStep: "Open Business Snapshot cost intelligence for the full breakdown.",
  };
}

export function categoriesNeedingReview(
  breakdown: CostCategorySummary[],
  limit = 3,
): CostCategorySummary[] {
  return breakdown
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.growthPercent - a.growthPercent || b.amount - a.amount)
    .slice(0, limit);
}

// ---- Persistence -----------------------------------------------------------

function rowToCostEvent(row: Record<string, unknown>): CostEvent {
  return {
    id: String(row.id),
    category: row.category as CostCategory,
    amount: Number(row.amount ?? 0),
    currency: String(row.currency ?? "USD"),
    occurredAt: String(row.occurred_at),
    source: (row.source as CostEventSource) ?? "manual",
    note: row.note ? String(row.note) : undefined,
  };
}

async function saveCostEvent(event: CostEvent): Promise<CostEvent> {
  const idx = costMemory.findIndex((e) => e.id === event.id);
  if (idx >= 0) costMemory[idx] = event;
  else costMemory.push(event);

  const supabase = getFounderSupabaseAdmin();
  if (!supabase) return event;

  const { error } = await supabase.from(COST_TABLE).upsert({
    id: event.id,
    category: event.category,
    amount: event.amount,
    currency: event.currency,
    occurred_at: event.occurredAt,
    source: event.source,
    note: event.note ?? null,
  });

  if (error) console.error("ecosystem_cost_events save", error);
  return event;
}

export async function loadAllCostEvents(): Promise<CostEvent[]> {
  const supabase = getFounderSupabaseAdmin();
  if (!supabase) return [...costMemory];

  const { data, error } = await supabase
    .from(COST_TABLE)
    .select("*")
    .order("occurred_at", { ascending: true });

  if (error) {
    console.error("ecosystem_cost_events load", error);
    return [...costMemory];
  }

  return (data ?? []).map((row) => rowToCostEvent(row as Record<string, unknown>));
}

export function buildEnvCostEstimates(monthKey: string): CostEvent[] {
  const occurredAt = `${monthKey}-01T12:00:00.000Z`;
  return COST_CATEGORIES.flatMap((category) => {
    const amount = readEnvCostEstimate(category);
    if (amount <= 0) return [];
    return [
      {
        id: `estimate-${category}-${monthKey}`,
        category,
        amount,
        currency: "USD",
        occurredAt,
        source: "estimate" as const,
      },
    ];
  });
}

export async function recordCostEvent(input: {
  category: CostCategory;
  amount: number;
  currency?: string;
  occurredAt?: string;
  source?: CostEventSource;
  note?: string;
  id?: string;
}): Promise<CostEvent> {
  if (!COST_CATEGORIES.includes(input.category)) {
    throw new Error("Invalid cost category.");
  }
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    throw new Error("Invalid amount.");
  }

  const event: CostEvent = {
    id: input.id ?? `cost-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    category: input.category,
    amount: roundMoney(input.amount),
    currency: input.currency ?? "USD",
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    source: input.source ?? "manual",
    note: input.note?.slice(0, 120),
  };

  return saveCostEvent(event);
}

export async function loadCostIntelligence(
  input: BuildCostIntelligenceInput = {},
): Promise<FounderCostIntelligence> {
  const stored = await loadAllCostEvents();
  const monthKey = monthKeyFromDate();
  const withEstimates =
    stored.length > 0 ? stored : [...stored, ...buildEnvCostEstimates(monthKey)];
  return buildFounderCostIntelligence(withEstimates, input);
}

export function resetCostStore(): void {
  costMemory.length = 0;
}

export function costStoreConfigured(): boolean {
  return founderSupabaseConfigured() || costMemory.length > 0;
}

export { formatUsd };
