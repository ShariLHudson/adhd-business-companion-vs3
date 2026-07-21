/**
 * 106 — Builder Mode selection + crash recovery (sessionStorage).
 */

export type BuilderSessionSnapshot = {
  blueprintId: string;
  selectedGroupId: string | null;
  selectedSectionId: string | null;
  collapsedGroupIds: string[];
  updatedAt: string;
};

const PREFIX = "spark.blueprint.builder.v1:";

function storage(): Storage | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage;
  } catch {
    return null;
  }
}

export function writeBuilderSession(snapshot: BuilderSessionSnapshot): void {
  const s = storage();
  if (!s) return;
  s.setItem(`${PREFIX}${snapshot.blueprintId}`, JSON.stringify(snapshot));
}

export function readBuilderSession(
  blueprintId: string,
): BuilderSessionSnapshot | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(`${PREFIX}${blueprintId}`);
    if (!raw) return null;
    return JSON.parse(raw) as BuilderSessionSnapshot;
  } catch {
    return null;
  }
}

export function clearBuilderSession(blueprintId: string): void {
  storage()?.removeItem(`${PREFIX}${blueprintId}`);
}
