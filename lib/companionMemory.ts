import type { CoachingMode } from "./companionPrompt";

export type SessionMemory = {
  lastTask: string | null;
  lastMode: CoachingMode;
  updatedAt: string | null;
};

const STORAGE_KEY = "companion-session-memory";

const DEFAULT_MEMORY: SessionMemory = {
  lastTask: null,
  lastMode: "today",
  updatedAt: null,
};

export function loadMemory(): SessionMemory {
  if (typeof window === "undefined") return DEFAULT_MEMORY;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MEMORY;
    const parsed = JSON.parse(raw) as SessionMemory;
    return {
      lastTask: parsed.lastTask ?? null,
      lastMode: parsed.lastMode ?? "today",
      updatedAt: parsed.updatedAt ?? null,
    };
  } catch {
    return DEFAULT_MEMORY;
  }
}

export function saveMemory(update: Partial<SessionMemory>) {
  if (typeof window === "undefined") return;

  const current = loadMemory();
  const next: SessionMemory = {
    ...current,
    ...update,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearMemory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function rememberTask(task: string, mode: CoachingMode) {
  const trimmed = task.trim();
  if (!trimmed) return;
  return saveMemory({ lastTask: trimmed, lastMode: mode });
}
