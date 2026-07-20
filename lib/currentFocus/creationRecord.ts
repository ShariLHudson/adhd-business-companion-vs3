/**
 * 066 / 072 — Runtime Creation Record.
 * Every Creation Destination has a record immediately — Event or not.
 * 072 — Persists exact schema + canonical facts so resume never re-derives.
 */

import {
  extractTitleFromDraftContent,
  resolveHumanReadableTitle,
} from "@/lib/activeWorkspaceRegistry/humanReadableIdentity";
import {
  RUNTIME_CREATION_RECORDS_KEY,
  getLastLocalStorageWriteDiagnostic,
  safeLocalStorageSet,
} from "@/lib/companionStorageRecovery";
import { isAuthoritativelyDurable } from "@/lib/creationDurable/verifiedRegistry";
import {
  resolvedTypeLabel,
  type CreateTemplateSection,
  type CreateWorkflowState,
} from "@/lib/createWorkflowState";
import { workspaceV2Sections } from "@/lib/createWorkspaceSections";
import {
  buildCanonicalKnownFacts,
  knownFactDisplayLines,
  migrateLegacyKnownFacts,
  type CanonicalKnownFact,
  WORKSPACE_SCHEMA_VERSION,
} from "./canonicalFacts";

const STORAGE_KEY = RUNTIME_CREATION_RECORDS_KEY;

/** 074 — last durable write succeeded (read-back verified). */
let lastRuntimePersistDurable = true;

export function wasLastRuntimePersistDurable(): boolean {
  return lastRuntimePersistDurable;
}

export type RuntimeCreationRecord = {
  id: string;
  typeLabel: string;
  title: string;
  sectionContent: Record<string, string>;
  skippedSectionIds: string[];
  /** Display lines (legacy + derived). Prefer canonicalFacts for identity. */
  knownFacts: string[];
  /** 072 — Stable fact IDs for React keys + dedupe */
  canonicalFacts?: CanonicalKnownFact[];
  /** 072 — Exact section schema (never re-derive on resume) */
  templateSections?: CreateTemplateSection[] | null;
  schemaVersion?: string;
  focusSectionId: string | null;
  currentFocusTitle?: string | null;
  selectedTemplateId?: string | null;
  selectedTemplateName?: string | null;
  creationWorkspaceKind?: CreateWorkflowState["creationWorkspaceKind"];
  eventRecordId: string | null;
  draftContent: string | null;
  /** Creation Identity — raw member words; never the display title. */
  originalRequest?: string | null;
  /** Creation Identity — internal routing intent (e.g. Create Checklist). */
  workingIntent?: string | null;
  createdAt: string;
  updatedAt: string;
};

type Store = Record<string, RuntimeCreationRecord>;

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: Store): boolean {
  if (typeof window === "undefined") {
    lastRuntimePersistDurable = true;
    return true;
  }
  const payload = JSON.stringify(store);
  const ok = safeLocalStorageSet(STORAGE_KEY, payload);
  // 074 — only claim durable after read-back
  if (ok) {
    try {
      lastRuntimePersistDurable =
        window.localStorage.getItem(STORAGE_KEY) === payload;
    } catch {
      lastRuntimePersistDurable = false;
    }
  } else {
    lastRuntimePersistDurable = false;
  }
  // Write outcome is on window.__SPARK_LS_WRITE__ (avoid circular import with diagnostics)
  void getLastLocalStorageWriteDiagnostic();
  return lastRuntimePersistDurable;
}

/** In-memory fallback for SSR / tests without localStorage */
const memoryStore: Store = {};

export function getRuntimeCreationRecord(
  creationId: string | null | undefined,
): RuntimeCreationRecord | null {
  const id = creationId?.trim();
  if (!id) return null;
  return readStore()[id] ?? memoryStore[id] ?? null;
}

export function upsertRuntimeCreationRecord(
  record: RuntimeCreationRecord,
): RuntimeCreationRecord {
  const next = {
    ...record,
    updatedAt: new Date().toISOString(),
  };
  memoryStore[next.id] = next;
  const store = readStore();
  store[next.id] = next;
  writeStore(store);
  return next;
}

/** Remove a runtime record so Continue / hydrate cannot resurrect it. */
export function removeRuntimeCreationRecord(
  creationId: string | null | undefined,
): void {
  const id = creationId?.trim();
  if (!id) return;
  delete memoryStore[id];
  const store = readStore();
  if (!(id in store)) return;
  delete store[id];
  writeStore(store);
}

/**
 * 074+ — True only after authoritative DB verify (or hydrate from DB).
 * localStorage / memory alone never satisfy durable verification.
 */
