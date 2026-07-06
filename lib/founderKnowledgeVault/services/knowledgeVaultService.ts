import {
  KNOWLEDGE_VAULT_HEADLINE,
  KNOWLEDGE_VAULT_SECTIONS,
  KNOWLEDGE_VAULT_SUMMARY,
} from "../sample/vaultData";
import type { KnowledgeVaultView } from "../types";

export function composeKnowledgeVaultView(): KnowledgeVaultView {
  return {
    product: "founder",
    generatedAt: new Date().toISOString(),
    headline: KNOWLEDGE_VAULT_HEADLINE,
    summary: KNOWLEDGE_VAULT_SUMMARY,
    sections: KNOWLEDGE_VAULT_SECTIONS,
  };
}
