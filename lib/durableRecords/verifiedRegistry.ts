/**
 * In-session marks of member records that passed authoritative DB write +
 * read-back verify. Memory / localStorage alone NEVER set these — this is the
 * synchronous source of truth for "is this record durably persisted right now".
 */

function markKey(domain: string, recordId: string): string {
  return `${domain}:${recordId}`;
}

const verified = new Map<string, { version: number; persistedAt: string }>();

export function markMemberRecordDurable(
  domain: string,
  recordId: string,
  version: number,
  persistedAt: string,
): void {
  const d = domain.trim();
  const id = recordId.trim();
  if (!d || !id) return;
  verified.set(markKey(d, id), { version, persistedAt });
}

export function clearMemberRecordDurableMark(
  domain?: string,
  recordId?: string,
): void {
  if (!domain || !recordId) {
    verified.clear();
    return;
  }
  verified.delete(markKey(domain.trim(), recordId.trim()));
}

/** True only after a verified durable mutation (or hydrate) this session. */
export function isMemberRecordDurable(
  domain: string,
  recordId: string,
): boolean {
  const d = domain.trim();
  const id = recordId.trim();
  if (!d || !id) return false;
  return verified.has(markKey(d, id));
}

export function getMemberRecordDurableVersion(
  domain: string,
  recordId: string,
): number | null {
  return verified.get(markKey(domain.trim(), recordId.trim()))?.version ?? null;
}

export function clearMemberRecordDurableMarksForTests(): void {
  verified.clear();
}
