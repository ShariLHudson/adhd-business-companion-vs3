import { todayStr } from "./companionStore";

export type TomorrowFocusItem = {
  id: string;
  text: string;
  sourceType?: "brain-dump" | "manual";
  sourceId?: string;
  /** YYYY-MM-DD — the day this should surface (usually tomorrow when created). */
  showOnDate: string;
  createdAt: string;
  done?: boolean;
};

const STORAGE_KEY = "companion-tomorrow-focus-v1";

function newId(): string {
  return `tf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function tomorrowDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function readAll(): TomorrowFocusItem[] {
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

function writeAll(items: TomorrowFocusItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addTomorrowFocus(
  text: string,
  opts?: { sourceType?: TomorrowFocusItem["sourceType"]; sourceId?: string },
): TomorrowFocusItem {
  const item: TomorrowFocusItem = {
    id: newId(),
    text: text.trim(),
    sourceType: opts?.sourceType,
    sourceId: opts?.sourceId,
    showOnDate: tomorrowDateStr(),
    createdAt: new Date().toISOString(),
  };
  writeAll([item, ...readAll()]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tomorrow-focus-updated"));
  }
  return item;
}

export function getTomorrowFocusForToday(): TomorrowFocusItem[] {
  const today = todayStr();
  return readAll()
    .filter((i) => !i.done && i.showOnDate === today)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
}

export function markTomorrowFocusDone(id: string): void {
  writeAll(
    readAll().map((i) => (i.id === id ? { ...i, done: true } : i)),
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tomorrow-focus-updated"));
  }
}

export function tomorrowFocusTrustMessage(text: string): {
  title: string;
  savedWhere: string;
  seeWhere: string;
} {
  return {
    title: text.trim(),
    savedWhere: "Tomorrow's Focus List",
    seeWhere:
      "Momentum — look for **You wanted to revisit these today** when you open the app tomorrow.",
  };
}
