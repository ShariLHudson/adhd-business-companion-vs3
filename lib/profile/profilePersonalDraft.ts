/**
 * My Profile personal draft — preserved across temporary leaves (Settings, etc.).
 */

export type ProfilePersonalDraft = {
  name: string;
  preferredName: string;
  email: string;
  introduction: string;
  updatedAt: string;
};

const STORAGE_KEY = "spark:profile-personal-draft:v1";

function canUseStorage(): boolean {
  try {
    return typeof sessionStorage !== "undefined" && sessionStorage != null;
  } catch {
    return false;
  }
}

export function saveProfilePersonalDraft(
  draft: Omit<ProfilePersonalDraft, "updatedAt">,
): void {
  if (!canUseStorage()) return;
  try {
    const payload: ProfilePersonalDraft = {
      ...draft,
      updatedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

export function loadProfilePersonalDraft(): ProfilePersonalDraft | null {
  if (!canUseStorage()) return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProfilePersonalDraft;
  } catch {
    return null;
  }
}

export function clearProfilePersonalDraft(): void {
  if (!canUseStorage()) return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
