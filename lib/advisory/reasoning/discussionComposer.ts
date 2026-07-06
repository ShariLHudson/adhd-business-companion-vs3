import type { BoardDiscussion, ComposedBoardDiscussion } from "../types";
import { getBoardMemberDefinition } from "../members/boardMembers";
import { advisorySampleRepository } from "../repositories/sample";

export function composeBoardDiscussion(
  topicId: BoardDiscussion["topicId"],
): ComposedBoardDiscussion | null {
  const discussion = advisorySampleRepository.getDiscussion(topicId);
  if (!discussion) return null;

  return {
    ...discussion,
    memberCount: advisorySampleRepository.listMembers().length,
    perspectiveCount: discussion.perspectives.length,
  };
}

export function listOpenQuestions(topicId?: BoardDiscussion["topicId"]): string[] {
  if (topicId) {
    const discussion = advisorySampleRepository.getDiscussion(topicId);
    return discussion?.consensus.openQuestions ?? [];
  }

  return advisorySampleRepository
    .listDiscussions()
    .flatMap((d) => d.consensus.openQuestions);
}

export function getPerspective(
  topicId: BoardDiscussion["topicId"],
  memberId: Parameters<typeof advisorySampleRepository.getPerspective>[1],
) {
  const sample = advisorySampleRepository.getPerspective(topicId, memberId);
  if (sample) return sample;

  const member = getBoardMemberDefinition(memberId);
  const discussion = advisorySampleRepository.getDiscussion(topicId);
  if (!member || !discussion) return null;

  return {
    id: `pers-placeholder-${topicId}-${memberId}`,
    topicId,
    memberId,
    memberName: member.name,
    memberRole: member.role,
    opportunities: [],
    concerns: member.primaryConcerns.slice(0, 1),
    questions: member.typicalQuestions.slice(0, 1),
    recommendations: member.sampleRecommendations.slice(0, 1),
    unknowns: ["Perspective not yet authored for this topic."],
    suggestedNextStep: "Add sample perspective when signal warrants.",
    evidenceRefs: [],
    confidence: {
      level: "exploratory" as const,
      score: 40,
      rationale: "Placeholder from member discipline template.",
    },
  };
}
