export type SavedCursorPrompt = {
  id: string;
  title: string;
  kind: string;
  body: string;
  savedAt: string;
};

const STORAGE_KEY = "founder-cursor-prompts-v1";
const MAX_SAVED = 50;

export function loadSavedCursorPrompts(): SavedCursorPrompt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedCursorPrompt[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCursorPrompt(entry: {
  title: string;
  kind: string;
  body: string;
}): SavedCursorPrompt {
  const record: SavedCursorPrompt = {
    id: `cp-${Date.now()}`,
    title: entry.title,
    kind: entry.kind,
    body: entry.body,
    savedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      const next = [record, ...loadSavedCursorPrompts()].slice(0, MAX_SAVED);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* quota */
    }
  }
  return record;
}
