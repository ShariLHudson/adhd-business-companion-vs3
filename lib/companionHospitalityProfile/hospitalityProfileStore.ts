import type { CompanionHospitalityProfile } from "@/lib/companionUniverse/libraries/hospitalityProfileLibrary";

const STORAGE_KEY = "companion-hospitality-profile-v1";

const EMPTY: CompanionHospitalityProfile = {};

export function getHospitalityProfile(): CompanionHospitalityProfile {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY };
  }
}

export function saveHospitalityProfile(
  update: Partial<CompanionHospitalityProfile>,
): CompanionHospitalityProfile {
  const next = { ...getHospitalityProfile(), ...update };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("companion-hospitality-profile-updated"));
    } catch {
      /* noop */
    }
  }
  return next;
}

export function clearHospitalityProfile(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("companion-hospitality-profile-updated"));
  } catch {
    /* noop */
  }
}
