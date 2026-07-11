/**
 * Context-first Discovery seeding (197 / 242 / 243 Pattern 3).
 * Check conversation, Clear My Mind, Journal, Projects, previous maps before asking.
 */

import { loadConversation } from "@/lib/companionStore";
import { getProjects } from "@/lib/companionStore";
import { readCompanionConversationState } from "@/lib/companionConversationContext/store";
import { resumeClearMyMindSession } from "@/lib/clearMyMindSessionStore";
import { getSessionThoughts } from "@/lib/thinkingSpace/queries";
import { getGrowthMemoryEntries } from "@/lib/growthJournalStore";
import { loadProjectContinuity } from "@/lib/projectContinuityStore";
import { listContinueThinkingMaps } from "@/lib/visualFocus/continueThinking";

export type DiscoveryContextSource =
  | "conversation"
  | "clear-my-mind"
  | "projects"
  | "journal"
  | "previous-maps";

export type DiscoveryContextSeed = {
  suggestedTopic: string | null;
  suggestedEverything: string | null;
  sources: DiscoveryContextSource[];
  /** Human lines Spark can show: "I already see…" */
  knownFacts: string[];
  /** Questions that can be skipped because context answers them. */
  skipTopicQuestion: boolean;
  skipEverythingQuestion: boolean;
};

function uniqueLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.length < 2) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

export function gatherMindMapDiscoveryContext(options?: {
  seedText?: string;
}): DiscoveryContextSeed {
  if (typeof window === "undefined") {
    const seed = options?.seedText?.trim() || null;
    return {
      suggestedTopic: seed,
      suggestedEverything: null,
      sources: seed ? (["conversation"] as DiscoveryContextSource[]) : [],
      knownFacts: [],
      skipTopicQuestion: Boolean(seed && seed.length > 2),
      skipEverythingQuestion: false,
    };
  }

  const sources: DiscoveryContextSource[] = [];
  const knownFacts: string[] = [];
  const ideaLines: string[] = [];
  let suggestedTopic: string | null = null;

  const seed = options?.seedText?.trim();
  if (seed) {
    const cleaned = seed
      .replace(
        /\b(?:i\s+want\s+(?:a\s+)?|create\s+(?:a\s+)?|build\s+(?:a\s+)?|make\s+(?:a\s+)?|open\s+(?:a\s+)?|start\s+(?:a\s+)?)mind\s*maps?\b/gi,
        "",
      )
      .replace(/\bmind\s*map\s+(?:this|that|it)\b/gi, "")
      .replace(/\bmind\s*maps?\b/gi, "")
      .replace(/^\s*(?:about|for|on|:)\s+/i, "")
      .trim();
    if (cleaned.length > 2) {
      suggestedTopic = cleaned.slice(0, 120);
      sources.push("conversation");
      knownFacts.push(`You asked to map: ${suggestedTopic}`);
      ideaLines.push(cleaned);
    } else if (seed.length > 2 && !/^mind\s*map/i.test(seed)) {
      suggestedTopic = seed.slice(0, 120);
      sources.push("conversation");
      knownFacts.push(`You asked to map: ${suggestedTopic}`);
    }
  }

  try {
    const ctx = readCompanionConversationState();
    if (!suggestedTopic && ctx.currentTopic?.trim()) {
      suggestedTopic = ctx.currentTopic.trim();
      sources.push("conversation");
      knownFacts.push(`You're already talking about: ${suggestedTopic}`);
    } else if (!suggestedTopic && ctx.lastUserGoal?.trim()) {
      suggestedTopic = ctx.lastUserGoal.trim();
      sources.push("conversation");
      knownFacts.push(`Your recent goal: ${suggestedTopic}`);
    }

    const chat = loadConversation() ?? [];
    const recentUser = chat
      .filter((m) => m.role === "user")
      .slice(-5)
      .map((m) => m.content.trim())
      .filter(Boolean);
    if (recentUser.length > 0) {
      if (!sources.includes("conversation")) sources.push("conversation");
      ideaLines.push(...recentUser);
      knownFacts.push(
        `I have ${recentUser.length} recent thought${recentUser.length === 1 ? "" : "s"} from our conversation.`,
      );
    }
  } catch {
    /* ignore */
  }

  try {
    const cmm = resumeClearMyMindSession();
    if (cmm?.sessionId) {
      const thoughts = getSessionThoughts(cmm.sessionId);
      const texts = thoughts.map((t) => t.text.trim()).filter(Boolean);
      if (texts.length > 0) {
        sources.push("clear-my-mind");
        ideaLines.push(...texts.slice(0, 40));
        knownFacts.push(
          `Clear My Mind is holding ${texts.length} thought${texts.length === 1 ? "" : "s"}.`,
        );
        if (!suggestedTopic) {
          suggestedTopic = texts[0]!.slice(0, 80);
        }
      } else if (cmm.rawCaptureTexts?.length) {
        sources.push("clear-my-mind");
        ideaLines.push(...cmm.rawCaptureTexts.filter(Boolean));
        knownFacts.push("I can use your Clear My Mind captures.");
      }
    }
  } catch {
    /* ignore */
  }

  try {
    const continuity = loadProjectContinuity();
    const projects = getProjects();
    const focus =
      projects.find((p) => p.id === continuity?.projectContinueId) ??
      projects.find((p) => p.status === "active-focus") ??
      projects.find((p) => p.status === "in-progress");
    if (focus) {
      sources.push("projects");
      if (!suggestedTopic) suggestedTopic = focus.name;
      knownFacts.push(`Active project: ${focus.name}`);
      if (focus.goal) ideaLines.push(`Goal: ${focus.goal}`);
      if (focus.nextAction) ideaLines.push(`Next: ${focus.nextAction}`);
      if (focus.notes) ideaLines.push(focus.notes);
    }
  } catch {
    /* ignore */
  }

  try {
    const journal = getGrowthMemoryEntries({
      types: ["journal", "reflection", "idea"],
    }).slice(0, 3);
    if (journal.length > 0) {
      sources.push("journal");
      knownFacts.push(
        `${journal.length} recent journal/reflection note${journal.length === 1 ? "" : "s"}.`,
      );
      for (const entry of journal) {
        ideaLines.push(entry.body.slice(0, 280));
      }
    }
  } catch {
    /* ignore */
  }

  try {
    const previous = listContinueThinkingMaps().slice(0, 3);
    if (previous.length > 0) {
      sources.push("previous-maps");
      knownFacts.push(
        `You already have ${previous.length} map${previous.length === 1 ? "" : "s"} in progress (e.g. “${previous[0]!.title}”).`,
      );
      for (const map of previous) {
        if (map.root?.label) ideaLines.push(map.root.label);
        const branchLabels = (map.root?.children ?? [])
          .slice(0, 4)
          .map((c) => c.label)
          .filter(Boolean);
        ideaLines.push(...branchLabels);
      }
      if (!suggestedTopic && previous[0]?.title) {
        suggestedTopic = previous[0].title;
      }
    }
  } catch {
    /* ignore */
  }

  const uniqueIdeas = uniqueLines(ideaLines);
  const suggestedEverything =
    uniqueIdeas.length > 0 ? uniqueIdeas.join("\n") : null;

  const skipTopicQuestion = Boolean(suggestedTopic && suggestedTopic.length > 2);
  const skipEverythingQuestion = Boolean(
    suggestedEverything && suggestedEverything.split("\n").length >= 2,
  );

  return {
    suggestedTopic,
    suggestedEverything,
    sources,
    knownFacts,
    skipTopicQuestion,
    skipEverythingQuestion,
  };
}
