/** Three-layer document architecture — Vault · Drive · NotebookLM */

export const DOCUMENT_LAYER_HEADLINE = "Three-Layer Document Architecture";

export const DOCUMENT_LAYER_SUMMARY =
  "Founder Knowledge Vault indexes. Google Drive stores. NotebookLM researches across large collections.";

export const DOCUMENT_LAYERS = [
  {
    id: "vault",
    label: "Founder Knowledge Vault",
    role: "Curated executive view",
    description:
      "The permanent executive archive — constitutions, blueprints, prompts, and recovery guides. Not raw file storage.",
  },
  {
    id: "drive",
    label: "Google Drive",
    role: "Master file storage",
    description:
      "Original Word, PDF, Docs, images, and workshop files. The authoritative file location behind the vault index.",
  },
  {
    id: "notebooklm",
    label: "NotebookLM",
    role: "Research assistant",
    description:
      "AI synthesis across large document libraries. Reads Drive — does not replace vault or storage.",
  },
] as const;

export type DocumentLayerId = (typeof DOCUMENT_LAYERS)[number]["id"];