export function verifyRuntimeRecordDurable(workspaceId: string): boolean {
  const id = workspaceId.trim();
  if (!id) return false;
  return isAuthoritativelyDurable(id);
}

function sectionsFromWorkflow(
  workflow: CreateWorkflowState,
  existing?: RuntimeCreationRecord | null,
): CreateTemplateSection[] {
  if (workflow.templateSections?.length) return [...workflow.templateSections];
  if (existing?.templateSections?.length) return [...existing.templateSections];
  return workspaceV2Sections(workflow).map((s) => ({ id: s.id, label: s.label }));
}

/**
 * Ensure a Creation Destination always has a runtime record.
 * Call when Estate Working begins or Focus advances.
 * 072 — Idempotent: does not append duplicate facts; preserves exact schema.
 */
export function ensureRuntimeCreationRecord(
  workflow: CreateWorkflowState,
): RuntimeCreationRecord {
  const id =
    workflow.eventRecordId?.trim() ||
    workflow.sessionId?.trim() ||
    `creation-${Date.now()}`;
  const existing = getRuntimeCreationRecord(id);
  const typeLabel = resolvedTypeLabel(workflow) || "Creation";
  const templateSections = sectionsFromWorkflow(workflow, existing);
  const sectionContent = {
    ...(existing?.sectionContent ?? {}),
    ...(workflow.sectionContent ?? {}),
  };
  const skippedSectionIds =
    workflow.skippedSectionIds ?? existing?.skippedSectionIds ?? [];
  const sectionsView = workspaceV2Sections({
    ...workflow,
    templateSections,
    sectionContent,
    skippedSectionIds,
  });
  const focusSection =
    sectionsView.find((s) => !s.skipped && !s.content.trim()) ?? null;

  const canonicalFacts = migrateLegacyKnownFacts(
    existing?.knownFacts,
    sectionContent,
    templateSections,
  );
  // Prefer section-derived facts (authoritative) when present
  const fromSections = buildCanonicalKnownFacts(sectionContent, templateSections);
  const mergedFacts =
    fromSections.length > 0
      ? fromSections
      : canonicalFacts;

  const now = new Date().toISOString();
  // 073 — persist human-readable title only (never technical / Default * Template)
  const requestHint = [
    Object.values(workflow.discoveryAnswers ?? {})
      .filter((v) => v?.trim())
      .join(" "),
    Object.values(workflow.sectionContent ?? {})
      .filter((v) => v?.trim())
      .slice(0, 2)
      .join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  // Prefer an already-confirmed workspace title — never re-mash from chat residue.
  const humanTitle = resolveHumanReadableTitle({
    existingTitle: existing?.title,
    memberTitle: workflow.selectedTemplateName,
    confirmedFocusTitle: existing?.selectedTemplateName,
    requestText: requestHint || workflow.originalRequest || null,
    draftTitle: extractTitleFromDraftContent(
      workflow.draftContent ?? existing?.draftContent,
      typeLabel,
    ),
    creationType: typeLabel || existing?.typeLabel || "Creation",
  });
  const originalRequest =
    workflow.originalRequest?.trim() ||
    existing?.originalRequest?.trim() ||
    null;
  const workingIntent =
    workflow.workingIntent?.trim() || existing?.workingIntent?.trim() || null;
  return upsertRuntimeCreationRecord({
    id,
    typeLabel: typeLabel || existing?.typeLabel || "Creation",
    title: humanTitle,
    sectionContent,
    skippedSectionIds: [...skippedSectionIds],
    knownFacts: knownFactDisplayLines(mergedFacts),
    canonicalFacts: mergedFacts,
    templateSections,
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    focusSectionId:
      workflow.workspaceCurrentFocus?.sectionId ??
      focusSection?.id ??
      existing?.focusSectionId ??
      templateSections[0]?.id ??
      null,
    currentFocusTitle:
      workflow.workspaceCurrentFocus?.title ??
      focusSection?.label ??
      existing?.currentFocusTitle ??
      null,
    selectedTemplateId:
      workflow.selectedTemplateId ?? existing?.selectedTemplateId ?? null,
    selectedTemplateName:
      workflow.selectedTemplateName ?? existing?.selectedTemplateName ?? null,
    creationWorkspaceKind:
      workflow.creationWorkspaceKind ?? existing?.creationWorkspaceKind ?? null,
    eventRecordId: workflow.eventRecordId ?? existing?.eventRecordId ?? null,
    draftContent: workflow.draftContent ?? existing?.draftContent ?? null,
    originalRequest,
    workingIntent,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });
}

export function applyAnswerToRuntimeCreationRecord(
  creationId: string,
  sectionId: string | null | undefined,
  answer: string,
  opts?: { skip?: boolean },
): RuntimeCreationRecord | null {
  const record = getRuntimeCreationRecord(creationId);
  if (!record) return null;
  const trimmed = answer.trim();
  const sectionContent = { ...record.sectionContent };
  let skipped = [...record.skippedSectionIds];

  if (sectionId) {
    if (opts?.skip) {
      if (!skipped.includes(sectionId)) skipped.push(sectionId);
      delete sectionContent[sectionId];
    } else if (trimmed) {
      sectionContent[sectionId] = trimmed;
      skipped = skipped.filter((id) => id !== sectionId);
    }
  }

  const sections = record.templateSections ?? [];
  const canonicalFacts = buildCanonicalKnownFacts(sectionContent, sections);

  return upsertRuntimeCreationRecord({
    ...record,
    sectionContent,
    skippedSectionIds: skipped,
    knownFacts: knownFactDisplayLines(canonicalFacts),
    canonicalFacts,
    focusSectionId: sectionId ?? record.focusSectionId,
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
  });
}

/** Merge runtime record answers into Create workflow (presentation + Focus sync). */
export function mergeRuntimeRecordIntoWorkflow(
  workflow: CreateWorkflowState,
  record: RuntimeCreationRecord,
): CreateWorkflowState {
  const templateSections =
    record.templateSections?.length
      ? record.templateSections
      : workflow.templateSections;

  const mergedBase: CreateWorkflowState = {
    ...workflow,
    sessionId: record.id || workflow.sessionId,
    eventRecordId: record.eventRecordId ?? workflow.eventRecordId,
    selectedTypeLabel: record.typeLabel || workflow.selectedTypeLabel,
    templateSections: templateSections ?? workflow.templateSections,
    selectedTemplateId:
      record.selectedTemplateId ?? workflow.selectedTemplateId,
    selectedTemplateName:
      record.selectedTemplateName ??
      record.title ??
      workflow.selectedTemplateName,
    creationWorkspaceKind:
      record.creationWorkspaceKind ?? workflow.creationWorkspaceKind,
    originalRequest: record.originalRequest ?? workflow.originalRequest ?? null,
    workingIntent: record.workingIntent ?? workflow.workingIntent ?? null,
    sectionContent: { ...record.sectionContent },
    skippedSectionIds: [...record.skippedSectionIds],
    draftContent: record.draftContent ?? workflow.draftContent,
    draftStatus: record.draftContent?.trim()
      ? "ready"
      : workflow.draftStatus,
  };

  const sections = workspaceV2Sections(mergedBase);

  // Prefer persisted focus when still valid; otherwise next empty section
  const persistedFocusId = record.focusSectionId;
  const persistedStillOpen =
    persistedFocusId &&
    sections.some(
      (s) =>
        s.id === persistedFocusId &&
        !s.skipped &&
        !s.content.trim(),
    );
  const focusSection = persistedStillOpen
    ? sections.find((s) => s.id === persistedFocusId) ?? null
    : sections.find((s) => !s.skipped && !s.content.trim()) ?? null;

  const facts =
    record.canonicalFacts?.length
      ? record.canonicalFacts
      : migrateLegacyKnownFacts(
          record.knownFacts,
          record.sectionContent,
          templateSections ?? [],
        );

  return {
    ...mergedBase,
    workspaceKnownFacts: knownFactDisplayLines(facts).slice(0, 24),
    workspaceCurrentFocus: focusSection
      ? {
          title: focusSection.label,
          reason: `Let's shape ${focusSection.label.toLowerCase()} for your ${record.typeLabel}.`,
          actionLabel: "Continue",
          sectionId: focusSection.id,
          assetTypeId: null,
        }
      : record.draftContent
        ? {
            title: "Ready for a draft",
            reason:
              "We have enough to build a working draft when you are ready.",
            actionLabel: "Build draft",
            sectionId: null,
            assetTypeId: null,
          }
        : workflow.workspaceCurrentFocus ?? {
            title: record.currentFocusTitle || "Continue",
            reason: "Pick up where we left off.",
            actionLabel: "Continue",
            sectionId: record.focusSectionId,
            assetTypeId: null,
          },
    workspacePhaseLabel: focusSection
      ? "Shaping"
      : record.draftContent
        ? "Draft ready"
        : workflow.workspacePhaseLabel || "Foundation",
  };
}

export function clearRuntimeCreationRecordsForTests(): void {
  for (const key of Object.keys(memoryStore)) {
    delete memoryStore[key];
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

export type { CanonicalKnownFact };
