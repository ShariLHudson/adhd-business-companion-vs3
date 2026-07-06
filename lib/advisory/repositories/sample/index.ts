import type { AdvisoryDiscussionTopicId, AdvisoryMemberId } from "../../types";
import { listBoardMemberDefinitions } from "../../members/boardMembers";
import {
  getSampleDiscussion,
  getSamplePerspective,
  listSampleDiscussions,
  SAMPLE_ADVISORY_RELATIONSHIPS,
} from "../../sample";

export const advisorySampleRepository = {
  listMembers: () => listBoardMemberDefinitions(),
  listDiscussions: () => listSampleDiscussions(),
  getDiscussion: (topicId: AdvisoryDiscussionTopicId) => getSampleDiscussion(topicId),
  getPerspective: (topicId: AdvisoryDiscussionTopicId, memberId: AdvisoryMemberId) =>
    getSamplePerspective(topicId, memberId),
  listRelationships: () => [...SAMPLE_ADVISORY_RELATIONSHIPS],
};

export type AdvisorySampleRepository = typeof advisorySampleRepository;
