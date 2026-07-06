import type {
  AdvisoryCouncilFilter,
  AdvisoryDiscussionTopicId,
  AdvisoryMember,
  AdvisoryMemberId,
  AdvisoryPerspective,
  BoardConsensus,
  BoardDiscussion,
  ComposedBoardDiscussion,
} from "../types";
import {
  getBoardMemberDefinition,
  listBoardMemberDefinitions,
} from "../members/boardMembers";
import { advisorySampleRepository } from "../repositories/sample";
import {
  listAdvisoryRelationships,
  relationshipsForRef,
  relationshipsForTopic,
} from "../relationships/advisoryRelationships";
import {
  boardComposition,
  listDiscussionsByMission,
  resolveTopicForMission,
} from "../perspectives/perspectiveCatalog";
import { composeConsensus } from "../reasoning/consensusComposer";
import {
  composeBoardDiscussion,
  getPerspective,
  listOpenQuestions,
} from "../reasoning/discussionComposer";

export class AdvisoryCouncilService {
  listBoardMembers(): AdvisoryMember[] {
    return listBoardMemberDefinitions();
  }

  getBoardMember(id: AdvisoryMemberId): AdvisoryMember | null {
    return getBoardMemberDefinition(id) ?? null;
  }

  listDiscussions(filter?: AdvisoryCouncilFilter): BoardDiscussion[] {
    let discussions = advisorySampleRepository.listDiscussions();
    if (filter?.topicId) {
      discussions = discussions.filter((d) => d.topicId === filter.topicId);
    }
    if (filter?.missionId) {
      discussions = discussions.filter((d) => d.missionIds.includes(filter.missionId!));
    }
    if (filter?.memberId) {
      discussions = discussions.filter((d) =>
        d.perspectives.some((p) => p.memberId === filter.memberId),
      );
    }
    return discussions;
  }

  getDiscussion(topicId: AdvisoryDiscussionTopicId): BoardDiscussion | null {
    return advisorySampleRepository.getDiscussion(topicId) ?? null;
  }

  getPerspective(
    topicId: AdvisoryDiscussionTopicId,
    memberId: AdvisoryMemberId,
  ): AdvisoryPerspective | null {
    return getPerspective(topicId, memberId);
  }

  composeBoardDiscussion(
    topicId: AdvisoryDiscussionTopicId,
  ): ComposedBoardDiscussion | null {
    return composeBoardDiscussion(topicId);
  }

  composeConsensus(topicId: AdvisoryDiscussionTopicId): BoardConsensus | null {
    const discussion = this.getDiscussion(topicId);
    if (!discussion) return null;
    return composeConsensus(discussion);
  }

  listOpenQuestions(topicId?: AdvisoryDiscussionTopicId): string[] {
    return listOpenQuestions(topicId);
  }

  boardComposition(): AdvisoryMember[] {
    return boardComposition();
  }

  listDiscussionsForMission(missionId: string): BoardDiscussion[] {
    return listDiscussionsByMission(missionId);
  }

  resolveTopicForMission(missionId: string): AdvisoryDiscussionTopicId | null {
    return resolveTopicForMission(missionId);
  }

  listRelationships() {
    return listAdvisoryRelationships();
  }

  relationshipsForTopic(topicId: AdvisoryDiscussionTopicId) {
    return relationshipsForTopic(topicId);
  }

  relationshipsForRef(kind: string, refId: string) {
    return relationshipsForRef(kind, refId);
  }
}

export const advisoryCouncilService = new AdvisoryCouncilService();

export function listBoardMembers(): AdvisoryMember[] {
  return advisoryCouncilService.listBoardMembers();
}

export function getBoardMember(id: AdvisoryMemberId): AdvisoryMember | null {
  return advisoryCouncilService.getBoardMember(id);
}

export function getPerspectivePublic(
  topicId: AdvisoryDiscussionTopicId,
  memberId: AdvisoryMemberId,
): AdvisoryPerspective | null {
  return advisoryCouncilService.getPerspective(topicId, memberId);
}

export { getPerspectivePublic as getPerspective };

export function composeBoardDiscussionPublic(
  topicId: AdvisoryDiscussionTopicId,
): ComposedBoardDiscussion | null {
  return advisoryCouncilService.composeBoardDiscussion(topicId);
}

export { composeBoardDiscussionPublic as composeBoardDiscussion };

export function composeConsensusPublic(
  topicId: AdvisoryDiscussionTopicId,
): BoardConsensus | null {
  return advisoryCouncilService.composeConsensus(topicId);
}

export { composeConsensusPublic as composeConsensus };

export function listOpenQuestionsPublic(topicId?: AdvisoryDiscussionTopicId): string[] {
  return advisoryCouncilService.listOpenQuestions(topicId);
}

export { listOpenQuestionsPublic as listOpenQuestions };
