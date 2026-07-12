export type {
  DirectorDecisionInviteRule,
  DirectorDiscussionAffinity,
  DirectorRelationshipEdge,
  DirectorRelationshipKind,
  DirectorRelationshipProfile,
  DirectorRelationshipRecommendation,
  RecommendDirectorsFromRelationshipsInput,
  RecommendDirectorsFromRelationshipsResult,
} from "@/lib/board/relationships/types";

export type {
  BoardDirectorMetadata,
  BoardDiscussionSupportSnapshot,
} from "@/lib/board/relationships/directorMetadata";

export {
  DIRECTOR_RELATIONSHIP_PROFILES,
  buildLegacyRelationshipSuggestionMap,
  getDirectorRelationshipProfile,
  listDirectorRelationshipEdges,
  listDirectorRelationshipProfiles,
} from "@/lib/board/relationships/directorRelationshipRegistry";

export {
  getDirectRecommendationsForDirector,
  recommendDirectorsFromRelationships,
} from "@/lib/board/relationships/recommendFromRelationships";

export {
  buildBoardDiscussionSupportSnapshot,
  getBoardDirectorMetadata,
  listBoardDirectorMetadata,
} from "@/lib/board/relationships/directorMetadata";
