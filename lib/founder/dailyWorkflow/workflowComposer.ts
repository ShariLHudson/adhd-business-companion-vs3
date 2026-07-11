/**
 * Workflow Composer — assembles today's work from existing Founder services.
 * Consumes Concierge, FLAME, FIRE, SPARK bridge, and Workspace Orchestrator.
 * No new intelligence. No duplication.
 */
import { getFireExecutivePortfolio } from "../briefs/firePortfolio";
import { prepareOffice } from "../concierge/services";
import { FounderFlameService } from "../flame/services";
import { getFounderSparkOverview } from "../services/sparkBridge";
import { getExecutiveRecommendation, getWorkspace } from "../workspace/orchestrator";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { getWorkMode, resolveWorkModeFromSuggestion } from "./workModes";
import type {
  FounderDailyWorkflow,
  TodayMission,
  TodayWorkItem,
} from "./types";

const MAX_SURFACE = 3;

function item(
  partial: TodayWorkItem,
): TodayWorkItem {
  return partial;
}

function cap<T>(list: T[], limit = MAX_SURFACE): T[] {
  return list.slice(0, limit);
}

function buildMission(
  sparkHeadline: string,
  conciergeSummary: string,
  flameObservation: string,
): TodayMission {
  const portfolio = getFireExecutivePortfolio();
  const topPriority = portfolio.priorities[0];
  return {
    title: topPriority?.title ?? "Focus on what moves Spark forward today",
    summary: conciergeSummary || sparkHeadline,
    whyItMatters:
      topPriority?.whyItMatters ??
      flameObservation ??
      "Your executive office assembled one calm view so you never hunt for the right module.",
  };
}

function buildAssembledStack(params: {
  mission: TodayMission;
  workModeLabel: string;
  portfolio: ReturnType<typeof getFireExecutivePortfolio>;
  office: ReturnType<typeof prepareOffice>;
  sparkPatterns: ReturnType<typeof getFounderSparkOverview>["topPatterns"];
  workspaceSections: ReturnType<typeof getWorkspace>["sections"];
}): TodayWorkItem[] {
  const { mission, workModeLabel, portfolio, office, sparkPatterns, workspaceSections } =
    params;

  const stack: TodayWorkItem[] = [
    item({
      id: "layer-mission",
      layer: "mission",
      title: mission.title,
      summary: mission.summary,
      whyItMatters: mission.whyItMatters,
      tone: "primary",
    }),
    item({
      id: "layer-listening",
      layer: "listening",
      title: office.thinkingSpace.label,
      summary: office.thinkingSpace.reason,
      href: office.thinkingSpace.href,
      hrefLabel: "Go there",
      tone: "calm",
    }),
  ];

  const researchSection = workspaceSections.find((s) =>
    ["research", "fire-reports", "knowledge-library"].includes(s.id),
  );
  for (const row of researchSection?.items.slice(0, 1) ?? []) {
    stack.push(
      item({
        id: `layer-research-${row.id}`,
        layer: "research",
        title: row.title,
        summary: row.summary,
        tone: "context",
      }),
    );
  }

  for (const bullet of portfolio.executiveSummary.slice(0, 1)) {
    stack.push(
      item({
        id: `layer-customer-${bullet.id}`,
        layer: "customer",
        title: bullet.whatChanged,
        summary: bullet.whyItMatters,
        tone: "context",
      }),
    );
  }

  for (const decision of portfolio.decisions.slice(0, 1)) {
    stack.push(
      item({
        id: `layer-decision-${decision.id}`,
        layer: "decisions",
        title: decision.title,
        summary: decision.summary,
        href: `${FOUNDER_STUDIO_BASE}/decision-vault`,
        hrefLabel: "Decision Vault",
        tone: "decision",
      }),
    );
  }

  const sparkRec = getFounderSparkOverview({ limit: 1 }).founderRecommendations[0];
  if (sparkRec) {
    stack.push(
      item({
        id: `layer-cursor-${sparkRec.id}`,
        layer: "cursor",
        title: sparkRec.title,
        summary: sparkRec.summary,
        tone: "primary",
      }),
    );
  }

  for (const pattern of sparkPatterns.slice(0, 1)) {
    stack.push(
      item({
        id: `layer-content-${pattern.id}`,
        layer: "content",
        title: "Content signal",
        summary: pattern.summary,
        tone: "opportunity",
      }),
    );
  }

  if (office.agenda.opportunity) {
    stack.push(
      item({
        id: `layer-workshop-${office.agenda.opportunity.id}`,
        layer: "workshop",
        title: office.agenda.opportunity.title,
        summary: office.agenda.opportunity.summary,
        tone: "opportunity",
      }),
    );
  }

  for (const rec of getFounderSparkOverview().founderRecommendations.filter((r) =>
    r.summary.toLowerCase().includes("postcraft"),
  ).slice(0, 1)) {
    stack.push(
      item({
        id: `layer-marketing-${rec.id}`,
        layer: "marketing",
        title: rec.title,
        summary: rec.summary,
        tone: "opportunity",
      }),
    );
  }

  for (const reminder of office.reminders.filter((r) => r.kind === "workshop-approval").slice(0, 1)) {
    stack.push(
      item({
        id: `layer-approval-${reminder.id}`,
        layer: "approvals",
        title: reminder.title,
        summary: reminder.note,
        href: reminder.href,
        tone: "decision",
      }),
    );
  }

  for (const alert of portfolio.alerts.slice(0, 1)) {
    stack.push(
      item({
        id: `layer-analytics-${alert.id}`,
        layer: "analytics",
        title: alert.title,
        summary: alert.explanation,
        tone: "context",
      }),
    );
  }

  const execRec = getExecutiveRecommendation();
  stack.push(
    item({
      id: "layer-next-action",
      layer: "mission",
      title: "Next action",
      summary: execRec.summary,
      whyItMatters: `Suggested while you are in ${workModeLabel} mode.`,
      tone: "primary",
    }),
  );

  return stack;
}

