/**
 * Mission Composer — assembles a mission workspace from existing Founder services.
 * Never duplicates Concierge, FLAME, FIRE, SPARK, Daily Workflow, or Workspace Orchestrator.
 */
import { getFireExecutivePortfolio } from "../../briefs/firePortfolio";
import { composeFounderDailyWorkflow } from "../../dailyWorkflow";
import { listFounderMemory } from "../../memory";
import { getFounderSparkOverview } from "../../services/sparkBridge";
import { getExecutiveRecommendation, getWorkspace } from "../../workspace/orchestrator";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { relationshipsForMission } from "../relationships/missionRelationships";
import {
  getSampleMilestonesForMission,
  getSampleMission,
  getSampleTimelineForMission,
} from "../sample";
import type {
  ComposedMission,
  MissionAction,
  MissionAnalytics,
  MissionAutomation,
  MissionContent,
  MissionDecision,
  MissionId,
  MissionKnowledgeGroup,
  MissionMarketing,
  MissionMilestone,
  MissionNextAction,
  MissionOpportunity,
  MissionOverview,
  MissionProgress,
  MissionResearch,
  MissionRisk,
  MissionTeam,
  MissionGoal,
} from "../types";

const MAX = 4;

function cap<T>(items: T[]): T[] {
  return items.slice(0, MAX);
}

const MISSION_WORKSPACE_MAP: Partial<Record<MissionId, Parameters<typeof getWorkspace>[0]>> = {
  "listening-rooms": "build",
  companion: "discover",
  postcraft: "grow",
  "workshop-series": "grow",
  estate: "discover",
  "founder-studio": "start",
  "marketing-launch": "grow",
};

