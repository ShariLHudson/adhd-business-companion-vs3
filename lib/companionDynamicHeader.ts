/**
 * Dynamic Companion Header — context-aware, rotating prompts for IdentityBar.
 */

import type { EmotionalState } from "./companionEmotions";
import type { AppSection } from "./companionUi";

export type DynamicHeaderContext = {
  calmHome: boolean;
  isIdle: boolean;
  workspaceActiveBeside: boolean;
  workspacePanel: AppSection | null;
  emotion: EmotionalState;
  recentUserTexts: string[];
  workflowLabel?: string | null;
  createBuilderActive?: boolean;
  strategyActive?: boolean;
  recoveryMode?: boolean;
  focusMode?: boolean;
  /** Short kickoff header — distinct from the Step 1 chat bubble. */
  kickoffHeader?: string | null;
};

type HeaderPool = {
  id: string;
  phrases: string[];
};

const HOME_POOL: HeaderPool = {
  id: "home",
  phrases: [
    "What feels most important right now?",
    "What's on your mind today?",
    "Where should we start?",
  ],
};

const POOLS: Record<string, HeaderPool> = {
  home: HOME_POOL,
  overwhelm: {
    id: "overwhelm",
    phrases: [
      "Let's sort this out together",
      "What's feeling the loudest right now?",
      "One thing at a time — we'll shrink the pile",
    ],
  },
  emotional: {
    id: "emotional",
    phrases: [
      "I'm here with you",
      "Let's take this one breath at a time",
      "What's weighing on you most?",
    ],
  },
  stuck: {
    id: "stuck",
    phrases: [
      "Let's find the smallest start",
      "What's one tiny step we could try?",
      "No pressure — what's blocking you?",
    ],
  },
  "brain-dump": {
    id: "brain-dump",
    phrases: [
      "What's taking up space in your head?",
      "Let's get it out of your brain",
      "Dump one thought — I'll hold it",
    ],
  },
  playbook: {
    id: "playbook",
    phrases: [
      "Let's think this through",
      "Let's create a plan that works for your brain",
      "What strategy fits your real situation?",
    ],
  },
  "content-generator": {
    id: "content-generator",
    phrases: [
      "Let's build this together",
      "One question at a time",
      "We'll shape this beside chat",
    ],
  },
  "client-avatars": {
    id: "client-avatars",
    phrases: [
      "Let's get to know your audience",
      "Tell me about the people you help",
      "Who are we building this for?",
    ],
  },
  focus: {
    id: "focus",
    phrases: [
      "Let's protect your attention",
      "One thing at a time",
      "What deserves your focus right now?",
    ],
  },
  projects: {
    id: "projects",
    phrases: [
      "Let's move this project forward",
      "What's the next milestone?",
      "What would make this project easier?",
    ],
  },
  building: {
    id: "building",
    phrases: [
      "Let's build this together",
      "We'll shape it step by step",
      "What should we tackle first?",
    ],
  },
  chat: {
    id: "chat",
    phrases: [
      "What's on your mind?",
      "I'm listening",
      "Tell me what you're working through",
    ],
  },
};

const ROTATION_KEY = "companion-header-rotation-v1";

/** In-memory fallback when sessionStorage is unavailable (SSR, tests). */
let memoryRotation: Record<string, number> = {};

