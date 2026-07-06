/**
 * Founder bridge — Executive Brief Experience without UI wiring.
 */
import {
  executiveBriefService,
  getExecutiveBrief,
  type ExecutiveBrief,
} from "@/lib/founder/executiveBrief";

import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";

export function prepareFounderExecutiveBrief(
  missionId: string = DEFAULT_ACTIVE_MISSION_ID,
): ExecutiveBrief {
  return getExecutiveBrief({ missionId });
}

export function prepareFounderExecutiveBriefFull(): ExecutiveBrief {
  return executiveBriefService.getBrief();
}

export function prepareFounderExecutiveBriefBundle(missionId: string = DEFAULT_ACTIVE_MISSION_ID) {
  const brief = prepareFounderExecutiveBriefFull();
  return {
    product: "founder" as const,
    brief,
    missionBrief: getExecutiveBrief({ missionId }),
    founderAlerts: executiveBriefService.listFounderAlerts(),
    advisorSection: executiveBriefService.getAdvisorSection(),
    readability: executiveBriefService.readabilityReport(brief),
  };
}
