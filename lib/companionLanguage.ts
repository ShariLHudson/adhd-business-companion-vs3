// Language & communication preferences — output/style only.
// Intentionally separate from emotional detection, routing, and memory.

export type LanguageOption = {
  code: string;
  label: string;
};

export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish (Español)" },
  { code: "ur", label: "Urdu (اردو)" },
  { code: "tl", label: "Filipino / Tagalog" },
  { code: "fr", label: "French (Français)" },
  { code: "de", label: "German (Deutsch)" },
  { code: "pt", label: "Portuguese (Português)" },
  { code: "nl", label: "Dutch (Nederlands)" },
  { code: "it", label: "Italian (Italiano)" },
  { code: "pl", label: "Polish (Polski)" },
  { code: "zh", label: "Chinese (中文)" },
  { code: "ja", label: "Japanese (日本語)" },
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
  ur: "Urdu",
  tl: "Filipino",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  nl: "Dutch",
  it: "Italian",
  pl: "Polish",
  zh: "Chinese",
  ja: "Japanese",
};

const SPEECH_LOCALES: Partial<Record<LanguageCode, string>> = {
  en: "en-US",
  es: "es-ES",
  ur: "ur-PK",
  tl: "fil-PH",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-PT",
  nl: "nl-NL",
  it: "it-IT",
  pl: "pl-PL",
  zh: "zh-CN",
  ja: "ja-JP",
};

const RTL_LANGUAGES = new Set<LanguageCode>(["ur"]);

export function getLanguageOption(code: string): LanguageOption | undefined {
  return LANGUAGE_OPTIONS.find((o) => o.code === code);
}

export function isLanguageAvailable(code: LanguageCode): boolean {
  return LANGUAGE_CODES.has(code);
}

/** Valid language code for output, or English as fallback. */
export function effectiveOutputLanguage(code: LanguageCode): LanguageCode {
  return LANGUAGE_CODES.has(code) ? code : "en";
}

export function getInterfaceLanguageCode(
  prefs: Pick<LanguageCommunicationPrefs, "interfaceLanguage" | "responseLanguage">,
): LanguageCode {
  return effectiveOutputLanguage(
    prefs.interfaceLanguage !== "en"
      ? prefs.interfaceLanguage
      : prefs.responseLanguage,
  );
}

export function isRtlLanguage(code: LanguageCode): boolean {
  return RTL_LANGUAGES.has(code);
}

export function speechLocaleForLanguage(code: LanguageCode): string {
  const effective = effectiveOutputLanguage(code);
  return SPEECH_LOCALES[effective] ?? "en-US";
}

export function languageOptionLabel(option: LanguageOption): string {
  return option.label;
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

/** When user picks an app language, keep all language prefs aligned. */
export function withUnifiedAppLanguage(
  code: LanguageCode,
  patch: Partial<LanguageCommunicationPrefs> = {},
): Partial<LanguageCommunicationPrefs> {
  return {
    ...patch,
    interfaceLanguage: code,
    responseLanguage: code,
    contentLanguage: code,
    voiceLanguage: code,
  };
}

export function languageLabel(code: LanguageCode): string {
  return getLanguageOption(code)?.label ?? "English";
}

export function regionLabel(code: RegionCode): string {
  return REGION_OPTIONS.find((o) => o.code === code)?.label ?? "United States";
}

export function languageCommunicationSummary(
  prefs: LanguageCommunicationPrefs,
): string {
  const primary = getLanguageOption(
    prefs.responseLanguage ?? prefs.interfaceLanguage,
  );
  const label = primary ? languageOptionLabel(primary) : "English";
  return `${label} · ${prefs.region}`;
}

export function hasPendingLanguagePreferences(
  _prefs: LanguageCommunicationPrefs,
): boolean {
  return false;
}

export function buildResponseLanguageHint(
  responseLanguage: LanguageCode,
): string | undefined {
  const effective = effectiveOutputLanguage(responseLanguage);
  if (effective === "en") {
    return "OUTPUT LANGUAGE: Respond in English unless the user clearly writes in another language or asks for another language.";
  }
  const name = PROMPT_LANGUAGE_NAMES[effective];
  return `OUTPUT LANGUAGE: Respond entirely in ${name}. Keep the same warmth, brevity, and ADHD-friendly style unless the user asks for English or another language.`;
}

export function buildContentLanguageHint(
  contentLanguage: LanguageCode,
): string | undefined {
  const effective = effectiveOutputLanguage(contentLanguage);
  if (effective === "en") return undefined;
  const name = PROMPT_LANGUAGE_NAMES[effective];
  return `OUTPUT LANGUAGE: Write the draft entirely in ${name}.`;
}

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