const OVERWHELM_RE =
  /\b(?:overwhelm|too much|can't cope|drowning|everything at once|so much|spinning)\b/i;

function readRotation(): Record<string, number> {
  if (typeof sessionStorage === "undefined") return { ...memoryRotation };
  try {
    const raw = sessionStorage.getItem(ROTATION_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function writeRotation(data: Record<string, number>): void {
  if (typeof sessionStorage === "undefined") {
    memoryRotation = { ...data };
    return;
  }
  try {
    sessionStorage.setItem(ROTATION_KEY, JSON.stringify(data));
  } catch {
    /* noop */
  }
}

export function pickRotatedPhrase(
  pool: HeaderPool,
  avoid?: string | null,
): string {
  const phrases = pool.phrases.filter(Boolean);
  if (phrases.length === 0) return "What feels most important right now?";
  if (phrases.length === 1) return phrases[0]!;

  const stored = readRotation();
  let idx = stored[pool.id] ?? 0;
  let pick = phrases[idx % phrases.length]!;
  if (avoid && pick === avoid) {
    idx = (idx + 1) % phrases.length;
    pick = phrases[idx]!;
  }
  stored[pool.id] = (idx + 1) % phrases.length;
  writeRotation(stored);
  return pick;
}

function poolForWorkspace(section: AppSection | null): HeaderPool | null {
  if (!section) return null;
  if (section === "brain-dump") return POOLS["brain-dump"]!;
  if (section === "playbook") return POOLS.playbook!;
  if (section === "content-generator") return POOLS["content-generator"]!;
  if (section === "client-avatars") return POOLS["client-avatars"]!;
  if (section === "projects") return POOLS.projects!;
  if (
    section === "focus-timer" ||
    section === "focus-audio" ||
    section === "focus" ||
    section === "breathe"
  ) {
    return POOLS.focus!;
  }
  return null;
}

function poolFromRecentMessages(texts: string[]): HeaderPool | null {
  const joined = texts.join(" ").toLowerCase();
  if (OVERWHELM_RE.test(joined)) return POOLS.overwhelm!;
  if (/\b(?:strateg|marketing plan|business plan|positioning)\b/i.test(joined)) {
    return POOLS.playbook!;
  }
  if (/\b(?:draft|write|create|build|sop|newsletter|email)\b/i.test(joined)) {
    return POOLS["content-generator"]!;
  }
  if (/\b(?:avatar|audience|ideal client|icp|customer)\b/i.test(joined)) {
    return POOLS["client-avatars"]!;
  }
  if (/\b(?:project|milestone|launch)\b/i.test(joined)) {
    return POOLS.projects!;
  }
  if (/\b(?:focus|timer|distract)\b/i.test(joined)) {
    return POOLS.focus!;
  }
  return null;
}

function poolFromEmotion(
  emotion: EmotionalState,
  recoveryMode?: boolean,
): HeaderPool | null {
  if (recoveryMode || emotion === "overwhelmed") return POOLS.overwhelm!;
  if (emotion === "emotional") return POOLS.emotional!;
  if (emotion === "stuck") return POOLS.stuck!;
  if (emotion === "building") return POOLS.building!;
  if (emotion === "focused") return POOLS.focus!;
  return null;
}

/** Resolve the header line shown under Shari's greeting. */
export function resolveCompanionHeader(
  ctx: DynamicHeaderContext,
  lastShown?: string | null,
): string {
  if (ctx.kickoffHeader?.trim()) {
    return ctx.kickoffHeader.trim();
  }

  const stabilize =
    !ctx.calmHome &&
    (!ctx.isIdle ||
      ctx.createBuilderActive ||
      Boolean(ctx.workspaceActiveBeside && ctx.workspacePanel));

  if (stabilize && lastShown?.trim()) {
    return lastShown.trim();
  }

  if (ctx.createBuilderActive) {
    const line = ctx.workflowLabel
      ? `Building: ${ctx.workflowLabel}`
      : POOLS["content-generator"]!.phrases[1]!;
    if (stabilize) return line;
    return pickRotatedPhrase(POOLS["content-generator"]!, lastShown);
  }

  if (ctx.calmHome) {
    const emotionPool = poolFromEmotion(ctx.emotion, ctx.recoveryMode);
    const topicPool = poolFromRecentMessages(ctx.recentUserTexts);
    const pool = emotionPool ?? topicPool ?? POOLS.home!;
    return pickRotatedPhrase(pool, lastShown);
  }

  if (ctx.focusMode) {
    return pickRotatedPhrase(POOLS.focus!, lastShown);
  }

  if (ctx.recoveryMode) {
    return pickRotatedPhrase(POOLS.overwhelm!, lastShown);
  }

  const workspaceSection =
    ctx.workspaceActiveBeside && ctx.isIdle ? ctx.workspacePanel : null;
  const workspacePool = poolForWorkspace(workspaceSection);
  if (workspacePool) {
    return pickRotatedPhrase(workspacePool, lastShown);
  }

  if (ctx.createBuilderActive || ctx.workflowLabel) {
    return pickRotatedPhrase(POOLS["content-generator"]!, lastShown);
  }

  if (ctx.strategyActive) {
    return pickRotatedPhrase(POOLS.playbook!, lastShown);
  }

  const workspacePoolActive = poolForWorkspace(ctx.workspacePanel);
  if (workspacePoolActive) {
    return pickRotatedPhrase(workspacePoolActive, lastShown);
  }

  const topicPool = poolFromRecentMessages(ctx.recentUserTexts);
  if (topicPool) {
    return pickRotatedPhrase(topicPool, lastShown);
  }

  const emotionPool = poolFromEmotion(ctx.emotion, ctx.recoveryMode);
  if (emotionPool) {
    return pickRotatedPhrase(emotionPool, lastShown);
  }

  if (!ctx.isIdle) {
    return pickRotatedPhrase(POOLS.chat!, lastShown);
  }

  return pickRotatedPhrase(POOLS.home!, lastShown);
}

/** @internal test helper */
export function headerPoolsForTests(): typeof POOLS {
  return POOLS;
}
