const STORAGE_KEY = "brain-dump-custom-categories-v1";

/** Top-level categories users can pick quickly (spec + taxonomy alignment). */
export const QUICK_PICK_CATEGORIES = [
  "Health",
  "Business",
  "Personal",
  "Family",
  "Work",
  "Worries",
] as const;

export function loadCustomBrainDumpCategories(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  } catch {
    return [];
  }
}

export function saveCustomBrainDumpCategory(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  const existing = loadCustomBrainDumpCategories();
  const hit = existing.find((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (hit) return hit;
  const next = [...existing, trimmed].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return trimmed;
}
