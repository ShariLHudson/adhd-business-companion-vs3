import { composeKnowledgeVaultView } from "@/lib/founderKnowledgeVault";

export { composeKnowledgeVaultView };

export function getKnowledgeVaultBootstrap() {
  return composeKnowledgeVaultView();
}
