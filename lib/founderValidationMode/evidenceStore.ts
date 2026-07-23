/**
 * Persist Founder Validation evidence (browser local + export path convention).
 */

import {
  CERTIFICATION_JOURNEYS,
  type CertificationJourneyId,
} from "@/lib/createCertification";
import { blankEmotionalQualityAudit } from "@/lib/createCertification/emotionalQuality";
import { browserStatusFromVerdict } from "./approvalGate";
import type {
  FounderStatusApproval,
  FounderValidationStore,
  JourneyRunRecord,
  JourneyStatusOverlay,
  ScreenshotReference,
} from "./types";
import {
  FOUNDER_VALIDATION_EVIDENCE_ROOT,
  FOUNDER_VALIDATION_STORAGE_KEY,
} from "./types";

export function emptyValidationStore(): FounderValidationStore {
  const overlays: JourneyStatusOverlay[] = CERTIFICATION_JOURNEYS.map((j) => ({
    journeyId: j.id,
    browser: j.browser,
    emotional: j.emotional,
    certification: j.certification,
    notes: j.notes,
    lastRunId: null,
    evidenceRelativePath: null,
    updatedAt: new Date(0).toISOString(),
  }));
  return {
    version: 1,
    runs: [],
    overlays,
    approvals: [],
    activeJourneyId: null,
    updatedAt: new Date().toISOString(),
  };
}

export function loadValidationStore(): FounderValidationStore {
  if (typeof window === "undefined") return emptyValidationStore();
  try {
    const raw = localStorage.getItem(FOUNDER_VALIDATION_STORAGE_KEY);
    if (!raw) return emptyValidationStore();
    const parsed = JSON.parse(raw) as FounderValidationStore;
    if (parsed?.version !== 1 || !Array.isArray(parsed.overlays)) {
      return emptyValidationStore();
    }
    return parsed;
  } catch {
    return emptyValidationStore();
  }
}

export function saveValidationStore(store: FounderValidationStore): void {
  if (typeof window === "undefined") return;
  const next = { ...store, updatedAt: new Date().toISOString() };
  localStorage.setItem(FOUNDER_VALIDATION_STORAGE_KEY, JSON.stringify(next));
}

export function evidenceRelativePathForRun(
  journeyId: CertificationJourneyId,
  runId: string,
): string {
  return `${FOUNDER_VALIDATION_EVIDENCE_ROOT}/runs/${journeyId}/${runId}.json`;
}

export function getOverlay(
  store: FounderValidationStore,
  journeyId: CertificationJourneyId,
): JourneyStatusOverlay {
  return (
    store.overlays.find((o) => o.journeyId === journeyId) ??
    emptyValidationStore().overlays.find((o) => o.journeyId === journeyId)!
  );
}

export function startJourneyRun(
  store: FounderValidationStore,
  journeyId: CertificationJourneyId,
  opts?: { environment?: JourneyRunRecord["environment"] },
): { store: FounderValidationStore; run: JourneyRunRecord } {
  const run: JourneyRunRecord = {
    id: `run-${journeyId}-${Date.now()}`,
    journeyId,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    authenticated: true,
    environment: opts?.environment ?? "preview",
    browserVerdict: "not_run",
    emotionalVerdict: "not_run",
    notes: "",
    screenshots: [],
    emotionalChecklist: blankEmotionalQualityAudit(),
    criteriaChecked: {},
  };
  const next: FounderValidationStore = {
    ...store,
    runs: [...store.runs, run],
    activeJourneyId: journeyId,
    updatedAt: new Date().toISOString(),
  };
  return { store: next, run };
}

/**
 * Finish a run — updates evidence + proposed browser/emotional.
 * Never sets CERTIFIED (approval gate required).
 */
export function finishJourneyRun(
  store: FounderValidationStore,
  runId: string,
  patch: {
    browserVerdict: JourneyRunRecord["browserVerdict"];
    emotionalVerdict: JourneyRunRecord["emotionalVerdict"];
    notes: string;
    screenshots: ScreenshotReference[];
    emotionalChecklist: JourneyRunRecord["emotionalChecklist"];
    criteriaChecked: Record<string, boolean>;
  },
): FounderValidationStore {
  const runs = store.runs.map((r) =>
    r.id === runId
      ? {
          ...r,
          ...patch,
          finishedAt: new Date().toISOString(),
        }
      : r,
  );
  const run = runs.find((r) => r.id === runId);
  if (!run) return store;

  const prior = getOverlay(store, run.journeyId);
  const browser = browserStatusFromVerdict(patch.browserVerdict);
  const emotional = browserStatusFromVerdict(patch.emotionalVerdict);

  // Evidence updates browser/emotional only.
  // certification status never changes without explicit founder approval.
  const overlay: JourneyStatusOverlay = {
    ...prior,
    browser,
    emotional,
    certification: prior.certification,
    notes: patch.notes.trim() || prior.notes,
    lastRunId: run.id,
    evidenceRelativePath: evidenceRelativePathForRun(run.journeyId, run.id),
    updatedAt: new Date().toISOString(),
  };

  return {
    ...store,
    runs,
    overlays: store.overlays.map((o) =>
      o.journeyId === run.journeyId ? overlay : o,
    ),
    activeJourneyId: null,
    updatedAt: new Date().toISOString(),
  };
}

export function applyApprovedOverlay(
  store: FounderValidationStore,
  approval: FounderStatusApproval,
  overlay: JourneyStatusOverlay,
): FounderValidationStore {
  return {
    ...store,
    approvals: [...store.approvals, approval],
    overlays: store.overlays.map((o) =>
      o.journeyId === overlay.journeyId ? overlay : o,
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function exportRunEvidenceJson(run: JourneyRunRecord): string {
  return JSON.stringify(
    {
      schema: "spark-founder-validation-run-v1",
      evidenceRoot: FOUNDER_VALIDATION_EVIDENCE_ROOT,
      relativePath: evidenceRelativePathForRun(run.journeyId, run.id),
      run,
      exportedAt: new Date().toISOString(),
      rule: "CERTIFIED requires separate founder approval — never automatic.",
    },
    null,
    2,
  );
}

export function exportStoreSnapshotJson(store: FounderValidationStore): string {
  return JSON.stringify(
    {
      schema: "spark-founder-validation-store-v1",
      evidenceRoot: FOUNDER_VALIDATION_EVIDENCE_ROOT,
      store,
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  );
}
