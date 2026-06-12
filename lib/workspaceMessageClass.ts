// Re-exports — use workspaceIntent.ts for the full 10-type classifier.

export {
  classifyWorkspaceMessage,
  classifyWorkspaceIntent,
  isProjectContent,
  isFieldContentIntent,
  isHelpRequest,
  isClarificationRequest,
  isKnowledgeQuestion,
  extractProjectQuery,
  type WorkspaceMessageClass,
  type WorkspaceIntent,
  type ClassifiedWorkspaceIntent,
} from "./workspaceIntent";

export type WorkspaceMessageKind = import("./workspaceIntent").WorkspaceMessageClass;
