/**
 * Progressive discovery — one gentle question per session, never a wizard wall.
 */

import { savePrefs, type AiTone, type HelpMode, type SupportStyle } from "@/lib/companionStore";
import { saveRecognitionStore } from "@/lib/recognition";

const STORE_KEY = "companion-progressive-discovery-v1";

export type DiscoveryTopicId =
  | "why-here"
  | "work-type"
  | "business"
  | "planning"
  | "memory"
  | "communication"
  | "celebrations";

export type DiscoveryQuestion = {
  id: DiscoveryTopicId;
  prompt: string;
  why: string;
  options: string[];
  allowCustom?: boolean;
};

export const DISCOVERY_QUESTIONS: DiscoveryQuestion[] = [
  {
    id: "why-here",
    prompt: "What brought you here today?",
    why: "So I can meet you where you are — not with a generic script.",
    options: [
      "I feel overwhelmed",
      "I need to focus",
      "I want to grow my business",
      "I need help creating something",
      "I'm exploring",
    ],
    allowCustom: true,
  },
  {
    id: "work-type",
    prompt: "What kind of work do you mostly do?",
    why: "So examples and suggestions fit how you actually work.",
    options: [
      "Coach or consultant",
      "Creator or content",
      "Service provider",
      "Product seller",
      "Multiple things",
      "Still figuring it out",
    ],
  },
  {
    id: "business",
    prompt: "Want to add a quick business detail?",
    why: "Even one line helps me personalize recommendations.",
    options: [
      "I'll add this in Business Profile",
      "Solo — services",
      "Solo — products",
      "Small team",
      "Skip for now",
    ],
  },
  {
    id: "planning",
    prompt: "When you plan your day, what helps most?",
    why: "So planning suggestions match your brain, not a generic planner.",
    options: [
      "One thing at a time",
      "A short list (3 items max)",
      "Time blocks on a calendar",
      "Shari decides with me",
      "I avoid planning",
    ],
  },
  {
    id: "memory",
    prompt: "How much should I remember between visits?",
    why: "You control how much context I hold — always changeable.",
    options: [
      "Light — just the essentials",
      "Balanced — recent work and goals",
      "Rich — more personal context",
      "Ask me each time",
    ],
  },
  {
    id: "communication",
    prompt: "How should I talk with you?",
    why: "Tone and pacing matter as much as the answer.",
    options: [
      "Calm and spacious",
      "Warm and balanced",
      "Brief and direct",
      "Gentle and reassuring",
      "Encouraging — celebrate small wins",
    ],
  },
  {
    id: "celebrations",
    prompt: "How do you like recognition?",
    why: "Some people love a warm moment; others prefer quiet acknowledgment.",
    options: [
      "Full — warm message and gentle visuals",
      "Simple — message only",
      "Off — no celebration prompts",
    ],
  },
];

type DiscoveryStore = {
  disabled: boolean;
  answered: Partial<Record<DiscoveryTopicId, string>>;
  lastAskedSession: string | null;
  lastAskedAt: string | null;
};

function readStore(): DiscoveryStore {
  if (typeof window === "undefined") {
    return { disabled: false, answered: {}, lastAskedSession: null, lastAskedAt: null };
  }
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      return { disabled: false, answered: {}, lastAskedSession: null, lastAskedAt: null };
    }
    const p = JSON.parse(raw) as Partial<DiscoveryStore>;
    return {
      disabled: Boolean(p.disabled),
      answered: p.answered ?? {},
      lastAskedSession: p.lastAskedSession ?? null,
      lastAskedAt: p.lastAskedAt ?? null,
    };
  } catch {
    return { disabled: false, answered: {}, lastAskedSession: null, lastAskedAt: null };
  }
}

function writeStore(next: DiscoveryStore) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

function sessionKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function discoveryDisabled(): boolean {
  return readStore().disabled;
}

export function disableDiscovery() {
  writeStore({ ...readStore(), disabled: true });
}

export function enableDiscovery() {
  writeStore({ ...readStore(), disabled: false });
}

export function nextDiscoveryQuestion(now = new Date()): DiscoveryQuestion | null {
  const store = readStore();
  if (store.disabled) return null;
  if (store.lastAskedSession === sessionKey(now)) return null;
  const next = DISCOVERY_QUESTIONS.find((q) => !store.answered[q.id]);
  return next ?? null;
}

function applyAnswer(id: DiscoveryTopicId, answer: string) {
  if (id === "communication") {
    const map: Record<string, AiTone> = {
      "Calm and spacious": "calm",
      "Warm and balanced": "balanced",
      "Brief and direct": "direct",
      "Gentle and reassuring": "gentle",
      "Encouraging — celebrate small wins": "encouraging",
    };
    const tone = map[answer];
    if (tone) savePrefs({ aiTone: tone });
  }
  if (id === "celebrations") {
    const map = {
      "Full — warm message and gentle visuals": "full",
      "Simple — message only": "simple",
      "Off — no celebration prompts": "off",
    } as const;
    const mode = map[answer as keyof typeof map];
    if (mode) saveRecognitionStore({ celebrationMode: mode });
  }
  if (id === "planning") {
    const map: Record<string, HelpMode> = {
      "One thing at a time": "step-by-step",
      "A short list (3 items max)": "direct",
      "Time blocks on a calendar": "navigate",
      "Shari decides with me": "ask-first",
      "I avoid planning": "ask-first",
    };
    const help = map[answer];
    if (help) savePrefs({ helpMode: help });
  }
  if (id === "why-here" && /overwhelm/i.test(answer)) {
    savePrefs({ supportStyle: "sos" satisfies SupportStyle });
  }
}

export function recordDiscoveryAnswer(
  id: DiscoveryTopicId,
  answer: string,
  now = new Date(),
) {
  const store = readStore();
  writeStore({
    ...store,
    answered: { ...store.answered, [id]: answer },
    lastAskedSession: sessionKey(now),
    lastAskedAt: now.toISOString(),
  });
  applyAnswer(id, answer);
}

export function skipDiscoveryForSession(now = new Date()) {
  const store = readStore();
  writeStore({
    ...store,
    lastAskedSession: sessionKey(now),
    lastAskedAt: now.toISOString(),
  });
}
