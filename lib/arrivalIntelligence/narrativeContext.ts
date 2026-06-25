/**
 * Narrative Context — working hypotheses about the user's story.
 * Never certainty. Confidence-scored and decaying.
 */

import { getLastActivity } from "@/lib/companionStore";
import { getPrefs } from "@/lib/companionStore";
import {
  buildContinuityManifest,
  HOME_RESUME_CONTINUITY_TYPES,
} from "@/lib/continuityManifest";
import { getCompanionAuthIntelligence } from "@/lib/companionAuthIntelligence";
import { getHomeVisitCount } from "@/lib/homeWelcome";
import {
  confident,
  decayConfidence,
  type ConfidentValue,
} from "./confidenceInference";

const STORAGE_KEY = "companion-narrative-context-v1";

export type EmotionalTrajectory =
  | "steady"
  | "building"
  | "uncertain"
  | "unknown";

export type MomentumLevel = "low" | "steady" | "rising" | "unknown";

export type NarrativeContext = {
  currentChapter: ConfidentValue<string | null>;
  chapterStartDate: ConfidentValue<string | null>;
  dominantThemes: ConfidentValue<string[]>;
  recentGrowthMarkers: ConfidentValue<string[]>;
  lastTurningPoint: ConfidentValue<string | null>;
  emotionalTrajectory: ConfidentValue<EmotionalTrajectory>;
  momentumLevel: ConfidentValue<MomentumLevel>;
  unresolvedTopics: ConfidentValue<string[]>;
};

function readStored(): Partial<NarrativeContext> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<NarrativeContext>) : null;
  } catch {
    return null;
  }
}

function writeStored(ctx: NarrativeContext) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
  } catch {
    /* quota */
  }
}

function inferThemes(): string[] {
  const themes: string[] = [];
  const last = getLastActivity();
  if (last?.title?.trim()) themes.push(last.title.trim());
  const manifest = buildContinuityManifest();
  for (const item of manifest.items) {
    if (!HOME_RESUME_CONTINUITY_TYPES.has(item.type)) continue;
    if (item.title?.trim()) themes.push(item.title.trim());
    if (themes.length >= 4) break;
  }
  return [...new Set(themes)].slice(0, 4);
}

function inferMomentum(): MomentumLevel {
  const visits = getHomeVisitCount();
  const auth = getCompanionAuthIntelligence();
  if (visits >= 8 && auth.loginCount >= 4) return "rising";
  if (visits >= 3) return "steady";
  if (visits <= 1) return "unknown";
  return "low";
}

function defaultNarrativeContext(now = new Date()): NarrativeContext {
  const themes = inferThemes();
  const last = getLastActivity();
  const prefs = getPrefs();
  const chapter =
    themes[0] ??
    (prefs.hasChatted ? "ongoing work" : null);

  return {
    currentChapter: confident(chapter, chapter ? 0.45 : 0.1, "arrival-inference", now),
    chapterStartDate: confident(null, 0.1, "unknown", now),
    dominantThemes: confident(themes, themes.length ? 0.5 : 0.15, "continuity-manifest", now),
    recentGrowthMarkers: confident([], 0.1, "unknown", now),
    lastTurningPoint: confident(
      last?.kind === "chat" ? last.title : null,
      last ? 0.35 : 0.1,
      "last-activity",
      now,
    ),
    emotionalTrajectory: confident("unknown", 0.15, "unknown", now),
    momentumLevel: confident(inferMomentum(), 0.4, "visit-rhythm", now),
    unresolvedTopics: confident(
      themes.slice(0, 3),
      themes.length ? 0.42 : 0.1,
      "unfinished-work",
      now,
    ),
  };
}

/** Load narrative hypotheses with decay applied — internal use only. */
export function loadNarrativeContext(now = new Date()): NarrativeContext {
  const stored = readStored();
  const fresh = defaultNarrativeContext(now);
  if (!stored) {
    writeStored(fresh);
    return fresh;
  }

  const merged: NarrativeContext = {
    currentChapter: stored.currentChapter ?? fresh.currentChapter,
    chapterStartDate: stored.chapterStartDate ?? fresh.chapterStartDate,
    dominantThemes: stored.dominantThemes ?? fresh.dominantThemes,
    recentGrowthMarkers:
      stored.recentGrowthMarkers ?? fresh.recentGrowthMarkers,
    lastTurningPoint: stored.lastTurningPoint ?? fresh.lastTurningPoint,
    emotionalTrajectory:
      stored.emotionalTrajectory ?? fresh.emotionalTrajectory,
    momentumLevel: stored.momentumLevel ?? fresh.momentumLevel,
    unresolvedTopics: stored.unresolvedTopics ?? fresh.unresolvedTopics,
  };

  writeStored(merged);
  return merged;
}

/** Refresh lightweight hypotheses after each arrival — never overwrites with certainty. */
export function refreshNarrativeContextOnArrival(now = new Date()): NarrativeContext {
  const cur = loadNarrativeContext(now);
  const themes = inferThemes();
  const next: NarrativeContext = {
    ...cur,
    dominantThemes: {
      ...cur.dominantThemes,
      value: themes.length ? themes : cur.dominantThemes.value,
      confidence: themes.length
        ? Math.min(1, decayConfidence(cur.dominantThemes, now) + 0.08)
        : decayConfidence(cur.dominantThemes, now),
      lastReinforcedAt: now.toISOString(),
    },
    momentumLevel: {
      ...cur.momentumLevel,
      value: inferMomentum(),
      lastReinforcedAt: now.toISOString(),
    },
    unresolvedTopics: {
      ...cur.unresolvedTopics,
      value: themes.slice(0, 3),
      confidence: themes.length
        ? Math.min(1, decayConfidence(cur.unresolvedTopics, now) + 0.06)
        : decayConfidence(cur.unresolvedTopics, now),
      lastReinforcedAt: now.toISOString(),
    },
  };
  writeStored(next);
  return next;
}
