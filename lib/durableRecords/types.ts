/**
 * Durable member-record persistence — Supabase table companion_member_records.
 *
 * LAW: Memory, localStorage, optimistic state, or an attempted network request
 * NEVER constitute durable success. Durable success requires an authenticated
 * Supabase user, a successful DB write, verified ownership, confirmed record
 * identity + version, and a successful read-back of the authoritative record.
 *
 * This is the generic foundation extended from lib/creationDurable/ so every
 * beta-critical member-work domain can persist through one verified pipeline.
 */

export const MEMBER_RECORDS_TABLE = "companion_member_records";

/** Lifecycle state of a member record. Deletes are soft (Constitution 117). */
export type MemberRecordStatus = "active" | "archived" | "deleted";

/** Authoritative member record (platform source of truth). */
export type MemberRecord<T = unknown> = {
  /** Owning member — Supabase Auth user.id (UUID). Never a per-browser id. */
  userId: string;
  /** Logical domain, e.g. "saved_work" | "business_profile" | "project". */
  domain: string;
  /** App-stable id within the domain (e.g. "sw-..."), or "singleton". */
  recordId: string;
  status: MemberRecordStatus;
  /** Payload schema version — lets a domain evolve its shape over time. */
  schemaVersion: number;
  /** Optimistic-concurrency record version — increments per durable write. */
  version: number;
  payload: T;
  createdAt: string;
  updatedAt: string;
};

/** Snake_case row as stored in Supabase. */
export type MemberRecordRow = {
  id: string;
  user_id: string;
  domain: string;
  record_id: string;
  status: string;
  schema_version: number;
  record_version: number;
  payload: unknown;
  created_at: string;
  updated_at: string;
};

/**
 * Stable error codes. Kept as a const map so callers (and Blocker 2's Trust
 * Kernel integration) can branch on a stable identifier, never on message text.
 */
export const DURABLE_ERROR = {
  AUTH_REQUIRED: "AUTH_REQUIRED",
  CLIENT_UNAVAILABLE: "CLIENT_UNAVAILABLE",
  INVALID_ID: "INVALID_ID",
  INVALID_PAYLOAD: "INVALID_PAYLOAD",
  USER_MISMATCH: "USER_MISMATCH",
  VERSION_CONFLICT: "VERSION_CONFLICT",
  NOT_FOUND: "NOT_FOUND",
  DB_WRITE_FAILED: "DB_WRITE_FAILED",
  DB_EMPTY_RETURN: "DB_EMPTY_RETURN",
  VERIFY_MISMATCH: "VERIFY_MISMATCH",
  READBACK_FAILED: "READBACK_FAILED",
  TABLE_MISSING: "TABLE_MISSING",
} as const;

export type DurableErrorCode =
  (typeof DURABLE_ERROR)[keyof typeof DURABLE_ERROR];

/**
 * Discriminated result. Success can only be constructed after a verified
 * read-back (see repository). `cause` is diagnostics-only — never shown to a
 * member; `message` is calm, member-safe copy.
 */
export type DurableRecordResult<T> =
  | {
      ok: true;
      durable: true;
      record: MemberRecord<T>;
      recordId: string;
      domain: string;
      persistedAt: string;
      version: number;
    }
  | {
      ok: false;
      durable: false;
      errorCode: DurableErrorCode | string;
      retryable: boolean;
      message: string;
      /** Technical cause for logs/diagnostics only — not member-facing. */
      cause?: string;
    };

export function durableRecordOk<T>(
  record: MemberRecord<T>,
): DurableRecordResult<T> {
  return {
    ok: true,
    durable: true,
    record,
    recordId: record.recordId,
    domain: record.domain,
    persistedAt: record.updatedAt,
    version: record.version,
  };
}

export function durableRecordFail(
  errorCode: DurableErrorCode | string,
  message: string,
  retryable = true,
  cause?: string,
): DurableRecordResult<never> {
  return { ok: false, durable: false, errorCode, retryable, message, cause };
}

export function memberRecordToRow(record: MemberRecord): Omit<
  MemberRecordRow,
  "id" | "created_at" | "updated_at"
> & { updated_at: string } {
  return {
    user_id: record.userId,
    domain: record.domain,
    record_id: record.recordId,
    status: record.status,
    schema_version: record.schemaVersion,
    record_version: record.version,
    payload: record.payload,
    updated_at: record.updatedAt,
  };
}

export function rowToMemberRecord<T = unknown>(
  row: MemberRecordRow,
): MemberRecord<T> {
  return {
    userId: row.user_id,
    domain: row.domain,
    recordId: row.record_id,
    status: (row.status as MemberRecordStatus) ?? "active",
    schemaVersion: row.schema_version ?? 1,
    version: row.record_version ?? 1,
    payload: row.payload as T,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
