/**
 * Optional Founder bridge — Advisory Council without UI wiring.
 * Consumes the ecosystem framework; Founder Studio imports this layer later.
 */
import {
  advisoryCouncilService,
  composeBoardDiscussion,
  type ComposedBoardDiscussion,
} from "@/lib/advisory";
import {
  DECISION_TOPIC_MAP,
  MISSION_TOPIC_MAP,
  QUESTION_TOPIC_MAP,
} from "@/lib/advisory/sample";

import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";

export function getMissionBoardDiscussion(
  missionId: string = DEFAULT_ACTIVE_MISSION_ID,
): ComposedBoardDiscussion | null {
  const topicId = MISSION_TOPIC_MAP[missionId];
  if (!topicId) {
    const byMission = advisoryCouncilService.listDiscussionsForMission(missionId);
    const first = byMission[0];
    return first ? composeBoardDiscussion(first.topicId) : null;
  }
  return composeBoardDiscussion(topicId);
}

export function getDecisionBoardDiscussion(decisionId: string): ComposedBoardDiscussion | null {
  const topicId = DECISION_TOPIC_MAP[decisionId];
  if (!topicId) return null;
  return composeBoardDiscussion(topicId);
}

export function getQuestionBoardDiscussion(questionId: string): ComposedBoardDiscussion | null {
  const topicId = QUESTION_TOPIC_MAP[questionId];
  if (!topicId) return null;
  return composeBoardDiscussion(topicId);
}
