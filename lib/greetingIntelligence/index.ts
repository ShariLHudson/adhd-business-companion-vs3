/**
 * @deprecated All companion copy lives in @/lib/shariVoiceBible — re-export for compatibility.
 */
export {
  evaluateGreetingIntelligence,
  composeRelationshipEcho,
  composeClarifyQuestion,
  composeSoftPresenceEcho,
  composeLivingRoomOpening,
} from "./evaluateGreetingIntelligence";

export {
  composeBibleGreeting as composeGreeting,
  composeBibleReconnectionQuestion as composeReconnectionQuestion,
  composeBibleChatPlaceholder as composeChatPlaceholder,
  composeBibleEcho as composeContinuityEcho,
  violatesShariVoice as containsBannedPhrase,
} from "@/lib/shariVoiceBible";

export type {
  GreetingIntelligence,
  GreetingIntelligenceInput,
  GreetingSeason,
  RelationshipEchoInput,
} from "./types";
