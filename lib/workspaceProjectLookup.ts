// Search stored projects by title — open exact match, never save questions into fields.

import { getProjects, type Project } from "./companionStore";
import {
  createWorkspaceSession,
  type WorkspaceSession,
} from "./workspaceSop";
import { normalizeSession, syncSessionProjectMeta } from "./workspaceSessionStore";

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2);
}

export function scoreProjectMatch(project: Project, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const name = project.name.toLowerCase();
  if (name === q) return 100;
  if (name.includes(q) || q.includes(name)) return 85;
  const qTokens = tokenize(q);
  const nTokens = tokenize(name);
  if (!qTokens.length) return 0;
  const overlap = qTokens.filter((t) =>
    nTokens.some((n) => n.includes(t) || t.includes(n)),
  ).length;
  return overlap > 0 ? overlap * 25 : 0;
}

export function searchProjects(query: string, limit = 5): Project[] {
  const projects = getProjects();
  const q = query.trim();
  if (!q) return projects.slice(0, limit);
  return projects
    .map((p) => ({ p, score: scoreProjectMatch(p, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

export function findSimilarProjects(title: string, minScore = 50): Project[] {
  return searchProjects(title).filter(
    (p) => scoreProjectMatch(p, title) >= minScore,
  );
}

export function buildSessionFromProject(
  project: Project,
  energy: "low" | "medium" | "high" = "medium",
): WorkspaceSession {
  const base = createWorkspaceSession("projects", project.name, energy);
  return normalizeSession(
    syncSessionProjectMeta(
      {
        ...base,
        workflowId: "workshop",
        acceptedValues: {
          "workshop-title": project.name,
          "project-name": project.name,
          "workshop-outcome": project.goal,
          "project-outcome": project.goal,
        },
      },
      {
        projectId: project.id,
        projectTitle: project.name,
        savedStatus: "saved",
      },
    ),
  );
}

export function buildProjectOpenMessage(project: Project): string {
  const goal = project.goal?.trim();
  return `[[focus:project-title]]Found **${project.name}** in your Projects list — opening it beside us now.${goal ? ` Outcome on file: **${goal}**.` : ""}`;
}

export function buildProjectChooserMessage(projects: Project[]): string {
  const list = projects
    .slice(0, 5)
    .map((p, i) => `${i + 1}. **${p.name}**`)
    .join("\n");
  return `I found a few projects that might match:\n\n${list}\n\nSay **number 1**, the project name, or tell me which one you mean.`;
}

export function buildDuplicateProjectMessage(project: Project): string {
  return (
    `I found an existing project called **${project.name}**. ` +
    `Do you want to **continue that one** or **create a new one**? ` +
    `Say **continue** or **new project**.`
  );
}
