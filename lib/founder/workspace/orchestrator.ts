/**
 * Workspace Orchestrator
 * Receives an intention. Returns a workspace assembled from existing Founder services.
 */

import { getTodayBrief } from "../briefs";
import { getAllCreationIdeas } from "../creation";
import { getInsights, getTopInsights } from "../insights";
import { listFounderMemory } from "../memory";
import {
  getBuildRecommendations,
  getTopRecommendations,
} from "../recommendations";
import { getReports } from "../research";
import { getRoomCards } from "../services/roomContentService";
import { getTeamHubSections } from "../teamhub";
import type {
  FounderExecutiveRecommendation,
  FounderWorkspace,
  FounderWorkspaceId,
  FounderWorkspaceItem,
  FounderWorkspaceMeta,
  FounderWorkspaceSection,
} from "../types/workspace";
import { scoreToImpactStars } from "../types/workspace";

import {
  FOUNDER_WORKSPACE_META,
  getWorkspaceMeta,
} from "./config";

const MAX_PRIORITIES = 3;
const MAX_ACTIONS = 3;

function capItems<T>(items: T[], limit: number): T[] {
  return items.slice(0, limit);
}

function toItem(
  id: string,
  title: string,
  summary?: string,
  meta?: string,
  tone?: FounderWorkspaceItem["tone"],
): FounderWorkspaceItem {
  return { id, title, summary, meta, tone };
}

/** One executive recommendation for the office home — never competing priorities. */
export function getExecutiveRecommendation(): FounderExecutiveRecommendation {
  const buildRecs = getBuildRecommendations().filter((r) => r.tone !== "ignore");
  const top = buildRecs[0] ?? getTopRecommendations(1)[0];

  if (top) {
    return {
      id: top.id,
      title: top.title,
      summary: top.summary,
      impactStars: scoreToImpactStars(top.score),
      tone: top.tone,
    };
  }

  const brief = getTodayBrief();
  return {
    id: "exec-from-brief",
    title: brief.bestIdea.title,
    summary: brief.bestIdea.summary,
    impactStars: scoreToImpactStars(brief.bestIdea.score),
    tone: brief.bestIdea.tone,
  };
}

export function listWorkspaces(): readonly FounderWorkspaceMeta[] {
  return FOUNDER_WORKSPACE_META;
}

function buildStartWorkspace(): FounderWorkspace {
  const brief = getTodayBrief();
  const quickWinItems =
    brief.glance.find((s) => s.id === "quick-wins")?.items ?? [];

  const sections: FounderWorkspaceSection[] = [
    {
      id: "morning-brief",
      title: "Morning Brief",
      subtitle: "Today at a glance",
      depth: "surface",
      items: brief.glance.flatMap((section) =>
        section.items.map((item) =>
          toItem(item.id, item.label, item.summary, section.title, item.tone),
        ),
      ),
    },
    {
      id: "alerts",
      title: "Founder Alerts",
      depth: "surface",
      items: (brief.alerts ?? []).map((a) =>
        toItem(a.id, a.title, a.summary, undefined, a.tone),
      ),
    },
    {
      id: "priorities",
      title: "Today's Priorities",
      depth: "surface",
      items: brief.priorities.map((p) => toItem(p.id, p.title, p.note)),
    },
    {
      id: "best-idea",
      title: "Best Idea",
      depth: "surface",
      items: [
        toItem(
          brief.bestIdea.id,
          brief.bestIdea.title,
          brief.bestIdea.summary,
          undefined,
          brief.bestIdea.tone,
        ),
      ],
    },
    {
      id: "customer-pulse",
      title: "Customer Pulse",
      depth: "surface",
      items: brief.customerSignals.map((s) =>
        toItem(s.id, s.label, s.detail),
      ),
    },
    {
      id: "trend-radar",
      title: "Trend Radar",
      depth: "deep",
      items: brief.trends.map((t) =>
        toItem(t.id, t.label, t.note, t.direction),
      ),
    },
    {
      id: "quick-wins",
      title: "Quick Wins",
      depth: "surface",
      items: quickWinItems.map((q) =>
        toItem(q.id, q.label, q.summary, undefined, q.tone),
      ),
    },
    {
      id: "ignore",
      title: "Ignore Today",
      subtitle: "Not your problem today",
      depth: "deep",
      items: brief.ignoreItems.map((i) =>
        toItem(i.id, "Ignore", i.summary, undefined, "ignore"),
      ),
    },
  ];

  const rec = getExecutiveRecommendation();

  return {
    id: "start",
    icon: "🌅",
    title: "Start My Day",
    purpose: "Morning orientation — one calm screen.",
    recommendation: rec,
    priorities: capItems(
      brief.priorities.map((p) => toItem(p.id, p.title, p.note)),
      MAX_PRIORITIES,
    ),
    actions: capItems(
      quickWinItems.map((q) =>
        toItem(q.id, q.summary, undefined, "Quick win", q.tone),
      ),
      MAX_ACTIONS,
    ),
    sections,
    roomIds: ["morning"],
  };
}

