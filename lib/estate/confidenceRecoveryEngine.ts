/**
 * Confidence Recovery Engine (251) + Evidence Retrieval Intelligence (252).
 *
 * When members feel discouraged, Spark restores with relevant evidence —
 * not empty motivation. Retrieval is small, ranked, and never overwhelming.
 */

import { getEvidenceEntries, type EvidenceEntry } from "@/lib/evidenceBankStore";
import { getPortfolioEntries, type PortfolioEntry } from "@/lib/growthPortfolioStore";
import { getJournalEntries, type JournalEntry } from "@/lib/growthJournalStore";
import { getSavedGrowthWins, type SavedGrowthWin } from "@/lib/growthWinsStore";
import { getJourneyEntries, type JourneyEntry } from "@/lib/myJourneyStore";
import { getProjects } from "@/lib/companionStore";

export const CONFIDENCE_RECOVERY_PURPOSE =
  "When members experience discouragement, self-doubt, or fear, Spark responds with meaningful evidence rather than generic encouragement." as const;

export const CONFIDENCE_RECOVERY_GOAL =
  "The goal is restoration, not motivation." as const;

/** 251 — example trigger phrases */
export const CONFIDENCE_RECOVERY_TRIGGER_EXAMPLES = [
  "I can't do this.",
  "I'm overwhelmed.",
  "I'm failing.",
  "Nothing is working.",
] as const;

/** 251 — sources Spark searches for recovery */
export const CONFIDENCE_RECOVERY_SEARCH_SOURCES = [
  "Evidence Vault",
  "Hall of Accomplishments",
  "Journal",
  "Previous victories",
  "Testimonials",
] as const;

/** 252 — full retrieval sources */
export const EVIDENCE_RETRIEVAL_SOURCES = [
  "Evidence Vault",
  "Hall of Accomplishments",
  "Celebration Garden",
  "Wins Timeline",
  "Journal",
  "Projects",
] as const;

/** 252 — context dimensions */
export const EVIDENCE_RETRIEVAL_CONTEXT_DIMENSIONS = [
  "Current conversation",
  "Current project",
  "Emotional state",
  "Recent setbacks",
  "Similar past successes",
] as const;

/** Never overwhelm — present a small number of highly relevant reminders. */
export const EVIDENCE_RETRIEVAL_MAX_ITEMS = 3 as const;

export type EvidenceRetrievalSourceId =
  | "evidence-vault"
  | "hall-of-accomplishments"
  | "celebration-garden"
  | "wins-timeline"
  | "journal"
  | "projects";

export type RetrievedEvidenceItem = {
  id: string;
  source: EvidenceRetrievalSourceId;
  sourceLabel: string;
  title: string;
  excerpt: string;
  score: number;
  createdAt: string;
};

export type EvidenceRetrievalContext = {
  conversationText?: string;
  projectName?: string;
  emotionalState?: "discouraged" | "overwhelmed" | "failing" | "fear" | "neutral";
  recentSetbacks?: string;
  maxItems?: number;
};

export type ConfidenceRecoveryResult = {
  triggered: boolean;
  emotionalState: EvidenceRetrievalContext["emotionalState"];
  items: RetrievedEvidenceItem[];
  message: string;
  openPlaceId: "evidence-vault" | "portfolio" | "wins-this-week" | "my-journey" | null;
};

const CONFIDENCE_TRIGGER_RE =
  /\b(?:i\s+can'?t\s+do\s+this|i'?m\s+overwhelmed|i\s+am\s+overwhelmed|i'?m\s+failing|i\s+am\s+failing|nothing\s+is\s+working|this\s+isn'?t\s+working|i\s+feel\s+like\s+(?:a\s+)?failure|i'?m\s+(?:so\s+)?discouraged|doubt(?:ing)?\s+myself|i\s+don'?t\s+think\s+i\s+can)\b/i;

