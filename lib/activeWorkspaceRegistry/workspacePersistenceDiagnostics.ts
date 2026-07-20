/**
 * 074 — Browser-observable Create/Event persistence trace.
 * Founder Validation: window.__SPARK_WORKSPACE_PERSIST__
 */

import {
  ACTIVE_WORKSPACE_REGISTRY_KEY,
  CREATE_WORKFLOW_RECORD_KEY,
  EVENT_RECORDS_STORAGE_KEY,
  LAST_ACTIVE_WORKSPACE_KEY,
  RUNTIME_CREATION_RECORDS_KEY,
  getLastLocalStorageWriteDiagnostic,
  getLocalStorageWriteDiagnosticLog,
  type LocalStorageWriteDiagnostic,
} from "@/lib/companionStorageRecovery";
import {
  getEventRecord,
  verifyEventRecordDurable,
} from "@/lib/eventsIntelligence/eventRecordStore";
import {
  getRuntimeCreationRecord,
  verifyRuntimeRecordDurable,
} from "@/lib/currentFocus/creationRecord";

function registryHasWorkspace(workspaceId: string): boolean {
  if (typeof window === "undefined" || !workspaceId) return false;
  try {
    const raw = localStorage.getItem(ACTIVE_WORKSPACE_REGISTRY_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as {
      byId?: Record<string, { workspaceId?: string; title?: string }>;
    };
    return Boolean(parsed?.byId?.[workspaceId]?.workspaceId === workspaceId);
  } catch {
    return false;
  }
}

function registryTitle(workspaceId: string): string | null {
  if (typeof window === "undefined" || !workspaceId) return null;
  try {
    const raw = localStorage.getItem(ACTIVE_WORKSPACE_REGISTRY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      byId?: Record<string, { title?: string }>;
    };
    return parsed?.byId?.[workspaceId]?.title?.trim() || null;
  } catch {
    return null;
  }
}

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

export type RuntimeDurableExplanation = {
  runtimeDurable: false;
  /** Exact branch that returned false */
  because: string;
  lineHint: string;
  lsRawLength: number | null;
  lsHasId: boolean;
  memoryPresent: boolean;
  templateSectionCountInLs: number;
  lastWrite: LocalStorageWriteDiagnostic | null;
};

export type WorkspacePersistDump = {
  workspaceId: string;
  runtimePresent: boolean;
  /** true when getRuntimeCreationRecord hits memory but LS verify fails */
  runtimeMemoryOnly: boolean;
  eventPresent: boolean;
  registryPresent: boolean;
  runtimeDurable: boolean;
  eventDurable: boolean;
  creationDurable: boolean;
  lastActiveId: string | null;
  title: string | null;
  hasDraft: boolean;
  sectionAnswerCount: number;
  templateSectionCount: number;
  storageKeys: Record<string, boolean>;
  runtimeDurableExplanation: RuntimeDurableExplanation | null;
  lastWrite: LocalStorageWriteDiagnostic | null;
  recentWrites: LocalStorageWriteDiagnostic[];
};

const TRACE_CAP = 120;
const traces: WorkspacePersistTraceEntry[] = [];

function lsHas(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(localStorage.getItem(key));
  } catch {
    return false;
  }
}

export function storageKeyPresence(): Record<string, boolean> {
  return {
    [RUNTIME_CREATION_RECORDS_KEY]: lsHas(RUNTIME_CREATION_RECORDS_KEY),
    [ACTIVE_WORKSPACE_REGISTRY_KEY]: lsHas(ACTIVE_WORKSPACE_REGISTRY_KEY),
    [LAST_ACTIVE_WORKSPACE_KEY]: lsHas(LAST_ACTIVE_WORKSPACE_KEY),
    [EVENT_RECORDS_STORAGE_KEY]: lsHas(EVENT_RECORDS_STORAGE_KEY),
    [CREATE_WORKFLOW_RECORD_KEY]: lsHas(CREATE_WORKFLOW_RECORD_KEY),
    "companion-events-intelligence-active-id": lsHas(
      "companion-events-intelligence-active-id",
    ),
    "companion-creation-continuity-v1": lsHas("companion-creation-continuity-v1"),
  };
}

/**
 * Exact reason runtimeDurable is false — Founder Validation.
 * Mirrors branches in creationRecord.verifyRuntimeRecordDurable.
 */
