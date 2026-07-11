import { composeDailyDiscoveryBrief } from "@/lib/executiveDiscoveryEngine/services/executiveDiscoveryEngineService";
import { getBuilderBootstrap } from "@/lib/executiveBuilder/services/executiveBuilderService";
import { getExecutiveIntegrationBootstrap } from "@/lib/executiveIntegration/services/executiveIntegrationService";
import { integrationSampleRepository } from "@/lib/executiveIntegration/repositories/sample";
import { composeRecommendationPyramid } from "@/lib/executiveJudgmentEngine/services/executiveJudgmentEngineService";
import { getMemoryTheaterBootstrap } from "@/lib/executiveMemoryTheater/services/executiveMemoryTheaterService";
import { relationshipIntelligenceSampleRepository } from "@/lib/executiveRelationshipIntelligence/repositories/sample";
import { getSimulationBootstrap } from "@/lib/executiveSimulation/services/executiveSimulationService";
import { executiveQuestionService } from "@/lib/executiveQuestions";
import {
  DEFAULT_ACTIVE_MISSION_ID,
  getSampleMission,
} from "@/lib/founder/missions/sample/missionsData";
import { composeOpportunityDiscoveryOverview } from "@/lib/opportunities/services/opportunityDiscoveryService";
import { researchSampleRepository } from "@/lib/research/repositories/sample";

import {
  COMMAND_CENTER_PRINCIPLE,
  COMPANION_INTELLIGENCE_SOURCES,
  HEADQUARTERS_MESSAGE,
} from "../sample/commandCenterPrinciple";
import type {
  AssistantPrepKind,
  ExecutiveAssistantItem,
  ExecutiveCommandCenterBootstrap,
  ExecutiveCommandCenterView,
  ExecutiveLevel,
  ExecutiveMomentum,
  ExecutivePanelDetailView,
  ExecutivePanelId,
  ExecutivePanelSummary,
  ExecutiveStatusBar,
} from "../types";

const FOUNDER_BASE = "/companion/founder";

function momentumFromProgress(progress: number): ExecutiveMomentum {
  if (progress < 35) return "restoring";
  if (progress < 60) return "building";
  if (progress < 80) return "accelerating";
  return "launching";
}

function riskLevelFromFinding(category: string): ExecutiveLevel {
  if (category === "competitive-risks" || category === "executive-warnings") return "elevated";
  if (category === "emerging-customer-needs") return "moderate";
  return "low";
}

function levelFromScore(score: number): ExecutiveLevel {
  if (score >= 80) return "high";
  if (score >= 60) return "elevated";
  if (score >= 40) return "moderate";
  return "low";
}

function mapPrepKind(kind: string): AssistantPrepKind {
  const map: Record<string, AssistantPrepKind> = {
    mission: "executive-brief",
    "executive-builder": "builder-packet",
    simulation: "decision-comparison",
    "cursor-prompt": "cursor-prompt",
    "postcraft-campaign": "postcraft-campaign",
    "ghl-workflow": "meeting-agenda",
    "executive-brief": "review-brief",
  };
  return map[kind] ?? "document";
}

function buildAssistantQueue(): ExecutiveAssistantItem[] {
  const pyramid = composeRecommendationPyramid();
  const fromJudgment = pyramid.primary.prepOffers.map((offer) => ({
    id: offer.id,
    kind: mapPrepKind(offer.kind),
    title: offer.label,
    summary: offer.description,
    status: "draft" as const,
    sourceEngine: "Executive Judgment",
  }));

  const researchAlerts = researchSampleRepository.significantAlerts().slice(0, 2);
  const fromResearch = researchAlerts.map((alert) => ({
    id: `assistant-research-${alert.id}`,
    kind: "research" as const,
    title: alert.title,
    summary: alert.whatHappened,
    status: "draft" as const,
    sourceEngine: "Executive Research",
  }));

  return [...fromJudgment, ...fromResearch].slice(0, 8);
}

