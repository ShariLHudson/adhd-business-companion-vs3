/**
 * Active avatars — product voices + audience archetypes for generation app-wide.
 */

import { getPrefs, savePrefs } from "./companionStore";

export type ActiveAvatar = {
  id: string;
  label: string;
  emoji: string;
  /** Optional portrait — emoji used when absent. */
  image?: string;
  description: string;
  promptHint: string;
};

export const MAX_ACTIVE_COMPANIONS = 3;

export const ACTIVE_AVATARS: ActiveAvatar[] = [
  {
    id: "wisdom",
    label: "Wisdom Companion",
    emoji: "🦉",
    image: "/shari.jpg",
    description: "Reflective, principle-led guidance and timeless framing.",
    promptHint:
      "WISDOM COMPANION ACTIVE: Favor reflective questions, principles, and calm long-view framing. Use stories and metaphors that teach without rushing.",
  },
  {
    id: "adhd-business",
    label: "ADHD Business Clients",
    emoji: "⚡",
    description: "ADHD-aware business momentum, clarity, and execution support.",
    promptHint:
      "ADHD BUSINESS CLIENTS ACTIVE: ADHD-friendly business language — tiny steps, momentum, overwhelm-aware pacing, practical systems, no shame.",
  },
  {
    id: "coaches-speakers",
    label: "Coaches & Speakers",
    emoji: "🎤",
    description: "Coaching and speaking audiences — transformation and stage-ready messaging.",
    promptHint:
      "COACHES & SPEAKERS AVATAR ACTIVE: Frame for coaches and speakers — clients, transformation, talks, and authority on stage.",
  },
  {
    id: "authors",
    label: "Authors",
    emoji: "✍️",
    description: "Author audiences — books, thought leadership, and long-form credibility.",
    promptHint:
      "AUTHORS AVATAR ACTIVE: Frame for authors — readers, books, essays, and intellectual authority.",
  },
  {
    id: "consultants",
    label: "Consultants",
    emoji: "💼",
    description: "Consulting audiences — expertise, outcomes, and trusted advisor tone.",
    promptHint:
      "CONSULTANTS AVATAR ACTIVE: Frame for consultants — decision-makers, expertise, ROI, and trusted advisor positioning.",
  },
];

/** @deprecated use ACTIVE_AVATARS */
export const PRODUCT_COMPANIONS = ACTIVE_AVATARS;

export const DEFAULT_ACTIVE_COMPANION_IDS = ["adhd-business"];

const ACTIVE_COMPANIONS_KEY = "companion-active-companion-ids-v1";

function catalogIds(): Set<string> {
  return new Set(ACTIVE_AVATARS.map((c) => c.id));
}

function normalizeIds(ids: string[]): string[] {
  const allowed = catalogIds();
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (!allowed.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= MAX_ACTIVE_COMPANIONS) break;
  }
  return out.length ? out : [...DEFAULT_ACTIVE_COMPANION_IDS];
}

export function getActiveCompanionIds(): string[] {
  if (typeof window === "undefined") return [...DEFAULT_ACTIVE_COMPANION_IDS];
  try {
    const fromPrefs = getPrefs().activeCompanionIds;
    if (Array.isArray(fromPrefs) && fromPrefs.length > 0) {
      return normalizeIds(fromPrefs);
    }
    const raw = window.localStorage.getItem(ACTIVE_COMPANIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
        return normalizeIds(parsed);
      }
    }
  } catch {
    /* fall through */
  }
  return [...DEFAULT_ACTIVE_COMPANION_IDS];
}

export function setActiveCompanionIds(ids: string[]): string[] {
  const next = normalizeIds(ids);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(ACTIVE_COMPANIONS_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }
  savePrefs({ activeCompanionIds: next });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("companion-active-companions-updated"));
  }
  return next;
}

export function toggleActiveCompanion(id: string): string[] {
  const current = getActiveCompanionIds();
  if (current.includes(id)) {
    const next = current.filter((x) => x !== id);
    return setActiveCompanionIds(
      next.length ? next : [...DEFAULT_ACTIVE_COMPANION_IDS],
    );
  }
  if (current.length >= MAX_ACTIVE_COMPANIONS) {
    return current;
  }
  return setActiveCompanionIds([...current, id]);
}

export function getActiveCompanions(): ActiveAvatar[] {
  const ids = new Set(getActiveCompanionIds());
  return ACTIVE_AVATARS.filter((c) => ids.has(c.id));
}

export function formatActiveCompanionsDisplay(ids?: string[]): string {
  const resolved = ids ?? getActiveCompanionIds();
  const labels = ACTIVE_AVATARS.filter((c) => resolved.includes(c.id)).map(
    (c) => c.label,
  );
  return labels.join(" + ") || ACTIVE_AVATARS[1]!.label;
}

export function formatActiveAvatarsSummary(ids?: string[]): {
  countLine: string;
  detailLine: string;
} {
  const resolved = ids ?? getActiveCompanionIds();
  const labels = ACTIVE_AVATARS.filter((c) => resolved.includes(c.id)).map(
    (c) => c.label,
  );
  if (labels.length === 0) {
    return {
      countLine: "Using 1 Avatar",
      detailLine: ACTIVE_AVATARS[1]!.label,
    };
  }
  if (labels.length === 1) {
    return { countLine: "Using 1 Avatar", detailLine: labels[0]! };
  }
  return {
    countLine: `Using ${labels.length} Avatars`,
    detailLine: labels.join(" + "),
  };
}

export function activeCompanionsContextForAI(): string | undefined {
  const active = getActiveCompanions();
  if (!active.length) return undefined;
  const header =
    active.length === 1
      ? `ACTIVE AVATAR: ${active[0]!.label}`
      : `ACTIVE AVATARS (${active.length}): ${active.map((c) => c.label).join(", ")}`;
  const combineNote =
    active.length > 1
      ? "When multiple avatars are active, combine their voices and audiences — e.g. Wisdom tone with ADHD business audience, or content that speaks to several audience types at once."
      : null;
  return [header, combineNote, ...active.map((c) => c.promptHint)]
    .filter(Boolean)
    .join("\n");
}

export const ACTIVE_COMPANIONS_TOOLTIP =
  "Active avatars shape voice, audience, examples, and suggestions throughout the app.";

/** Combined AI context block for chat + generation routes. */
export function combinedCompanionContextForAI(
  businessContext?: string,
): string | undefined {
  const parts = [businessContext, activeCompanionsContextForAI()].filter(Boolean);
  return parts.length ? parts.join("\n\n") : undefined;
}
