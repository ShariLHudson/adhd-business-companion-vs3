/**
 * Unified project files — merges documentMetadataStore + projectExecutionLinks.
 */

import { getProjects } from "./companionStore";
import {
  listDocumentMetadata,
  listDocumentsForProject,
  type DocumentMetadata,
} from "./documentMetadataStore";
import {
  listAllProjectExecutionLinks,
  listProjectExecutionLinks,
  type ProjectExecutionLink,
} from "./projectExecutionLinks";
import { listProjectLinks, type ProjectLink } from "./projectLinks";
import {
  listProjectAssetFiles,
  type ProjectAssetFile,
  projectAssetFileKindLabel,
} from "./projectAssets";

export type ProjectFileCategory =
  | "documents"
  | "spreadsheets"
  | "forms"
  | "images"
  | "pdfs"
  | "exports"
  | "links";

export type UnifiedProjectFile = {
  id: string;
  projectId: string;
  projectName?: string;
  category: ProjectFileCategory;
  title: string;
  source: string;
  url?: string;
  createdAt: string;
  icon: string;
};

const CATEGORY_META: Record<
  ProjectFileCategory,
  { label: string; icon: string }
> = {
  documents: { label: "Documents", icon: "📄" },
  spreadsheets: { label: "Spreadsheets", icon: "📊" },
  forms: { label: "Forms", icon: "📋" },
  images: { label: "Images", icon: "🖼️" },
  pdfs: { label: "PDFs", icon: "📕" },
  exports: { label: "Other Exports", icon: "📦" },
  links: { label: "Links", icon: "🔗" },
};

export function projectFileCategoryLabel(category: ProjectFileCategory): string {
  return CATEGORY_META[category].label;
}

function categoryFromGoogleKind(
  kind?: string,
  title?: string,
  type?: string,
): ProjectFileCategory {
  if (kind === "sheet") return "spreadsheets";
  if (kind === "form") return "forms";
  const blob = `${title ?? ""} ${type ?? ""}`.toLowerCase();
  if (/\bpng\b|image|infographic/.test(blob)) return "images";
  if (/\bpdf\b/.test(blob)) return "pdfs";
  return "documents";
}

function categoryFromExecutionLink(
  kind: ProjectExecutionLink["kind"],
  label: string,
): ProjectFileCategory {
  if (kind === "sheet") return "spreadsheets";
  if (kind === "form") return "forms";
  if (kind === "export") {
    if (/\.pdf|pdf/i.test(label)) return "pdfs";
    if (/\.png|png|image/i.test(label)) return "images";
    return "exports";
  }
  return "documents";
}

function fromMetadata(doc: DocumentMetadata): UnifiedProjectFile {
  const category = categoryFromGoogleKind(
    doc.googleKind,
    doc.title,
    doc.type,
  );
  return {
    id: `meta:${doc.id}`,
    projectId: doc.projectId ?? "",
    projectName: doc.projectName,
    category,
    title: doc.title,
    source: doc.googleUrl ? "Google export" : "Document",
    url: doc.googleUrl,
    createdAt: doc.createdAt,
    icon: CATEGORY_META[category].icon,
  };
}

function fromExecutionLink(link: ProjectExecutionLink): UnifiedProjectFile {
  const category = categoryFromExecutionLink(link.kind, link.label);
  return {
    id: `exec:${link.id}`,
    projectId: link.projectId,
    category,
    title: link.label,
    source: "Execution export",
    url: link.url,
    createdAt: link.createdAt,
    icon: CATEGORY_META[category].icon,
  };
}

function fromUploadedFile(file: ProjectAssetFile): UnifiedProjectFile {
  const category: ProjectFileCategory =
    file.kind === "pdf"
      ? "pdfs"
      : file.kind === "image"
        ? "images"
        : file.kind === "xlsx" || file.kind === "csv"
          ? "spreadsheets"
          : "documents";
  return {
    id: `upload:${file.id}`,
    projectId: file.projectId,
    category,
    title: file.name,
    source: `Uploaded ${projectAssetFileKindLabel(file.kind)}`,
    url: file.dataUrl,
    createdAt: file.createdAt,
    icon: CATEGORY_META[category].icon,
  };
}
function fromProjectLink(link: ProjectLink): UnifiedProjectFile {
  return {
    id: `link:${link.id}`,
    projectId: link.projectId,
    category: "links",
    title: link.label,
    source: "Manual link",
    url: link.url,
    createdAt: link.createdAt,
    icon: CATEGORY_META.links.icon,
  };
}

export function listUnifiedProjectFiles(projectId: string): UnifiedProjectFile[] {
  const seen = new Set<string>();
  const out: UnifiedProjectFile[] = [];

  function add(file: UnifiedProjectFile) {
    const key = file.url?.toLowerCase().trim() || file.id;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(file);
  }

  for (const doc of listDocumentsForProject(projectId)) add(fromMetadata(doc));
  for (const link of listProjectExecutionLinks(projectId)) {
    add(fromExecutionLink(link));
  }
  for (const uploaded of listProjectAssetFiles(projectId)) {
    add(fromUploadedFile(uploaded));
  }
  for (const link of listProjectLinks(projectId)) add(fromProjectLink(link));

  return out.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/** All files across projects + orphan metadata — deduped by URL. */
export function listAllUnifiedFiles(): UnifiedProjectFile[] {
  const seen = new Set<string>();
  const out: UnifiedProjectFile[] = [];
  const projectNames = new Map(
    getProjects().map((p) => [p.id, p.name] as const),
  );

  function add(file: UnifiedProjectFile) {
    const key = file.url?.toLowerCase().trim() || file.id;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(file);
  }

  for (const doc of listDocumentMetadata()) {
    const file = fromMetadata(doc);
    if (file.projectId && !file.projectName) {
      file.projectName = projectNames.get(file.projectId);
    }
    add(file);
  }

  for (const project of getProjects()) {
    for (const file of listUnifiedProjectFiles(project.id)) {
      add({
        ...file,
        projectName: file.projectName ?? project.name,
      });
    }
  }

  for (const link of listAllProjectExecutionLinks()) {
    if (!getProjects().some((p) => p.id === link.projectId)) {
      add(fromExecutionLink(link));
    }
  }

  return out.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function groupUnifiedProjectFiles(
  files: UnifiedProjectFile[],
): Record<ProjectFileCategory, UnifiedProjectFile[]> {
  const groups: Record<ProjectFileCategory, UnifiedProjectFile[]> = {
    documents: [],
    spreadsheets: [],
    forms: [],
    images: [],
    pdfs: [],
    exports: [],
    links: [],
  };
  for (const f of files) {
    groups[f.category].push(f);
  }
  return groups;
}

export const PROJECT_FILES_UPDATED = "project-files-updated";
