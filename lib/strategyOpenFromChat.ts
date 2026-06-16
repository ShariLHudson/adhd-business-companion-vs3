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

const OPEN_VERB_RE =
  /\b(?:open|show|pull up|bring up|let'?s (?:do|try|use)|start|use|try)\b/i;

/** Common nicknames → strategy id */
const ALIASES: Record<string, string> = {
  "start ugly": "ugly-first-draft",
  "just start ugly": "ugly-first-draft",
  "ugly first draft": "ugly-first-draft",
  "shrink the first step": "shrink-first-step",
  "shrink first step": "shrink-first-step",
  "body double": "body-double",
  "two minute entry": "two-minute-start",
  "2 minute entry": "two-minute-start",
  "the 2-minute entry": "two-minute-start",
  "first tiny step": "first-tiny-step",
  "shrink the world": "shrink-the-world",
};

function normalizeQuery(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^(?:open|show|pull up|bring up|let'?s (?:do|try|use)|start|use|try)\s+/i, "")
    .replace(/^just\s+/, "")
    .trim();
}

function matchBuiltinStrategy(query: string): StrategyOpenTarget | null {
  for (const [alias, id] of Object.entries(ALIASES)) {
    if (query === alias || query.includes(alias)) {
      const s = getStrategy(id);
      if (s) return { kind: "builtin", strategyId: id, title: s.title };
    }
  }
  for (const s of STRATEGIES) {
    const title = s.title.toLowerCase();
    if (query === title || query.includes(title)) {
      return { kind: "builtin", strategyId: s.id, title: s.title };
    }
  }
  return null;
}

function matchHubEntry(query: string): StrategyOpenTarget | null {
  for (const entry of ADHD_STRATEGY_HUB) {
    const label = entry.label.toLowerCase();
    if (query === label || query.includes(label)) {
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

/** User wants a strategy opened in the Strategies panel. */
export function resolveStrategyOpenFromChat(text: string): StrategyOpenTarget | null {
  const raw = text.trim();
  if (!raw) return null;

  const query = normalizeQuery(raw);
  if (!query) return null;

  const wantsOpen =
    OPEN_VERB_RE.test(raw) ||
    /\b(?:start ugly|body double|shrink)/i.test(raw);

  if (!wantsOpen) return null;

  return matchBuiltinStrategy(query) ?? matchHubEntry(query);
}

export function strategyOpenAck(title: string): string {
  return `Got it — **${title}** is open on the right. Want to walk through how to apply it to your situation?`;
}
