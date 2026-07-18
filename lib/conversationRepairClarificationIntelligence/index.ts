/**
 * Conversation Repair & Clarification Intelligence (CRCI).
 * Understanding before exploration — shared across Estate conversations.
 */

export type {
  CrciExperienceId,
  CrciMessage,
  CrciRepairInput,
  CrciRepairResult,
  CrciRepairTrigger,
} from "./types";

export {
  detectMisunderstoodAnswer,
  detectRepairTrigger,
  resolveRepairTrigger,
} from "./triggerDetection";
export {
  buildRepairAssistantText,
  extractThoughtToClarify,
} from "./repairEngine";
export {
  shouldSuppressReflectiveQuestions,
  tryConversationRepair,
} from "./api";
