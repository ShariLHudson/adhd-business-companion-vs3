import type { AttentionItem } from "../types";
import { classifyAttention } from "../attention/attentionModel";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import type { MissionId } from "@/lib/founder/missions/types";
import { executiveDecisionService } from "@/lib/executiveDecision";
import { opportunityDiscoveryService } from "@/lib/opportunities";
import { executiveOrchestratorService } from "@/lib/orchestrator";
import { getFounderExecutiveQuestionsBundle } from "@/lib/founder/services/executiveQuestionsBridge";

export function buildAttentionItems(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID): AttentionItem[] {
  const items: AttentionItem[] = [];

  const decision = executiveDecisionService.get("ed-voice-companion");
  if (decision) {
    items.push(
      classifyAttention({
        id: `att-${decision.id}`,
        title: decision.title,
        summary: decision.recommendation?.headline ?? decision.question,
        level: "now",
        source: "executive_decision",
        missionId,
        estimatedMinutes: 20,
      }),
    );
  }

  const questions = getFounderExecutiveQuestionsBundle({ product: "founder", missionId });
  for (const q of questions.todaysQuestions.slice(0, 2)) {
    items.push(
      classifyAttention({
        id: `att-q-${q.id}`,
        title: q.title,
        summary: q.purpose,
        level: "next",
        source: "executive_questions",
        missionId,
      }),
    );
  }

  for (const opp of opportunityDiscoveryService.discover({ missionId }).slice(0, 3)) {
    items.push(
      classifyAttention({
        id: `att-opp-${opp.id}`,
        title: opp.title,
        summary: opp.summary,
        level: "watch",
        source: "opportunity_discovery",
        missionId,
        ignoreAction: "ignore_today",
      }),
    );
  }

  for (const init of executiveOrchestratorService.sampleRepository().forMission(missionId)) {
    if (init.status === "awaiting_approval") {
      items.push(
        classifyAttention({
          id: `att-init-${init.id}`,
          title: init.title,
          summary: "Prepared — awaiting your approval.",
          level: "now",
          source: "executive_orchestrator",
          missionId,
        }),
      );
    }
  }

  items.push(
    classifyAttention({
      id: "att-library-research",
      title: "ADHD Restart Research Archive",
      summary: "Reference — already synthesized in Institutional Memory.",
      level: "library",
      source: "institutional_memory",
      missionId,
      ignoreAction: "archive",
    }),
  );

  return items;
}