function roomCardsAsItems(roomId: string): FounderWorkspaceItem[] {
  return getRoomCards(roomId).map((card) =>
    toItem(card.id, card.title, card.summary, undefined, card.tone),
  );
}

function buildBuildWorkspace(): FounderWorkspace {
  const recs = getBuildRecommendations();
  const insights = getTopInsights(MAX_PRIORITIES);
  const sparkCards = roomCardsAsItems("spark-command");
  const innovationCards = roomCardsAsItems("innovation");
  const strategyCards = roomCardsAsItems("strategy");

  const rec = recs[0]
    ? {
        id: recs[0].id,
        title: recs[0].title,
        summary: recs[0].summary,
        impactStars: scoreToImpactStars(recs[0].score),
        tone: recs[0].tone,
      }
    : getExecutiveRecommendation();

  return {
    id: "build",
    icon: "🏗",
    title: "Build",
    purpose: "Creating and improving Spark products.",
    recommendation: rec,
    priorities: capItems(
      insights.map((i) =>
        toItem(i.id, i.title, i.summary, i.category, i.tone),
      ),
      MAX_PRIORITIES,
    ),
    actions: capItems(
      recs
        .filter((r) => r.tone !== "ignore")
        .map((r) => toItem(r.id, r.title, r.summary, undefined, r.tone)),
      MAX_ACTIONS,
    ),
    sections: [
      {
        id: "spark-command",
        title: "Spark Command Center",
        depth: "surface",
        items: sparkCards,
      },
      {
        id: "development",
        title: "Development & Architecture",
        depth: "surface",
        items: innovationCards,
      },
      {
        id: "strategy",
        title: "Roadmap & Strategy",
        depth: "deep",
        items: strategyCards,
      },
      {
        id: "build-recs",
        title: "Build Recommendations",
        depth: "deep",
        items: recs.map((r) =>
          toItem(r.id, r.title, r.summary, r.category, r.tone),
        ),
      },
    ],
    roomIds: ["spark-command", "innovation", "strategy"],
  };
}

function buildGrowWorkspace(): FounderWorkspace {
  const brief = getTodayBrief();
  const creation = getAllCreationIdeas();
  const vaultCards = roomCardsAsItems("opportunity-vault");

  return {
    id: "grow",
    icon: "📈",
    title: "Grow",
    purpose: "Growing the business — revenue, content, and opportunities.",
    recommendation: {
      id: "revenue-today",
      title: brief.revenueOpportunity.title,
      summary: brief.revenueOpportunity.summary,
      impactStars: scoreToImpactStars({ impact: 0.9 }),
      tone: brief.revenueOpportunity.tone ?? "revenue",
    },
    priorities: capItems(
      creation.slice(0, MAX_PRIORITIES).map((c) =>
        toItem(c.id, c.title, c.summary, c.format, c.tone),
      ),
      MAX_PRIORITIES,
    ),
    actions: capItems(vaultCards, MAX_ACTIONS),
    sections: [
      {
        id: "opportunities",
        title: "Opportunity Vault",
        depth: "surface",
        items: vaultCards,
      },
      {
        id: "creation",
        title: "Creation Studio",
        depth: "surface",
        items: creation.map((c) =>
          toItem(c.id, c.title, c.summary, c.format, c.tone),
        ),
      },
      {
        id: "revenue",
        title: "Revenue Opportunity",
        depth: "surface",
        items: [
          toItem(
            "rev-1",
            brief.revenueOpportunity.title,
            brief.revenueOpportunity.summary,
            undefined,
            brief.revenueOpportunity.tone,
          ),
        ],
      },
      {
        id: "marketing",
        title: "Marketing & Campaigns",
        depth: "deep",
        items: creation
          .filter((c) =>
            ["newsletter", "linkedin", "campaign", "lead-magnet"].includes(
              c.format,
            ),
          )
          .map((c) => toItem(c.id, c.title, c.summary, c.format, c.tone)),
      },
    ],
    roomIds: ["opportunity-vault", "creation-studio"],
  };
}

function buildDiscoverWorkspace(): FounderWorkspace {
  const reports = getReports();
  const insights = getInsights();
  const memory = listFounderMemory().slice(0, 6);
  const libraryCards = roomCardsAsItems("knowledge-library");
  const rec = insights[0]
    ? {
        id: insights[0].id,
        title: insights[0].title,
        summary: insights[0].summary,
        impactStars: scoreToImpactStars(insights[0].score),
        tone: insights[0].tone,
      }
    : getExecutiveRecommendation();

  return {
    id: "discover",
    icon: "🧠",
    title: "Discover",
    purpose: "Learning, research, and intelligence.",
    recommendation: rec,
    priorities: capItems(
      reports.slice(0, MAX_PRIORITIES).map((r) =>
        toItem(r.id, r.title, r.summary, r.type, r.tone),
      ),
      MAX_PRIORITIES,
    ),
    actions: capItems(
      insights.map((i) =>
        toItem(i.id, i.title, i.summary, i.category, i.tone),
      ),
      MAX_ACTIONS,
    ),
    sections: [
      {
        id: "fire-reports",
        title: "FIRE Reports",
        depth: "surface",
        items: reports.map((r) =>
          toItem(r.id, r.title, r.summary, r.type, r.tone),
        ),
      },
      {
        id: "knowledge-library",
        title: "Knowledge Library",
        depth: "surface",
        items:
          libraryCards.length > 0
            ? libraryCards
            : reports
                .slice(0, 3)
                .map((r) => toItem(r.id, r.title, r.summary)),
      },
      {
        id: "research",
        title: "Research & Trends",
        depth: "deep",
        items: insights.map((i) =>
          toItem(i.id, i.title, i.summary, i.category, i.tone),
        ),
      },
      {
        id: "memory",
        title: "Founder Memory",
        depth: "deep",
        items: memory.map((m) =>
          toItem(m.id, m.title, m.summary, m.category),
        ),
      },
      {
        id: "reflection",
        title: "Reflection",
        depth: "deep",
        items: roomCardsAsItems("reflection"),
      },
    ],
    roomIds: ["knowledge-library", "reflection"],
  };
}

