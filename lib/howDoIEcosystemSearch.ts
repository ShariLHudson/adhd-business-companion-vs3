import type { AppSection, SidebarToolId } from "./companionUi";
import {
  MORE_NAV,
  SIDEBAR_NAV,
  SIDEBAR_TOOLS,
  TOOL_SECTION,
} from "./companionUi";
import { APP_FEATURES, type AppFeatureId } from "./appFeatureKnowledge";
import { COMPANION_ACTIVITIES } from "./companionActivities";
import { guidedExerciseMenu } from "./guidedExercises";
import { HOW_DO_I_HELP_ARTICLES } from "./howDoIHelpArticles";
import { HELP_CENTER_ARTICLE_IDS } from "./howDoIHelpCenterArticles";
import { ADHD_STRATEGY_HUB } from "./strategyCatalog";
import {
  STRATEGIES,
  getCategory,
  type Strategy,
} from "./strategySystem";

export type EcosystemSearchResultType =
  | "Area"
  | "Activity"
  | "Strategy"
  | "Help";

export type EcosystemSearchAction =
  | { kind: "section"; section: AppSection }
  | { kind: "activity"; activityId: string }
  | { kind: "strategy"; strategyId: string }
  | { kind: "help-article"; articleId: string }
  | { kind: "tool"; tool: SidebarToolId }
  | { kind: "settings"; section: string };

export type EcosystemSearchResult = {
  id: string;
  title: string;
  type: EcosystemSearchResultType;
  description: string;
  emoji?: string;
  score: number;
  action: EcosystemSearchAction;
};

type IndexEntry = {
  id: string;
  title: string;
  type: EcosystemSearchResultType;
  description: string;
  emoji?: string;
  keywords: string[];
  aliases: string[];
  haystack: string;
  action: EcosystemSearchAction;
  priority: number;
};

const MAIN_AREA_SECTION: Record<string, AppSection> = {
  "plan-my-day": "plan-my-day",
  projects: "projects",
  "create-overview": "content-generator",
  "clear-my-mind": "brain-dump",
  strategies: "playbook",
  templates: "templates-library",
  snippets: "snippets",
  "my-work": "my-work",
  "evidence-bank": "wins-this-week",
  "wins-this-week": "wins-this-week",
  "client-avatars": "client-avatars",
  "settings-personalization": "settings",
};

const HIDDEN_ALIASES: Record<string, string[]> = {
  "spin-wheel": ["spin the wheel", "spin wheel", "wheel", "pick for me", "random"],
  breathe: [
    "breath",
    "breathing",
    "breathe and reset",
    "calm",
    "grounding",
    "nervous system",
    "reset",
  ],
  "brain-parking-lot": [
    "parking lot",
    "brain parking lot",
    "park idea",
    "park this",
    "save for later",
  ],
  "focus-timer": ["pomodoro", "focus session", "focus timer", "timer"],
  "focus-audio": ["focus audio", "background music", "study music", "lofi"],
  games: ["momentum games", "mini games", "play a game"],
  "guided-exercises": ["guided exercises", "decision compass", "values check"],
  "adhd-overwhelm": ["overwhelmed", "overwhelm", "too much", "shutdown"],
  "task-initiation": ["stuck starting", "cannot start", "procrastinate"],
  playbook: ["strategies", "adhd strategies", "playbook"],
  "brain-dump": ["clear my mind", "brain dump", "mental clutter"],
  energy: ["adjust my day", "low energy", "match energy"],
};

const FEATURE_SECTION: Partial<Record<AppFeatureId, AppSection>> = {
  focus: "focus",
  "clear-my-mind": "brain-dump",
  "focus-session": "focus-timer",
  breathe: "breathe",
  "focus-audio": "focus-audio",
  "time-block": "time-block",
  "momentum-games": "games",
  "spin-wheel": "spin-wheel",
  "guided-exercises": "guided-exercises",
  create: "content-generator",
  templates: "templates-library",
  strategies: "playbook",
  projects: "projects",
  snippets: "snippets",
  "how-do-i": "how-do-i",
  settings: "settings",
  profile: "profile",
  "client-avatars": "client-avatars",
  "adjust-my-day": "energy",
  "settings-appearance": "settings",
};

