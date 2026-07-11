import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import type { MissionId } from "@/lib/founder/missions/types";
import { getFounderSparkOverview } from "@/lib/founder/services/sparkBridge";
import { getFounderInstitutionalMemoryBundle } from "@/lib/founder/services/institutionalMemoryBridge";
import { getFounderIntelligenceGraphBundle } from "@/lib/founder/services/intelligenceGraphBridge";
import { prepareFounderOvernightBundle } from "@/lib/founder/services/overnightExecutiveCycleBridge";
import { getFounderExecutiveQuestionsBundle } from "@/lib/founder/services/executiveQuestionsBridge";
import { getFlameMentorOverview } from "@/lib/founder/flame/services/flameService";
import { getFireExecutivePortfolio } from "@/lib/founder/briefs/firePortfolio";
import { ExecutiveConciergeService } from "@/lib/founder/concierge/services/conciergeService";

export function composeExecutiveContexts(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return {
    missionId,
    overnight: prepareFounderOvernightBundle(missionId),
    questions: getFounderExecutiveQuestionsBundle({ product: "founder", missionId }),
    spark: getFounderSparkOverview(),
    flame: getFlameMentorOverview(),
    fire: getFireExecutivePortfolio(),
    concierge: ExecutiveConciergeService.prepareOffice(),
    memory: getFounderInstitutionalMemoryBundle(missionId),
    graph: getFounderIntelligenceGraphBundle(missionId),
    predictive: null as null,
    note: "Predictive Intelligence hook reserved — not duplicated here.",
  };
}

export type ComposedExecutiveContexts = ReturnType<typeof composeExecutiveContexts>;
