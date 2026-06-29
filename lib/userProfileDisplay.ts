import { getPrefs } from "@/lib/companionStore";

/** User-uploaded profile image only — never companion portraits. */
export function userProfileImageUrl(): string | null {
  const image = getPrefs().profileImage?.trim();
  return image || null;
}

export function userProfileInitials(name?: string, email?: string): string {
  const prefs = getPrefs();
  const source = (name ?? prefs.name).trim() || (email ?? prefs.email).trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}
