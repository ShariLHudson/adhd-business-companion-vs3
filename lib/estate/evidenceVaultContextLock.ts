import {
  getLiveShellPlaceId,
  isVisuallyInRoom,
} from "@/lib/estate/roomAwareness";

const VAULT_LEAVE_RE =
  /\b(?:leave\s+(?:the\s+)?(?:vault|evidence)|go\s+back\s+to\s+(?:chat|estate|home)|exit\s+(?:the\s+)?vault|return\s+to\s+(?:chat|companion))\b/i;

const VAULT_IN_ROOM_RE =
  /\b(?:preserve|discovery|archive|vault|evidence|rediscover|today'?s\s+discovery|discovery\s+file)\b/i;

const CREATE_MISROUTE_RE =
  /\b(?:create\s+(?:an?\s+)?(?:app|project|product|offer|course)|project\s+builder|brainstorm|build\s+(?:an?\s+)?app)\b/i;

/** True when the member is visually inside Evidence Vault. */
export function isInEvidenceVaultContext(): boolean {
  const shell = getLiveShellPlaceId();
  if (shell === "evidence-vault" || shell === "evidence-bank") return true;
  return isVisuallyInRoom("evidence-vault");
}

/**
 * When inside the vault, steer discovery language away from Create / Project Builder.
 */
export function evidenceVaultContextReply(userText: string): string | null {
  if (!isInEvidenceVaultContext()) return null;
  if (VAULT_LEAVE_RE.test(userText)) return null;
  if (!VAULT_IN_ROOM_RE.test(userText) && !CREATE_MISROUTE_RE.test(userText)) {
    return null;
  }
  if (CREATE_MISROUTE_RE.test(userText)) {
    return "This sounds like a meaningful discovery. I can preserve it in today's Discovery File — or we can return to the Estate when you're ready.";
  }
  return "I hear you. Would you like to add this to today's Discovery File, or browse discoveries you've already preserved?";
}
