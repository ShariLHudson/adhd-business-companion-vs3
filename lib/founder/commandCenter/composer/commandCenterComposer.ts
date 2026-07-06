import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { missionService } from "@/lib/founder/missions";
import type { MissionId } from "@/lib/founder/missions/types";
import { executiveDecisionService } from "@/lib/executiveDecision";
import type {
  AttentionView,
  CommandCenterContext,
  CommandCenterView,
  FocusView,
  LeverageView,
  TodayView,
} from "../types";
import { buildAttentionItems } from "../recommendations/attentionItems";
import { groupByAttentionLevel, recommendIgnore } from "../attention/attentionModel";
import { calculateFocusScore } from "../attention/focusScore";
import { suggestEnergyProfile } from "../attention/energyAwareness";
import { detectExecutiveFriction } from "../attention/frictionTracking";
import { composeExecutiveDesk } from "./deskComposer";
import { composeMorningExperience } from "./todayComposer";
import { composeLeverageItems, topLeverageRecommendation } from "./leverageComposer";
import { composeExecutiveContexts } from "../contexts/contextComposer";

const SOURCES = [
  "executive_brief",
  "mission_workspace",
  "executive_questions",
  "executive_decision",
  "institutional_memory",
  "opportunity_discovery",
  "concierge",
  "flame",
  "fire",
  "intelligence_graph",
  "executive_orchestrator",
  "overnight_cycle",
  "spark",
];

export { composeExecutiveDesk };

export function composeAttention(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID): AttentionView {
  const items = buildAttentionItems(missionId);
  return {
    items,
    byLevel: groupByAttentionLevel(items),
    ignore: recommendIgnore(items),
  };
}

export function composeFocus(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID): FocusView {
  const attention = composeAttention(missionId);
  const openMissions = missionService.listMissions().filter((m) => m.status === "active").length;
  const openDecisions = executiveDecisionService.list().length;
  const focus = calculateFocusScore(attention.items, openMissions, openDecisions);
  return {
    focus,
    now: attention.byLevel.now,
    next: attention.byLevel.next,
    simplification: focus.simplification,
  };
}

export function composeLeverage(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID): LeverageView {
  const items = composeLeverageItems(missionId);
  return {
    items,
    topRecommendation: topLeverageRecommendation(items),
  };
}

export function composeToday(context: CommandCenterContext = {}): TodayView {
  const missionId = context.missionId ?? DEFAULT_ACTIVE_MISSION_ID;
  const desk = composeExecutiveDesk(missionId);
  const focus = composeFocus(missionId).focus;
  return {
    missionId,
    morning: composeMorningExperience(desk),
    desk,
    focus,
    generatedAt: new Date().toISOString(),
  };
}

export function composeCommandCenter(context: CommandCenterContext = {}): CommandCenterView {
  const missionId = context.missionId ?? DEFAULT_ACTIVE_MISSION_ID;
  composeExecutiveContexts(missionId);

  const today = composeToday(context);
  const attention = composeAttention(missionId);
  const focus = composeFocus(missionId);
  const leverage = composeLeverage(missionId);

  return {
    product: "founder",
    today,
    attention,
    focus,
    leverage,
    desk: today.desk,
    friction: detectExecutiveFriction(),
    energy: suggestEnergyProfile(),
    sources: SOURCES,
  };
}
