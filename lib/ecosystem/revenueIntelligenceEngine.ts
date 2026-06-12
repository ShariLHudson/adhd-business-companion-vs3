// Revenue Intelligence — centralized revenue, growth, churn, and conversion signals.

import { getFounderSupabaseAdmin, founderSupabaseConfigured } from "@/lib/supabase/founderServer";
import type { GhlBusinessMetrics } from "@/lib/ghl/types";

export type RevenueEventKind =
  | "new_sale"
  | "renewal"
  | "upgrade"
  | "downgrade"
  | "refund"
  | "cancelled_subscription"
  | "trial_conversion";

export const REVENUE_EVENT_KINDS: RevenueEventKind[] = [
  "new_sale",
  "renewal",
  "upgrade",
  "downgrade",
  "refund",
  "cancelled_subscription",
  "trial_conversion",
];

export type RevenueEventSource = "ghl" | "stripe" | "paypal" | "manual" | "internal";

export type RevenueEvent = {
  id: string;
  kind: RevenueEventKind;
  amount: number;
  recurringAmount?: number;
  currency: string;
  occurredAt: string;
  source: RevenueEventSource;
  customerRef?: string;
};

export type RevenuePeriodSnapshot = {
  monthKey: string;
  monthlyRevenue: number;
  mrr: number;
  arr: number;
  newSales: number;
  newSalesRevenue: number;
  renewals: number;
  renewalsRevenue: number;
  upgrades: number;
  upgradesRevenue: number;
  downgrades: number;
  downgradesRevenue: number;
  refunds: number;
  refundsAmount: number;
  cancelledSubscriptions: number;
  trialConversions: number;
};

export type RevenueDashboardMetrics = {
  revenueThisMonth: number;
  mrr: number;
  arr: number;
  revenueGrowthPercent: number;
  conversionRate: number;
  churnRate: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
};

export type RevenueTrendPoint = {
  monthKey: string;
  monthlyRevenue: number;
  mrr: number;
};

export type RevenueHealthStatus = "strong" | "stable" | "concerning" | "critical";

export type FounderRevenueIntelligence = {
  dashboardMetrics: RevenueDashboardMetrics;
  currentPeriod: RevenuePeriodSnapshot;
  previousPeriod: RevenuePeriodSnapshot | null;
  revenueTrend: RevenueTrendPoint[];
  revenueHealth: RevenueHealthStatus;
  conversionTrend: "up" | "down" | "stable";
  churnTrend: "up" | "down" | "stable";
  ghlSignals: {
    payingSubscribers: number;
    trialSubscribers: number;
    pipelineValue: number;
    conversionRate: number;
    newContacts: number;
  } | null;
  sourcesConnected: RevenueEventSource[];
  generatedAt: string;
};

const REVENUE_TABLE = "ecosystem_revenue_events";
const revenueMemory: RevenueEvent[] = [];

export function defaultMonthlyPrice(): number {
  const raw = process.env.ECOSYSTEM_DEFAULT_MONTHLY_PRICE?.trim();
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 47;
}

