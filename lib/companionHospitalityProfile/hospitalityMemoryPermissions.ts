import type { PersonalDate } from "@/lib/recognition/types";
import type { UserHospitalityMemory } from "./types";

/** Categories that must not influence room visuals without explicit permission. */
const SENSITIVE_DATE_CATEGORIES = new Set([
  "health",
  "family",
  "custom",
]);

const SENSITIVE_DATE_KINDS = new Set(["milestone"]);

/**
 * Whether a personal date may influence hospitality visuals.
 * Birthday and vacation are safe when user explicitly added them.
 */
export function isSafePersonalDateForHospitality(date: PersonalDate): boolean {
  if (date.kind === "birthday" || date.kind === "vacation") return true;
  if (date.kind === "launch" || date.kind === "workshop" || date.kind === "speaking") {
    return true;
  }
  if (SENSITIVE_DATE_KINDS.has(date.kind)) return false;
  if (date.category && SENSITIVE_DATE_CATEGORIES.has(date.category)) {
    return false;
  }
  return date.kind === "anniversary" || date.kind === "due_date";
}

export function sensitiveMemoryBlockedReason(
  field: string,
): string | null {
  const blocked: Record<string, string> = {
    petsFromPhotos: "Pet photos need explicit permission before appearing in the room",
    familyPhotos: "Family photos need explicit permission",
    childDrawings: "Child drawings need explicit permission",
    memorialItems: "Memorial items need explicit permission",
    healthSymbols: "Health-related symbols are not shown without permission",
    griefDates: "Grief-related dates are not shown without permission",
  };
  return blocked[field] ?? null;
}

export function mayShowPetInRoom(memory: UserHospitalityMemory): boolean {
  return memory.permissions?.petsFromPhotos === true;
}

export function mayShowFamilyContent(memory: UserHospitalityMemory): boolean {
  return memory.permissions?.familyPhotos === true;
}
