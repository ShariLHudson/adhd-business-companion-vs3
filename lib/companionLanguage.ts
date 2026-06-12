// Language & communication preferences — output/style only.
// Intentionally separate from emotional detection, routing, and memory.
// Informs future UI copy, Companion replies, Make output, and voice later.

export type LanguageOption = {
  code: string;
  label: string;
  /** When false, preference can be saved but output stays English until enabled. */
  available: boolean;
};

export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { code: "en", label: "English", available: true },
  { code: "es", label: "Spanish (Español)", available: false },
  { code: "fr", label: "French (Français)", available: false },
  { code: "de", label: "German (Deutsch)", available: false },
  { code: "pt", label: "Portuguese (Português)", available: false },
  { code: "nl", label: "Dutch (Nederlands)", available: false },
  { code: "it", label: "Italian (Italiano)", available: false },
  { code: "pl", label: "Polish (Polski)", available: false },
  { code: "zh", label: "Chinese (中文)", available: false },
  { code: "ja", label: "Japanese (日本語)", available: false },
] as const;

export type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]["code"];

export const REGION_OPTIONS = [
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
] as const;

export type RegionCode = (typeof REGION_OPTIONS)[number]["code"];

export const DATE_FORMAT_OPTIONS = [
  { code: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { code: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { code: "YYYY-MM-DD", label: "YYYY-MM-DD" },
] as const;

export type DateFormat = (typeof DATE_FORMAT_OPTIONS)[number]["code"];

export type LanguageCommunicationPrefs = {
  interfaceLanguage: LanguageCode;
  responseLanguage: LanguageCode;
  contentLanguage: LanguageCode;
  voiceLanguage: LanguageCode;
  region: RegionCode;
  dateFormat: DateFormat;
};

export const DEFAULT_LANGUAGE_COMMUNICATION: LanguageCommunicationPrefs = {
  interfaceLanguage: "en",
  responseLanguage: "en",
  contentLanguage: "en",
  voiceLanguage: "en",
  region: "US",
  dateFormat: "MM/DD/YYYY",
};

const LANGUAGE_CODES = new Set(LANGUAGE_OPTIONS.map((o) => o.code));
const REGION_CODES = new Set(REGION_OPTIONS.map((o) => o.code));
const DATE_FORMAT_CODES = new Set(DATE_FORMAT_OPTIONS.map((o) => o.code));

const PROMPT_LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  nl: "Dutch",
  it: "Italian",
  pl: "Polish",
  zh: "Chinese",
  ja: "Japanese",
};

export function getLanguageOption(code: string): LanguageOption | undefined {
  return LANGUAGE_OPTIONS.find((o) => o.code === code);
}

export function isLanguageAvailable(code: LanguageCode): boolean {
  return getLanguageOption(code)?.available ?? false;
}

/** Language used for model output today (English until a code is marked available). */
export function effectiveOutputLanguage(code: LanguageCode): LanguageCode {
  return isLanguageAvailable(code) ? code : "en";
}

export function languageOptionLabel(option: LanguageOption): string {
  if (option.available) return option.label;
  return `${option.label} — coming soon`;
}

export function normalizeLanguageCommunication(
  partial?: Partial<LanguageCommunicationPrefs>,
): LanguageCommunicationPrefs {
  const merged = { ...DEFAULT_LANGUAGE_COMMUNICATION, ...partial };
  const pickLang = (code: string | undefined): LanguageCode =>
    LANGUAGE_CODES.has(code ?? "") ? (code as LanguageCode) : "en";
  return {
    interfaceLanguage: pickLang(merged.interfaceLanguage),
    responseLanguage: pickLang(merged.responseLanguage),
    contentLanguage: pickLang(merged.contentLanguage),
    voiceLanguage: pickLang(merged.voiceLanguage),
    region: REGION_CODES.has(merged.region as RegionCode) ? merged.region : "US",
    dateFormat: DATE_FORMAT_CODES.has(merged.dateFormat as DateFormat)
      ? merged.dateFormat
      : "MM/DD/YYYY",
  };
}

export function languageLabel(code: LanguageCode): string {
  return getLanguageOption(code)?.label ?? "English";
}

export function regionLabel(code: RegionCode): string {
  return REGION_OPTIONS.find((o) => o.code === code)?.label ?? "United States";
}

/** One-line summary for the Settings list row. */
export function languageCommunicationSummary(
  prefs: LanguageCommunicationPrefs,
): string {
  const iface = getLanguageOption(prefs.interfaceLanguage);
  const label = iface ? languageOptionLabel(iface) : "English";
  return `${label.replace(/ — coming soon$/, "")} · ${prefs.region}`;
}

/** True when a non-English preference is saved but output is not available yet. */
export function hasPendingLanguagePreferences(
  prefs: LanguageCommunicationPrefs,
): boolean {
  return (
    (prefs.interfaceLanguage !== "en" &&
      !isLanguageAvailable(prefs.interfaceLanguage)) ||
    (prefs.responseLanguage !== "en" &&
      !isLanguageAvailable(prefs.responseLanguage)) ||
    (prefs.contentLanguage !== "en" &&
      !isLanguageAvailable(prefs.contentLanguage)) ||
    (prefs.voiceLanguage !== "en" && !isLanguageAvailable(prefs.voiceLanguage))
  );
}

/** System-prompt hint for Companion chat — undefined until language is available. */
export function buildResponseLanguageHint(
  responseLanguage: LanguageCode,
): string | undefined {
  if (responseLanguage === "en" || !isLanguageAvailable(responseLanguage)) {
    return undefined;
  }
  const name = PROMPT_LANGUAGE_NAMES[responseLanguage];
  return `OUTPUT LANGUAGE: Respond entirely in ${name}. Keep the same warmth, brevity, and ADHD-friendly style.`;
}

/** System-prompt suffix for Make / generate — undefined until language is available. */
export function buildContentLanguageHint(
  contentLanguage: LanguageCode,
): string | undefined {
  if (contentLanguage === "en" || !isLanguageAvailable(contentLanguage)) {
    return undefined;
  }
  const name = PROMPT_LANGUAGE_NAMES[contentLanguage];
  return `OUTPUT LANGUAGE: Write the draft entirely in ${name}.`;
}

/** Ready to pass into chat and Make API calls (hints activate when languages go live). */
export function getOutputLanguageContext(
  prefs: Pick<LanguageCommunicationPrefs, "responseLanguage" | "contentLanguage">,
): {
  responseLanguage: LanguageCode;
  contentLanguage: LanguageCode;
  effectiveResponseLanguage: LanguageCode;
  effectiveContentLanguage: LanguageCode;
  responseLanguageHint: string | undefined;
  contentLanguageHint: string | undefined;
} {
  return {
    responseLanguage: prefs.responseLanguage,
    contentLanguage: prefs.contentLanguage,
    effectiveResponseLanguage: effectiveOutputLanguage(prefs.responseLanguage),
    effectiveContentLanguage: effectiveOutputLanguage(prefs.contentLanguage),
    responseLanguageHint: buildResponseLanguageHint(prefs.responseLanguage),
    contentLanguageHint: buildContentLanguageHint(prefs.contentLanguage),
  };
}

export const PENDING_LANGUAGE_NOTICE =
  "Full multilingual output is coming later. Your choices are saved — Shari still replies and writes in English for now.";
