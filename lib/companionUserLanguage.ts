import type { LanguageCommunicationPrefs } from "@/lib/companionLanguage";
import { normalizeLanguageCommunication } from "@/lib/companionLanguage";
import { getCompanionSupabase } from "@/lib/supabase/companionClient";

const LANGUAGE_PREF_KEYS = [
  "interfaceLanguage",
  "responseLanguage",
  "contentLanguage",
  "voiceLanguage",
  "region",
  "dateFormat",
] as const;

export function languagePrefsFromUserMetadata(
  metadata: Record<string, unknown> | undefined,
): Partial<LanguageCommunicationPrefs> | null {
  const raw = metadata?.languagePrefs ?? metadata?.language_prefs;
  if (!raw || typeof raw !== "object") return null;
  return normalizeLanguageCommunication(raw as Partial<LanguageCommunicationPrefs>);
}

export function extractLanguagePrefs(
  prefs: Partial<LanguageCommunicationPrefs>,
): LanguageCommunicationPrefs {
  return normalizeLanguageCommunication(prefs);
}

export function languagePrefsPatch(
  update: Partial<LanguageCommunicationPrefs>,
): boolean {
  return LANGUAGE_PREF_KEYS.some((key) => key in update);
}

export async function pushLanguagePrefsToUser(
  prefs: LanguageCommunicationPrefs,
): Promise<void> {
  const supabase = getCompanionSupabase();
  if (!supabase) return;
  try {
    await supabase.auth.updateUser({
      data: { languagePrefs: prefs },
    });
  } catch {
    /* offline or session expired */
  }
}