function buildStatusBar(
  missionName: string,
  focus: string,
  energy: string,
  progress: number,
  riskLevel: ExecutiveLevel,
  opportunityScore: number,
): ExecutiveStatusBar {
  return {
    currentMission: missionName,
    currentFocus: focus,
    currentEnergy: energy,
    currentMomentum: momentumFromProgress(progress),
    currentRiskLevel: riskLevel,
    currentOpportunityLevel: levelFromScore(opportunityScore),
  };
}

function buildPanels(): ExecutivePanelSummary[] {
  const pyramid = composeRecommendationPyramid();
  const primary = pyramid.primary;
  const daily = composeDailyDiscoveryBrief();
  const opportunities = composeOpportunityDiscoveryOverview();
  const simulation = getSimulationBootstrap();
  const builder = getBuilderBootstrap();
  const integration = getExecutiveIntegrationBootstrap();
  const memory = getMemoryTheaterBootstrap();
  const discoveries = relationshipIntelligenceSampleRepository.discoveries().slice(0, 3);
  const researchAlerts = researchSampleRepository.significantAlerts().slice(0, 3);
  const decisionQuestions = executiveQuestionService
    .listQuestions({ product: "founder" })
    .filter((q) => q.tags.includes("decision"))
    .slice(0, 3);
  const runGroups = integrationSampleRepository.groups();

  const today: ExecutivePanelSummary = {
    id: "today",
    title: "Today",
    mission: "Mission · Primary Recommendation · Momentum",
    teaser: primary.headline,
    itemCount: 5,
    primaryRoomHref: `${FOUNDER_BASE}/executive-judgment-engine`,
    items: [
      { id: "today-mission", label: "Active mission", detail: getSampleMission(DEFAULT_ACTIVE_MISSION_ID)?.name ?? "Listening Rooms" },
      { id: "today-rec", label: "Primary recommendation", detail: primary.headline, roomHref: `${FOUNDER_BASE}/executive-judgment-engine` },
      { id: "today-goal", label: "Today's goal", detail: "Advance unified restart narrative before workshop momentum fades." },
      { id: "today-momentum", label: "Current momentum", detail: `Building — ${getSampleMission(DEFAULT_ACTIVE_MISSION_ID)?.progress ?? 64}% estimated progress on active mission.` },
      { id: "today-overnight", label: "Overnight message", detail: daily.overnightMessage, roomHref: `${FOUNDER_BASE}/executive-discovery-engine` },
    ],
  };

  const discover: ExecutivePanelSummary = {
    id: "discover",
    title: "Discover",
    mission: "Research · Opportunities · Alerts · Weak signals",
    teaser: daily.topDiscovery.headline,
    itemCount: 6,
    primaryRoomHref: `${FOUNDER_BASE}/executive-discovery-engine`,
    items: [
      ...researchAlerts.map((a) => ({
        id: a.id,
        label: "Research",
        detail: a.title,
        roomHref: `${FOUNDER_BASE}/executive-research`,
      })),
      {
        id: opportunities.todaysBiggest.id,
        label: "Opportunity",
        detail: opportunities.todaysBiggest.name,
        roomHref: `${FOUNDER_BASE}/opportunity-discovery`,
      },
      ...(daily.founderAlert
        ? [{ id: daily.founderAlert.id, label: "Founder Alert", detail: daily.founderAlert.title, roomHref: `${FOUNDER_BASE}/executive-discovery-engine` }]
        : []),
      ...discoveries.map((d) => ({
        id: d.id,
        label: "Relationship discovery",
        detail: d.headline,
        roomHref: `${FOUNDER_BASE}/executive-relationship-intelligence`,
      })),
    ].slice(0, 6),
  };

  const decide: ExecutivePanelSummary = {
    id: "decide",
    title: "Decide",
    mission: "Board · Simulation · Vault · Judgment",
    teaser: simulation.suggestedDecisions[0]?.phrase ?? "Workshop vs membership path",
    itemCount: 5,
    primaryRoomHref: `${FOUNDER_BASE}/executive-simulation`,
    items: [
      { id: "sim-primary", label: "Simulation Studio", detail: "Workshop vs membership — compare futures before committing.", roomHref: `${FOUNDER_BASE}/executive-simulation` },
      { id: "judgment-primary", label: "Executive Judgment", detail: primary.headline, roomHref: `${FOUNDER_BASE}/executive-judgment-engine` },
      ...decisionQuestions.map((q) => ({
        id: q.id,
        label: "Executive question",
        detail: q.title,
        roomHref: `${FOUNDER_BASE}/executive-strategy`,
      })),
      { id: "vault", label: "Decision Vault", detail: "Institutional memory — what we decided and why.", roomHref: `${FOUNDER_BASE}/decision-vault` },
    ].slice(0, 5),
  };

  const build: ExecutivePanelSummary = {
    id: "build",
    title: "Build",
    mission: "Builder · Development · Launch prep",
    teaser: builder.suggestedBuilds[0]?.phrase ?? "Listening Rooms restart experience",
    itemCount: 5,
    primaryRoomHref: `${FOUNDER_BASE}/executive-builder`,
    items: [
      { id: "builder", label: "Executive Builder", detail: builder.suggestedBuilds[0]?.phrase ?? "Complete blueprint ready", roomHref: `${FOUNDER_BASE}/executive-builder` },
      { id: "cursor", label: "Cursor", detail: "Implementation packet drafted — approval before any build.", roomHref: `${FOUNDER_BASE}/executive-integration-center` },
      { id: "products", label: "Products", detail: "Listening Rooms, Companion, Founder Studio aligned to restart mission.", roomHref: `${FOUNDER_BASE}/spark-command` },
      { id: "roadmap", label: "Roadmaps", detail: "One-room-per-sprint rhythm — final headquarters sprint complete.", roomHref: `${FOUNDER_BASE}/executive-strategy` },
      { id: "launch", label: "Launch preparation", detail: "Gentle Restart campaign hooks tied to workshop proximity.", roomHref: `${FOUNDER_BASE}/creation-studio` },
    ],
  };

  const run: ExecutivePanelSummary = {
    id: "run",
    title: "Run",
    mission: "Operations · Automation · Revenue",
    teaser: `${integration.connectedCount} systems connected · One Office Principle`,
    itemCount: 6,
    primaryRoomHref: `${FOUNDER_BASE}/executive-integration-center`,
    items: runGroups.slice(0, 6).map((group) => ({
      id: group.id,
      label: group.label,
      detail: `${group.integrations.filter((i) => i.status === "connected").length} connected`,
      roomHref: `${FOUNDER_BASE}/executive-integration-center`,
    })),
  };

  const learn: ExecutivePanelSummary = {
    id: "learn",
    title: "Learn",
    mission: "Memory · Patterns · Growth",
    teaser: memory.entryPoints[0]?.phrase ?? "Replay the workshop decision",
    itemCount: 6,
    primaryRoomHref: `${FOUNDER_BASE}/executive-memory-theater`,
    items: [
      { id: "memory", label: "Memory Theater", detail: memory.entryPoints[0]?.phrase ?? "Living company history", roomHref: `${FOUNDER_BASE}/executive-memory-theater` },
      { id: "lessons", label: "Lessons learned", detail: pyramid.primary.learningNote, roomHref: `${FOUNDER_BASE}/reflection` },
      { id: "wisdom", label: "Executive wisdom", detail: "Return guilt threads across Companion and workshop — pattern forming.", roomHref: `${FOUNDER_BASE}/executive-memory-theater` },
      { id: "patterns", label: "Patterns", detail: "Research → workshop → membership chains before tier exists.", roomHref: `${FOUNDER_BASE}/executive-intelligence-graph` },
      { id: "company", label: "Company growth", detail: "Executive stack Sprints 1–9 linked via shared intelligence.", roomHref: `${FOUNDER_BASE}/executive-intelligence-graph` },
      { id: "founder", label: "Founder growth", detail: primary.shariLens.fitSummary, roomHref: `${FOUNDER_BASE}/reflection` },
    ],
  };

  return [today, discover, decide, build, run, learn];
}

