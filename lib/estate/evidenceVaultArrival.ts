/**
 * Evidence Vault — EST-001 place-first arrival.
 * Member enters the room before any capture form or browse workspace.
 */

import {
  formatEvidenceEntryForExport,
  getEvidenceEntries,
  pickRandomEvidenceEntries,
} from "@/lib/evidenceBankStore";

import {
  EVIDENCE_VAULT_CORE_QUESTION,
  EVIDENCE_VAULT_DISCOVERY_PROMPTS,
} from "@/lib/estate/evidenceVaultIntelligence";
import {
  EVIDENCE_VAULT_ENTRY_WELCOME,
  EVIDENCE_VAULT_ROOM_NAME,
} from "@/lib/estate/evidenceVaultExperience";

/** Full Spark welcome shown on room entry (chat / frosted chrome). */
export const EVIDENCE_VAULT_ARRIVAL_WELCOME = [
  `Welcome to the ${EVIDENCE_VAULT_ROOM_NAME}.`,
  "This is where meaningful experiences slowly become understanding — one discovery at a time.",
  EVIDENCE_VAULT_CORE_QUESTION,
].join("\n\n");

/** Immediate welcome when member names the vault — no generic menu. */
export const EVIDENCE_VAULT_INTENTIONAL_ENTRY_WELCOME =
  EVIDENCE_VAULT_ENTRY_WELCOME;

export type EvidenceVaultWorkspaceMode = "arrive" | "add" | "browse";

export const EVIDENCE_VAULT_WORKSPACE_MODE_KEY =
  "spark:estate:evidence-vault-workspace-mode:v1";

/** Skip door/key ritual — chat prefill opens Discovery File directly. */
export const EVIDENCE_VAULT_SKIP_ENTRANCE_KEY =
  "spark:estate:evidence-vault-skip-entrance:v1";

export const EVIDENCE_VAULT_CHAT_PREFILL_KEY =
  "spark:estate:evidence-vault-chat-prefill:v1";

/** Spark welcome deferred until door/key ritual completes. */
export const EVIDENCE_VAULT_PENDING_WELCOME_KEY =
  "spark:estate:evidence-vault-pending-welcome:v1";

/** Key travels to lock, turns, clicks — 0.8–1.2s. */
export const EVIDENCE_VAULT_ENTRANCE_UNLOCK_MS = 1000;
/** Heavy hinged doors swing open. */
export const EVIDENCE_VAULT_ENTRANCE_DOOR_MS = 1600;
export const EVIDENCE_VAULT_ENTRANCE_ENTER_MS = 250;

/** Returning members — browse archive link after first successful entrance. */
export const EVIDENCE_VAULT_ENTRANCE_COMPLETED_KEY =
  "spark:estate:evidence-vault-entrance-completed:v1";

export const EVIDENCE_VAULT_ENTRANCE_COMPLETE_EVENT =
  "spark:evidence-vault-entrance-complete";

/**
 * @deprecated Prefer EvidenceVaultDoorState from evidenceVaultDoor.ts
 * Kept for engine compatibility during migration.
 */
export type EvidenceVaultEntrancePhase =
  | "door"
  | "unlocking"
  | "opening"
  | "entering"
  | "inside";

export {
  hasEvidenceVaultUnlocked as hasEvidenceVaultEntranceCompleted,
  markEvidenceVaultUnlocked as markEvidenceVaultEntranceCompleted,
  resetEvidenceVaultAccessStateForDev,
  type EvidenceVaultDoorState,
} from "./evidenceVaultDoor";

export function setEvidenceVaultSkipEntrance(skip: boolean): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (skip) {
      sessionStorage.setItem(EVIDENCE_VAULT_SKIP_ENTRANCE_KEY, "1");
    } else {
      sessionStorage.removeItem(EVIDENCE_VAULT_SKIP_ENTRANCE_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function consumeEvidenceVaultSkipEntrance(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(EVIDENCE_VAULT_SKIP_ENTRANCE_KEY);
    sessionStorage.removeItem(EVIDENCE_VAULT_SKIP_ENTRANCE_KEY);
    return raw === "1";
  } catch {
    return false;
  }
}

export function setEvidenceVaultChatPrefill(active: boolean): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (active) {
      sessionStorage.setItem(EVIDENCE_VAULT_CHAT_PREFILL_KEY, "1");
    } else {
      sessionStorage.removeItem(EVIDENCE_VAULT_CHAT_PREFILL_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function consumeEvidenceVaultChatPrefill(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(EVIDENCE_VAULT_CHAT_PREFILL_KEY);
    sessionStorage.removeItem(EVIDENCE_VAULT_CHAT_PREFILL_KEY);
    return raw === "1";
  } catch {
    return false;
  }
}

export function setEvidenceVaultPendingWelcome(message: string): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(EVIDENCE_VAULT_PENDING_WELCOME_KEY, message);
  } catch {
    /* ignore */
  }
}

