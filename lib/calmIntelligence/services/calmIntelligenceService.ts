import type { CalmIntelligenceContext, CalmIntelligenceView } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { composeExecutiveDesk, composeToday } from "@/lib/founder/commandCenter";
import { collectCompetingRecommendations } from "@/lib/executiveOS";
import { filterItems } from "../attention/attentionFilter";
import { applyRuleOfOne } from "../focus/ruleOfOne";
import { applyRuleOfThree } from "../focus/ruleOfThree";
import { computeFocusScore } from "../focus/focusScore";
import { buildSimplificationSuggestions } from "../simplification/simplificationEngine";
import { classifyInterruptions } from "../timing/interruptionEngine";
import { composeExecutivePresence } from "../presentation/presenceComposer";
import { CALM_INTELLIGENCE_PRINCIPLE } from "../sample";
import { calmIntelligenceSampleRepository } from "../repositories/sample";

export function composeCalmIntelligence(context: CalmIntelligenceContext = {}): CalmIntelligenceView {
  const missionId = context.missionId ?? DEFAULT_ACTIVE_MISSION_ID;
  const desk = composeExecutiveDesk(missionId);
  const today = composeToday({ missionId });
  const competing = collectCompetingRecommendations(missionId);
  const filtered = filterItems(competing, missionId);
  const visible = filtered.filter((f) => f.passes);
  const hiddenCount = filtered.filter((f) => f.shouldStayHidden).length;

  const ruleOfOne = applyRuleOfOne(missionId);

  const opportunities = applyRuleOfThree(
    desk.topOpportunities.map((o) => ({ id: o.id, title: o.title, summary: o.summary })),
  );

  const waiting = applyRuleOfThree(
    desk.waitingOnOthers.map((w) => ({ id: w.id, label: w.label })),
  );

  const recommendations = applyRuleOfThree(
    visible.slice(0, 6).map((v) => ({ id: v.id, title: v.title, summary: v.summary })),
  );

  const risks = applyRuleOfThree(
    filtered
      .filter((f) => !f.passes && f.canWait)
      .slice(0, 6)
      .map((r) => ({ id: r.id, title: r.title, summary: "Can wait — not needed today." })),
  );

  return {
    product: "founder",
    missionId,
    generatedAt: new Date().toISOString(),
    principle: CALM_INTELLIGENCE_PRINCIPLE,
    presence: composeExecutivePresence(
      today.morning.greeting,
      today.morning.calmClose,
    ),
    focus: computeFocusScore(missionId),
    ruleOfOne,
    opportunities,
    risks,
    waiting,
    recommendations,
    filtered,
    hiddenCount,
    simplification: buildSimplificationSuggestions(missionId),
    interruptions: classifyInterruptions(competing, missionId),
  };
}

export function filterForToday(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return filterItems(collectCompetingRecommendations(missionId), missionId).filter((f) => f.passes);
}

export class CalmIntelligenceService {
  compose(context: CalmIntelligenceContext = {}) {
    return composeCalmIntelligence(context);
  }

  filterToday(missionId?: MissionId) {
    return filterForToday(missionId);
  }

  sampleRepository() {
    return calmIntelligenceSampleRepository;
  }
}

export const calmIntelligenceService = new CalmIntelligenceService();
