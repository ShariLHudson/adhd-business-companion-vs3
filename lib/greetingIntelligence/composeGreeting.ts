/**
 * @deprecated Use @/lib/shariVoiceBible — all greeting composition lives in the Voice Bible™.
 */
export {
  composeBibleGreeting as composeGreeting,
  composeBibleReconnectionQuestion as composeReconnectionQuestion,
  composeBibleChatPlaceholder as composeChatPlaceholder,
  composeBibleEcho as composeRelationshipEcho,
  composeBibleClarify as composeClarifyQuestion,
  composeBibleSoftPresence as composeSoftPresenceEcho,
  composeBibleEcho as composeContinuityEcho,
  violatesShariVoice as containsBannedPhrase,
  assertShariVoice as assertHomeVoice,
} from "@/lib/shariVoiceBible";
