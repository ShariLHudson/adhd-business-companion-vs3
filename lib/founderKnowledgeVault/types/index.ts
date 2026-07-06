/** Founder Knowledge Vault™ — executive archive for master documents and prompts. */

export type KnowledgeVaultCategoryId =
  | "constitutions"
  | "blueprints"
  | "cursor-rules"
  | "master-prompts"
  | "founder-prompts"
  | "companion-prompts"
  | "postcraft-prompts"
  | "gohighlevel-prompts"
  | "image-prompts"
  | "estate-design-prompts"
  | "launch-prompts"
  | "research-prompts"
  | "recovery-handoff"
  | "how-to-rebuild"
  | "archive";

export type KnowledgeVaultItemStatus = "active" | "reference" | "archive" | "draft";

export type KnowledgeVaultItem = {
  id: string;
  title: string;
  categoryId: KnowledgeVaultCategoryId;
  purpose: string;
  lastUpdated: string;
  status: KnowledgeVaultItemStatus;
  documentPath: string;
  promptExcerpt?: string;
  notes?: string;
};

export type KnowledgeVaultSection = {
  id: KnowledgeVaultCategoryId;
  label: string;
  purpose: string;
  items: KnowledgeVaultItem[];
};

export type KnowledgeVaultView = {
  product: "founder";
  generatedAt: string;
  headline: string;
  summary: string;
  sections: KnowledgeVaultSection[];
};
