import type { FounderWorkspaceData, FounderWorkspaceItem } from "../types";
import type { ProjectLink, ProjectLinkTarget } from "./types";

function newId(): string {
  return `pl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function mentionsProject(
  item: FounderWorkspaceItem,
  project: FounderWorkspaceItem,
): boolean {
  const hay = `${item.title} ${item.description}`.toLowerCase();
  const needle = project.title.toLowerCase().trim();
  if (!needle || needle.length < 3) return false;
  return hay.includes(needle);
}

function integrationLinks(project: FounderWorkspaceItem): ProjectLink[] {
  const links: ProjectLink[] = [];
  const text = `${project.title} ${project.description}`.toLowerCase();
  if (/\b(google doc|google docs|export)\b/.test(text)) {
    links.push({
      id: newId(),
      projectId: project.id,
      targetKind: "google_doc",
      label: "Google Docs export",
    });
  }
  if (/\b(ghl|go high level|supabase|integration)\b/.test(text)) {
    links.push({
      id: newId(),
      projectId: project.id,
      targetKind: "integration",
      label: "Integration noted in project",
    });
  }
  return links;
}

export function inferRelationshipsForProject(
  project: FounderWorkspaceItem,
  data: FounderWorkspaceData,
): ProjectLink[] {
  const links: ProjectLink[] = [];

  for (const experiment of data.experiments) {
    if (mentionsProject(experiment, project)) {
      links.push({
        id: newId(),
        projectId: project.id,
        targetKind: "experiment",
        targetId: experiment.id,
        label: experiment.title,
      });
    }
  }

  for (const note of data.notes) {
    if (mentionsProject(note, project)) {
      links.push({
        id: newId(),
        projectId: project.id,
        targetKind: "note",
        targetId: note.id,
        label: note.title,
      });
    }
  }

  links.push(...integrationLinks(project));
  return links;
}

export function syncRelationshipsFromWorkspace(
  links: ProjectLink[],
  data: FounderWorkspaceData,
): ProjectLink[] {
  const manual = links.filter((l) => l.targetKind === "google_doc" && l.url);
  const inferred: ProjectLink[] = [];

  for (const project of data.projects) {
    inferred.push(...inferRelationshipsForProject(project, data));
  }

  const deduped = new Map<string, ProjectLink>();
  for (const link of [...inferred, ...manual]) {
    const key = `${link.projectId}:${link.targetKind}:${link.targetId ?? link.label}`;
    if (!deduped.has(key)) deduped.set(key, link);
  }
  return Array.from(deduped.values());
}

export function getLinksForProject(
  links: ProjectLink[],
  projectId: string,
): ProjectLink[] {
  return links.filter((l) => l.projectId === projectId);
}

export function linkTargetLabel(kind: ProjectLinkTarget): string {
  const labels: Record<ProjectLinkTarget, string> = {
    experiment: "Experiment",
    note: "Note",
    google_doc: "Google Doc",
    issue: "Issue",
    integration: "Integration",
  };
  return labels[kind];
}