const FEATURE_ACTIVITY: Partial<Record<AppFeatureId, string>> = {
  "brain-parking-lot": "brain-parking-lot",
  "safe-for-today": "safe-for-today",
};

function normalizeQuery(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^how\s+(?:do\s+i|to|can\s+i)\s+/i, "")
    .replace(/[?.!]+$/g, "")
    .trim();
}

function tokenize(q: string): string[] {
  return q.split(/\s+/).filter((t) => t.length > 1);
}

function buildHaystack(parts: (string | undefined)[]): string {
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function regexToKeywordHints(patterns: RegExp[]): string[] {
  const out: string[] = [];
  for (const re of patterns) {
    const src = re.source
      .replace(/\\b/g, "")
      .replace(/[()[\]{}^$|?*+]/g, " ")
      .replace(/\\s\+/g, " ")
      .replace(/\\s\*/g, "")
      .replace(/\\s/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (src.length > 2 && src.length < 48) out.push(src);
  }
  return out;
}

function entryFromParts(parts: Omit<IndexEntry, "haystack">): IndexEntry {
  return {
    ...parts,
    haystack: buildHaystack([
      parts.title,
      parts.description,
      ...parts.keywords,
      ...parts.aliases,
    ]),
  };
}

function buildIndex(): IndexEntry[] {
  const entries: IndexEntry[] = [];
  const seen = new Set<string>();

  function add(entry: IndexEntry) {
    const key = `${entry.type}:${entry.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    entries.push(entry);
  }

  const mainAreaIds = new Set<string>(HELP_CENTER_ARTICLE_IDS);

  for (const article of HOW_DO_I_HELP_ARTICLES) {
    const isMain = mainAreaIds.has(article.id);
    const section = MAIN_AREA_SECTION[article.id] ?? article.openSection;

    if (isMain && section) {
      add(
        entryFromParts({
          id: `area-${article.id}`,
          title: article.title,
          type: "Area",
          description: article.whatItIs,
          emoji: article.emoji,
          keywords: [...article.keywords, article.id.replace(/-/g, " ")],
          aliases: HIDDEN_ALIASES[article.id] ?? [],
          action: { kind: "section", section },
          priority: 0,
        }),
      );
      continue;
    }

    add(
      entryFromParts({
        id: `help-${article.id}`,
        title: article.title,
        type: "Help",
        description: article.whatItIs,
        emoji: article.emoji,
        keywords: [
          ...article.keywords,
          article.id.replace(/-/g, " "),
          article.whenToUse,
        ],
        aliases: HIDDEN_ALIASES[article.id] ?? [],
        action: { kind: "help-article", articleId: article.id },
        priority: 3,
      }),
    );
  }

  for (const nav of [...SIDEBAR_NAV, ...MORE_NAV]) {
    const sectionMap: Partial<Record<string, AppSection>> = {
      chat: "home",
      focus: "focus",
      create: "content-generator",
      "my-work": "my-work",
      projects: "projects",
      snippets: "snippets",
      "saved-work": "saved-work",
      "wins-this-week": "wins-this-week",
      playbook: "playbook",
      templates: "templates-library",
      "how-do-i": "how-do-i",
    };
    const section = sectionMap[nav.id];
    if (!section) continue;
    add(
      entryFromParts({
        id: `nav-${nav.id}`,
        title: nav.label,
        type: "Area",
        description: `Open ${nav.label} from the sidebar.`,
        emoji: nav.emoji,
        keywords: [nav.label.toLowerCase(), nav.id.replace(/-/g, " ")],
        aliases: [],
        action: { kind: "section", section },
        priority: 1,
      }),
    );
  }

  for (const tool of SIDEBAR_TOOLS) {
    const section = TOOL_SECTION[tool.id];
    if (!section) continue;
    add(
      entryFromParts({
        id: `tool-${tool.id}`,
        title: tool.label,
        type: "Activity",
        description: `Open ${tool.label}.`,
        emoji: tool.emoji,
        keywords: [tool.label.toLowerCase(), tool.id.replace(/-/g, " ")],
        aliases: HIDDEN_ALIASES[tool.id] ?? [],
        action: { kind: "section", section },
        priority: 1,
      }),
    );
  }

  for (const feature of APP_FEATURES) {
    const activityId = FEATURE_ACTIVITY[feature.id];
    const section = FEATURE_SECTION[feature.id];
    const aliasKey = feature.id === "focus-session" ? "focus-timer" : feature.id;

    if (activityId) {
      add(
        entryFromParts({
          id: `feature-activity-${feature.id}`,
          title: feature.name,
          type: "Activity",
          description: feature.howTo,
          keywords: [
            feature.name.toLowerCase(),
            ...regexToKeywordHints(feature.match),
          ],
          aliases: [
            ...(HIDDEN_ALIASES[aliasKey] ?? []),
            ...(HIDDEN_ALIASES[feature.id] ?? []),
          ],
          action: { kind: "activity", activityId },
          priority: 1,
        }),
      );
      continue;
    }

    if (section) {
      add(
        entryFromParts({
          id: `feature-${feature.id}`,
          title: feature.name,
          type: section === "playbook" || section === "brain-dump" ? "Area" : "Activity",
          description: feature.howTo,
          keywords: [
            feature.name.toLowerCase(),
            ...regexToKeywordHints(feature.match),
          ],
          aliases: [
            ...(HIDDEN_ALIASES[aliasKey] ?? []),
            ...(HIDDEN_ALIASES[feature.id] ?? []),
          ],
          action: { kind: "section", section },
          priority: 1,
        }),
      );
    }
  }

  for (const activity of COMPANION_ACTIVITIES) {
    add(
      entryFromParts({
        id: `activity-${activity.id}`,
        title: activity.title,
        type: "Activity",
        description: activity.helpsWith,
        keywords: [
          activity.title.toLowerCase(),
          activity.id.replace(/-/g, " "),
          activity.categoryId,
          activity.helpsWith.toLowerCase(),
        ],
        aliases: HIDDEN_ALIASES[activity.id] ?? [],
        action: { kind: "activity", activityId: activity.id },
        priority: 2,
      }),
    );
  }

  for (const exercise of guidedExerciseMenu()) {
    add(
      entryFromParts({
        id: `guided-${exercise.id}`,
        title: exercise.title,
        type: "Activity",
        description: exercise.purpose,
        emoji: exercise.emoji,
        keywords: [
          exercise.title.toLowerCase(),
          exercise.id.replace(/-/g, " "),
          exercise.activityId,
          "guided exercise",
        ],
        aliases: [],
        action: { kind: "activity", activityId: exercise.activityId },
        priority: 2,
      }),
    );
  }

  for (const hub of ADHD_STRATEGY_HUB) {
    if (hub.route.kind === "builtin") {
      add(
        entryFromParts({
          id: `hub-strategy-${hub.id}`,
          title: hub.label,
          type: "Strategy",
          description: "ADHD strategy — apply right now.",
          keywords: [hub.label.toLowerCase(), hub.id.replace(/-/g, " ")],
          aliases: HIDDEN_ALIASES[hub.id] ?? [],
          action: { kind: "strategy", strategyId: hub.route.strategyId },
          priority: 2,
        }),
      );
    } else if (hub.route.kind === "activity") {
      add(
        entryFromParts({
          id: `hub-activity-${hub.id}`,
          title: hub.label,
          type: "Activity",
          description: "ADHD strategy activity.",
          keywords: [hub.label.toLowerCase(), hub.id.replace(/-/g, " ")],
          aliases: HIDDEN_ALIASES[hub.id] ?? [],
          action: { kind: "activity", activityId: hub.route.activityId },
          priority: 2,
        }),
      );
    } else if (hub.route.kind === "section") {
      add(
        entryFromParts({
          id: `hub-area-${hub.id}`,
          title: hub.label,
          type: "Area",
          description: "Open this workspace.",
          keywords: [hub.label.toLowerCase()],
          aliases: HIDDEN_ALIASES[hub.id] ?? [],
          action: { kind: "section", section: hub.route.section },
          priority: 2,
        }),
      );
    }
  }

  for (const strategy of STRATEGIES) {
    add(strategyIndexEntry(strategy));
  }

  return entries;
}

function strategyIndexEntry(strategy: Strategy): IndexEntry {
  const cat = getCategory(strategy.categoryId);
  const catLabel = cat?.label.toLowerCase() ?? strategy.categoryId;
  return entryFromParts({
    id: `strategy-${strategy.id}`,
    title: strategy.title,
    type: "Strategy",
    description: strategy.whenToUse,
    keywords: [
      strategy.title.toLowerCase(),
      strategy.id.replace(/-/g, " "),
      catLabel,
      strategy.categoryId,
      strategy.whenToUse.toLowerCase(),
      strategy.problem.toLowerCase().slice(0, 120),
      ...(strategy.tags ?? []),
    ],
    aliases: [],
    action: { kind: "strategy", strategyId: strategy.id },
    priority: 2,
  });
}

let indexCache: IndexEntry[] | null = null;

function ecosystemIndex(): IndexEntry[] {
  if (!indexCache) indexCache = buildIndex();
  return indexCache;
}

function scoreEntry(entry: IndexEntry, rawQuery: string): number {
  const q = normalizeQuery(rawQuery);
  if (!q) return 0;

  let score = 0;
  const title = entry.title.toLowerCase();

  if (title === q) score += 120;
  if (title.includes(q)) score += 45;

  for (const alias of entry.aliases) {
    if (alias === q) score += 90;
    else if (alias.includes(q) || q.includes(alias)) score += 35;
    else {
      for (const token of tokenize(q)) {
        if (alias.includes(token)) score += 18;
      }
    }
  }

  for (const kw of entry.keywords) {
    const k = kw.toLowerCase();
    if (k === q) score += 55;
    else if (k.includes(q) || q.includes(k)) score += 22;
  }

  if (entry.haystack.includes(q)) score += 20;

  const tokens = tokenize(q);
  for (const token of tokens) {
    if (title.includes(token)) score += 14;
    if (entry.aliases.some((a) => a.includes(token))) score += 12;
    if (entry.keywords.some((k) => k.toLowerCase().includes(token))) score += 8;
    if (entry.haystack.includes(token)) score += 5;
  }

  return score;
}

const TYPE_ORDER: EcosystemSearchResultType[] = [
  "Area",
  "Activity",
  "Strategy",
  "Help",
];

function actionKey(action: EcosystemSearchAction): string {
  switch (action.kind) {
    case "section":
      return `section:${action.section}`;
    case "activity":
      return `activity:${action.activityId}`;
    case "strategy":
      return `strategy:${action.strategyId}`;
    case "help-article":
      return `help:${action.articleId}`;
    case "tool":
      return `tool:${action.tool}`;
    case "settings":
      return `settings:${action.section}`;
    default:
      return "unknown";
  }
}

export function searchEcosystem(
  query: string,
  limit = 20,
): EcosystemSearchResult[] {
  const q = query.trim();
  if (!q) return [];

  const ranked = ecosystemIndex()
    .map((entry) => ({
      entry,
      score: scoreEntry(entry, q),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.entry.priority !== b.entry.priority) {
        return a.entry.priority - b.entry.priority;
      }
      const typeDiff =
        TYPE_ORDER.indexOf(a.entry.type) - TYPE_ORDER.indexOf(b.entry.type);
      if (typeDiff !== 0) return typeDiff;
      return a.entry.title.localeCompare(b.entry.title);
    });

  const seenActions = new Set<string>();
  const out: EcosystemSearchResult[] = [];

  for (const { entry, score } of ranked) {
    const key = actionKey(entry.action);
    if (seenActions.has(key)) continue;
    seenActions.add(key);
    out.push({
      id: entry.id,
      title: entry.title,
      type: entry.type,
      description: entry.description,
      emoji: entry.emoji,
      score,
      action: entry.action,
    });
    if (out.length >= limit) break;
  }

  return out;
}

export function groupEcosystemSearchResults(
  results: EcosystemSearchResult[],
): { type: EcosystemSearchResultType; items: EcosystemSearchResult[] }[] {
  const buckets = new Map<EcosystemSearchResultType, EcosystemSearchResult[]>();
  for (const result of results) {
    const list = buckets.get(result.type) ?? [];
    list.push(result);
    buckets.set(result.type, list);
  }
  return TYPE_ORDER.map((type) => ({
    type,
    items: buckets.get(type) ?? [],
  })).filter((group) => group.items.length > 0);
}

export function bestEcosystemSearchResult(
  query: string,
): EcosystemSearchResult | null {
  return searchEcosystem(query, 1)[0] ?? null;
}
