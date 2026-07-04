import type {
  PendingChoiceState,
  PendingChoiceType,
  PendingChoiceItem,
} from "./types";
import { PENDING_CHOICE_TIMEOUT_MS } from "./types";

const STORAGE_KEY = "spark:pending-choice:v1";

let memoryPending: PendingChoiceState | null = null;

function readRaw(): PendingChoiceState | null {
  if (typeof window === "undefined") return memoryPending;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingChoiceState;
    if (!parsed?.choices?.length || !parsed.pendingChoiceId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function write(state: PendingChoiceState | null): void {
  memoryPending = state;
  if (typeof window === "undefined") return;
  try {
    if (!state) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function loadPendingChoice(): PendingChoiceState | null {
  const state = readRaw();
  if (!state) return null;
  if (Date.now() - state.timestamp > PENDING_CHOICE_TIMEOUT_MS) {
    clearPendingChoice();
    return null;
  }
  return state;
}

export function savePendingChoice(state: PendingChoiceState): void {
  write({
    ...state,
    timestamp: state.timestamp || Date.now(),
  });
}

export function clearPendingChoice(): void {
  write(null);
}

export function hasActivePendingChoice(): boolean {
  return loadPendingChoice() !== null;
}

export function createPendingChoiceId(type: PendingChoiceType): string {
  return `${type}-${Date.now()}`;
}

export function registerPendingChoice(input: {
  type: PendingChoiceType;
  choices: PendingChoiceItem[];
  menuText?: string;
  conversationId?: string;
  activeIntent?: string;
  activeRole?: string;
  activeWorkflow?: string;
  offeredAtTurn?: number;
}): PendingChoiceState {
  const state: PendingChoiceState = {
    pendingChoiceId: createPendingChoiceId(input.type),
    pendingChoiceType: input.type,
    choices: input.choices,
    conversationId: input.conversationId,
    timestamp: Date.now(),
    activeIntent: input.activeIntent,
    activeRole: input.activeRole,
    activeWorkflow: input.activeWorkflow,
    menuText: input.menuText,
    offeredAtTurn: input.offeredAtTurn,
  };
  savePendingChoice(state);
  return state;
}