export function consumeEvidenceVaultPendingWelcome(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(EVIDENCE_VAULT_PENDING_WELCOME_KEY);
    sessionStorage.removeItem(EVIDENCE_VAULT_PENDING_WELCOME_KEY);
    return raw?.trim() ? raw : null;
  } catch {
    return null;
  }
}

export function setEvidenceVaultWorkspaceMode(
  mode: EvidenceVaultWorkspaceMode,
): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(EVIDENCE_VAULT_WORKSPACE_MODE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function consumeEvidenceVaultWorkspaceMode(): EvidenceVaultWorkspaceMode {
  if (typeof sessionStorage === "undefined") return "arrive";
  try {
    const raw = sessionStorage.getItem(EVIDENCE_VAULT_WORKSPACE_MODE_KEY);
    sessionStorage.removeItem(EVIDENCE_VAULT_WORKSPACE_MODE_KEY);
    if (raw === "add" || raw === "browse" || raw === "arrive") return raw;
  } catch {
    /* ignore */
  }
  return "arrive";
}

export function peekEvidenceVaultWorkspaceMode(): EvidenceVaultWorkspaceMode {
  if (typeof sessionStorage === "undefined") return "arrive";
  try {
    const raw = sessionStorage.getItem(EVIDENCE_VAULT_WORKSPACE_MODE_KEY);
    if (raw === "add" || raw === "browse" || raw === "arrive") return raw;
  } catch {
    /* ignore */
  }
  return "arrive";
}

/** Conversational reminder — never opens the form. */
export function formatEvidenceVaultReminderReply(): string {
  const entries = getEvidenceEntries();
  if (entries.length === 0) {
    return [
      "The vault is quiet for now — no discoveries preserved yet.",
      "When you're ready, tell me about a discovery you'd like to preserve, or open the vault when the first piece of evidence is here.",
    ].join("\n\n");
  }
  const [picked] = pickRandomEvidenceEntries(1, entries);
  if (!picked) {
    return "I couldn't find a reminder just now. Want to browse the vault together?";
  }
  const body = formatEvidenceEntryForExport(picked)
    .replace(/^Evidence Vault Entry\n/, "")
    .replace(/^Evidence Bank Entry\n/, "")
    .trim();
  return [
    "Here's a discovery from your Evidence Vault — wisdom you've already earned:",
    "",
    body,
  ].join("\n");
}

export function formatEvidenceVaultInsightsReply(): string {
  const count = getEvidenceEntries().length;
  if (count === 0) {
    return [
      "Your vault is waiting for its first discovery.",
      "Each piece of evidence you preserve helps Spark notice patterns and wisdom over time.",
    ].join("\n\n");
  }
  const prompts = EVIDENCE_VAULT_DISCOVERY_PROMPTS.slice(0, 3);
  return [
    `Your Evidence Vault holds ${count} preserved discover${count === 1 ? "y" : "ies"}.`,
    "Over time, Spark connects experiences, notices patterns, and helps you rediscover the wisdom you've already earned.",
    "",
    "Reflections you might explore:",
    ...prompts.map((line) => `• ${line}`),
  ].join("\n");
}

export function formatEvidenceVaultFindProofReply(): string {
  const count = getEvidenceEntries().length;
  if (count === 0) {
    return [
      "There's nothing in the vault yet to search — and that's okay.",
      "Tell me about a discovery you'd like to preserve, and we can keep it here for a harder day.",
    ].join("\n\n");
  }
  return [
    `You have ${count} discover${count === 1 ? "y" : "ies"} preserved in the vault.`,
    "Tell me what you're looking for — a client result, kind words, a small win you keep minimizing — and I'll help you rediscover it.",
    "Or choose Browse Archive when you want to look through everything yourself.",
  ].join("\n\n");
}
