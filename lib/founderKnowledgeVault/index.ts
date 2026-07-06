export type {
  DocumentAuthorityLevel,
  KnowledgeVaultCategoryId,
  KnowledgeVaultItem,
  KnowledgeVaultItemStatus,
  KnowledgeVaultSection,
  KnowledgeVaultView,
} from "./types";

export {
  DOCUMENT_LAYER_HEADLINE,
  DOCUMENT_LAYER_SUMMARY,
  DOCUMENT_LAYERS,
} from "./documentLayers";
export type { DocumentLayerId } from "./documentLayers";

export {
  ALL_KNOWLEDGE_VAULT_ITEMS,
  KNOWLEDGE_VAULT_HEADLINE,
  KNOWLEDGE_VAULT_SECTIONS,
  KNOWLEDGE_VAULT_SUMMARY,
} from "./sample/vaultData";

export { composeKnowledgeVaultView } from "./services/knowledgeVaultService";
