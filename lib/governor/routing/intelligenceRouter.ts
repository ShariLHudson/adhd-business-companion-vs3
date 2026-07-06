import type { IncomingRecommendation, IntelligenceSource } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { collectCompetingRecommendations } from "@/lib/executiveOS";
import { significantAwareness } from "@/lib/awareness";
import { executiveBriefService } from "@/lib/founder/executiveBrief";
import { prepareFounderExecutiveQuestions } from "@/lib/founder/services/overnightExecutiveCycleBridge";
import { getFounderInstitutionalMemoryBundle } from "@/lib/founder/services/institutionalMemoryBridge";
import { intelligenceGraphService } from "@/lib/intelligenceGraph";
import { prepareMissionExecution } from "@/lib/founder/services/executiveOrchestratorBridge";
import { composeToday } from "@/lib/founder/commandCenter";
import { filterForToday } from "@/lib/calmIntelligence";

const SOURCE_LABELS: Record<IntelligenceSource, string> = {
  spark: "SPARK",
  flame: "FLAME",
  fire: "FIRE",
  research: "Research",
  executive_questions: "Executive Questions",
  institutional_memory: "Institutional Memory",
  awareness: "Executive Awareness",
  predictions: "Opportunity Predictions",
  executive_decision: "Decision Lifecycle",
  executive_brief: "Executive Brief",
  executive_orchestrator: "Executive Orchestrator",
  intelligence_graph: "Companion Intelligence Graph",
  continuous_improvement: "Continuous Improvement",
  command_center: "Command Center",
  founder_profile: "Founder Profile",
  opportunity_discovery: "Opportunity Discovery",
  overnight_cycle: "Overnight Cycle",
  calm_intelligence: "Calm Intelligence",
  executive_os: "Executive OS",
  experiences: "Executive Experiences",
};

function mapOsSource(source: string): IntelligenceSource {
  const map: Record<string, IntelligenceSource> = {
    executive_decision: "executive_decision",
    command_center: "command_center",
    continuous_improvement: "continuous_improvement",
    founder_profile: "founder_profile",
    opportunity_discovery: "predictions",
  };
  return map[source] ?? "executive_os";
}

function incoming(
  id: string,
  source: IntelligenceSource,
  title: string,
  summary: string,
  leverageScore: number,
): IncomingRecommendation {
  return {
    id,
    source,
    title,
    summary,
    leverageScore,
    systemLabel: SOURCE_LABELS[source],
  };
}

export function collectIncomingRecommendations(
  missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID,
): IncomingRecommendation[] {
  const items: IncomingRecommendation[] = [];

  for (const rec of collectCompetingRecommendations(missionId)) {
    items.push(
      incoming(rec.id, mapOsSource(rec.source), rec.title, rec.summary, rec.leverageScore),
    );
  }

  for (const rec of significantAwareness(missionId)) {
    const source: IntelligenceSource =
      rec.channel === "founder_alert"
        ? "executive_brief"
        : rec.channel === "mission_recommendation"
          ? "awareness"
          : "awareness";
    items.push(incoming(rec.id, source, rec.title, rec.summary, rec.confidence.score + 20));
  }

  for (const alert of executiveBriefService.listFounderAlerts().slice(0, 2)) {
    items.push(
      incoming(
        `gov-alert-${alert.id}`,
        "executive_brief",
        alert.title,
        alert.simpleExplanation,
        alert.priority.score + 15,
      ),
    );
  }

  const questions = prepareFounderExecutiveQuestions();
  if (questions[0]) {
    items.push(
      incoming(
        `gov-q-${questions[0].id}`,
        "executive_questions",
        questions[0].question,
        questions[0].category,
        72,
      ),
    );
  }

  const memory = getFounderInstitutionalMemoryBundle(missionId);
  if (memory.lessons[0]) {
    items.push(
      incoming(
        `gov-mem-${memory.lessons[0].id}`,
        "institutional_memory",
        memory.lessons[0].title,
        memory.lessons[0].description,
        58,
      ),
    );
  }

  const graph = intelligenceGraphService.missionView(missionId);
  const graphNodes =
    graph.research.length +
    graph.decisions.length +
    graph.lessons.length +
    (graph.missionNode ? 1 : 0);
  if (graphNodes > 0) {
    items.push(
      incoming(
        `gov-graph-${missionId}`,
        "intelligence_graph",
        "Connected intelligence graph",
        `${graphNodes} linked nodes for this mission.`,
        55 + Math.min(20, graphNodes),
      ),
    );
  }

  const execution = prepareMissionExecution(missionId);
  if (execution?.initiative) {
    items.push(
      incoming(
        `gov-orch-${execution.initiative.id}`,
        "executive_orchestrator",
        execution.initiative.title,
        execution.initiative.purpose,
        82,
      ),
    );
  }

  const today = composeToday({ missionId });
  items.push(
    incoming(
      "gov-flame-morning",
      "flame",
      "FLAME morning guidance",
      today.morning.calmClose,
      68,
    ),
  );

  items.push(
    incoming(
      "gov-spark-orient",
      "spark",
      "SPARK orientation",
      today.morning.greeting,
      65,
    ),
  );

  for (const calm of filterForToday(missionId).slice(0, 2)) {
    if (!items.some((i) => i.id === calm.id)) {
      items.push(
        incoming(calm.id, "calm_intelligence", calm.title, calm.summary, calm.neededToday ? 78 : 45),
      );
    }
  }

  const deduped = new Map<string, IncomingRecommendation>();
  for (const item of items.sort((a, b) => b.leverageScore - a.leverageScore)) {
    const key = `${item.source}:${item.title.slice(0, 40)}`;
    if (!deduped.has(key)) deduped.set(key, item);
  }

  return [...deduped.values()].sort((a, b) => b.leverageScore - a.leverageScore);
}

export { SOURCE_LABELS };