export function composeMission(missionId: MissionId): ComposedMission | null {
  const mission = getSampleMission(missionId);
  if (!mission) return null;

  const workflow = composeFounderDailyWorkflow();
  const portfolio = getFireExecutivePortfolio();
  const spark = getFounderSparkOverview({ limit: 5 });
  const workspaceId = MISSION_WORKSPACE_MAP[missionId] ?? "build";
  const workspace = getWorkspace(workspaceId);
  const execRec = getExecutiveRecommendation();
  const memory = listFounderMemory();

  const goals: MissionGoal[] = [
    {
      id: `goal-${missionId}`,
      missionId,
      title: mission.purpose,
      summary: mission.estimatedImpact,
    },
  ];

  const milestones: MissionMilestone[] = getSampleMilestonesForMission(missionId);

  const decisions: MissionDecision[] = cap([
    ...workflow.pendingDecisions.map((d) => ({
      id: d.id,
      missionId,
      title: d.title,
      summary: d.summary ?? "",
      href: d.href,
      status: "pending" as const,
    })),
    ...portfolio.decisions.map((d) => ({
      id: d.id,
      missionId,
      title: d.title,
      summary: d.summary,
      href: `${FOUNDER_STUDIO_BASE}/decision-vault`,
      status: "decided" as const,
    })),
  ]);

  const research: MissionResearch[] = cap(
    workspace.sections
      .filter((s) => ["research", "fire-reports", "knowledge-library"].includes(s.id))
      .flatMap((s) =>
        s.items.map((row) => ({
          id: row.id,
          missionId,
          title: row.title,
          summary: row.summary ?? "",
          source: s.title,
        })),
      ),
  );

  const content: MissionContent[] = cap(
    workspace.sections
      .filter((s) => ["creation", "spark-command", "best-idea"].includes(s.id))
      .flatMap((s) =>
        s.items.map((row) => ({
          id: row.id,
          missionId,
          title: row.title,
          summary: row.summary ?? "",
          format: row.meta,
        })),
      ),
  );

  const marketing: MissionMarketing[] = cap([
    ...spark.founderRecommendations
      .filter((r) => r.summary.toLowerCase().includes("postcraft") || r.summary.toLowerCase().includes("campaign"))
      .map((r) => ({
        id: r.id,
        missionId,
        title: r.title,
        summary: r.summary,
        channel: "PostCraft",
      })),
    ...workspace.sections
      .filter((s) => s.id === "marketing" || s.id === "revenue")
      .flatMap((s) =>
        s.items.map((row) => ({
          id: row.id,
          missionId,
          title: row.title,
          summary: row.summary ?? "",
          channel: row.meta,
        })),
      ),
  ]);

  const analytics: MissionAnalytics[] = cap(
    portfolio.alerts.map((a) => ({
      id: a.id,
      missionId,
      title: a.title,
      summary: a.explanation,
    })),
  );

  const team: MissionTeam[] = cap(
    workflow.office.reminders
      .filter((r) => r.kind === "workshop-approval")
      .map((r) => ({
        id: r.id,
        missionId,
        title: r.title,
        summary: r.note,
        assignee: "Izna",
      })),
  );

  const automation: MissionAutomation[] =
    missionId === "marketing-launch" || missionId === "listening-rooms"
      ? [
          {
            id: `auto-ghl-${missionId}`,
            missionId,
            title: "GHL nurture sequence",
            summary: "Gentle Restart funnel — sample status: draft ready for review.",
            status: "draft",
          },
        ]
      : [];

  const opportunities: MissionOpportunity[] = cap(
    workflow.opportunities.map((o) => ({
      id: o.id,
      missionId,
      title: o.title,
      summary: o.summary ?? "",
    })),
  );

  const risks: MissionRisk[] = [
    {
      id: `risk-fragment-${missionId}`,
      missionId,
      title: "Intelligence fragmentation",
      summary: "Mission loses clarity if services duplicate outside SPARK.",
      severity: "medium",
    },
  ];

  const primaryAction: MissionNextAction = {
    id: `action-primary-${missionId}`,
    missionId,
    title: workflow.primaryAction.title,
    summary: workflow.primaryAction.summary ?? execRec.summary,
    href: workflow.primaryAction.href,
    hrefLabel: workflow.primaryAction.hrefLabel ?? "Begin",
    kind: mission.phase === "Build" ? "build" : "strategy",
  };

  const overview: MissionOverview = {
    missionId,
    headline: `What we are building: ${mission.name}`,
    currentRecommendation: execRec.summary,
    primaryAction,
    priorityLabel: mission.priority,
    phase: mission.phase,
    strategicValue: mission.strategicValue,
    estimatedImpact: mission.estimatedImpact,
    progress: mission.progress,
  };

  const completed = milestones.filter((m) => m.completed).length;
  const progress: MissionProgress = {
    missionId,
    overall: mission.progress,
    milestonesCompleted: completed,
    milestonesTotal: milestones.length || 1,
    phase: mission.phase,
    nextMilestone: milestones.find((m) => !m.completed)?.title,
  };

  const timeline = getSampleTimelineForMission(missionId);

  const knowledge: MissionKnowledgeGroup[] = [
    {
      id: "knowledge-research",
      title: "Research & ideas",
      items: cap([
        ...research,
        ...spark.topPatterns.map((p) => ({
          id: p.id,
          title: p.title,
          summary: p.summary,
        })),
      ]).map((r) => ({
        id: r.id,
        title: "title" in r ? r.title : "",
        summary: "summary" in r ? r.summary : "",
      })),
    },
    {
      id: "knowledge-insights",
      title: "Customer insights & lessons",
      items: cap(
        memory.map((m) => ({
          id: m.id,
          title: m.title,
          summary: m.summary,
        })),
      ),
    },
    {
      id: "knowledge-executive",
      title: "Executive notes",
      items: portfolio.executiveSummary.slice(0, 2).map((b) => ({
        id: b.id,
        title: b.whatChanged,
        summary: b.whyItMatters,
      })),
    },
  ];

  const actions: MissionAction[] = cap([
    {
      id: "act-build",
      label: "Continue Building",
      summary: workspace.recommendation.summary,
      href: workspace.priorities[0] ? `${FOUNDER_STUDIO_BASE}/workspace/${workspaceId}` : undefined,
    },
    {
      id: "act-research",
      label: "Continue Research",
      summary: research[0]?.summary,
      href: `${FOUNDER_STUDIO_BASE}/workspace/discover`,
    },
    {
      id: "act-decision",
      label: "Review Decision",
      summary: decisions[0]?.summary,
      href: decisions[0]?.href ?? `${FOUNDER_STUDIO_BASE}/decision-vault`,
    },
    {
      id: "act-strategy",
      label: "Open Strategy Session",
      summary: "Executive Strategy Center for visual thinking.",
      href: `${FOUNDER_STUDIO_BASE}/executive-strategy`,
    },
    {
      id: "act-content",
      label: "Approve Content",
      summary: marketing[0]?.summary,
      href: `${FOUNDER_STUDIO_BASE}/creation-studio`,
    },
    {
      id: "act-team",
      label: "Assign Team Work",
      summary: team[0]?.summary,
      href: `${FOUNDER_STUDIO_BASE}/team-hub`,
    },
  ]).filter((a) => a.summary || a.href);

  const relationships = relationshipsForMission(missionId);

  return {
    mission,
    overview,
    progress,
    goals,
    milestones,
    decisions,
    research,
    content,
    marketing,
    analytics,
    team,
    automation,
    opportunities,
    risks,
    timeline,
    knowledge,
    actions,
    relationships,
  };
}

export function getMissionOverview(missionId: MissionId): MissionOverview | null {
  return composeMission(missionId)?.overview ?? null;
}

export function getMissionProgress(missionId: MissionId): MissionProgress | null {
  return composeMission(missionId)?.progress ?? null;
}
