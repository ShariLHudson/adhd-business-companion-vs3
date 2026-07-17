/**
 * Session-scoped IntentWorkflowState (CB-022 addendum).
 * Persists strategy classification so ADHD/Business is not re-asked.
 */

import type {
  IntentWorkflowState,
  IntentWorkflowStatus,
  StrategyClassificationStatus,
} from "./intentWorkflowTypes";

export const INTENT_WORKFLOW_STORAGE_KEY = "spark-intent-workflow-v1" as const;

let memoryFallback: IntentWorkflowState | null = null;

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function loadIntentWorkflow(): IntentWorkflowState | null {
  if (!canUseSessionStorage()) return memoryFallback;
  try {
    const raw = sessionStorage.getItem(INTENT_WORKFLOW_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as IntentWorkflowState;
    if (!parsed?.interpretedGoal || !parsed?.classificationStatus) return null;
    if (parsed.responseOwner !== "shari") {
      parsed.responseOwner = "shari";
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveIntentWorkflow(state: IntentWorkflowState): void {
  const next: IntentWorkflowState = { ...state, responseOwner: "shari" };
  memoryFallback = next;
  if (!canUseSessionStorage()) return;
  try {
    sessionStorage.setItem(INTENT_WORKFLOW_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

export function clearIntentWorkflow(): void {
  memoryFallback = null;
  if (!canUseSessionStorage()) return;
  try {
    sessionStorage.removeItem(INTENT_WORKFLOW_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function getIntentWorkflow(): IntentWorkflowState | null {
  return loadIntentWorkflow();
}

export function patchIntentWorkflow(
  patch: Partial<IntentWorkflowState> & { updatedAtTurn: number },
): IntentWorkflowState | null {
  const current = loadIntentWorkflow();
  if (!current) return null;
  const next: IntentWorkflowState = {
    ...current,
    ...patch,
    responseOwner: "shari",
    context: patch.context
      ? { ...current.context, ...patch.context }
      : current.context,
  };
  saveIntentWorkflow(next);
  return next;
}

export function setIntentWorkflowStatus(
  status: IntentWorkflowStatus,
  turn: number,
): IntentWorkflowState | null {
  return patchIntentWorkflow({ status, updatedAtTurn: turn });
}

export function setStrategyClassification(
  status: StrategyClassificationStatus,
  turn: number,
): IntentWorkflowState | null {
  const resolved =
    status === "adhd_apply" ||
    status === "business_create" ||
    status === "adhd_aware_business";
  return patchIntentWorkflow({
    classificationStatus: status,
    classificationResolvedAtTurn: resolved ? turn : undefined,
    updatedAtTurn: turn,
  });
}

export function resetIntentWorkflowStoreForTests(): void {
  memoryFallback = null;
  if (canUseSessionStorage()) {
    try {
      sessionStorage.removeItem(INTENT_WORKFLOW_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}
