import type { GovernorContext, GovernorView, IntelligenceSource } from "../types";
import type { MissionId } from "@/lib/founder/missions/types";
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { GOVERNOR_PRINCIPLE, COORDINATED_INTELLIGENCE_SYSTEMS } from "../sample";
import { governorSampleRepository } from "../repositories/sample";
import { collectIncomingRecommendations } from "../routing/intelligenceRouter";
import { dedupeByConflict, resolveConflicts } from "../policies/conflictResolution";
import { prioritizeRecommendations } from "../priorities/priorityEngine";

export function composeGovernor(context: GovernorContext = {}): GovernorView {
  const missionId = context.missionId ?? DEFAULT_ACTIVE_MISSION_ID;
  const incoming = collectIncomingRecommendations(missionId);
  const conflicts = resolveConflicts(incoming);
  const deduped = dedupeByConflict(incoming, conflicts);
  const { primary, supporting, deferredCount, silentCount } = prioritizeRecommendations(deduped);

  return {
    product: "founder",
    missionId,
    generatedAt: new Date().toISOString(),
    principle: GOVERNOR_PRINCIPLE,
    coordinatedSystems: [...COORDINATED_INTELLIGENCE_SYSTEMS] as IntelligenceSource[],
    incoming: deduped,
    deferredCount,
    silentCount,
    primary,
    supporting,
    conflicts,
    attentionProtected: true,
  };
}

export function governorPrimaryRecommendation(missionId: MissionId = DEFAULT_ACTIVE_MISSION_ID) {
  return composeGovernor({ missionId }).primary;
}

export class GovernorService {
  compose(context: GovernorContext = {}) {
    return composeGovernor(context);
  }

  primary(missionId?: MissionId) {
    return governorPrimaryRecommendation(missionId);
  }

  sampleRepository() {
    return governorSampleRepository;
  }
}

export const governorService = new GovernorService();
