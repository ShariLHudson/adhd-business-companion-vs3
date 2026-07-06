/** Founder Knowledge Vault™ — executive archive for master documents and prompts. */

export type DocumentAuthorityLevel =
  | "constitution"
  | "blueprint"
  | "operating-manual"
  | "prompt"
  | "reference"
  | "archive";

export type KnowledgeVaultCategoryId =
  | "constitutions"
  | "blueprints"
  | "operating-manuals"
  | "master-prompts"
  | "cursor-rules"
  | "recovery-guides"
  | "architecture"
  | "research"
  | "estate"
  | "images"
  | "audio"
  | "launches"
  | "business-systems"
  | "archive"
  | "founder-prompts"
  | "companion-prompts"
  | "postcraft-prompts"
  | "gohighlevel-prompts"
  | "image-prompts"
  | "estate-design-prompts"
  | "launch-prompts"
  | "research-prompts"
  | "recovery-handoff"
  | "how-to-rebuild";

export type KnowledgeVaultItemStatus = "active" | "reference" | "archive" | "draft";

export type KnowledgeVaultItem = {
  id: string;
  title: string;
  categoryId: KnowledgeVaultCategoryId;
  purpose: string;
  authorityLevel: DocumentAuthorityLevel;
  relatedSystems: readonly string[];
  lastUpdated: string;
  status: KnowledgeVaultItemStatus;
  documentPath: string;
  googleDrivePath?: string;
  inNotebookLmLibrary?: boolean;
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
