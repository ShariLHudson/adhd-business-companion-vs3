import type { FounderEvent } from "@/lib/ecosystem/events";

import type {
  AggregatedSignal,
  LovedFeature,
  ProductCategory,
  ProductIntelligenceReport,
  ProductSignal,
  ProductSignalType,
} from "./types";
import { generateWeeklyProductReview } from "./weeklyReview";
import { identifyOpportunities } from "./opportunityEngine";
import { prioritizeIssues } from "./issuePriorityEngine";
import { identifyQuickWins } from "./quickWins";

const CATEGORY_RULES: { category: ProductCategory; patterns: RegExp[] }[] = [
  {
    category: "create",
    patterns: [
      /\bcreate\b/i,
      /\bdraft\b/i,
      /old content/i,
      /stale/i,
      /blank start/i,
      /opens old/i,
    ],
  },
  {
    category: "google_docs",
    patterns: [
      /google doc/i,
      /\bgdoc/i,
      /where.*(document|doc)/i,
      /document.*(save|saved|go)/i,
      /export/i,
    ],
  },
  {
    category: "time_block",
    patterns: [/time\s*block/i, /timeblock/i, /scheduled block/i, /calendar block/i],
  },
  {
    category: "focus",
    patterns: [
      /focus audio/i,
      /focus session/i,
      /\bfocus\b/i,
      /distract/i,
      /concentrat/i,
    ],
  },
  {
    category: "projects",
    patterns: [/\bproject/i, /milestone/i, /project context/i],
  },
  {
    category: "memory",
    patterns: [/remember/i, /\bmemory\b/i, /forget/i, /lost context/i, /brain dump/i],
  },
  {
    category: "dashboard",
    patterns: [
      /dashboard/i,
      /workspace button/i,
      /navigation/i,
      /sidebar/i,
      /button.*disappear/i,
    ],
  },
  {
    category: "integrations",
    patterns: [
      /calendar/i,
      /mobile app/i,
      /integration/i,
      /\bsync\b/i,
      /template/i,
    ],
  },
];

const FRICTION_RE =
  /\b(confus|struggl|stuck|broken|bug|error|lost|can't|cannot|doesn't|does not|where did|unclear|frustrat|overwhelm|hard to)\b/i;

const FEATURE_REQUEST_RE =
  /\b(would love|wish|can you add|please add|need a|want a|feature request|could you add|more templates|better .+ management)\b/i;

const SUCCESS_LABELS: Record<string, { feature: string; category: ProductCategory }> = {
  "project.completed": { feature: "Project completion", category: "projects" },
  "focus.completed": { feature: "Focus Audio / Focus sessions", category: "focus" },
  "document.created": { feature: "Document creation", category: "create" },
  "document.exported": { feature: "Google Docs export", category: "google_docs" },
};

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function signalKey(text: string, type: ProductSignalType): string {
  return `${type}:${text.toLowerCase().replace(/\s+/g, " ").slice(0, 160)}`;
}

export function classifyProductCategory(
  text: string,
  workspace?: string,
): ProductCategory {
  const haystack = `${text} ${workspace ?? ""}`;
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((re) => re.test(haystack))) {
      return rule.category;
    }
  }
  return "general_ux";
}

function frictionFromChat(message: string): string | null {
  const text = message.trim();
  if (!text || text.length < 8) return null;
  if (FRICTION_RE.test(text) || /\?/.test(text)) return text;
  return null;
}

function featureRequestFromText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (FEATURE_REQUEST_RE.test(trimmed)) return trimmed;
  if (
    /\b(calendar|mobile app|templates?|integration)\b/i.test(trimmed) &&
    /\b(want|need|add|please)\b/i.test(trimmed)
  ) {
    return trimmed;
  }
  return null;
}

export function extractProductSignals(
  events: FounderEvent[],
  founderId?: string,
): ProductSignal[] {
  const mine = founderId
    ? events.filter((e) => e.founderId === founderId)
    : events;
  const signals: ProductSignal[] = [];
  let seq = 0;

  function push(
    type: ProductSignalType,
    text: string,
    event: FounderEvent,
    workspace?: string,
  ) {
    const clean = text.trim();
    if (!clean) return;
    signals.push({
      id: `ps-${seq++}`,
      type,
      text: clean,
      category: classifyProductCategory(clean, workspace),
      sourceEventId: event.id,
      ts: event.ts,
      workspace,
    });
  }

  for (const e of mine) {
    const workspace = asString(e.refs?.workspace) || asString(e.workspaceContext?.kind);

    if (e.type === "painpoint.observed") {
      push("friction", asString(e.data?.text) || "Observed friction", e, workspace);
      continue;
    }

    if (e.type === "chat.coaching" && e.userMessage) {
      const friction = frictionFromChat(e.userMessage);
      if (friction) push("friction", friction, e, workspace);
      const request = featureRequestFromText(e.userMessage);
      if (request) push("feature_request", request, e, workspace);
      continue;
    }

    if (e.type === "note.captured") {
      const text = asString(e.data?.text);
      const kind = asString(e.data?.kind);
      if (kind === "question" && text) {
        push("friction", text, e, workspace);
      }
      const request = featureRequestFromText(text);
      if (request) push("feature_request", request, e, workspace);
      continue;
    }

    if (e.type === "opportunity.created") {
      push(
        "feature_request",
        asString(e.data?.text) || "Captured opportunity",
        e,
        workspace,
      );
      continue;
    }

    const successMeta = SUCCESS_LABELS[e.type];
    if (successMeta) {
      const detail =
        asString(e.data?.title) ||
        asString(e.data?.docType) ||
        asString(e.data?.provider) ||
        successMeta.feature;
      push("success", `${successMeta.feature}: ${detail}`, e, workspace);
    }
  }

  const activeDays = new Set(mine.map((e) => e.ts.slice(0, 10)));
  if (activeDays.size >= 3) {
    const last = mine[mine.length - 1];
    if (last) {
      push(
        "success",
        "User returned on multiple days",
        last,
        "companion",
      );
    }
  }

  const firstProject = mine.find((e) => e.type === "project.completed");
  if (firstProject) {
    push(
      "success",
      "User completed first project",
      firstProject,
      asString(firstProject.refs?.workspace),
    );
  }

  return signals;
}

