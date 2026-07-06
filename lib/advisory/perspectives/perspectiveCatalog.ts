import type {
  AdvisoryDiscussionTopicId,
  AdvisoryMember,
  AdvisoryMemberId,
  AdvisoryPerspective,
  BoardDiscussion,
} from "../types";
import { MISSION_TOPIC_MAP } from "../sample";
import { advisorySampleRepository } from "../repositories/sample";

export function perspectivesForDiscussion(
  discussion: BoardDiscussion,
): AdvisoryPerspective[] {
  return discussion.perspectives;
}

export function membersWithPerspectives(
  discussion: BoardDiscussion,
): AdvisoryMemberId[] {
  return discussion.perspectives.map((p) => p.memberId);
}

export function boardComposition(): AdvisoryMember[] {
  return advisorySampleRepository.listMembers();
}

export function discussionForMission(missionId: string): BoardDiscussion | null {
  const match = advisorySampleRepository
    .listDiscussions()
    .find((d) => d.missionIds.includes(missionId));
  return match ?? null;
}

export function listDiscussionsByMission(missionId: string): BoardDiscussion[] {
  return advisorySampleRepository
    .listDiscussions()
    .filter((d) => d.missionIds.includes(missionId));
}

export function resolveTopicForMission(missionId: string): AdvisoryDiscussionTopicId | null {
  return MISSION_TOPIC_MAP[missionId] ?? null;
}