function buildTeamWorkspace(): FounderWorkspace {
  const sections = getTeamHubSections();
  const active = sections.find((s) => s.id === "active-projects");
  const waiting = sections.find((s) => s.id === "waiting-shari");
  const approvals = sections.find((s) => s.id === "approvals");

  const surfaceItems: FounderWorkspaceItem[] = [
    ...(active?.items.slice(0, 2).map((i) =>
      toItem(i.id, i.title, i.meta, "Active project"),
    ) ?? []),
    ...(waiting?.items.slice(0, 1).map((i) =>
      toItem(i.id, i.title, i.meta, "Waiting for you"),
    ) ?? []),
  ];

  const rec = approvals?.items[0]
    ? {
        id: approvals.items[0].id,
        title: approvals.items[0].title,
        summary: approvals.items[0].meta ?? "Review when you are ready.",
        impactStars: 4 as const,
        tone: "on-deck" as const,
      }
    : getExecutiveRecommendation();

  return {
    id: "team",
    icon: "👥",
    title: "Team",
    purpose: "Execution — Team Hub, Izna, approvals, and publishing.",
    recommendation: rec,
    priorities: capItems(surfaceItems, MAX_PRIORITIES),
    actions: capItems(
      (approvals?.items ?? []).map((i) =>
        toItem(i.id, i.title, i.meta, "Approval"),
      ),
      MAX_ACTIONS,
    ),
    sections: sections.map((section) => ({
      id: section.id,
      title: section.title,
      depth:
        section.id === "active-projects" ||
        section.id === "waiting-shari" ||
        section.id === "approvals"
          ? ("surface" as const)
          : ("deep" as const),
      items: section.items.map((item) =>
        toItem(item.id, item.title, item.meta),
      ),
    })),
    roomIds: ["team-hub"],
  };
}

function buildSimplifyWorkspace(): FounderWorkspace {
  const brief = getTodayBrief();
  const quickWin =
    brief.glance.find((s) => s.id === "quick-wins")?.items[0];
  const rec = getExecutiveRecommendation();

  return {
    id: "simplify",
    icon: "🌿",
    title: "Simplify Today",
    purpose: "Only what matters — no guilt, no clutter.",
    recommendation: rec,
    priorities: capItems(
      brief.priorities.slice(0, 2).map((p) => toItem(p.id, p.title, p.note)),
      2,
    ),
    actions: quickWin
      ? [
          toItem(
            quickWin.id,
            quickWin.summary,
            undefined,
            "Quick win",
            quickWin.tone,
          ),
        ]
      : [],
    sections: [
      {
        id: "focus",
        title: "Your focus",
        subtitle: "Two priorities. That is enough.",
        depth: "surface",
        items: brief.priorities.slice(0, 2).map((p) =>
          toItem(p.id, p.title, p.note),
        ),
      },
      {
        id: "one-rec",
        title: "One recommendation",
        depth: "surface",
        items: [toItem(rec.id, rec.title, rec.summary, undefined, rec.tone)],
      },
      {
        id: "one-win",
        title: "One quick win",
        depth: "surface",
        items: quickWin
          ? [
              toItem(
                quickWin.id,
                quickWin.summary,
                undefined,
                undefined,
                quickWin.tone,
              ),
            ]
          : [],
      },
    ],
    roomIds: [],
  };
}

const WORKSPACE_BUILDERS: Record<
  FounderWorkspaceId,
  () => FounderWorkspace
> = {
  start: buildStartWorkspace,
  build: buildBuildWorkspace,
  grow: buildGrowWorkspace,
  discover: buildDiscoverWorkspace,
  team: buildTeamWorkspace,
  simplify: buildSimplifyWorkspace,
};

/** Assemble a workspace from intention — uses existing services only. */
export function getWorkspace(id: FounderWorkspaceId): FounderWorkspace {
  const builder = WORKSPACE_BUILDERS[id];
  const meta = getWorkspaceMeta(id);
  const workspace = builder();
  if (meta) {
    workspace.icon = meta.icon;
    workspace.title = meta.title;
    workspace.purpose = meta.purpose;
  }
  return workspace;
}
