import {
  getLiveShellPlaceId,
  isVisuallyInRoom,
} from "@/lib/estate/roomAwareness";

const VAULT_LEAVE_RE =
  /\b(?:leave\s+(?:the\s+)?(?:vault|evidence)|go\s+back\s+to\s+(?:chat|estate|home)|exit\s+(?:the\s+)?vault|return\s+to\s+(?:chat|companion|estate)|back\s+to\s+(?:the\s+)?estate)\b/i;

const VAULT_IN_ROOM_RE =
  /\b(?:preserve|discover(?:y|ed)|archive|vault|evidence|rediscover|today'?s\s+discovery|discovery\s+file|i\s+(?:realized|learned|noticed))\b/i;

const CREATE_MISROUTE_RE =
  /\b(?:create\s+(?:an?\s+)?(?:app|project|product|offer|course)|project\s+builder|brainstorm|build\s+(?:an?\s+)?app)\b/i;

/** Member shared a discovery to preserve (not a leave / navigate request). */
const DISCOVERY_SHARE_RE =
  /\b(?:i\s+)?discover(?:ed|y)\b|\bi\s+(?:realized|learned|noticed)\b|\bworth\s+preserving\b|\badd\s+this\b/i;

/** True when the member is visually inside Evidence Vault. */
export function isInEvidenceVaultContext(): boolean {
  const shell = getLiveShellPlaceId();
  if (shell === "evidence-vault" || shell === "evidence-bank") return true;
  return isVisuallyInRoom("evidence-vault");
}

export function isEvidenceVaultLeaveRequest(userText: string): boolean {
  return VAULT_LEAVE_RE.test(userText.trim());
}

/**
 * Substantive discovery share while vault chat is asking what to preserve.
 * Opens Discovery File with prefill — never Create / document recovery.
 */
export function looksLikeEvidenceVaultDiscoveryShare(userText: string): boolean {
  const t = userText.trim();
  if (!t || t.length < 8) return false;
  if (isEvidenceVaultLeaveRequest(t)) return false;
  if (CREATE_MISROUTE_RE.test(t) && !DISCOVERY_SHARE_RE.test(t)) return false;
  return DISCOVERY_SHARE_RE.test(t) || VAULT_IN_ROOM_RE.test(t);
}

/**
 * When inside the vault, steer discovery language away from Create / Project Builder.
 */
export function evidenceVaultContextReply(userText: string): string | null {
  if (!isInEvidenceVaultContext()) return null;
  if (isEvidenceVaultLeaveRequest(userText)) return null;
  if (!VAULT_IN_ROOM_RE.test(userText) && !CREATE_MISROUTE_RE.test(userText)) {
    return null;
  }
  if (CREATE_MISROUTE_RE.test(userText)) {
    return "This sounds like a meaningful discovery. I can preserve it in today's Discovery File — or we can return to the Estate when you're ready.";
  }
  return "I hear you. Would you like to add this to today's Discovery File, or browse discoveries you've already preserved?";
}
