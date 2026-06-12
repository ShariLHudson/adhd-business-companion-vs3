// Server-side aggregated user intelligence — categorized counts only.

import { getFounderSupabaseAdmin, founderSupabaseConfigured } from "@/lib/supabase/founderServer";

import type {
  UserQuestionType,
  UserSignalKind,
  UserStruggleType,
} from "./userIntelligenceEngine";
import type { EmotionalSignalType } from "./userIntelligenceEngine";

const TABLE = "ecosystem_signal_counts";

const STRUGGLE_CATEGORIES = new Set<UserStruggleType>([
  "overwhelm",
  "prioritization",
  "focus",
  "follow_through",
  "decision_making",
  "marketing",
  "content_creation",
]);

const QUESTION_CATEGORIES = new Set<UserQuestionType>([
  "what_should_i_work_on",
  "help_me_prioritize",
  "im_overwhelmed",
  "dont_know_where_to_start",
]);

const EMOTION_CATEGORIES = new Set<EmotionalSignalType>([
  "frustrated",
  "stuck",
  "confused",
  "excited",
  "hopeful",
]);

export type EcosystemSignalCount = {
  kind: UserSignalKind;
  category: string;
  count: number;
  lastSeen: string;
};

export type EcosystemSignalIncrement = {
  kind: UserSignalKind;
  category: string;
};

type MemoryRow = { count: number; lastSeen: string };

const memory = new Map<string, MemoryRow>();

function rowKey(kind: string, category: string): string {
  return `${kind}:${category}`;
}

function isValidSignal(kind: string, category: string): boolean {
  if (kind === "struggle") return STRUGGLE_CATEGORIES.has(category as UserStruggleType);
  if (kind === "question") return QUESTION_CATEGORIES.has(category as UserQuestionType);
  if (kind === "emotion") return EMOTION_CATEGORIES.has(category as EmotionalSignalType);
  return false;
}

export function filterValidSignalIncrements(
  signals: EcosystemSignalIncrement[],
): EcosystemSignalIncrement[] {
  return signals
    .map((s) => ({
      kind: s.kind?.trim(),
      category: s.category?.trim(),
    }))
    .filter(
      (s): s is EcosystemSignalIncrement =>
        Boolean(s.kind && s.category && isValidSignal(s.kind, s.category)),
    )
    .map((s) => ({
      kind: s.kind as UserSignalKind,
      category: s.category,
    }));
}

/** Unique valid signals (for batch dedupe). */
export function sanitizeSignalIncrements(
  signals: EcosystemSignalIncrement[],
): EcosystemSignalIncrement[] {
  const out: EcosystemSignalIncrement[] = [];
  const seen = new Set<string>();
  for (const s of filterValidSignalIncrements(signals)) {
    const key = rowKey(s.kind, s.category);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function memoryIncrement(signals: EcosystemSignalIncrement[]): void {
  const now = new Date().toISOString();
  for (const s of signals) {
    const key = rowKey(s.kind, s.category);
    const prev = memory.get(key);
    memory.set(key, {
      count: (prev?.count ?? 0) + 1,
      lastSeen: now,
    });
  }
}

function memoryReconcile(rows: EcosystemSignalCount[]): void {
  for (const row of rows) {
    if (!isValidSignal(row.kind, row.category)) continue;
    const key = rowKey(row.kind, row.category);
    const prev = memory.get(key);
    const count = Math.max(prev?.count ?? 0, row.count);
    const lastSeen =
      !prev?.lastSeen || row.lastSeen > prev.lastSeen ? row.lastSeen : prev.lastSeen;
    memory.set(key, { count, lastSeen });
  }
}

function memoryAll(): EcosystemSignalCount[] {
  return [...memory.entries()]
    .map(([key, row]) => {
      const [kind, category] = key.split(":");
      return {
        kind: kind as UserSignalKind,
        category,
        count: row.count,
        lastSeen: row.lastSeen,
      };
    })
    .sort((a, b) => b.count - a.count);
}

export async function incrementEcosystemSignals(
  signals: EcosystemSignalIncrement[],
): Promise<void> {
  const valid = filterValidSignalIncrements(signals);
  if (!valid.length) return;

  const supabase = getFounderSupabaseAdmin();
  if (!supabase) {
    memoryIncrement(valid);
    return;
  }

  const now = new Date().toISOString();
  for (const s of valid) {
    const { data, error: readError } = await supabase
      .from(TABLE)
      .select("count")
      .eq("signal_kind", s.kind)
      .eq("signal_category", s.category)
      .maybeSingle();

    if (readError) {
      console.error("ecosystem_signal_counts read", readError);
      memoryIncrement([s]);
      continue;
    }

    const nextCount = (data?.count ?? 0) + 1;
    const { error: writeError } = await supabase.from(TABLE).upsert({
      signal_kind: s.kind,
      signal_category: s.category,
      count: nextCount,
      last_seen: now,
    });

    if (writeError) {
      console.error("ecosystem_signal_counts upsert", writeError);
      memoryIncrement([s]);
    }
  }
}

export async function reconcileEcosystemSignals(
  rows: EcosystemSignalCount[],
): Promise<void> {
  const valid = rows.filter((r) => isValidSignal(r.kind, r.category) && r.count > 0);
  if (!valid.length) return;

  const supabase = getFounderSupabaseAdmin();
  if (!supabase) {
    memoryReconcile(valid);
    return;
  }

  for (const row of valid) {
    const { data, error: readError } = await supabase
      .from(TABLE)
      .select("count, last_seen")
      .eq("signal_kind", row.kind)
      .eq("signal_category", row.category)
      .maybeSingle();

    if (readError) {
      console.error("ecosystem_signal_counts reconcile read", readError);
      memoryReconcile([row]);
      continue;
    }

    const nextCount = Math.max(data?.count ?? 0, row.count);
    const lastSeen =
      data?.last_seen && data.last_seen > row.lastSeen ? data.last_seen : row.lastSeen;

    const { error: writeError } = await supabase.from(TABLE).upsert({
      signal_kind: row.kind,
      signal_category: row.category,
      count: nextCount,
      last_seen: lastSeen,
    });

    if (writeError) {
      console.error("ecosystem_signal_counts reconcile upsert", writeError);
      memoryReconcile([row]);
    }
  }
}

export async function loadEcosystemSignalCounts(): Promise<EcosystemSignalCount[]> {
  const supabase = getFounderSupabaseAdmin();
  if (!supabase) return memoryAll();

  const { data, error } = await supabase
    .from(TABLE)
    .select("signal_kind, signal_category, count, last_seen")
    .order("count", { ascending: false });

  if (error) {
    console.error("ecosystem_signal_counts load", error);
    return memoryAll();
  }

  return (data ?? []).map((row) => ({
    kind: row.signal_kind as UserSignalKind,
    category: row.signal_category,
    count: row.count,
    lastSeen: row.last_seen,
  }));
}

export function ecosystemSignalStoreConfigured(): boolean {
  return founderSupabaseConfigured() || memory.size > 0;
}

/** Test helper */
export function resetMemorySignalStore(): void {
  memory.clear();
}
