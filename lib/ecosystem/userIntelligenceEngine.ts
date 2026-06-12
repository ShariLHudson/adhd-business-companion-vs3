// User Intelligence Foundation — categorized signals only (no conversation text).

import { getEcosystemUserId } from "./ecosystemUserId";
import type { EmotionalState } from "../companionEmotions";

// ---- Signal categories ----------------------------------------------------

export type UserStruggleType =
  | "overwhelm"
  | "prioritization"
  | "focus"
  | "follow_through"
  | "decision_making"
  | "marketing"
  | "content_creation";

export type UserQuestionType =
  | "what_should_i_work_on"
  | "help_me_prioritize"
  | "im_overwhelmed"
  | "dont_know_where_to_start";

export type EmotionalSignalType =
  | "frustrated"
  | "stuck"
  | "confused"
  | "excited"
  | "hopeful";

export type UserSignalKind = "struggle" | "question" | "emotion";

export type UserSignalCategory =
  | UserStruggleType
  | UserQuestionType
  | EmotionalSignalType;

export type UserSignalSource = "chat" | "checkin" | "feature" | "inferred";

/** One categorized observation — never includes message text. */
export type UserSignalRecord = {
  id: string;
  userId: string;
  timestamp: string;
  date: string;
  kind: UserSignalKind;
  category: UserSignalCategory;
  source: UserSignalSource;
};

export type ClassifiedUserSignals = {
  struggles: UserStruggleType[];
  questions: UserQuestionType[];
  emotions: EmotionalSignalType[];
};

export type UserSignalCount = {
  kind: UserSignalKind;
  category: UserSignalCategory;
  count: number;
  lastSeen: string;
};

export type UserSignalDailyCount = {
  date: string;
  kind: UserSignalKind;
  category: UserSignalCategory;
  count: number;
};

export type TrendDirection = "up" | "stable" | "down";

export type UserSignalTrend = {
  kind: UserSignalKind;
  category: UserSignalCategory;
  count7d: number;
  countPrior7d: number;
  frequency7d: number;
  trend: TrendDirection;
  lastSeen: string;
};

export type UserSignalQuery = {
  userId?: string;
  kind?: UserSignalKind;
  category?: UserSignalCategory;
  since?: string;
  until?: string;
  limit?: number;
};

export type ObserveUserSignalsInput = {
  userId: string;
  text: string;
  emotionalState?: EmotionalState;
  source?: UserSignalSource;
  timestamp?: string;
};

const MAX_SIGNALS = 8_000;
const STORAGE_KEY = "adhd-user-intelligence-v1";