export function getExecutiveCommandCenterBootstrap(): ExecutiveCommandCenterBootstrap {
  const assistantQueue = buildAssistantQueue();
  return {
    principle: COMMAND_CENTER_PRINCIPLE,
    headquartersMessage: HEADQUARTERS_MESSAGE,
    overnightMessage: composeDailyDiscoveryBrief().overnightMessage,
    assistantQueueCount: assistantQueue.length,
    panelCount: 6,
    intelligenceSources: [...COMPANION_INTELLIGENCE_SOURCES],
  };
}

export function composeExecutiveCommandCenterView(): ExecutiveCommandCenterView {
  const mission = getSampleMission(DEFAULT_ACTIVE_MISSION_ID);
  const pyramid = composeRecommendationPyramid();
  const primary = pyramid.primary;
  const daily = composeDailyDiscoveryBrief();
  const opportunities = composeOpportunityDiscoveryOverview();
  const assistantQueue = buildAssistantQueue();
  const panels = buildPanels();

  const companionVoice =
    "SPARK, FLAME, FIRE, and every executive engine reviewed overnight work. Judgment selected one primary recommendation. Discovery surfaced what changed. Research and relationships added evidence. Everything below speaks with one calm voice — expand only what you need.";

  const nextAction =
    primary.discipline?.title ??
    primary.prepOffers[0]?.label ??
    "Review today's primary recommendation and approve one prepared draft.";

  return {
    product: "founder",
    generatedAt: new Date().toISOString(),
    principle: COMMAND_CENTER_PRINCIPLE,
    headquartersMessage: HEADQUARTERS_MESSAGE,
    overnightMessage: daily.overnightMessage,
    companionVoice,
    status: buildStatusBar(
      mission?.name ?? "Listening Rooms",
      primary.headline,
      primary.shariLens.currentEnergy,
      mission?.progress ?? 64,
      riskLevelFromFinding(daily.potentialRisk.category),
      opportunities.todaysBiggest.rankScore,
    ),
    sixQuestions: {
      whatMattersToday: `${mission?.name ?? "Listening Rooms"} — ${primary.headline}`,
      whyItMatters: primary.whyThis,
      whatWeRecommend: primary.summary,
      opportunitiesToKnow: opportunities.todaysBiggest.name,
      decisionsWaiting: `Simulation ready: workshop vs membership. ${pyramid.supporting.length} supporting judgments waiting.`,
      whatToDoNext: nextAction,
    },
    primaryMission: mission?.name ?? "Listening Rooms",
    primaryRecommendation: primary.headline,
    primaryRecommendationSummary: primary.summary,
    todaysGoal: "Advance unified restart narrative before workshop momentum fades.",
    estimatedProgress: mission?.progress ?? 64,
    nextAction,
    assistantQueue,
    panels,
  };
}

export function composeExecutivePanelDetail(panelId: ExecutivePanelId): ExecutivePanelDetailView | null {
  const panels = buildPanels();
  const panel = panels.find((p) => p.id === panelId);
  if (!panel) return null;
  return {
    product: "founder",
    panel,
    generatedAt: new Date().toISOString(),
  };
}

export class ExecutiveCommandCenterService {
  view() {
    return composeExecutiveCommandCenterView();
  }

  panel(panelId: ExecutivePanelId) {
    return composeExecutivePanelDetail(panelId);
  }

  bootstrap() {
    return getExecutiveCommandCenterBootstrap();
  }
}

export const executiveCommandCenterService = new ExecutiveCommandCenterService();
