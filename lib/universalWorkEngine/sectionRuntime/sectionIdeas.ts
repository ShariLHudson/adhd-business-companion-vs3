/**
 * Section-scoped “Give me ideas” — shared Universal Work Engine capability.
 * Work Type packages register domain catalogs; UI never auto-applies ideas.
 *
 * Supports iterative assistance: More Ideas, Refresh Ideas, Expand This Idea,
 * with shown-ID tracking so Refresh does not repeat the same catalog slice.
 */

import { expandSectionIdeaText } from "./sectionIdeaExpansion";

export type SectionIdeasFocusInput = {
  sectionId?: string | null;
  title?: string | null;
  workTypeId?: string | null;
  assetTypeId?: string | null;
  savedContent?: string | null;
  /** Optional work/creation id for session scoping (page-lifetime). */
  creationId?: string | null;
};

/** Catalog entry — string (legacy) or structured with stable id + optional expansion. */
export type SectionIdeaCatalogEntry =
  | string
  | {
      id?: string;
      text: string;
      expansion?: string;
    };

export type SectionIdeasCatalog = Readonly<
  Record<string, readonly SectionIdeaCatalogEntry[]>
>;

export type SectionIdeaSuggestion = {
  id: string;
  text: string;
  /** Pre-authored expansion when present on the catalog entry. */
  expansion?: string;
};

export type SectionIdeasSessionState = {
  workTypeId: string;
  sectionKey: string;
  creationId: string;
  /** All idea ids already shown in this assistance session (page lifetime). */
  shownIds: readonly string[];
  /** Currently visible suggestion ids (order matches UI). */
  visibleIds: readonly string[];
  /** Ideas the member already appended into their answer (this session). */
  appendedIds: readonly string[];
  /** Currently selected / expanded idea id when known. */
  selectedIdeaId?: string | null;
};

export type SectionIdeasMode = "initial" | "more" | "refresh";

export type SectionIdeasGenerateOptions = {
  existingAnswer?: string;
  mode?: SectionIdeasMode;
  session?: SectionIdeasSessionState | null;
  count?: number;
};

export type SectionIdeasResult = {
  ok: boolean;
  intro: string;
  /** Plain texts — backward compatible with assistance / guidance callers. */
  ideas: string[];
  suggestions: SectionIdeaSuggestion[];
  session: SectionIdeasSessionState;
  exhausted?: boolean;
  notice?: string;
  errorMessage?: string;
};

export type SectionIdeaExpansionResult = {
  ok: boolean;
  original: SectionIdeaSuggestion;
  expanded: SectionIdeaSuggestion;
  errorMessage?: string;
};

const DEFAULT_COUNT = 3;
const MORE_CAP_VISIBLE = 12;

const catalogsByWorkType = new Map<string, SectionIdeasCatalog>();

/** Page-lifetime shown tracking keyed by creation + work type + section. */
const shownStore = new Map<string, Set<string>>();

/** Shared keys used across many work types when a package has no override. */
const SHARED_SECTION_IDEAS: SectionIdeasCatalog = {
  purpose: [
    "Name the change you want someone to feel or make after this.",
    "Keep it small enough to keep — and meaningful enough to matter.",
    "Say it the way you’d tell a trusted friend out loud.",
    "Write the purpose as a promise you can keep this season.",
    "Start with the problem you’re relieving — then name the hope.",
    "If someone only remembers one sentence, what should it be?",
  ],
  audience: [
    "Who needs this most right now — not everyone who might someday.",
    "Describe one real person you already know, then generalize gently.",
    "Name the season of life they’re in, not just a demographic label.",
    "Who would feel relieved to find this — and why today?",
    "Name who you’re not for, so the right people feel chosen.",
    "Picture the person who’d thank you six months from now.",
  ],
  outcomes: [
    "One clear next step they can take without special tools.",
    "A feeling of relief or clarity they can recognize in themselves.",
    "Something they can show or share within a week.",
    "A decision they can make with more confidence than before.",
    "One habit or practice they can try in the next seven days.",
    "A sentence they can say about themselves that wasn’t true before.",
  ],
  steps: [
    "Three to five plain steps is enough to start.",
    "Open, do the core work, close with one next action.",
    "Name the first step someone can take today.",
    "Put the hardest step where energy is highest — not at the end.",
    "Include one pause so people can catch their breath.",
    "End with a tiny win they can feel before they leave.",
  ],
  offer: [
    "Name who it’s for and what changes for them.",
    "One outcome, one audience, one clear way to say yes.",
    "Keep the promise small enough to keep.",
    "Describe the first result — not the entire transformation journey.",
    "Make the yes easy: one path, one price, one next step.",
    "Say what support continues after they say yes.",
  ],
};

