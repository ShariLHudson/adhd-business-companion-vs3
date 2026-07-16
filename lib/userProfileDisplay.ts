import { getPrefs } from "@/lib/companionStore";

/**
 * Member identity for the personal avatar / menu — never companion (Shari) portraits.
 *
 * Initials rule (canonical):
 * 1. Prefer `preferredName` when set
 * 2. Else legal / full `name`
 * 3. Else email local-part
 * 4. Strip common titles; ignore middle names
 * 5. One name token → first letter only (Madonna → M, Bob → B)
 * 6. Two+ tokens → first letter of first + first letter of last (Mary Ann Jones → MJ)
 */

const TITLE_TOKENS = new Set(
  [
    "mr",
    "mrs",
    "ms",
    "miss",
    "dr",
    "prof",
    "professor",
    "sir",
    "lady",
    "rev",
    "reverend",
    "hon",
    "honorable",
    "mx",
  ].map((t) => t.toLowerCase()),
);

/** User-uploaded profile image only — never companion portraits. */
export function userProfileImageUrl(): string | null {
  const image = getPrefs().profileImage?.trim();
  return image || null;
}

function firstLetter(token: string): string {
  const match = token.normalize("NFC").match(/\p{L}/u);
  return match ? match[0]!.toLocaleUpperCase() : "";
}

function stripTitlePunctuation(token: string): string {
  return token.replace(/[.,]+$/g, "").trim();
}

/** Significant name tokens after titles / empty parts are removed. */
export function significantNameTokens(source: string): string[] {
  return source
    .normalize("NFC")
    .split(/\s+/u)
    .map(stripTitlePunctuation)
    .filter(Boolean)
    .filter((token) => !TITLE_TOKENS.has(token.toLowerCase()));
}

export function initialsFromDisplayName(source: string): string {
  const tokens = significantNameTokens(source.trim());
  if (tokens.length === 0) return "";
  if (tokens.length === 1) return firstLetter(tokens[0]!);
  const first = firstLetter(tokens[0]!);
  const last = firstLetter(tokens[tokens.length - 1]!);
  return `${first}${last}`;
}

export type UserProfileNameSource = {
  preferredName?: string | null;
  name?: string | null;
  email?: string | null;
};

/** Preferred name → legal name → email local-part. */
export function resolveUserDisplayNameSource(
  overrides?: UserProfileNameSource,
): string {
  const prefs = getPrefs();
  const preferred = (overrides?.preferredName ?? prefs.preferredName ?? "").trim();
  if (preferred) return preferred;
  const legal = (overrides?.name ?? prefs.name ?? "").trim();
  if (legal) return legal;
  const email = (overrides?.email ?? prefs.email ?? "").trim();
  if (!email) return "";
  const local = email.split("@")[0]?.trim() ?? "";
  return local.replace(/[._+-]+/g, " ").trim();
}

/**
 * Dynamic member initials. Empty string means “no identity yet” → show generic icon.
 *
 * - `userProfileInitials()` — reads prefs (preferredName first)
 * - `userProfileInitials({ preferredName, name, email })` — live preview overrides
 * - `userProfileInitials("John Smith", email?)` — legacy explicit name (ignores preferredName)
 */
export function userProfileInitials(
  nameOrOverrides?: string | UserProfileNameSource,
  email?: string,
): string {
  if (typeof nameOrOverrides === "object" && nameOrOverrides !== null) {
    const source = resolveUserDisplayNameSource(nameOrOverrides);
    return source ? initialsFromDisplayName(source) : "";
  }

  if (typeof nameOrOverrides === "string") {
    const explicit = nameOrOverrides.trim();
    if (explicit) return initialsFromDisplayName(explicit);
    if (email?.trim()) {
      return initialsFromDisplayName(
        resolveUserDisplayNameSource({ email, preferredName: "", name: "" }),
      );
    }
  }

  const source = resolveUserDisplayNameSource();
  return source ? initialsFromDisplayName(source) : "";
}

/** Warm short name for greetings — first significant token, else “Member”. */
export function userProfileGreetingName(
  overrides?: UserProfileNameSource,
): string {
  const source = resolveUserDisplayNameSource(overrides);
  if (!source) return "Member";
  const tokens = significantNameTokens(source);
  return tokens[0] || source;
}

/** Header display name — preferred/full source, else “Member”. */
export function userProfileDisplayName(
  overrides?: UserProfileNameSource,
): string {
  const source = resolveUserDisplayNameSource(overrides);
  return source || "Member";
}

export function userProfileMenuGreeting(overrides?: UserProfileNameSource): {
  line1: string;
  line2: string;
} {
  const first = userProfileGreetingName(overrides);
  return {
    line1: `Welcome back, ${first}.`,
    line2: "This is your Spark Estate.",
  };
}