export function explainRuntimeDurableFalse(
  workspaceId: string,
): RuntimeDurableExplanation | null {
  const id = workspaceId.trim();
  if (!id) return null;
  if (verifyRuntimeRecordDurable(id)) return null;

  const memoryPresent = Boolean(getRuntimeCreationRecord(id));
  const lastWrite = getLastLocalStorageWriteDiagnostic();

  if (typeof window === "undefined") {
    return {
      runtimeDurable: false,
      because: "typeof window === undefined (SSR path)",
      lineHint: "creationRecord.ts verifyRuntimeRecordDurable — window check",
      lsRawLength: null,
      lsHasId: false,
      memoryPresent,
      templateSectionCountInLs: 0,
      lastWrite,
    };
  }

  try {
    const raw = window.localStorage.getItem(RUNTIME_CREATION_RECORDS_KEY);
    if (!raw) {
      return {
        runtimeDurable: false,
        because:
          "localStorage.getItem('spark.runtimeCreationRecords.v1') returned null — durable write never stuck (memory-only). Check __SPARK_LS_WRITE__.last",
        lineHint:
          "creationRecord.ts verifyRuntimeRecordDurable: if (!raw) return false",
        lsRawLength: 0,
        lsHasId: false,
        memoryPresent,
        templateSectionCountInLs: 0,
        lastWrite,
      };
    }
    const parsed = JSON.parse(raw) as Record<
      string,
      {
        id?: string;
        templateSections?: unknown[];
        draftContent?: string | null;
        sectionContent?: Record<string, string>;
      }
    >;
    const rec = parsed?.[id];
    if (!rec?.id) {
      return {
        runtimeDurable: false,
        because: `LS key exists (len=${raw.length}) but parsed['${id}'] is missing — write used a different id or store was overwritten`,
        lineHint:
          "creationRecord.ts verifyRuntimeRecordDurable: if (!rec?.id) return false",
        lsRawLength: raw.length,
        lsHasId: false,
        memoryPresent,
        templateSectionCountInLs: 0,
        lastWrite,
      };
    }
    const templateSectionCountInLs = rec.templateSections?.length ?? 0;
    const hasSchema = templateSectionCountInLs > 0;
    const hasProgress =
      hasSchema ||
      Boolean(rec.draftContent?.trim()) ||
      Object.values(rec.sectionContent ?? {}).some((v) => Boolean(v?.trim()));
    if (!hasProgress) {
      return {
        runtimeDurable: false,
        because:
          "LS record exists but hasProgress is false (no templateSections, draft, or section answers)",
        lineHint:
          "creationRecord.ts verifyRuntimeRecordDurable: return hasProgress",
        lsRawLength: raw.length,
        lsHasId: true,
        memoryPresent,
        templateSectionCountInLs,
        lastWrite,
      };
    }
  } catch (err) {
    return {
      runtimeDurable: false,
      because: `JSON.parse/getItem threw: ${err instanceof Error ? err.message : String(err)}`,
      lineHint: "creationRecord.ts verifyRuntimeRecordDurable catch → return false",
      lsRawLength: null,
      lsHasId: false,
      memoryPresent,
      templateSectionCountInLs: 0,
      lastWrite,
    };
  }

  return {
    runtimeDurable: false,
    because: "verifyRuntimeRecordDurable returned false (unclassified)",
    lineHint: "creationRecord.ts verifyRuntimeRecordDurable",
    lsRawLength: null,
    lsHasId: false,
    memoryPresent,
    templateSectionCountInLs: 0,
    lastWrite,
  };
}

export function dumpWorkspacePersistence(workspaceId: string): WorkspacePersistDump {
  const id = workspaceId.trim();
  const runtime = getRuntimeCreationRecord(id);
  const event = getEventRecord(id);
  const inRegistry = registryHasWorkspace(id);
  let lastActiveId: string | null = null;
  if (typeof window !== "undefined") {
    try {
      lastActiveId = localStorage.getItem(LAST_ACTIVE_WORKSPACE_KEY);
    } catch {
      lastActiveId = null;
    }
  }
  const runtimeDurable = verifyRuntimeRecordDurable(id);
  const eventDurable = verifyEventRecordDurable(id);
  const runtimeMemoryOnly = Boolean(runtime) && !runtimeDurable;
  return {
    workspaceId: id,
    runtimePresent: Boolean(runtime),
    runtimeMemoryOnly,
    eventPresent: Boolean(event),
    registryPresent: inRegistry,
    runtimeDurable,
    eventDurable,
    // 074+ — authoritative DB verify only (not LS/Event alone)
    creationDurable: runtimeDurable,
    lastActiveId,
    title: registryTitle(id) ?? runtime?.title ?? event?.title ?? null,
    hasDraft: Boolean(runtime?.draftContent?.trim()),
    sectionAnswerCount: Object.values(runtime?.sectionContent ?? {}).filter((v) =>
      Boolean(v?.trim()),
    ).length,
    templateSectionCount: runtime?.templateSections?.length ?? 0,
    storageKeys: storageKeyPresence(),
    runtimeDurableExplanation: runtimeDurable
      ? null
      : explainRuntimeDurableFalse(id),
    lastWrite: getLastLocalStorageWriteDiagnostic(),
    recentWrites: getLocalStorageWriteDiagnosticLog().slice(-12),
  };
}

function publishWindowApi(): void {
  if (typeof window === "undefined") return;
  const w = window as Window & {
    __SPARK_WORKSPACE_PERSIST__?: {
      traces: WorkspacePersistTraceEntry[];
      dump: typeof dumpWorkspacePersistence;
      explain: typeof explainRuntimeDurableFalse;
      last: WorkspacePersistTraceEntry | null;
    };
  };
  w.__SPARK_WORKSPACE_PERSIST__ = {
    traces: [...traces],
    dump: dumpWorkspacePersistence,
    explain: explainRuntimeDurableFalse,
    last: traces[traces.length - 1] ?? null,
  };
}

export function traceWorkspacePersist(
  phase: WorkspacePersistPhase,
  workspaceId: string,
  ok: boolean,
  detail?: string,
): WorkspacePersistTraceEntry {
  const entry: WorkspacePersistTraceEntry = {
    at: new Date().toISOString(),
    phase,
    workspaceId: workspaceId.trim(),
    ok,
    detail,
    keys: storageKeyPresence(),
    write: getLastLocalStorageWriteDiagnostic(),
  };
  traces.push(entry);
  if (traces.length > TRACE_CAP) traces.shift();
  publishWindowApi();
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    console.info(
      "[SPARK_WORKSPACE_PERSIST]",
      phase,
      workspaceId,
      ok,
      detail ?? "",
      entry.write && !entry.write.ok
        ? `writeFail=${entry.write.stage}/${entry.write.errorName}`
        : "",
    );
  }
  return entry;
}

export function getWorkspacePersistTraces(): WorkspacePersistTraceEntry[] {
  return [...traces];
}

export function clearWorkspacePersistTracesForTests(): void {
  traces.length = 0;
}
