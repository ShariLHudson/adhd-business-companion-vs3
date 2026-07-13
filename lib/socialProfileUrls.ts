/**
 * Social profile URLs — Settings → Connections.
 * Soft validation only; never block saving valid platform variations.
 */

export type SocialProfilePlatformId =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "tiktok"
  | "pinterest";

export type SocialProfilePrefKey =
  | "facebookUrl"
  | "instagramUrl"
  | "linkedinUrl"
  | "tiktokUrl"
  | "pinterestUrl";

export type SocialProfileFieldDef = {
  id: SocialProfilePlatformId;
  prefKey: SocialProfilePrefKey;
  label: string;
  placeholder: string;
  /** Hostnames accepted for soft validation (no hard reject). */
  hosts: readonly string[];
  /** Shown when the URL looks unrelated to this platform */
  hint: string;
  openLabel: string;
};

/** Display order for Settings → Connections social profiles. */
export const SOCIAL_PROFILE_FIELDS: readonly SocialProfileFieldDef[] = [
  {
    id: "facebook",
    prefKey: "facebookUrl",
    label: "Facebook URL",
    placeholder: "https://facebook.com/yourpage",
    hosts: ["facebook.com", "www.facebook.com", "fb.com", "m.facebook.com"],
    hint: "Usually looks like facebook.com/yourpage",
    openLabel: "Open Facebook",
  },
  {
    id: "instagram",
    prefKey: "instagramUrl",
    label: "Instagram URL",
    placeholder: "https://instagram.com/yourhandle",
    hosts: ["instagram.com", "www.instagram.com"],
    hint: "Usually looks like instagram.com/yourhandle",
    openLabel: "Open Instagram",
  },
  {
    id: "linkedin",
    prefKey: "linkedinUrl",
    label: "LinkedIn URL",
    placeholder: "https://linkedin.com/in/you",
    hosts: ["linkedin.com", "www.linkedin.com"],
    hint: "Usually looks like linkedin.com/in/you",
    openLabel: "Open LinkedIn",
  },
  {
    id: "tiktok",
    prefKey: "tiktokUrl",
    label: "TikTok URL",
    placeholder: "https://www.tiktok.com/@username",
    hosts: ["tiktok.com", "www.tiktok.com", "vm.tiktok.com"],
    hint: "Usually looks like tiktok.com/@username",
    openLabel: "Open TikTok",
  },
  {
    id: "pinterest",
    prefKey: "pinterestUrl",
    label: "Pinterest URL",
    placeholder: "https://www.pinterest.com/username/",
    hosts: ["pinterest.com", "www.pinterest.com", "pin.it"],
    hint: "Usually looks like pinterest.com/username",
    openLabel: "Open Pinterest",
  },
] as const;

function tryParseUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    return new URL(withProtocol);
  } catch {
    return null;
  }
}

/**
 * Soft check — empty is fine; mismatched host returns a gentle hint.
 * Never blocks save.
 */
export function socialProfileUrlHint(
  platformId: SocialProfilePlatformId,
  raw: string,
): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const field = SOCIAL_PROFILE_FIELDS.find((f) => f.id === platformId);
  if (!field) return null;
  const url = tryParseUrl(trimmed);
  if (!url) return "That doesn't look like a full web address yet.";
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const allowed = field.hosts.some((h) => {
    const normalized = h.replace(/^www\./, "");
    return host === normalized || host.endsWith(`.${normalized}`);
  });
  if (allowed) return null;
  return field.hint;
}

/** Absolute http(s) URL for opening, or null if empty/invalid. */
export function socialProfileOpenHref(raw: string): string | null {
  const url = tryParseUrl(raw);
  if (!url) return null;
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  return url.toString();
}
