/**
 * Package 205 — Talk It Out Personalization & Continuity.
 * Remember conversational preferences — not sensitive private details.
 */

export type TioResponseLength = "short" | "moderate" | "detailed";
export type TioQuestionStyle =
  | "direct"
  | "gentle"
  | "either_or"
  | "open"
  | "practical"
  | "reflective";

export type TalkItOutPreferences = {
  responseLength: TioResponseLength;
  questionStyle: TioQuestionStyle;
  preferLiteral: boolean;
  preferFewerQuestions: boolean;
  listeningFirst: boolean;
  updatedAt: string;
};

const PREFS_KEY = "spark.talkItOut.preferences.v1";

export function defaultTalkItOutPreferences(): TalkItOutPreferences {
  return {
    responseLength: "moderate",
    questionStyle: "practical",
    preferLiteral: false,
    preferFewerQuestions: false,
    listeningFirst: false,
    updatedAt: new Date().toISOString(),
  };
}

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

let memoryPrefs: TalkItOutPreferences | null = null;

export function loadTalkItOutPreferences(): TalkItOutPreferences {
  if (!canUseStorage()) {
    return memoryPrefs ?? defaultTalkItOutPreferences();
  }
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return defaultTalkItOutPreferences();
    return { ...defaultTalkItOutPreferences(), ...(JSON.parse(raw) as object) };
  } catch {
    return defaultTalkItOutPreferences();
  }
}

export function saveTalkItOutPreferences(
  prefs: Partial<TalkItOutPreferences>,
): TalkItOutPreferences {
  const next: TalkItOutPreferences = {
    ...loadTalkItOutPreferences(),
    ...prefs,
    updatedAt: new Date().toISOString(),
  };
  memoryPrefs = next;
  if (canUseStorage()) {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}

export function clearTalkItOutPreferences(): void {
  memoryPrefs = defaultTalkItOutPreferences();
  if (canUseStorage()) {
    try {
      localStorage.removeItem(PREFS_KEY);
    } catch {
      /* ignore */
    }
  }
}

/** Apply explicit user preference statements immediately. */
export function applyExplicitPreferenceStatement(
  userText: string,
): TalkItOutPreferences | null {
  const t = userText.trim();
  const patch: Partial<TalkItOutPreferences> = {};
  if (/\b(?:ask me direct|be direct|direct questions)\b/i.test(t)) {
    patch.questionStyle = "direct";
  }
  if (/\b(?:do not read into|don'?t read into|stay literal|no hidden)\b/i.test(t)) {
    patch.preferLiteral = true;
  }
  if (/\b(?:keep it short|shorter|brief)\b/i.test(t)) {
    patch.responseLength = "short";
  }
  if (/\b(?:fewer questions|stop asking|less questions)\b/i.test(t)) {
    patch.preferFewerQuestions = true;
  }
  if (/\b(?:just listen|listening first|not (?:looking for )?advice)\b/i.test(t)) {
    patch.listeningFirst = true;
  }
  if (Object.keys(patch).length === 0) return null;
  return saveTalkItOutPreferences(patch);
}

export function adaptDraftToPreferences(
  draft: string,
  prefs: TalkItOutPreferences,
): string {
  let text = draft.trim();
  if (prefs.preferLiteral) {
    text = text.replace(
      /\b(?:quieter question underneath|something underneath|what this is really about)[^.?!]*[.?!]?\s*/gi,
      "",
    );
  }
  if (prefs.responseLength === "short" && text.length > 280) {
    const parts = text.split(/(?<=[.!?])\s+/);
    text = parts.slice(0, 2).join(" ").trim();
  }
  if (prefs.preferFewerQuestions) {
    const qs = text.match(/[^.?!]*\?/g) ?? [];
    if (qs.length > 1) {
      const withoutQs = text.replace(/\?/g, ".");
      text = `${withoutQs.split(/(?<=[.])\s+/)[0] ?? withoutQs} ${qs[0]}`.trim();
    }
  }
  return text.trim();
}

export function resetTalkItOutPreferencesForTests(): void {
  memoryPrefs = null;
  clearTalkItOutPreferences();
}
