import { saveProjectItem } from "@/lib/companionProjectsStore";

/** Seed project task sections from New Project planning — mirrors guided breakdown chunks. */
export function seedProjectChunks(
  projectId: string,
  chunkTitles: readonly string[],
): string | null {
  const titles = chunkTitles.map((t) => t.trim()).filter(Boolean);
  if (titles.length === 0) return null;

  for (const title of titles) {
    saveProjectItem({ projectId, kind: "section", title });
  }

  return titles[0] ?? null;
}