/** Compose Shari's executive day — one operating system, not modules. */
export function composeFounderDailyWorkflow(): FounderDailyWorkflow {
  const office = prepareOffice();
  const portfolio = getFireExecutivePortfolio();
  const spark = getFounderSparkOverview({ limit: 5 });
  const flame = FounderFlameService.getMentorOverview();
  const workMode = resolveWorkModeFromSuggestion(office.workspaceSuggestion);
  const workspace = getWorkspace(workMode.workspaceIds[0] ?? "start");

  const mission = buildMission(
    spark.headline,
    office.primaryMessage.text,
    flame.observation.observation,
  );

  const primaryAction: TodayWorkItem = {
    id: office.workspaceSuggestion.workspaceId,
    layer: "mission",
    title: office.workspaceSuggestion.title,
    summary: office.workspaceSuggestion.reason,
    href: office.workspaceSuggestion.href,
    hrefLabel: "Begin here",
    whyItMatters: mission.whyItMatters,
    tone: "primary",
  };

  const opportunities: TodayWorkItem[] = cap(
    [
      ...(office.agenda.opportunity
        ? [
            item({
              id: office.agenda.opportunity.id,
              layer: "opportunity",
              title: office.agenda.opportunity.title,
              summary: office.agenda.opportunity.summary,
              tone: "opportunity",
            }),
          ]
        : []),
      ...spark.founderRecommendations.map((r) =>
        item({
          id: r.id,
          layer: "marketing",
          title: r.title,
          summary: r.summary,
          tone: "opportunity",
        }),
      ),
      ...portfolio.priorities.slice(1).map((p) =>
        item({
          id: p.id,
          layer: "opportunity",
          title: p.title,
          summary: p.whyItMatters,
          tone: "opportunity",
        }),
      ),
    ],
    MAX_SURFACE,
  );

  const pendingDecisions: TodayWorkItem[] = cap(
    [
      ...office.reminders
        .filter((r) => r.kind === "pending-decision" || r.kind === "strategy-session")
        .map((r) =>
          item({
            id: r.id,
            layer: "decisions",
            title: r.title,
            summary: r.note,
            href: r.href,
            hrefLabel: "Review",
            tone: "decision",
          }),
        ),
      ...portfolio.decisions.map((d) =>
        item({
          id: d.id,
          layer: "decisions",
          title: d.title,
          summary: d.summary,
          href: `${FOUNDER_STUDIO_BASE}/decision-vault`,
          tone: "decision",
        }),
      ),
    ],
    MAX_SURFACE,
  );

  const canWait: TodayWorkItem[] = cap(
    [
      ...office.agenda.watchItems.map((w) =>
        item({
          id: w.id,
          layer: "analytics",
          title: w.title,
          summary: w.note,
          tone: "wait",
        }),
      ),
      ...office.quickWins.map((q) =>
        item({
          id: q.id,
          layer: "content",
          title: q.title,
          summary: q.summary,
          tone: "wait",
        }),
      ),
    ],
    MAX_SURFACE,
  );

  const relatedKnowledge: TodayWorkItem[] = cap(
    workspace.sections
      .filter((s) => ["knowledge-library", "research", "memory"].includes(s.id))
      .flatMap((s) =>
        s.items.map((row) =>
          item({
            id: row.id,
            layer: "research",
            title: row.title,
            summary: row.summary,
            tone: "context",
          }),
        ),
      ),
    MAX_SURFACE,
  );

  const relatedContent: TodayWorkItem[] = cap(
    workspace.sections
      .filter((s) => ["creation", "spark-command"].includes(s.id))
      .flatMap((s) =>
        s.items.slice(0, 2).map((row) =>
          item({
            id: row.id,
            layer: "content",
            title: row.title,
            summary: row.summary,
            tone: "context",
          }),
        ),
      ),
    MAX_SURFACE,
  );

  const relatedMarketing: TodayWorkItem[] = cap(
    workspace.sections
      .filter((s) => ["marketing", "revenue", "opportunities"].includes(s.id))
      .flatMap((s) =>
        s.items.map((row) =>
          item({
            id: row.id,
            layer: "marketing",
            title: row.title,
            summary: row.summary,
            tone: "opportunity",
          }),
        ),
      ),
    MAX_SURFACE,
  );

  const relatedTeamActivity: TodayWorkItem[] = cap(
    office.reminders
      .filter((r) => r.kind === "workshop-approval")
      .map((r) =>
        item({
          id: r.id,
          layer: "team",
          title: r.title,
          summary: r.note,
          href: r.href,
          tone: "decision",
        }),
      ),
    MAX_SURFACE,
  );

  const relatedAnalytics: TodayWorkItem[] = cap(
    portfolio.alerts.map((a) =>
      item({
        id: a.id,
        layer: "analytics",
        title: a.title,
        summary: a.explanation,
        tone: "context",
      }),
    ),
    MAX_SURFACE,
  );

  const assembledStack = buildAssembledStack({
    mission,
    workModeLabel: workMode.label,
    portfolio,
    office,
    sparkPatterns: spark.topPatterns,
    workspaceSections: workspace.sections,
  });

  return {
    greeting: office.greeting,
    mission,
    workMode: getWorkMode(workMode.id),
    primaryAction,
    currentInitiative: item({
      id: `initiative-${workMode.id}`,
      layer: "mission",
      title: workMode.label,
      summary: workMode.summary,
      tone: "primary",
    }),
    currentContext: item({
      id: "context-office",
      layer: "listening",
      title: office.thinkingSpace.label,
      summary: office.thinkingSpace.reason,
      href: office.thinkingSpace.href,
      tone: "calm",
    }),
    opportunities,
    pendingDecisions,
    canWait,
    relatedKnowledge,
    relatedContent,
    relatedMarketing,
    relatedTeamActivity,
    relatedAnalytics,
    assembledStack,
    office,
    preparedAt: new Date().toISOString(),
  };
}
