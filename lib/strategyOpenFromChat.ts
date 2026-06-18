/**
 * Open a specific ADHD strategy in the panel when the user asks in chat.
 */

import {
  ADHD_STRATEGY_HUB,
  type AdhdStrategyHubEntry,
} from "./strategyCatalog";
import { STRATEGIES, getStrategy } from "./strategySystem";

export type StrategyOpenTarget =
  | { kind: "builtin"; strategyId: string; title: string }
  | { kind: "hub"; entry: AdhdStrategyHubEntry; title: string };

export type StrategyOpenContext = {
  /** Strategies workspace is visible beside chat. */
  inStrategiesWorkspace?: boolean;
  /** Last assistant message — used when user picks from a short list. */
  lastAssistantText?: string;
};

const OPEN_VERB_RE =
  /\b(?:open|show|pull up|bring up|let'?s (?:do|try|use)|use|try)\b/i;

/** Common nicknames → strategy id */
const ALIASES: Record<string, string> = {
  "start ugly": "ugly-first-draft",
  ugly: "ugly-first-draft",
  "just start ugly": "ugly-first-draft",
  "ugly first draft": "ugly-first-draft",
  "shrink the first step": "shrink-first-step",
  "shrink first step": "shrink-first-step",
  shrink: "shrink-first-step",
  "body double": "body-double",
  "two minute entry": "two-minute-start",
  "2 minute entry": "two-minute-start",
  "the 2-minute entry": "two-minute-start",
  "first tiny step": "first-tiny-step",
  "shrink the world": "shrink-the-world",
};

const PROCRASTINATION_PICK_RE =
  /\b(?:start ugly|shrink(?:\s+the)?(?:\s+first)?(?:\s+step)?|body double|ugly|first one|second one|third one|#\s*1|#\s*2|#\s*3|option\s*[123])\b/i;

function softNormalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s'#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Strip open verbs only — keep "start ugly" intact. */
function stripOpenVerbs(text: string): string {
  return text
    .replace(/^(?:open|show|pull up|bring up|let'?s (?:do|try|use)|use|try)\s+/i, "")
    .replace(/^just\s+/, "")
    .trim();
}

function matchBuiltinStrategy(query: string): StrategyOpenTarget | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const aliasEntries = Object.entries(ALIASES).sort(
    (a, b) => b[0].length - a[0].length,
  );
  for (const [alias, id] of aliasEntries) {
    if (q === alias) {
      const s = getStrategy(id);
      if (s) return { kind: "builtin", strategyId: id, title: s.title };
    }
  }

  for (const s of STRATEGIES) {
    const title = s.title.toLowerCase();
    if (q === title) {
      return { kind: "builtin", strategyId: s.id, title: s.title };
    }
  }
  return null;
}

function matchHubEntry(query: string): StrategyOpenTarget | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  for (const entry of ADHD_STRATEGY_HUB) {
    const label = entry.label.toLowerCase();
    if (q === label) {
      if (entry.route.kind === "builtin") {
        const s = getStrategy(entry.route.strategyId);
        return {
          kind: "builtin",
          strategyId: entry.route.strategyId,
          title: s?.title ?? entry.label,
        };
      }
      return { kind: "hub", entry, title: entry.label };
    }
  }
  return null;
}

function assistantOfferedStrategyPick(
  lastAssistantText: string | undefined,
  query: string,
): boolean {
  if (!lastAssistantText?.trim()) return false;
  const last = lastAssistantText.toLowerCase();
  const target = matchBuiltinStrategy(query) ?? matchHubEntry(query);
  if (!target) return false;
  const title = target.title.toLowerCase();
  return (
    last.includes(title) ||
    last.includes("adhd dropdown") ||
    last.includes("pick one") ||
    PROCRASTINATION_PICK_RE.test(last)
  );
}

function resolvePickFromOrdinal(
  raw: string,
  lastAssistantText?: string,
): StrategyOpenTarget | null {
  const t = softNormalize(raw);
  const last = lastAssistantText?.toLowerCase() ?? "";
  if (!last.includes("start ugly") || !last.includes("body double")) return null;

  const picks: StrategyOpenTarget[] = [];
  for (const id of ["ugly-first-draft", "shrink-first-step", "body-double"] as const) {
    const s = getStrategy(id);
    if (s) picks.push({ kind: "builtin", strategyId: id, title: s.title });
  }
  if (/\b(?:first|1|one|#1)\b/.test(t)) return picks[0] ?? null;
  if (/\b(?:second|2|two|#2)\b/.test(t)) return picks[1] ?? null;
  if (/\b(?:third|3|three|#3)\b/.test(t)) return picks[2] ?? null;
  return null;
}

/** User wants a strategy opened in the Strategies panel. */
export function resolveStrategyOpenFromChat(
  text: string,
  ctx: StrategyOpenContext = {},
): StrategyOpenTarget | null {
  const raw = text.trim();
  if (!raw) return null;

  const soft = softNormalize(raw);
  const stripped = stripOpenVerbs(soft);

  const candidates = [soft, stripped].filter(
    (q, i, arr) => q && arr.indexOf(q) === i,
  );

  for (const query of candidates) {
    const target = matchBuiltinStrategy(query) ?? matchHubEntry(query);
    if (!target) continue;

    const explicitOpen = OPEN_VERB_RE.test(raw);
    const inWorkspace = Boolean(ctx.inStrategiesWorkspace);
    const fromOffer = assistantOfferedStrategyPick(ctx.lastAssistantText, query);

    if (explicitOpen || inWorkspace || fromOffer) {
      return target;
    }
  }

  if (ctx.inStrategiesWorkspace || ctx.lastAssistantText) {
    return resolvePickFromOrdinal(raw, ctx.lastAssistantText);
  }

  return null;
}

export function strategyOpenAck(title: string): string {
  return `**${title}** is open on the right — skim it, then tell me what you're avoiding and we'll apply it to your situation.`;
}