const STRUGGLE_RULES: { type: UserStruggleType; re: RegExp }[] = [
  {
    type: "overwhelm",
    re: /\b(overwhelm|overwhelmed|too much|so much|too many|mental clutter|brain fog|drowning|everything at once|can'?t keep up|frazzled|stressed out)\b/i,
  },
  {
    type: "prioritization",
    re: /\b(priorit|what (should|to) (i )?do first|what first|too many priorities|which one first|pick (one|what)|most important|triage|what matters most)\b/i,
  },
  {
    type: "focus",
    re: /\b(can'?t focus|lose focus|distract|attention|scattered|can'?t concentrate|focus is|stay focused|keep losing)\b/i,
  },
  {
    type: "follow_through",
    re: /\b(follow through|finish(ing)?|haven'?t finished|didn'?t finish|never finish|drop(ped)? the ball|left incomplete|abandon|gave up on|stop(ped)? halfway)\b/i,
  },
  {
    type: "decision_making",
    re: /\b(can'?t decide|decide between|which (one|option|path)|decision|too many (ideas|options)|pick the wrong|afraid of picking)\b/i,
  },
  {
    type: "marketing",
    re: /\b(marketing|launch|promot|campaign|sales funnel|audience growth|visibility|get clients|find clients)\b/i,
  },
  {
    type: "content_creation",
    re: /\b(content|write|writing|draft|blog|newsletter|social post|linkedin|copy|create (a )?(post|email|video))\b/i,
  },
];

const QUESTION_RULES: { type: UserQuestionType; re: RegExp }[] = [
  {
    type: "what_should_i_work_on",
    re: /\b(what should i work on|what should i do|what do i do next|what'?s next|where should i start|what to work on)\b/i,
  },
  {
    type: "help_me_prioritize",
    re: /\b(help me priorit|prioritize (this|my)|what matters most|what first|too many things)\b/i,
  },
  {
    type: "im_overwhelmed",
    re: /\b(i'?m overwhelmed|i am overwhelmed|feeling overwhelmed|so overwhelmed|too overwhelmed)\b/i,
  },
  {
    type: "dont_know_where_to_start",
    re: /\b(don'?t know where to start|no idea where to start|where do i (even )?start|can'?t get started|don'?t know how to start)\b/i,
  },
];

const EMOTION_RULES: { type: EmotionalSignalType; re: RegExp }[] = [
  {
    type: "frustrated",
    re: /\b(frustrat|annoyed|irritated|angry|ugh|this sucks|so sick of)\b/i,
  },
  {
    type: "stuck",
    re: /\b(stuck|frozen|can'?t start|procrastinat|paralyzed|can'?t move forward)\b/i,
  },
  {
    type: "confused",
    re: /\b(confus|unclear|don'?t understand|not sure what|lost|foggy)\b/i,
  },
  {
    type: "excited",
    re: /\b(excited|thrilled|pumped|can'?t wait|energized about|love this idea)\b/i,
  },
  {
    type: "hopeful",
    re: /\b(hopeful|optimistic|looking forward|finally|this could work|light at the end)\b/i,
  },
];

function dayKey(ts: string): string {
  return ts.slice(0, 10);
}

function newSignalId(): string {
  return `sig-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function unique<T extends string>(items: T[]): T[] {
  return [...new Set(items)];
}

function mapEmotionalStateToSignals(
  state: EmotionalState | undefined,
): EmotionalSignalType[] {
  if (!state) return [];
  switch (state) {
    case "stuck":
      return ["stuck"];
    case "overwhelmed":
      return ["frustrated"];
    case "unclear":
      return ["confused"];
    case "emotional":
      return ["frustrated"];
    case "focused":
      return [];
    case "building":
      return ["excited"];
    default:
      return [];
  }
}

/** Classify message text into signal categories. Text is not stored. */
export function classifyUserSignals(
  text: string,
  emotionalState?: EmotionalState,
): ClassifiedUserSignals {
  const t = text.trim();
  const struggles = unique(
    STRUGGLE_RULES.filter((r) => r.re.test(t)).map((r) => r.type),
  );
  const questions = unique(
    QUESTION_RULES.filter((r) => r.re.test(t)).map((r) => r.type),
  );
  const fromRules = unique(
    EMOTION_RULES.filter((r) => r.re.test(t)).map((r) => r.type),
  );
  const fromState = mapEmotionalStateToSignals(emotionalState);
  const emotions = unique([...fromRules, ...fromState]);
  return { struggles, questions, emotions };
}

// ---- Persistence ----------------------------------------------------------

export interface UserSignalSink {
  append(record: UserSignalRecord): void;
  all(): UserSignalRecord[];
}

export class MemoryUserSignalSink implements UserSignalSink {
  private records: UserSignalRecord[] = [];
  append(record: UserSignalRecord) {
    this.records.push(record);
    if (this.records.length > MAX_SIGNALS) {
      this.records = this.records.slice(-MAX_SIGNALS);
    }
  }
  all() {
    return this.records.slice();
  }
}

export class LocalStorageUserSignalSink implements UserSignalSink {
  constructor(private key = STORAGE_KEY) {}
  all(): UserSignalRecord[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(this.key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as UserSignalRecord[]) : [];
    } catch {
      return [];
    }
  }
  append(record: UserSignalRecord) {
    if (typeof window === "undefined") return;
    try {
      const next = [...this.all(), record].slice(-MAX_SIGNALS);
      window.localStorage.setItem(this.key, JSON.stringify(next));
    } catch {
      /* best-effort */
    }
  }
}

// ---- Engine ---------------------------------------------------------------

export class UserIntelligenceEngine {
  constructor(private sink: UserSignalSink = new MemoryUserSignalSink()) {}

  recordSignal(input: {
    userId: string;
    kind: UserSignalKind;
    category: UserSignalCategory;
    source?: UserSignalSource;
    timestamp?: string;
  }): UserSignalRecord {
    const timestamp = input.timestamp ?? new Date().toISOString();
    const record: UserSignalRecord = {
      id: newSignalId(),
      userId: input.userId,
      timestamp,
      date: dayKey(timestamp),
      kind: input.kind,
      category: input.category,
      source: input.source ?? "inferred",
    };
    this.sink.append(record);
    return record;
  }

  /** Classify text, record signals, discard text. Returns categories only. */
  observeUserSignals(input: ObserveUserSignalsInput): ClassifiedUserSignals {
    const classified = classifyUserSignals(input.text, input.emotionalState);
    const source = input.source ?? "chat";
    const base = {
      userId: input.userId,
      source,
      timestamp: input.timestamp,
    };
    for (const category of classified.struggles) {
      this.recordSignal({ ...base, kind: "struggle", category });
    }
    for (const category of classified.questions) {
      this.recordSignal({ ...base, kind: "question", category });
    }
    for (const category of classified.emotions) {
      this.recordSignal({ ...base, kind: "emotion", category });
    }
    return classified;
  }

  all(): UserSignalRecord[] {
    return this.sink.all();
  }

  query(q: UserSignalQuery = {}): UserSignalRecord[] {
    let out = this.sink.all().filter((r) => {
      if (q.userId && r.userId !== q.userId) return false;
      if (q.kind && r.kind !== q.kind) return false;
      if (q.category && r.category !== q.category) return false;
      if (q.since && r.timestamp < q.since) return false;
      if (q.until && r.timestamp > q.until) return false;
      return true;
    });
    if (q.limit && out.length > q.limit) out = out.slice(-q.limit);
    return out;
  }

  getCounts(userId?: string): UserSignalCount[] {
    const rows = userId ? this.query({ userId }) : this.all();
    const map = new Map<
      string,
      { kind: UserSignalKind; category: UserSignalCategory; count: number; lastSeen: string }
    >();
    for (const r of rows) {
      const key = `${r.kind}:${r.category}`;
      const prev = map.get(key);
      if (!prev) {
        map.set(key, {
          kind: r.kind,
          category: r.category,
          count: 1,
          lastSeen: r.timestamp,
        });
      } else {
        prev.count += 1;
        if (r.timestamp > prev.lastSeen) prev.lastSeen = r.timestamp;
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }

  getDailyCounts(userId: string, days = 30): UserSignalDailyCount[] {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceIso = since.toISOString();
    const rows = this.query({ userId, since: sinceIso });
    const map = new Map<string, UserSignalDailyCount>();
    for (const r of rows) {
      const key = `${r.date}:${r.kind}:${r.category}`;
      const prev = map.get(key);
      if (prev) prev.count += 1;
      else {
        map.set(key, {
          date: r.date,
          kind: r.kind,
          category: r.category,
          count: 1,
        });
      }
    }
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  }

  getTrends(userId: string, now = new Date()): UserSignalTrend[] {
    const msDay = 86_400_000;
    const end7 = now.getTime();
    const start7 = end7 - 7 * msDay;
    const start14 = end7 - 14 * msDay;
    const rows = this.query({ userId, since: new Date(start14).toISOString() });

    const bucket = new Map<
      string,
      {
        kind: UserSignalKind;
        category: UserSignalCategory;
        count7d: number;
        countPrior7d: number;
        lastSeen: string;
      }
    >();

    for (const r of rows) {
      const ts = new Date(r.timestamp).getTime();
      const key = `${r.kind}:${r.category}`;
      let row = bucket.get(key);
      if (!row) {
        row = {
          kind: r.kind,
          category: r.category,
          count7d: 0,
          countPrior7d: 0,
          lastSeen: r.timestamp,
        };
        bucket.set(key, row);
      }
      if (ts >= start7) row.count7d += 1;
      else row.countPrior7d += 1;
      if (r.timestamp > row.lastSeen) row.lastSeen = r.timestamp;
    }

    return [...bucket.values()]
      .map((row) => {
        let trend: TrendDirection = "stable";
        if (row.count7d > row.countPrior7d + 1) trend = "up";
        else if (row.count7d + 1 < row.countPrior7d) trend = "down";
        return {
          kind: row.kind,
          category: row.category,
          count7d: row.count7d,
          countPrior7d: row.countPrior7d,
          frequency7d: row.count7d / 7,
          trend,
          lastSeen: row.lastSeen,
        };
      })
      .sort((a, b) => b.count7d - a.count7d);
  }

  /** Verify no conversation text leaked into storage. */
  storageIsSignalOnly(): boolean {
    const forbidden = ["text", "message", "content", "conversation", "transcript"];
    for (const r of this.all()) {
      const keys = Object.keys(r as unknown as Record<string, unknown>);
      if (forbidden.some((k) => keys.includes(k))) return false;
    }
    return true;
  }
}

export const userIntelligenceEngine = new UserIntelligenceEngine(
  typeof window === "undefined"
    ? new MemoryUserSignalSink()
    : new LocalStorageUserSignalSink(),
);

export function observeUserSignalsFromText(
  input: Omit<ObserveUserSignalsInput, "userId"> & { userId?: string },
): ClassifiedUserSignals {
  return userIntelligenceEngine.observeUserSignals({
    ...input,
    userId: input.userId ?? getEcosystemUserId(),
  });
}

export function formatUserIntelligenceForGuidance(
  userId: string,
): string | undefined {
  const counts = userIntelligenceEngine.getCounts(userId).slice(0, 12);
  const trends = userIntelligenceEngine.getTrends(userId).slice(0, 8);
  if (!counts.length) return undefined;

  const lines = [
    "USER INTELLIGENCE (categorized signals only — no conversation text):",
    "",
    "TOP SIGNAL COUNTS:",
    ...counts.map(
      (c) => `- ${c.kind}/${c.category}: ${c.count} (last ${c.lastSeen.slice(0, 10)})`,
    ),
  ];

  if (trends.length) {
    lines.push("", "RECENT TRENDS (7d vs prior 7d):");
    for (const t of trends) {
      lines.push(
        `- ${t.kind}/${t.category}: ${t.count7d} vs ${t.countPrior7d} (${t.trend})`,
      );
    }
  }

  return lines.join("\n");
}
