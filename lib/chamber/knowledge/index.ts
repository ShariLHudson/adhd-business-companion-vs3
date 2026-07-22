export type {
  ChamberKnowledgeDocRef,
  ChamberKnowledgeDocStatus,
  ChamberKnowledgeLibraryStatus,
  ChamberKnowledgePack,
  ChamberKnowledgeRetrievalSlice,
  ChamberKnowledgeRuntimeContract,
  ChamberKnowledgeWiringStatus,
  LoadChamberKnowledgeOptions,
} from "./types";

export {
  getChamberKnowledgePack,
  isChamberKnowledgeWired,
  listChamberKnowledgePacks,
  listWiredChamberKnowledgeMemberIds,
} from "./chamberKnowledgeRegistry";

export {
  CLIENT_RELATIONSHIPS_DOCS,
  CLIENT_RELATIONSHIPS_DOCS_ROOT,
  CLIENT_RELATIONSHIPS_LIBRARY_VERSION,
  CLIENT_RELATIONSHIPS_RUNTIME_CONTRACT,
  clientRelationshipsRolesForHint,
} from "./clientRelationshipsContracts";

export {
  KNOWLEDGE_MANAGEMENT_DOCS,
  KNOWLEDGE_MANAGEMENT_DOCS_ROOT,
  KNOWLEDGE_MANAGEMENT_EXCLUDED_ROLES,
  KNOWLEDGE_MANAGEMENT_LIBRARY_VERSION,
  KNOWLEDGE_MANAGEMENT_MEMBER_ID,
  KNOWLEDGE_MANAGEMENT_RUNTIME_CONTRACT,
  knowledgeManagementRolesForHint,
  knowledgeManagementSelectPaths,
} from "./knowledgeManagementContracts";

export {
  chamberKnowledgeShouldAugmentChat,
  loadChamberKnowledge,
} from "./loadChamberKnowledge";

export {
  chamberKnowledgeHintForChat,
  formatChamberKnowledgePromptBlock,
} from "./chamberKnowledgePromptBlock";

/**
 * Node/fs verification lives in ./verifyChamberKnowledgePaths and must NOT be
 * re-exported here — importing it from this barrel pulls `node:fs` into the
 * companion client bundle (UnhandledSchemeError).
 */