export function monthKeyFromDate(date: Date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function monthBounds(monthKey: string): { start: Date; end: Date } {
  const [y, m] = monthKey.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
  return { start, end };
}

export function previousMonthKey(monthKey: string): string {
  const { start } = monthBounds(monthKey);
  const prev = new Date(start);
  prev.setUTCMonth(prev.getUTCMonth() - 1);
  return monthKeyFromDate(prev);
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function eventRecurring(e: RevenueEvent): number {
  return e.recurringAmount ?? e.amount;
}

export function computeMrrAt(events: RevenueEvent[], at: Date): number {
  let mrr = 0;
  const sorted = [...events].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
  );

  for (const e of sorted) {
    if (new Date(e.occurredAt) > at) break;
    switch (e.kind) {
      case "new_sale":
      case "trial_conversion":
        mrr += eventRecurring(e);
        break;
      case "upgrade":
        mrr += eventRecurring(e);
        break;
      case "downgrade":
        mrr -= Math.abs(eventRecurring(e));
        break;
      case "cancelled_subscription":
        mrr -= Math.abs(eventRecurring(e));
        break;
      default:
        break;
    }
  }

  return roundMoney(Math.max(0, mrr));
}

export function eventsInMonth(events: RevenueEvent[], monthKey: string): RevenueEvent[] {
  const { start, end } = monthBounds(monthKey);
  return events.filter((e) => {
    const t = new Date(e.occurredAt).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
}

export function computeRevenuePeriodSnapshot(
  events: RevenueEvent[],
  monthKey: string,
): RevenuePeriodSnapshot {
  const monthEvents = eventsInMonth(events, monthKey);
  const { end } = monthBounds(monthKey);

  let monthlyRevenue = 0;
  let newSales = 0;
  let newSalesRevenue = 0;
  let renewals = 0;
  let renewalsRevenue = 0;
  let upgrades = 0;
  let upgradesRevenue = 0;
  let downgrades = 0;
  let downgradesRevenue = 0;
  let refunds = 0;
  let refundsAmount = 0;
  let cancelledSubscriptions = 0;
  let trialConversions = 0;

  for (const e of monthEvents) {
    switch (e.kind) {
      case "new_sale":
        newSales += 1;
        newSalesRevenue += e.amount;
        monthlyRevenue += e.amount;
        break;
      case "renewal":
        renewals += 1;
        renewalsRevenue += e.amount;
        monthlyRevenue += e.amount;
        break;
      case "upgrade":
        upgrades += 1;
        upgradesRevenue += e.amount;
        monthlyRevenue += e.amount;
        break;
      case "downgrade":
        downgrades += 1;
        downgradesRevenue += e.amount;
        monthlyRevenue -= Math.abs(e.amount);
        break;
      case "refund":
        refunds += 1;
        refundsAmount += Math.abs(e.amount);
        monthlyRevenue -= Math.abs(e.amount);
        break;
      case "cancelled_subscription":
        cancelledSubscriptions += 1;
        break;
      case "trial_conversion":
        trialConversions += 1;
        monthlyRevenue += e.amount;
        break;
      default:
        break;
    }
  }

  const mrr = computeMrrAt(events, end);

  return {
    monthKey,
    monthlyRevenue: roundMoney(monthlyRevenue),
    mrr,
    arr: roundMoney(mrr * 12),
    newSales,
    newSalesRevenue: roundMoney(newSalesRevenue),
    renewals,
    renewalsRevenue: roundMoney(renewalsRevenue),
    upgrades,
    upgradesRevenue: roundMoney(upgradesRevenue),
    downgrades,
    downgradesRevenue: roundMoney(downgradesRevenue),
    refunds,
    refundsAmount: roundMoney(refundsAmount),
    cancelledSubscriptions,
    trialConversions,
  };
}

export function computeRevenueGrowthPercent(
  current: number,
  previous: number,
): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return roundMoney(((current - previous) / previous) * 100);
}

export function computeChurnRate(
  cancelled: number,
  activeSubscribers: number,
): number {
  if (activeSubscribers <= 0) return cancelled > 0 ? 100 : 0;
  return roundMoney((cancelled / activeSubscribers) * 100);
}

export function computeConversionRate(
  trialConversions: number,
  trialStarts: number,
  fallbackRate = 0,
): number {
  const denom = trialConversions + trialStarts;
  if (denom <= 0) return fallbackRate;
  return Math.round((trialConversions / denom) * 100);
}

export function computeArpu(mrr: number, activeSubscribers: number): number {
  if (activeSubscribers <= 0) return 0;
  return roundMoney(mrr / activeSubscribers);
}

export function computeLtv(arpu: number, monthlyChurnPercent: number): number {
  if (arpu <= 0) return 0;
  if (monthlyChurnPercent <= 0) return roundMoney(arpu * 24);
  const monthlyChurn = monthlyChurnPercent / 100;
  return roundMoney(arpu / monthlyChurn);
}

export function computeRevenueHealth(
  growthPercent: number,
  churnRate: number,
): RevenueHealthStatus {
  if (growthPercent < -10 || churnRate > 15) return "critical";
  if (growthPercent < -2 || churnRate >= 8) return "concerning";
  if (growthPercent > 5 && churnRate < 5) return "strong";
  return "stable";
}

export function computeTrendDirection(
  current: number,
  previous: number,
): "up" | "down" | "stable" {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "stable";
}

export function buildRevenueTrend(
  events: RevenueEvent[],
  months = 6,
  now: Date = new Date(),
): RevenueTrendPoint[] {
  const points: RevenueTrendPoint[] = [];
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(cursor);
    d.setUTCMonth(d.getUTCMonth() - i);
    const key = monthKeyFromDate(d);
    const snap = computeRevenuePeriodSnapshot(events, key);
    points.push({
      monthKey: key,
      monthlyRevenue: snap.monthlyRevenue,
      mrr: snap.mrr,
    });
  }

  return points;
}

export function applyGhlRevenueHints(
  metrics: RevenueDashboardMetrics,
  current: RevenuePeriodSnapshot,
  ghl: GhlBusinessMetrics | null,
  monthlyPrice = defaultMonthlyPrice(),
): void {
  if (!ghl) return;

  if (current.mrr <= 0 && ghl.payingSubscribers > 0) {
    current.mrr = roundMoney(ghl.payingSubscribers * monthlyPrice);
    current.arr = roundMoney(current.mrr * 12);
    metrics.mrr = current.mrr;
    metrics.arr = current.arr;
  }

  if (current.monthlyRevenue <= 0 && current.mrr > 0) {
    current.monthlyRevenue = current.mrr;
    metrics.revenueThisMonth = current.monthlyRevenue;
  }

  if (metrics.averageRevenuePerUser <= 0 && ghl.payingSubscribers > 0) {
    metrics.averageRevenuePerUser = computeArpu(metrics.mrr, ghl.payingSubscribers);
  }

  if (metrics.conversionRate <= 0) {
    const trialDenom = ghl.trialSubscribers + ghl.payingSubscribers;
    if (trialDenom > 0) {
      metrics.conversionRate = Math.round((ghl.payingSubscribers / trialDenom) * 100);
    } else if (ghl.conversionRate > 0) {
      metrics.conversionRate = ghl.conversionRate;
    }
  }
}

export function buildFounderRevenueIntelligence(
  events: RevenueEvent[],
  ghl: GhlBusinessMetrics | null = null,
  now: Date = new Date(),
): FounderRevenueIntelligence {
  const currentKey = monthKeyFromDate(now);
  const prevKey = previousMonthKey(currentKey);

  const currentPeriod = computeRevenuePeriodSnapshot(events, currentKey);
  const previousPeriod = computeRevenuePeriodSnapshot(events, prevKey);

  const activeSubscribers =
    ghl?.payingSubscribers ??
    Math.max(0, currentPeriod.newSales + currentPeriod.trialConversions - currentPeriod.cancelledSubscriptions);

  const churnRate = computeChurnRate(
    currentPeriod.cancelledSubscriptions,
    Math.max(activeSubscribers, 1),
  );

  const conversionRate = computeConversionRate(
    currentPeriod.trialConversions,
    ghl?.trialSubscribers ?? 0,
    ghl?.conversionRate ?? 0,
  );

  const revenueGrowthPercent = computeRevenueGrowthPercent(
    currentPeriod.monthlyRevenue,
    previousPeriod.monthlyRevenue,
  );

  const arpu = computeArpu(currentPeriod.mrr, Math.max(activeSubscribers, 1));

  const dashboardMetrics: RevenueDashboardMetrics = {
    revenueThisMonth: currentPeriod.monthlyRevenue,
    mrr: currentPeriod.mrr,
    arr: currentPeriod.arr,
    revenueGrowthPercent,
    conversionRate,
    churnRate,
    averageRevenuePerUser: arpu,
    lifetimeValue: computeLtv(arpu, churnRate),
  };

  applyGhlRevenueHints(dashboardMetrics, currentPeriod, ghl);

  const revenueTrend = buildRevenueTrend(events, 6, now);
  const sourcesConnected = [...new Set(events.map((e) => e.source))];

  if (ghl && !sourcesConnected.includes("ghl")) {
    sourcesConnected.push("ghl");
  }

  const prevChurn = computeChurnRate(
    previousPeriod.cancelledSubscriptions,
    Math.max(activeSubscribers, 1),
  );
  const prevConversion = computeConversionRate(
    previousPeriod.trialConversions,
    ghl?.trialSubscribers ?? 0,
    ghl?.conversionRate ?? 0,
  );

  return {
    dashboardMetrics,
    currentPeriod,
    previousPeriod,
    revenueTrend,
    revenueHealth: computeRevenueHealth(revenueGrowthPercent, churnRate),
    conversionTrend: computeTrendDirection(conversionRate, prevConversion),
    churnTrend: computeTrendDirection(churnRate, prevChurn),
    ghlSignals: ghl
      ? {
          payingSubscribers: ghl.payingSubscribers,
          trialSubscribers: ghl.trialSubscribers,
          pipelineValue: ghl.pipelineValue,
          conversionRate: ghl.conversionRate,
          newContacts: ghl.newContacts,
        }
      : null,
    sourcesConnected,
    generatedAt: now.toISOString(),
  };
}

export function answerRevenueFounderQuestion(
  question: string,
  intel: FounderRevenueIntelligence,
): { answer: string; nextStep: string } {
  const q = question.toLowerCase();
  const m = intel.dashboardMetrics;

  if (q.includes("how healthy") && q.includes("revenue")) {
    return {
      answer: `Revenue health is ${intel.revenueHealth}. MRR $${m.mrr.toLocaleString()}, growth ${m.revenueGrowthPercent}%, churn ${m.churnRate}%.`,
      nextStep:
        intel.revenueHealth === "critical" || intel.revenueHealth === "concerning"
          ? "Review cancellations and run a win-back offer this week."
          : "Protect momentum — focus on trial conversion and renewals.",
    };
  }

  if (q.includes("what changed") || q.includes("this month")) {
    const cur = intel.currentPeriod;
    const prev = intel.previousPeriod;
    const delta =
      prev && prev.monthlyRevenue > 0
        ? computeRevenueGrowthPercent(cur.monthlyRevenue, prev.monthlyRevenue)
        : m.revenueGrowthPercent;
    return {
      answer: `This month: $${cur.monthlyRevenue.toLocaleString()} revenue (${delta >= 0 ? "+" : ""}${delta}% vs last month). ${cur.newSales} new sales, ${cur.cancelledSubscriptions} cancellations, ${cur.trialConversions} trial conversions.`,
      nextStep: "Compare new sales vs cancellations in Business Snapshot revenue trends.",
    };
  }

  if (q.includes("conversion") && (q.includes("improv") || q.includes("better"))) {
    const trend =
      intel.conversionTrend === "up"
        ? "Conversions are improving."
        : intel.conversionTrend === "down"
          ? "Conversions are slipping."
          : "Conversion rate is flat.";
    return {
      answer: `${trend} Current conversion rate: ${m.conversionRate}%.`,
      nextStep:
        intel.conversionTrend !== "up"
          ? "Tighten trial onboarding and add one clear upgrade CTA."
          : "Double down on the trial flow that is working.",
    };
  }

  if (q.includes("churn") && (q.includes("increas") || q.includes("rising"))) {
    const trend =
      intel.churnTrend === "up"
        ? "Churn is increasing."
        : intel.churnTrend === "down"
          ? "Churn is decreasing."
          : "Churn is stable.";
    return {
      answer: `${trend} Monthly churn rate: ${m.churnRate}% (${intel.currentPeriod.cancelledSubscriptions} cancellations this month).`,
      nextStep:
        intel.churnTrend === "up"
          ? "Interview recent cancellations and fix the top friction point."
          : "Keep monitoring at-risk users alongside revenue metrics.",
    };
  }

  return {
    answer: `MRR $${m.mrr.toLocaleString()}, revenue this month $${m.revenueThisMonth.toLocaleString()}, ARPU $${m.averageRevenuePerUser}, LTV $${m.lifetimeValue.toLocaleString()}.`,
    nextStep: "Open Business Snapshot revenue section for the 6-month trend.",
  };
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ---- Persistence -----------------------------------------------------------

function rowToRevenueEvent(row: Record<string, unknown>): RevenueEvent {
  return {
    id: String(row.id),
    kind: row.kind as RevenueEventKind,
    amount: Number(row.amount ?? 0),
    recurringAmount:
      row.recurring_amount != null ? Number(row.recurring_amount) : undefined,
    currency: String(row.currency ?? "USD"),
    occurredAt: String(row.occurred_at),
    source: (row.source as RevenueEventSource) ?? "internal",
    customerRef: row.customer_ref ? String(row.customer_ref) : undefined,
  };
}

async function saveRevenueEvent(event: RevenueEvent): Promise<RevenueEvent> {
  const idx = revenueMemory.findIndex((e) => e.id === event.id);
  if (idx >= 0) revenueMemory[idx] = event;
  else revenueMemory.push(event);

  const supabase = getFounderSupabaseAdmin();
  if (!supabase) return event;

  const { error } = await supabase.from(REVENUE_TABLE).upsert({
    id: event.id,
    kind: event.kind,
    amount: event.amount,
    recurring_amount: event.recurringAmount ?? null,
    currency: event.currency,
    occurred_at: event.occurredAt,
    source: event.source,
    customer_ref: event.customerRef ?? null,
  });

  if (error) console.error("ecosystem_revenue_events save", error);
  return event;
}

export async function loadAllRevenueEvents(): Promise<RevenueEvent[]> {
  const supabase = getFounderSupabaseAdmin();
  if (!supabase) return [...revenueMemory];

  const { data, error } = await supabase
    .from(REVENUE_TABLE)
    .select("*")
    .order("occurred_at", { ascending: true });

  if (error) {
    console.error("ecosystem_revenue_events load", error);
    return [...revenueMemory];
  }

  return (data ?? []).map((row) => rowToRevenueEvent(row as Record<string, unknown>));
}

export async function recordRevenueEvent(input: {
  kind: RevenueEventKind;
  amount: number;
  recurringAmount?: number;
  currency?: string;
  occurredAt?: string;
  source?: RevenueEventSource;
  customerRef?: string;
  id?: string;
}): Promise<RevenueEvent> {
  if (!REVENUE_EVENT_KINDS.includes(input.kind)) {
    throw new Error("Invalid revenue event kind.");
  }
  if (!Number.isFinite(input.amount)) {
    throw new Error("Invalid amount.");
  }
  if (input.customerRef && (input.customerRef.includes("@") || input.customerRef.length > 80)) {
    throw new Error("Invalid customer ref.");
  }

  const event: RevenueEvent = {
    id: input.id ?? `rev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    kind: input.kind,
    amount: roundMoney(input.amount),
    recurringAmount:
      input.recurringAmount != null ? roundMoney(input.recurringAmount) : undefined,
    currency: input.currency ?? "USD",
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    source: input.source ?? "internal",
    customerRef: input.customerRef,
  };

  return saveRevenueEvent(event);
}

export async function loadRevenueIntelligence(
  ghl: GhlBusinessMetrics | null = null,
): Promise<FounderRevenueIntelligence> {
  const events = await loadAllRevenueEvents();
  return buildFounderRevenueIntelligence(events, ghl);
}

export function resetRevenueStore(): void {
  revenueMemory.length = 0;
}

export function revenueStoreConfigured(): boolean {
  return founderSupabaseConfigured() || revenueMemory.length > 0;
}

/** Future Stripe webhook adapter — normalize to RevenueEvent. */
export function mapStripeEventToRevenueEvent(
  type: string,
  payload: { amount: number; recurringAmount?: number; customerRef?: string; occurredAt?: string },
): Omit<RevenueEvent, "id" | "currency"> & { currency?: string } | null {
  const map: Record<string, RevenueEventKind> = {
    "invoice.paid": "renewal",
    "customer.subscription.created": "new_sale",
    "customer.subscription.updated": "upgrade",
    "customer.subscription.deleted": "cancelled_subscription",
    "charge.refunded": "refund",
  };
  const kind = map[type];
  if (!kind) return null;
  return {
    kind,
    amount: payload.amount,
    recurringAmount: payload.recurringAmount,
    occurredAt: payload.occurredAt ?? new Date().toISOString(),
    source: "stripe",
    customerRef: payload.customerRef,
  };
}

/** Future PayPal webhook adapter. */
export function mapPayPalEventToRevenueEvent(
  eventType: string,
  payload: { amount: number; recurringAmount?: number; customerRef?: string; occurredAt?: string },
): Omit<RevenueEvent, "id" | "currency"> & { currency?: string } | null {
  const map: Record<string, RevenueEventKind> = {
    "PAYMENT.SALE.COMPLETED": "renewal",
    "BILLING.SUBSCRIPTION.CREATED": "new_sale",
    "BILLING.SUBSCRIPTION.CANCELLED": "cancelled_subscription",
    "PAYMENT.SALE.REFUNDED": "refund",
  };
  const kind = map[eventType];
  if (!kind) return null;
  return {
    kind,
    amount: payload.amount,
    recurringAmount: payload.recurringAmount,
    occurredAt: payload.occurredAt ?? new Date().toISOString(),
    source: "paypal",
    customerRef: payload.customerRef,
  };
}
