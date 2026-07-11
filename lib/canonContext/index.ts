export type {
  CanonCharacterFacts,
  CanonContextPayload,
  CanonEstateFacts,
  CanonRetrievalInput,
  CanonRetrievalResult,
  CanonShariFacts,
  CanonTopic,
} from "./types";

export {
  ESTATE_HISTORY_CANON,
  ESTATE_PHILOSOPHY_CANON,
  KINSEY_CANON_FACTS,
  SHARI_HUDSON_CANON_FACTS,
  SPARK_ESTATE_CANON_FACTS,
} from "./canonIdentity";

export {
  SPARK_ESTATE_CANON_AUTHORITY,
  formatCanonRoomsAnswer,
  getCanonLiveRooms,
} from "./sparkEstateCanonKnowledgeSource";

export { detectCanonTopics, isCanonIdentityQuestion } from "./detectCanonTopics";
export { formatCanonContextBlock } from "./formatCanonContextBlock";
export {
  baselineCanonContext,
  retrieveCanonContext,
} from "./retrieveCanonContext";

export {
  buildCanonContextBlockForChat,
  buildCanonResponseHint,
  tryCanonLocalReply,
} from "./canonContextForChat";
