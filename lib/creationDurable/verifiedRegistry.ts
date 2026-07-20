/**
 * In-session marks of workspaces that passed authoritative DB write + read-back.
 * Memory / localStorage alone never set these.
 */

const verified = new Map<string, { version: number; persistedAt: string }>();

export function markWorkspaceAuthoritativelyDurable(
  workspaceId: string,
  version: number,
  persistedAt: string
): void {
  const id = workspaceId.trim();
  if (!id) return;
  verified.set(id, { version, persistedAt });
}

export function clearAuthoritativeDurableMark(workspaceId?: string): void {
  if (!workspaceId) {
    verified.clear();
    return;
  }
  verified.delete(workspaceId.trim());
}

/** Sync check — true only after verified durable mutation in this session (or hydrate). */
export function isAuthoritativelyDurable(workspaceId: string): boolean {
  const id = workspaceId.trim();
  if (!id) return false;
  return verified.has(id);
}

export function getAuthoritativeDurableVersion(
  workspaceId: string
): number | null {
  return verified.get(workspaceId.trim())?.version ?? null;
}

export function clearAuthoritativeDurableMarksForTests(): void {
  verified.clear();
}
