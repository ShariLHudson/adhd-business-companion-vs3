/** Spark Master Library — permanent index of all important Spark knowledge. */

export type MasterLibraryCategoryId =
  | "founder"
  | "spark-companion"
  | "postcraft"
  | "gohighlevel"
  | "estate"
  | "research"
  | "development"
  | "marketing"
  | "business"
  | "ai"
  | "design"
  | "audio"
  | "images"
  | "workshops"
  | "courses"
  | "constitutions"
  | "blueprints"
  | "operating-manuals"
  | "recovery-guides"
  | "master-prompt-library";

export type MasterLibraryAuthority =
  | "constitution"
  | "blueprint"
  | "operating-manual"
  | "prompt"
  | "reference"
  | "archive";

export type MasterLibraryItem = {
  id: string;
  name: string;
  purpose: string;
  categoryId: MasterLibraryCategoryId;
  authority: MasterLibraryAuthority;
  location: string;
  inNotebookLmLibrary: boolean;
  relatedSystems: readonly string[];
  owner: string;
  lastUpdated: string;
};

export type MasterLibraryCategory = {
  id: MasterLibraryCategoryId;
  label: string;
  purpose: string;
  items: readonly MasterLibraryItem[];
};

export type MasterLibraryView = {
  product: "founder";
  generatedAt: string;
  headline: string;
  summary: string;
  categories: readonly MasterLibraryCategory[];
  totalItems: number;
};
