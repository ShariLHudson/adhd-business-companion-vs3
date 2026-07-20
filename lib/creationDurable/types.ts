/**
 * Verified Durable Persistence — Creation workspaces.
 * Memory / localStorage never constitute durable success.
 */

export type DurableMutationResult<T> =
  | {
      ok: true;
      durable: true;
      record: T;
      workspaceId: string;
      persistedAt: string;
      version: number;
    }
  | {
      ok: false;
      durable: false;
      errorCode: string;
      retryable: boolean;
      message: string;
    };

/** Authoritative Creation workspace fields (platform source of truth). */
export type AuthoritativeCreationPayload = {
  schemaId: string | null;
  schemaVersion: string | null;
  templateSections: Array<{ id: string; title: string; prompt?: string }>;
  currentFocusId: string | null;
  currentFocusIndex: number;
  answers: Record<string, string>;
  knownFacts: Record<string, unknown>;
  draft: string | null;
  draftReady: boolean;
  progress: {
    answeredCount: number;
    totalFocusCount: number;
    percent: number;
  };
  workflowSnapshot: Record<string, unknown> | null;
  registryMeta: {
    humanTitle: string;
    creationTypeLabel: string;
    lastActiveAt: string;
    projectLinked: boolean;
  };
};

export type AuthoritativeCreationRecord = {
  workspaceId: string;
  userId: string;
  creationType: string;
  title: string;
  status: string;
  originalRequest: string;
  kind: "creation" | "event" | "project";
  eventRecordId: string | null;
  projectHomeId: string | null;
  version: number;
  payload: AuthoritativeCreationPayload;
  createdAt: string;
  updatedAt: string;
};

export type CreationDurableRow = {
  id: string;
  user_id: string;
  creation_type: string;
  title: string;
  status: string;
  original_request: string;
  kind: string;
  event_record_id: string | null;
  project_home_id: string | null;
  persistence_version: number;
  payload: AuthoritativeCreationPayload;
  created_at: string;
  updated_at: string;
};

export const CREATION_DURABLE_TABLE = "companion_creation_workspaces";
export const CREATION_OPTIONAL_CACHE_KEY = "spark.creationDurableCache.v1";

export function durableFail(
  errorCode: string,
  message: string,
  retryable = true
): DurableMutationResult<never> {
  return {
    ok: false,
    durable: false,
    errorCode,
    retryable,
    message,
  };
}

export function durableOk<T extends AuthoritativeCreationRecord>(
  record: T
): DurableMutationResult<T> {
  return {
    ok: true,
    durable: true,
    record,
    workspaceId: record.workspaceId,
    persistedAt: record.updatedAt,
    version: record.version,
  };
}