export function aggregateSignals(signals: ProductSignal[]): AggregatedSignal[] {
  const groups = new Map<string, AggregatedSignal>();

  for (const s of signals) {
    const key = signalKey(s.text, s.type);
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, {
        key,
        text: s.text,
        type: s.type,
        category: s.category,
        count: 1,
        firstSeen: s.ts,
        lastSeen: s.ts,
        sampleEventIds: [s.sourceEventId],
      });
    } else {
      existing.count += 1;
      if (s.ts < existing.firstSeen) existing.firstSeen = s.ts;
      if (s.ts > existing.lastSeen) existing.lastSeen = s.ts;
      if (existing.sampleEventIds.length < 5) {
        existing.sampleEventIds.push(s.sourceEventId);
      }
    }
  }

  return [...groups.values()].sort((a, b) => b.count - a.count);
}

function buildLovedFeatures(
  signals: ProductSignal[],
  events: FounderEvent[],
): LovedFeature[] {
  const successes = aggregateSignals(signals.filter((s) => s.type === "success"));
  const workspaceOpens = new Map<string, number>();
  for (const e of events) {
    if (e.type !== "workspace.opened") continue;
    const ws = asString(e.refs?.workspace) || "unknown";
    workspaceOpens.set(ws, (workspaceOpens.get(ws) ?? 0) + 1);
  }

  const loved: LovedFeature[] = successes.slice(0, 6).map((s) => ({
    feature: s.text.split(":")[0] ?? s.text,
    category: s.category,
    engagementScore: s.count * 10,
    evidence: `${s.count} success signal${s.count === 1 ? "" : "s"}`,
  }));

  for (const [ws, opens] of workspaceOpens.entries()) {
    if (ws === "unknown" || opens < 2) continue;
    loved.push({
      feature: `${ws} workspace`,
      category: classifyProductCategory(ws, ws),
      engagementScore: opens * 5,
      evidence: `${opens} workspace opens`,
    });
  }

  return loved
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 6);
}

function buildLeastUsed(
  events: FounderEvent[],
): { feature: string; opens: number }[] {
  const workspaceOpens = new Map<string, number>();
  for (const e of events) {
    if (e.type !== "workspace.opened") continue;
    const ws = asString(e.refs?.workspace) || "unknown";
    workspaceOpens.set(ws, (workspaceOpens.get(ws) ?? 0) + 1);
  }
  return [...workspaceOpens.entries()]
    .map(([feature, opens]) => ({ feature, opens }))
    .sort((a, b) => a.opens - b.opens)
    .slice(0, 5);
}

function categoryCounts(signals: ProductSignal[]): Record<ProductCategory, number> {
  const counts: Record<ProductCategory, number> = {
    create: 0,
    projects: 0,
    focus: 0,
    time_block: 0,
    google_docs: 0,
    memory: 0,
    dashboard: 0,
    general_ux: 0,
    integrations: 0,
  };
  for (const s of signals.filter((x) => x.type === "friction")) {
    counts[s.category] += 1;
  }
  return counts;
}

export function buildProductIntelligenceReport(
  events: FounderEvent[],
  founderId?: string,
  now: Date = new Date(),
): ProductIntelligenceReport {
  const mine = founderId
    ? events.filter((e) => e.founderId === founderId)
    : events;
  const signals = extractProductSignals(mine, founderId);
  const aggregated = aggregateSignals(signals);

  const frictionAgg = aggregated.filter((a) => a.type === "friction");
  const requestAgg = aggregated.filter((a) => a.type === "feature_request");

  const topFrustrations = prioritizeIssues(frictionAgg).slice(0, 10);
  const opportunities = identifyOpportunities(frictionAgg, requestAgg);
  const quickWins = identifyQuickWins(frictionAgg);

  const weeklyReview = generateWeeklyProductReview({
    events: mine,
    signals,
    topFrustrations,
    topRequests: requestAgg.slice(0, 5),
    opportunities,
    now,
  });

  return {
    generatedAt: now.toISOString(),
    topFrustrations,
    mostRequestedFeatures: requestAgg.slice(0, 10),
    mostLovedFeatures: buildLovedFeatures(signals, mine),
    quickWins,
    opportunities,
    weeklyReview,
    categoryCounts: categoryCounts(signals),
    leastUsedFeatures: buildLeastUsed(mine),
  };
}
