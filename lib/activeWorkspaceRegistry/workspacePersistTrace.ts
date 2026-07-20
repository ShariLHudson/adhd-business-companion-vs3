/**
 * Leaf persist tracer — no creationRecord / eventRecordStore imports.
 * Keeps Project Homes / Continue registry writes off the circular graph.
 */

import type { LocalStorageWriteDiagnostic } from "@/lib/companionStorageRecovery";
import { getLastLocalStorageWriteDiagnostic } from "@/lib/companionStorageRecovery";

export type WorkspacePersistPhase =
  | "begin"
  | "focus_save"
  | "build_draft"
  | "rename"
  | "event_write"
  | "runtime_write"
  | "registry_write"
  | "readback"
  | "pre_refresh_dump"
  | "auth_reclaim"
  | "hydrate_registry"
  | "hydrate_event_fallback"
  | "restore_builder_session"
  | "projects_resolve"
  | "mounted_workspace"
  | "step";

export type WorkspacePersistTraceEntry = {
  at: string;
  phase: WorkspacePersistPhase;
  workspaceId: string;
  ok: boolean;
  detail?: string;
  keys?: Record<string, boolean>;
  write?: LocalStorageWriteDiagnostic | null;
};

const MAX_TRACES = 80;
const traces: WorkspacePersistTraceEntry[] = [];

export function traceWorkspacePersist(
  phase: WorkspacePersistPhase,
  workspaceId: string,
  ok: boolean,
  detail?: string,
  keys?: Record<string, boolean>,
): void {
  const entry: WorkspacePersistTraceEntry = {
    at: new Date().toISOString(),
    phase,
    workspaceId,
    ok,
    detail,
    keys,
    write: getLastLocalStorageWriteDiagnostic(),
  };
  traces.push(entry);
  if (traces.length > MAX_TRACES) traces.shift();
  if (typeof window !== "undefined") {
    try {
      (
        window as Window & {
          __SPARK_WORKSPACE_PERSIST__?: WorkspacePersistTraceEntry[];
        }
      ).__SPARK_WORKSPACE_PERSIST__ = traces.slice();
    } catch {
      /* ignore */
    }
  }
}

export function getWorkspacePersistTraces(): WorkspacePersistTraceEntry[] {
  return traces.slice();
}

export function clearWorkspacePersistTracesForTests(): void {
  traces.length = 0;
}
