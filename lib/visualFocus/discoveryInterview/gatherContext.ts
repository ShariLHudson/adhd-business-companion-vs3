/**
 * Context-first Discovery seeding (197).
 * Check conversation, Clear My Mind, Projects, Journal before asking.
 */

import { loadConversation } from "@/lib/companionStore";
import { getProjects } from "@/lib/companionStore";
import { readCompanionConversationState } from "@/lib/companionConversationContext/store";
import { resumeClearMyMindSession } from "@/lib/clearMyMindSessionStore";
import { getSessionThoughts } from "@/lib/thinkingSpace/queries";
import { getGrowthMemoryEntries } from "@/lib/growthJournalStore";
import { loadProjectContinuity } from "@/lib/projectContinuityStore";

export type DiscoveryContextSource =
  | "conversation"
  | "clear-my-mind"
  | "projects"
  | "journal";

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

export function gatherMindMapDiscoveryContext(): DiscoveryContextSeed {
  if (typeof window === "undefined") {
    return {
      suggestedTopic: null,
      suggestedEverything: null,
      sources: [],
      knownFacts: [],
      skipTopicQuestion: false,
      skipEverythingQuestion: false,
    };
  }

  const sources: DiscoveryContextSource[] = [];
  const knownFacts: string[] = [];
  const ideaLines: string[] = [];
  let suggestedTopic: string | null = null;

  try {
    const ctx = readCompanionConversationState();
    if (ctx.currentTopic?.trim()) {
      suggestedTopic = ctx.currentTopic.trim();
      sources.push("conversation");
      knownFacts.push(`You're already talking about: ${suggestedTopic}`);
    } else if (ctx.lastUserGoal?.trim()) {
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
          `Clear My Mind™ is holding ${texts.length} thought${texts.length === 1 ? "" : "s"}.`,
        );
        if (!suggestedTopic) {
          suggestedTopic = texts[0]!.slice(0, 80);
        }
      } else if (cmm.rawCaptureTexts?.length) {
        sources.push("clear-my-mind");
        ideaLines.push(...cmm.rawCaptureTexts.filter(Boolean));
        knownFacts.push("I can use your Clear My Mind™ captures.");
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
      projects.find((p) => p.status === "in-progress") ??
      projects.find((p) => p.status === "planned");
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
