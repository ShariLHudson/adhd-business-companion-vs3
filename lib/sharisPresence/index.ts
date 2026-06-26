export {
  evaluateSharisPresence,
  applySharisPresenceToEngine,
  sharisPresenceHintForChat,
} from "./evaluateSharisPresence";
export {
  EVIDENCE_BY_STATE,
  NEARBY_EVIDENCE,
  RETURNING_EVIDENCE,
  BESIDE_YOU_EVIDENCE,
  STATE_HOST_LINES,
} from "./evidenceCatalog";
export {
  presenceStateForPlace,
  ROOM_PRESENCE_ASSIGNMENTS,
  SECTION_TO_PLACE_FOR_PRESENCE,
  EXPERIENCE_TO_PLACE,
} from "./roomAssignments";
export {
  communicationAnchorPrimaryForState,
  conversationPrimaryForState,
  evidenceAllowedForState,
  GUEST_NEVER_FEELS_WATCHED,
  shariImageAllowedForState,
} from "./rules";
export type {
  ShariPresenceState,
  SharisPresenceInput,
  SharisPresenceVerdict,
} from "./types";
export {
  SHARI_PRESENCE_STATES,
  SHARIS_PRESENCE_GOAL,
  SHARIS_PRESENCE_PRINCIPLE,
} from "./types";
