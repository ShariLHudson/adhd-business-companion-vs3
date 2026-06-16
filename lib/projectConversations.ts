/** Chat turns logged while a project detail workspace is open. */

export type ProjectConversationEntry = {
  id: string;
  projectId: string;
  userPreview: string;
  assistantPreview: string;
  createdAt: string;
};

const STORAGE_KEY = "companion-project-conversations-v1";
const MAX_PER_PROJECT = 40;
const PREVIEW_LEN = 160;

function newId(): string {
  return `pconv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function preview(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= PREVIEW_LEN) return t;
  return `${t.slice(0, PREVIEW_LEN - 1)}…`;
}

function readAll(): ProjectConversationEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: ProjectConversationEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listProjectConversations(
  projectId: string,
): ProjectConversationEntry[] {
  return readAll()
    .filter((e) => e.projectId === projectId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function countProjectConversations(projectId: string): number {
  return listProjectConversations(projectId).length;
}

export function appendProjectConversation(
  projectId: string,
  userText: string,
  assistantText: string,
): ProjectConversationEntry {
  const entry: ProjectConversationEntry = {
    id: newId(),
    projectId,
    userPreview: preview(userText),
    assistantPreview: preview(assistantText),
    createdAt: new Date().toISOString(),
  };
  const forProject = listProjectConversations(projectId);
  const rest = readAll().filter((e) => e.projectId !== projectId);
  const next = [entry, ...forProject].slice(0, MAX_PER_PROJECT);
  writeAll([...next, ...rest]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("project-conversations-updated", {
        detail: { projectId },
      }),
    );
  }
  return entry;
}

export const PROJECT_CONVERSATIONS_UPDATED = "project-conversations-updated";

/** Log a chat exchange when the user is on project detail in the workspace. */
export function recordProjectConversationIfOpen(
  workspacePanel: string | null | undefined,
  projectId: string | null | undefined,
  view: string | null | undefined,
  userText: string,
  assistantText: string,
): void {
  if (workspacePanel !== "projects") return;
  if (view !== "detail" || !projectId) return;
  const user = userText.trim();
  const assistant = assistantText.trim();
  if (!user || !assistant) return;
  appendProjectConversation(projectId, user, assistant);
}