export function detectsConfidenceRecoveryNeed(text: string): boolean {
  return CONFIDENCE_TRIGGER_RE.test(text.trim());
}

export function inferEmotionalState(
  text: string,
): NonNullable<EvidenceRetrievalContext["emotionalState"]> {
  const t = text.toLowerCase();
  if (/\boverwhelmed\b/.test(t)) return "overwhelmed";
  if (/\bfail(?:ing|ure)?\b/.test(t)) return "failing";
  if (/\b(?:afraid|fear|scared|can'?t\s+do)\b/.test(t)) return "fear";
  if (/\b(?:discouraged|doubt|nothing\s+is\s+working|defeated)\b/.test(t)) {
    return "discouraged";
  }
  return "neutral";
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);
}

function overlapScore(queryTokens: string[], haystack: string): number {
  if (!queryTokens.length || !haystack.trim()) return 0;
  const hay = haystack.toLowerCase();
  let hits = 0;
  for (const t of queryTokens) {
    if (hay.includes(t)) hits += 1;
  }
  return hits;
}

function scoreText(
  queryTokens: string[],
  fields: string[],
  boosts: { confidenceBoost?: boolean; testimonial?: boolean; recent?: boolean },
): number {
  const joined = fields.filter(Boolean).join("\n");
  let score = overlapScore(queryTokens, joined);
  if (boosts.confidenceBoost) score += 2;
  if (boosts.testimonial) score += 2;
  if (boosts.recent) score += 1;
  if (/\b(?:proud|courage|handled|succeed|won|finished|helped)\b/i.test(joined)) {
    score += 1;
  }
  return score;
}

function isRecent(iso: string, days = 90): boolean {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return false;
  return Date.now() - t < days * 24 * 60 * 60 * 1000;
}

function fromVault(
  entry: EvidenceEntry,
  queryTokens: string[],
): RetrievedEvidenceItem {
  const title =
    entry.whatThisProves?.trim() ||
    entry.category ||
    "Evidence from your Vault";
  const excerpt =
    entry.whatHappened?.trim() ||
    entry.whyItMattered?.trim() ||
    entry.whatThisProves?.trim() ||
    "Proof you handled something before.";
  const testimonial = /testimonial|thank|encourag/i.test(entry.category);
  return {
    id: `vault:${entry.id}`,
    source: "evidence-vault",
    sourceLabel: "Evidence Vault",
    title: title.slice(0, 80),
    excerpt: excerpt.slice(0, 220),
    score: scoreText(
      queryTokens,
      [
        entry.whatHappened,
        entry.whyItMattered,
        entry.whatThisProves,
        entry.category,
        entry.projectName ?? "",
        entry.personName ?? "",
      ],
      {
        confidenceBoost: entry.confidenceBoost,
        testimonial,
        recent: isRecent(entry.updatedAt || entry.createdAt),
      },
    ),
    createdAt: entry.updatedAt || entry.createdAt,
  };
}

function fromHall(
  entry: PortfolioEntry,
  queryTokens: string[],
): RetrievedEvidenceItem {
  return {
    id: `hall:${entry.id}`,
    source: "hall-of-accomplishments",
    sourceLabel: "Hall of Accomplishments",
    title: entry.title.slice(0, 80) || "A milestone you earned",
    excerpt: (entry.description || entry.title).slice(0, 220),
    score: scoreText(
      queryTokens,
      [
        entry.title,
        entry.description,
        entry.achievementType ?? "",
        entry.projectName ?? "",
        entry.category ?? "",
      ],
      { recent: isRecent(entry.updatedAt || entry.createdAt) },
    ) + 1,
    createdAt: entry.updatedAt || entry.createdAt,
  };
}

function fromGarden(
  win: SavedGrowthWin,
  queryTokens: string[],
): RetrievedEvidenceItem {
  return {
    id: `garden:${win.id}`,
    source: "celebration-garden",
    sourceLabel: "Celebration Garden",
    title: (win.category || "A moment of progress").slice(0, 80),
    excerpt: win.whatHappened.slice(0, 220),
    score: scoreText(
      queryTokens,
      [win.whatHappened, win.category ?? ""],
      { recent: isRecent(win.ts || win.createdAt) },
    ),
    createdAt: win.ts || win.createdAt,
  };
}

function fromTimeline(
  entry: JourneyEntry,
  queryTokens: string[],
): RetrievedEvidenceItem {
  return {
    id: `timeline:${entry.id}`,
    source: "wins-timeline",
    sourceLabel: "Wins Timeline",
    title: entry.title.slice(0, 80) || "A chapter in your growth",
    excerpt: (
      entry.whatHappened ||
      entry.whatDidILearn ||
      entry.whatWisdom ||
      entry.title
    ).slice(0, 220),
    score: scoreText(
      queryTokens,
      [
        entry.title,
        entry.whatHappened,
        entry.whatDidILearn,
        entry.category,
        entry.chapter,
      ],
      { recent: isRecent(entry.updatedAt || entry.createdAt) },
    ),
    createdAt: entry.updatedAt || entry.date || entry.createdAt,
  };
}

function fromJournal(
  entry: JournalEntry,
  queryTokens: string[],
): RetrievedEvidenceItem {
  return {
    id: `journal:${entry.id}`,
    source: "journal",
    sourceLabel: "Journal",
    title: (entry.title || "From your journal").slice(0, 80),
    excerpt: entry.body.slice(0, 220),
    score: scoreText(
      queryTokens,
      [entry.title ?? "", entry.body, ...(entry.tags ?? [])],
      {
        recent: isRecent(entry.updatedAt || entry.createdAt),
        testimonial: /\b(?:proud|grateful|breakthrough|won|finished)\b/i.test(
          entry.body,
        ),
      },
    ),
    createdAt: entry.updatedAt || entry.createdAt,
  };
}

function fromProjects(
  entry: PortfolioEntry,
  queryTokens: string[],
): RetrievedEvidenceItem | null {
  const isProject =
    /project|launch|finished/i.test(entry.achievementType ?? "") ||
    Boolean(entry.projectName?.trim());
  if (!isProject && !entry.projectName) return null;
  return {
    id: `project:${entry.id}`,
    source: "projects",
    sourceLabel: "Projects",
    title: (entry.projectName || entry.title).slice(0, 80),
    excerpt: (entry.description || entry.title).slice(0, 220),
    score: scoreText(
      queryTokens,
      [entry.title, entry.description, entry.projectName ?? ""],
      { recent: isRecent(entry.updatedAt || entry.createdAt) },
    ),
    createdAt: entry.updatedAt || entry.createdAt,
  };
}

function fromCompanionProject(
  project: { id: string; name: string; goals?: string[]; updatedAt?: string; createdAt?: string },
  queryTokens: string[],
): RetrievedEvidenceItem {
  const createdAt = project.updatedAt || project.createdAt || new Date().toISOString();
  return {
    id: `projects:${project.id}`,
    source: "projects",
    sourceLabel: "Projects",
    title: project.name.slice(0, 80) || "A project you are building",
    excerpt: (project.goals?.slice(0, 2).join(" · ") || project.name).slice(0, 220),
    score: scoreText(
      queryTokens,
      [project.name, ...(project.goals ?? [])],
      { recent: isRecent(createdAt) },
    ),
    createdAt,
  };
}

/**
 * 252 — retrieve a small set of highly relevant reminders across sources.
 */
export function retrieveEvidenceReminders(
  context: EvidenceRetrievalContext = {},
): RetrievedEvidenceItem[] {
  const max = Math.min(
    context.maxItems ?? EVIDENCE_RETRIEVAL_MAX_ITEMS,
    EVIDENCE_RETRIEVAL_MAX_ITEMS,
  );
  const query = [
    context.conversationText ?? "",
    context.projectName ?? "",
    context.recentSetbacks ?? "",
    context.emotionalState && context.emotionalState !== "neutral"
      ? context.emotionalState
      : "",
  ]
    .join(" ")
    .trim();
  const queryTokens = tokenize(query);

  const candidates: RetrievedEvidenceItem[] = [];

  for (const e of getEvidenceEntries()) {
    candidates.push(fromVault(e, queryTokens));
  }
  for (const e of getPortfolioEntries()) {
    candidates.push(fromHall(e, queryTokens));
    const project = fromProjects(e, queryTokens);
    if (project) candidates.push(project);
  }
  try {
    for (const p of getProjects()) {
      candidates.push(fromCompanionProject(p, queryTokens));
    }
  } catch {
    /* SSR / storage unavailable */
  }
  for (const w of getSavedGrowthWins()) {
    candidates.push(fromGarden(w, queryTokens));
  }
  for (const j of getJourneyEntries()) {
    candidates.push(fromTimeline(j, queryTokens));
  }
  for (const entry of getJournalEntries()) {
    if (entry.isArchived) continue;
    candidates.push(fromJournal(entry, queryTokens));
  }

  // Prefer confidence-boost vault items and milestones when query is empty.
  const ranked = [...candidates].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const seen = new Set<string>();
  const picked: RetrievedEvidenceItem[] = [];
  for (const item of ranked) {
    const key = `${item.source}:${item.excerpt.slice(0, 40)}`;
    if (seen.has(key)) continue;
    // Soft floor: keep items with any signal, or top recency when no tokens.
    if (queryTokens.length > 0 && item.score <= 0 && picked.length > 0) continue;
    seen.add(key);
    picked.push(item);
    if (picked.length >= max) break;
  }
  return picked;
}

export function formatConfidenceRecoveryMessage(
  items: readonly RetrievedEvidenceItem[],
): string {
  if (items.length === 0) {
    return [
      "This feels heavy right now. When you have something that proves you can keep going — a note, a win, a milestone — we can keep it in your Evidence Vault so it's here next time.",
      "",
      CONFIDENCE_RECOVERY_GOAL,
      "",
      "Would it help to open your Evidence Vault anyway?",
    ].join("\n");
  }
  const lines = [
    "You're not starting from nothing. Here are reminders from your own evidence — not empty pep talk:",
    "",
  ];
  items.forEach((item, i) => {
    lines.push(`${i + 1}. (${item.sourceLabel}) ${item.title}`);
    lines.push(`   ${item.excerpt}`);
    lines.push("");
  });
  lines.push(CONFIDENCE_RECOVERY_GOAL);
  lines.push("");
  lines.push(
    "Would you like to open the Evidence Vault for more, or stay with these for a moment?",
  );
  return lines.join("\n");
}

function preferredOpenPlace(
  items: readonly RetrievedEvidenceItem[],
): ConfidenceRecoveryResult["openPlaceId"] {
  if (items.length === 0) return "evidence-vault";
  const top = items[0]!.source;
  if (top === "hall-of-accomplishments") return "portfolio";
  if (top === "celebration-garden") return "wins-this-week";
  if (top === "wins-timeline") return "my-journey";
  return "evidence-vault";
}

/**
 * 251 — full confidence recovery turn: detect → retrieve → present.
 */
export function runConfidenceRecovery(
  userText: string,
  options?: { projectName?: string },
): ConfidenceRecoveryResult | null {
  if (!detectsConfidenceRecoveryNeed(userText)) return null;
  const emotionalState = inferEmotionalState(userText);
  const items = retrieveEvidenceReminders({
    conversationText: userText,
    projectName: options?.projectName,
    emotionalState,
    maxItems: EVIDENCE_RETRIEVAL_MAX_ITEMS,
  });
  return {
    triggered: true,
    emotionalState,
    items,
    message: formatConfidenceRecoveryMessage(items),
    openPlaceId: preferredOpenPlace(items),
  };
}
