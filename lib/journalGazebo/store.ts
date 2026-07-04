import type { JournalEntry } from "@/lib/growthJournalStore";
import {
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "@/lib/growthJournalStore";
import { todaysPageJournalDefaults } from "./defaults";
import type { JournalGazeboConfig } from "./types";
import { journalConfigTag, parseJournalConfigTag } from "./types";

export type JournalGazeboSession = {
  activeJournalId: string | null;
  /** Welcome stationery shown once; never again unless requested. */
  hasSeenWelcomeNote: boolean;
  editingEntryId: string | null;
  /** Journal ids that completed the first-opening ceremony. */
  completedCeremonies: string[];
};

const CONFIG_STORAGE_KEY = "companion-journal-gazebo-configs-v1";
const SESSION_STORAGE_KEY = "companion-journal-gazebo-session-v1";

export const JOURNAL_GAZEBO_UPDATED_EVENT = "companion-journal-gazebo-updated";

const EMPTY_SESSION: JournalGazeboSession = {
  activeJournalId: null,
  hasSeenWelcomeNote: false,
  editingEntryId: null,
  completedCeremonies: [],
};

/** Skip localStorage after first quota error this session. */
let localStorageBlocked = false;

/** In-memory fallbacks when browser storage is full (common in long dev sessions). */
let memorySession: JournalGazeboSession = { ...EMPTY_SESSION };
let memoryConfigs: JournalGazeboConfig[] | null = null;

function safeSetItem(key: string, payload: string): boolean {
  if (typeof window === "undefined") return false;
  if (!localStorageBlocked) {
    try {
      localStorage.setItem(key, payload);
      return true;
    } catch {
      localStorageBlocked = true;
    }
  }
  try {
    sessionStorage.setItem(key, payload);
    return true;
  } catch {
    return false;
  }
}

function safeGetItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromLocal = localStorage.getItem(key);
    if (fromLocal) return fromLocal;
  } catch {
    localStorageBlocked = true;
  }
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeRemoveItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    localStorageBlocked = true;
  }
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function newId(): string {
  return `jg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultJournalConfig(
  partial?: Partial<JournalGazeboConfig>,
): JournalGazeboConfig {
  const now = new Date().toISOString();
  return {
    id: newId(),
    name: "My Journey",
    leatherColor: "cognac",
    embossedTitle: "",
    showSparkFlame: true,
    coverImageKind: "none",
    shelfTemplateId: "saddle-brown",
    coverMaterial: "leather",
    embossingStyle: "gold",
    penVariant: "elegant-fountain",
    paperStyle: "cream",
    bookmarkColor: "forest",
    bookmarkStyle: "ribbon",
    fontId: "lora",
    inkColor: "charcoal",
    penStyle: "fountain",
    nibSize: "medium",
    writingFontSize: 18,
    writingMode: "gentle",
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

function readConfigs(): JournalGazeboConfig[] {
  if (typeof window === "undefined") return memoryConfigs ?? [];
  const raw = safeGetItem(CONFIG_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const configs = parsed.filter(
          (c): c is JournalGazeboConfig =>
            c && typeof c === "object" && typeof c.id === "string",
        );
        memoryConfigs = configs;
        return configs;
      }
    } catch {
      /* fall through */
    }
  }
  return memoryConfigs ?? [];
}

function writeConfigs(configs: JournalGazeboConfig[]): boolean {
  if (typeof window === "undefined") return false;
  memoryConfigs = configs;
  const ok = safeSetItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
  try {
    window.dispatchEvent(new Event(JOURNAL_GAZEBO_UPDATED_EVENT));
  } catch {
    /* optional */
  }
  return ok;
}

function parseSession(raw: string | null): JournalGazeboSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<JournalGazeboSession> & {
      hasVisited?: boolean;
    };
    return {
      activeJournalId: parsed.activeJournalId ?? null,
      hasSeenWelcomeNote:
        parsed.hasSeenWelcomeNote ?? parsed.hasVisited ?? false,
      editingEntryId: parsed.editingEntryId ?? null,
      completedCeremonies: Array.isArray(parsed.completedCeremonies)
        ? parsed.completedCeremonies.filter((id): id is string => typeof id === "string")
        : [],
    };
  } catch {
    return null;
  }
}

function readSession(): JournalGazeboSession {
  if (typeof window === "undefined") {
    return { ...memorySession };
  }
  const parsed = parseSession(safeGetItem(SESSION_STORAGE_KEY));
  if (parsed) {
    memorySession = parsed;
    return parsed;
  }
  return { ...memorySession };
}

function writeSession(session: JournalGazeboSession): boolean {
  if (typeof window === "undefined") return false;
  memorySession = session;
  return safeSetItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function resetJournalGazeboSessionState(): void {
  memorySession = { ...EMPTY_SESSION };
  if (typeof window === "undefined") return;
  safeRemoveItem(SESSION_STORAGE_KEY);
}

export function resetJournalGazeboConfigs(): void {
  memoryConfigs = null;
  if (typeof window === "undefined") return;
  safeRemoveItem(CONFIG_STORAGE_KEY);
}

export function getJournalConfigs(): JournalGazeboConfig[] {
  return readConfigs();
}

export function getJournalConfigById(id: string): JournalGazeboConfig | null {
  return readConfigs().find((c) => c.id === id) ?? null;
}

export function hasCompletedJournalCeremony(journalId: string): boolean {
  return readSession().completedCeremonies.includes(journalId);
}

export function markJournalCeremonyComplete(journalId: string): void {
  const session = readSession();
  if (session.completedCeremonies.includes(journalId)) return;
  writeSession({
    ...session,
    completedCeremonies: [...session.completedCeremonies, journalId],
  });
}

export function isFirstJournalGazeboVisit(): boolean {
  return !readSession().hasSeenWelcomeNote;
}

export function markWelcomeNoteSeen(): void {
  const session = readSession();
  writeSession({ ...session, hasSeenWelcomeNote: true });
}

export function requestWelcomeNoteAgain(): void {
  const session = readSession();
  writeSession({ ...session, hasSeenWelcomeNote: false });
}

/** Return visits — ensure a journal exists without showing first-visit UI. */
export function ensureActiveJournalConfig(): JournalGazeboConfig {
  const configs = readConfigs();
  const session = readSession();
  if (session.activeJournalId) {
    const found = configs.find((c) => c.id === session.activeJournalId);
    if (found) return found;
  }
  if (configs.length > 0) {
    setActiveJournalConfig(configs[0]!.id);
    return configs[0]!;
  }
  return createJournalConfig(todaysPageJournalDefaults());
}

export function getActiveJournalConfig(): JournalGazeboConfig {
  return ensureActiveJournalConfig();
}

export function openTodaysPageJournal(): JournalGazeboConfig {
  markWelcomeNoteSeen();
  return createJournalConfig(todaysPageJournalDefaults());
}

export function setActiveJournalConfig(id: string): void {
  const session = readSession();
  writeSession({ ...session, activeJournalId: id });
}

export function createJournalConfig(
  partial?: Partial<JournalGazeboConfig>,
): JournalGazeboConfig {
  const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = partial ?? {};
  const config = defaultJournalConfig(rest);
  writeConfigs([config, ...readConfigs()]);
  setActiveJournalConfig(config.id);
  return config;
}

export function updateJournalConfig(
  id: string,
  patch: Partial<Omit<JournalGazeboConfig, "id" | "createdAt">>,
): JournalGazeboConfig | null {
  const configs = readConfigs();
  const index = configs.findIndex((c) => c.id === id);
  if (index < 0) return null;
  const next: JournalGazeboConfig = {
    ...configs[index]!,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  const updated = [...configs];
  updated[index] = next;
  writeConfigs(updated);
  return next;
}

export function hasVisitedJournalGazebo(): boolean {
  return readSession().hasSeenWelcomeNote;
}

export function setEditingEntryId(entryId: string | null): void {
  const session = readSession();
  writeSession({ ...session, editingEntryId: entryId });
}

export function getEditingEntryId(): string | null {
  return readSession().editingEntryId;
}

export function getEntriesForJournal(configId: string): JournalEntry[] {
  const tag = journalConfigTag(configId);
  return getJournalEntries().filter((e) => e.tags.includes(tag));
}

export function saveJournalPage(input: {
  configId: string;
  body: string;
  entryId?: string | null;
  title?: string;
}): { entryId: string; ok: boolean } {
  const body = input.body.trim();
  if (!body) return { entryId: input.entryId ?? "", ok: false };

  const tag = journalConfigTag(input.configId);

  if (input.entryId) {
    const ok = updateJournalEntry(input.entryId, {
      body,
      title: input.title,
    });
    return { entryId: input.entryId, ok };
  }

  const { entry, ok } = createJournalEntry({
    body,
    title: input.title,
    attachments: [],
    sourcePage: "journal_gazebo",
    tags: [tag, "journal-gazebo"],
  });
  setEditingEntryId(entry.id);
  return { entryId: entry.id, ok };
}

export function openJournalEntry(entryId: string): JournalEntry | null {
  const entry = getJournalEntries().find((e) => e.id === entryId) ?? null;
  if (entry) {
    const configId = parseJournalConfigTag(entry.tags);
    if (configId) setActiveJournalConfig(configId);
    setEditingEntryId(entryId);
  }
  return entry;
}

export function removeJournalEntry(entryId: string): void {
  deleteJournalEntry(entryId);
  if (getEditingEntryId() === entryId) setEditingEntryId(null);
}
