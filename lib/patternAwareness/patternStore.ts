import {
  PATTERN_AWARENESS_CHANGE_EVENT,
  SAVED_PATTERNS_KEY,
  type PatternCategory,
  type PatternSuggestionDraft,
  type PatternUseContext,
  type SavedPattern,
} from "./types";
import { findSimilarSavedPatterns } from "./similarity";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  return `pattern-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizePattern(raw: Partial<SavedPattern>): SavedPattern | null {
  const statement = typeof raw.statement === "string" ? raw.statement.trim() : "";
  if (!statement) return null;
  const useContexts = Array.isArray(raw.useContexts)
    ? (raw.useContexts.filter(Boolean) as PatternUseContext[])
    : ["everywhere"];
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : newId(),
    statement,
    category: (raw.category as PatternCategory) || "custom",
    source: raw.source === "spark-suggested" ? "spark-suggested" : "user-added",
    status:
      raw.status === "paused" || raw.status === "retired" ? raw.status : "active",
    useContexts: useContexts.length > 0 ? useContexts : ["everywhere"],
    evidenceSummary:
      typeof raw.evidenceSummary === "string" ? raw.evidenceSummary : undefined,
    confidence:
      raw.confidence === "early" ||
      raw.confidence === "possible" ||
      raw.confidence === "strong"
        ? raw.confidence
        : undefined,
    createdAt:
      typeof raw.createdAt === "string" && raw.createdAt
        ? raw.createdAt
        : nowIso(),
    updatedAt:
      typeof raw.updatedAt === "string" && raw.updatedAt
        ? raw.updatedAt
        : nowIso(),
    version:
      typeof raw.version === "number" && raw.version >= 1
        ? Math.floor(raw.version)
        : 1,
  };
}

function readAll(): SavedPattern[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_PATTERNS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => normalizePattern(item as Partial<SavedPattern>))
      .filter((p): p is SavedPattern => Boolean(p));
  } catch {
    return [];
  }
}

function writeAll(patterns: SavedPattern[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(SAVED_PATTERNS_KEY, JSON.stringify(patterns));
    window.dispatchEvent(new CustomEvent(PATTERN_AWARENESS_CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function listSavedPatterns(): SavedPattern[] {
  return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getSavedPattern(id: string): SavedPattern | null {
  return readAll().find((p) => p.id === id) ?? null;
}

export type SavePatternResult =
  | { ok: true; pattern: SavedPattern }
  | {
      ok: false;
      reason: "empty" | "similar-exists" | "storage";
      similar?: SavedPattern[];
      pattern?: SavedPattern;
    };

export function saveNewPattern(input: {
  statement: string;
  category?: PatternCategory;
  source?: SavedPattern["source"];
  useContexts?: PatternUseContext[];
  evidenceSummary?: string;
  confidence?: SavedPattern["confidence"];
  /** When true, skip similar-pattern gate (caller already resolved). */
  force?: boolean;
}): SavePatternResult {
  const statement = input.statement.trim();
  if (!statement) return { ok: false, reason: "empty" };

  const existing = readAll();
  if (!input.force) {
    const similar = findSimilarSavedPatterns(statement, existing);
    if (similar.length > 0) {
      return { ok: false, reason: "similar-exists", similar };
    }
  }

  const pattern = normalizePattern({
    statement,
    category: input.category ?? "custom",
    source: input.source ?? "user-added",
    useContexts: input.useContexts ?? ["everywhere"],
    evidenceSummary: input.evidenceSummary,
    confidence: input.confidence,
    status: "active",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    version: 1,
  });
  if (!pattern) return { ok: false, reason: "empty" };

  if (!writeAll([pattern, ...existing])) {
    return { ok: false, reason: "storage", pattern };
  }
  return { ok: true, pattern };
}

export function saveSparkSuggestedPattern(
  draft: PatternSuggestionDraft,
  force = false,
): SavePatternResult {
  return saveNewPattern({
    statement: draft.statement,
    category: draft.category,
    source: "spark-suggested",
    useContexts: draft.useContexts ?? ["everywhere"],
    evidenceSummary: draft.evidenceSummary,
    confidence: draft.confidence,
    force,
  });
}

export function updateSavedPattern(
  id: string,
  patch: Partial<
    Pick<
      SavedPattern,
      | "statement"
      | "category"
      | "status"
      | "useContexts"
      | "evidenceSummary"
      | "confidence"
    >
  >,
): SavedPattern | null {
  const all = readAll();
  const index = all.findIndex((p) => p.id === id);
  if (index < 0) return null;
  const current = all[index]!;
  if (
    typeof patch.statement === "string" &&
    "version" in patch &&
    typeof (patch as { version?: number }).version === "number" &&
    ((patch as { version?: number }).version as number) < current.version
  ) {
    return current;
  }
  const next = normalizePattern({
    ...current,
    ...patch,
    id: current.id,
    source: current.source,
    createdAt: current.createdAt,
    updatedAt: nowIso(),
    version: current.version + 1,
  });
  if (!next) return null;
  all[index] = next;
  if (!writeAll(all)) return null;
  return next;
}

export function pauseSavedPattern(id: string): SavedPattern | null {
  return updateSavedPattern(id, { status: "paused" });
}

export function resumeSavedPattern(id: string): SavedPattern | null {
  return updateSavedPattern(id, { status: "active" });
}

export function retireSavedPattern(id: string): SavedPattern | null {
  return updateSavedPattern(id, { status: "retired" });
}

export function deleteSavedPattern(id: string): boolean {
  const all = readAll();
  const next = all.filter((p) => p.id !== id);
  if (next.length === all.length) return false;
  return writeAll(next);
}

export function mergeIntoExistingPattern(
  existingId: string,
  statement: string,
  useContexts?: PatternUseContext[],
): SavedPattern | null {
  const existing = getSavedPattern(existingId);
  if (!existing) return null;
  const contexts = useContexts?.length
    ? Array.from(new Set([...existing.useContexts, ...useContexts]))
    : existing.useContexts;
  return updateSavedPattern(existingId, {
    statement: statement.trim() || existing.statement,
    useContexts: contexts,
    status: "active",
  });
}