const GENERIC_FALLBACK: readonly string[] = [
  "A rough phrase is enough — capture what feels true, even if it’s incomplete.",
  "Name one concrete detail you already know, then one you’re still deciding.",
  "Borrow language you’d say out loud to a friend — plain beats perfect.",
  "Write the messy version first — polish can wait.",
  "Start with what you refuse to complicate.",
  "Capture the feeling you want someone to leave with.",
];

export function registerSectionIdeasCatalog(
  workTypeId: string,
  catalog: SectionIdeasCatalog,
): void {
  const id = workTypeId.trim();
  if (!id) return;
  catalogsByWorkType.set(id, catalog);
}

export function clearSectionIdeasCatalogsForTests(): void {
  catalogsByWorkType.clear();
  shownStore.clear();
}

export function clearSectionIdeasSessionsForTests(): void {
  shownStore.clear();
}

export function getSectionIdeasCatalog(
  workTypeId: string | null | undefined,
): SectionIdeasCatalog | null {
  const id = workTypeId?.trim();
  if (!id) return null;
  return catalogsByWorkType.get(id) ?? null;
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function slugText(text: string): string {
  return normalizeKey(text).slice(0, 48) || "idea";
}

function storeKey(
  creationId: string,
  workTypeId: string,
  sectionKey: string,
): string {
  return `${creationId || "_"}::${workTypeId || "_"}::${sectionKey}`;
}

function getShownSet(key: string): Set<string> {
  let set = shownStore.get(key);
  if (!set) {
    set = new Set();
    shownStore.set(key, set);
  }
  return set;
}

function normalizeEntry(
  entry: SectionIdeaCatalogEntry,
  sectionKey: string,
  index: number,
): SectionIdeaSuggestion {
  if (typeof entry === "string") {
    const slug = slugText(entry);
    return {
      // Prefer text-stable ids so catalog reorder does not invalidate session tracking.
      id: `${sectionKey}:${slug}${slug === "idea" ? `:${index}` : ""}`,
      text: entry,
    };
  }
  const text = entry.text.trim();
  const slug = slugText(text);
  return {
    id: entry.id?.trim() || `${sectionKey}:${slug}${slug === "idea" ? `:${index}` : ""}`,
    text,
    ...(entry.expansion?.trim()
      ? { expansion: entry.expansion.trim() }
      : {}),
  };
}

function lookupInCatalog(
  catalog: SectionIdeasCatalog,
  keys: string[],
): { sectionKey: string; entries: SectionIdeaSuggestion[] } | null {
  for (const key of keys) {
    const direct = catalog[key];
    if (direct?.length) {
      return {
        sectionKey: key,
        entries: direct.map((e, i) => normalizeEntry(e, key, i)),
      };
    }
    const nk = normalizeKey(key);
    const normalized = catalog[nk];
    if (normalized?.length) {
      return {
        sectionKey: nk,
        entries: normalized.map((e, i) => normalizeEntry(e, nk, i)),
      };
    }
  }
  const titleKey = keys.map(normalizeKey).find(Boolean);
  if (titleKey) {
    for (const [sectionId, ideas] of Object.entries(catalog)) {
      if (titleKey.includes(sectionId) || sectionId.includes(titleKey)) {
        return {
          sectionKey: sectionId,
          entries: ideas.map((e, i) => normalizeEntry(e, sectionId, i)),
        };
      }
    }
  }
  return null;
}

function poolForFocus(focus: SectionIdeasFocusInput): {
  sectionKey: string;
  pool: SectionIdeaSuggestion[];
  workTypeId: string;
} {
  const workTypeId = focus.workTypeId?.trim() || "";
  const keys = [
    focus.sectionId?.trim() ?? "",
    normalizeKey(focus.title ?? ""),
    focus.assetTypeId?.trim() ?? "",
  ].filter(Boolean);

  const packageCatalog = getSectionIdeasCatalog(workTypeId);
  if (packageCatalog) {
    const fromPackage = lookupInCatalog(packageCatalog, keys);
    if (fromPackage) {
      return {
        sectionKey: fromPackage.sectionKey,
        pool: fromPackage.entries,
        workTypeId,
      };
    }
  }

  const fromShared = lookupInCatalog(SHARED_SECTION_IDEAS, keys);
  if (fromShared) {
    return {
      sectionKey: fromShared.sectionKey,
      pool: fromShared.entries,
      workTypeId,
    };
  }

  const sectionKey = keys[0] || "generic";
  return {
    sectionKey,
    pool: GENERIC_FALLBACK.map((text, i) =>
      normalizeEntry(text, sectionKey, i),
    ),
    workTypeId,
  };
}

function nearDuplicate(a: string, b: string): boolean {
  const na = normalizeKey(a);
  const nb = normalizeKey(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length > 24 && nb.includes(na.slice(0, 24))) return true;
  if (nb.length > 24 && na.includes(nb.slice(0, 24))) return true;
  return false;
}

function filterUnused(
  pool: SectionIdeaSuggestion[],
  shown: Set<string>,
  alsoAvoidTexts: readonly string[] = [],
): SectionIdeaSuggestion[] {
  return pool.filter((idea) => {
    if (shown.has(idea.id)) return false;
    if (
      alsoAvoidTexts.some((t) => nearDuplicate(t, idea.text) || t === idea.text)
    ) {
      return false;
    }
    return true;
  });
}

function pickBatch(
  unused: SectionIdeaSuggestion[],
  count: number,
): SectionIdeaSuggestion[] {
  return unused.slice(0, Math.max(0, count));
}

function buildIntro(
  focus: SectionIdeasFocusInput,
  existingAnswer: string,
  mode: SectionIdeasMode,
  exhausted: boolean,
): string {
  const title = focus.title?.trim() || "this section";
  const hasContent = Boolean(existingAnswer.trim());
  if (exhausted) {
    return `You’ve seen the available ideas for “${title}”. You can expand one of them, add one, or return later.`;
  }
  if (mode === "more") {
    return hasContent
      ? `A few more directions for “${title}” — added below. Nothing is applied until you choose.`
      : `A few more starting places for “${title}”. Pick what feels closest — or keep writing your own.`;
  }
  if (mode === "refresh") {
    return hasContent
      ? `Here’s a fresh set for “${title}”, still building on what you wrote. Nothing is applied until you choose.`
      : `Here’s a fresh set for “${title}”. Pick what feels closest — or keep writing your own.`;
  }
  return hasContent
    ? `Here are a few directions that could deepen “${title}”, building on what you already wrote. Nothing is applied until you choose.`
    : `Here are a few starting places for “${title}”. Pick what feels closest — or keep writing your own.`;
}

function toResult(
  focus: SectionIdeasFocusInput,
  existingAnswer: string,
  mode: SectionIdeasMode,
  suggestions: SectionIdeaSuggestion[],
  shown: Set<string>,
  sectionKey: string,
  workTypeId: string,
  exhausted: boolean,
  notice?: string,
  priorSession?: SectionIdeasSessionState | null,
): SectionIdeasResult {
  const creationId = focus.creationId?.trim() || "_session";
  for (const s of suggestions) shown.add(s.id);
  const visibleIds = suggestions.map((s) => s.id);
  const priorSelected = priorSession?.selectedIdeaId ?? null;
  const selectedIdeaId =
    priorSelected && visibleIds.includes(priorSelected)
      ? priorSelected
      : (visibleIds[0] ?? null);
  const session: SectionIdeasSessionState = {
    workTypeId,
    sectionKey,
    creationId,
    shownIds: [...shown],
    visibleIds,
    appendedIds: priorSession?.appendedIds ?? [],
    selectedIdeaId,
  };
  return {
    ok: true,
    intro: buildIntro(focus, existingAnswer, mode, exhausted && suggestions.length === 0),
    ideas: suggestions.map((s) => s.text),
    suggestions,
    session,
    exhausted,
    ...(notice ? { notice } : {}),
  };
}

/**
 * Generate or evolve a section-ideas set.
 * - initial: first unused batch (or reopen with remaining unused)
 * - more: append unused batch; preserve current visible
 * - refresh: replace visible with a different unused batch
 */
export function generateSectionIdeas(
  focus: SectionIdeasFocusInput,
  existingAnswerOrOptions: string | SectionIdeasGenerateOptions = "",
): SectionIdeasResult {
  try {
    const options: SectionIdeasGenerateOptions =
      typeof existingAnswerOrOptions === "string"
        ? { existingAnswer: existingAnswerOrOptions, mode: "initial" }
        : existingAnswerOrOptions;
    const existingAnswer = options.existingAnswer ?? "";
    const mode = options.mode ?? "initial";
    const count = options.count ?? DEFAULT_COUNT;
    const { sectionKey, pool, workTypeId } = poolForFocus(focus);
    const creationId = focus.creationId?.trim() || options.session?.creationId || "_session";
    const key = storeKey(creationId, workTypeId, sectionKey);
    const shown = getShownSet(key);

    // Seed shown from caller session if provided (same page continuity).
    if (options.session?.shownIds?.length) {
      for (const id of options.session.shownIds) shown.add(id);
    }

    if (mode === "more") {
      const currentVisible = (options.session?.visibleIds ?? [])
        .map((id) => pool.find((p) => p.id === id))
        .filter((x): x is SectionIdeaSuggestion => Boolean(x));
      const visibleTexts = currentVisible.map((v) => v.text);
      if (currentVisible.length >= MORE_CAP_VISIBLE) {
        return {
          ok: true,
          intro: buildIntro(focus, existingAnswer, "more", false),
          ideas: currentVisible.map((s) => s.text),
          suggestions: currentVisible,
          session: {
            workTypeId,
            sectionKey,
            creationId,
            shownIds: [...shown],
            visibleIds: currentVisible.map((s) => s.id),
            appendedIds: options.session?.appendedIds ?? [],
            selectedIdeaId: options.session?.selectedIdeaId ?? null,
          },
          exhausted: false,
          notice:
            "You’ve reached a comfortable number of ideas on screen. Expand one, add one, or refresh for a new set.",
        };
      }
      const unused = filterUnused(pool, shown, visibleTexts);
      const batch = pickBatch(unused, count);
      if (batch.length === 0) {
        return {
          ok: true,
          intro: buildIntro(focus, existingAnswer, "more", true),
          ideas: currentVisible.map((s) => s.text),
          suggestions: currentVisible,
          session: {
            workTypeId,
            sectionKey,
            creationId,
            shownIds: [...shown],
            visibleIds: currentVisible.map((s) => s.id),
            appendedIds: options.session?.appendedIds ?? [],
            selectedIdeaId: options.session?.selectedIdeaId ?? null,
          },
          exhausted: true,
          notice:
            "You’ve seen the available ideas for this section. You can expand one of them, add one, or return later.",
        };
      }
      const merged = [...currentVisible, ...batch].slice(0, MORE_CAP_VISIBLE);
      return toResult(
        { ...focus, creationId },
        existingAnswer,
        "more",
        merged,
        shown,
        sectionKey,
        workTypeId,
        false,
        undefined,
        options.session,
      );
    }

    if (mode === "refresh") {
      // Refresh replaces the set; previously visible stay in shown so we rotate.
      const previousVisible = options.session?.visibleIds ?? [];
      for (const id of previousVisible) shown.add(id);
      const unused = filterUnused(pool, shown);
      const batch = pickBatch(unused, count);
      if (batch.length === 0) {
        // Keep prior visible suggestions; do not pretend a repeat is new.
        const prior = previousVisible
          .map((id) => pool.find((p) => p.id === id))
          .filter((x): x is SectionIdeaSuggestion => Boolean(x));
        return {
          ok: true,
          intro: buildIntro(focus, existingAnswer, "refresh", true),
          ideas: prior.map((s) => s.text),
          suggestions: prior,
          session: {
            workTypeId,
            sectionKey,
            creationId,
            shownIds: [...shown],
            visibleIds: prior.map((s) => s.id),
            appendedIds: options.session?.appendedIds ?? [],
            selectedIdeaId: options.session?.selectedIdeaId ?? null,
          },
          exhausted: true,
          notice:
            "You’ve seen the available ideas for this section. You can expand one of them, add one, or return later.",
        };
      }
      const nextShown = new Set(shown);
      for (const id of previousVisible) nextShown.add(id);
      return toResult(
        { ...focus, creationId },
        existingAnswer,
        "refresh",
        batch,
        nextShown,
        sectionKey,
        workTypeId,
        false,
        undefined,
        options.session,
      );
    }

    // initial / reopen
    const unused = filterUnused(pool, shown);
    const batch = pickBatch(unused.length ? unused : pool, count);
    const exhausted = unused.length === 0;
    if (exhausted && shown.size > 0) {
      // Catalog exhausted — allow honest reuse only with notice, prefer not claiming "new"
      return {
        ok: true,
        intro: buildIntro(focus, existingAnswer, "initial", true),
        ideas: [],
        suggestions: [],
        session: {
          workTypeId,
          sectionKey,
          creationId,
          shownIds: [...shown],
          visibleIds: [],
          appendedIds: options.session?.appendedIds ?? [],
          selectedIdeaId: null,
        },
        exhausted: true,
        notice:
          "You’ve seen the available ideas for this section. You can expand one of them, add one, or return later.",
        errorMessage: undefined,
      };
    }
    // If fully fresh (no unused because shown empty), batch from pool
    const picked = unused.length ? batch : pickBatch(pool, count);
    return toResult(
      { ...focus, creationId },
      existingAnswer,
      "initial",
      picked,
      shown,
      sectionKey,
      workTypeId,
      false,
      undefined,
      options.session,
    );
  } catch {
    return {
      ok: false,
      intro: "",
      ideas: [],
      suggestions: [],
      session: {
        workTypeId: focus.workTypeId?.trim() || "",
        sectionKey: focus.sectionId?.trim() || "",
        creationId: focus.creationId?.trim() || "_session",
        shownIds: [],
        visibleIds: [],
        appendedIds: [],
        selectedIdeaId: null,
      },
      errorMessage:
        "Something got tangled while gathering ideas. Your writing is still here — try again when you’re ready.",
    };
  }
}

/** Record that a suggestion was appended into the member’s answer. */
export function markSectionIdeaAppended(
  session: SectionIdeasSessionState,
  ideaId: string,
): SectionIdeasSessionState {
  const id = ideaId.trim();
  if (!id) return session;
  if (session.appendedIds.includes(id)) return session;
  return {
    ...session,
    appendedIds: [...session.appendedIds, id],
    selectedIdeaId: id,
  };
}

export function expandSectionIdea(
  focus: SectionIdeasFocusInput,
  idea: SectionIdeaSuggestion | string,
): SectionIdeaExpansionResult {
  try {
    const original: SectionIdeaSuggestion =
      typeof idea === "string"
        ? { id: `adhoc:${slugText(idea)}`, text: idea }
        : idea;
    if (original.expansion?.trim()) {
      return {
        ok: true,
        original,
        expanded: {
          id: `${original.id}__expanded`,
          text: original.expansion.trim(),
        },
      };
    }
    const expandedText = expandSectionIdeaText(focus, original.text);
    return {
      ok: true,
      original,
      expanded: {
        id: `${original.id}__expanded`,
        text: expandedText,
      },
    };
  } catch {
    return {
      ok: false,
      original:
        typeof idea === "string"
          ? { id: "adhoc", text: idea }
          : idea,
      expanded:
        typeof idea === "string"
          ? { id: "adhoc", text: idea }
          : idea,
      errorMessage:
        "I couldn’t expand that idea just now. Your writing is still safe.",
    };
  }
}

export function ideasGuidanceFromSectionIdeas(
  focus: SectionIdeasFocusInput,
): string {
  const result = generateSectionIdeas(focus, {
    existingAnswer: focus.savedContent ?? "",
    mode: "initial",
  });
  if (!result.ok) {
    return (
      result.errorMessage ||
      "There's no perfect answer — a rough phrase is enough to keep us moving."
    );
  }
  if (result.exhausted && result.suggestions.length === 0) {
    return (
      result.notice ||
      result.intro ||
      "You’ve seen the available ideas for this section."
    );
  }
  return `${result.intro}\n\n${result.suggestions.map((idea, i) => `${i + 1}. ${idea.text}`).join("\n")}`;
}

/** Test helper — pool size for a focus (after catalog normalize). */
export function debugSectionIdeasPoolSize(
  focus: SectionIdeasFocusInput,
): number {
  return poolForFocus(focus).pool.length;
}
