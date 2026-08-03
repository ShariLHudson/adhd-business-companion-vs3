/**
 * Personal Library — My Spark Collection filter model (Item Type · Alphabet
 * Range · Date). One source for the approved dropdown options, the alphabet
 * bucketing, the date narrowing/sort, and the gate that hides records until an
 * Item Type AND an Alphabet Range are chosen.
 *
 * Real data today: only "Spark Cards" (saved Sparks) and "My Ideas & Notes"
 * (saved Sparks that carry a member note) have records. "Actions I Tried",
 * "What I've Learned" and "Questions to Revisit" have no persisted source yet,
 * so they render an honest, encouraging empty state — never fabricated content.
 */

import type { MySparkSavedItem } from "./mySparksCollection";

export type PersonalLibraryItemType =
  | "spark-cards"
  | "ideas-notes"
  | "actions-tried"
  | "learned"
  | "questions";

export type PersonalLibraryItemTypeOption = {
  id: PersonalLibraryItemType;
  /** Exact approved Personal Library room label. */
  label: string;
};

/** The five approved Item Types, in the approved order and wording. */
export const PERSONAL_LIBRARY_ITEM_TYPES: readonly PersonalLibraryItemTypeOption[] = [
  { id: "spark-cards", label: "Spark Cards" },
  { id: "ideas-notes", label: "My Ideas & Notes" },
  { id: "actions-tried", label: "Actions I Tried" },
  { id: "learned", label: "What I’ve Learned" },
  { id: "questions", label: "Questions to Revisit" },
] as const;

export type AlphabetRangeId = "a-f" | "g-l" | "m-r" | "s-z";

export type AlphabetRangeOption = {
  id: AlphabetRangeId;
  /** Exact approved label, e.g. "A–F". */
  label: string;
  /** Uppercase letters covered by this range. */
  letters: string;
};

export const PERSONAL_LIBRARY_ALPHABET_RANGES: readonly AlphabetRangeOption[] = [
  { id: "a-f", label: "A–F", letters: "ABCDEF" },
  { id: "g-l", label: "G–L", letters: "GHIJKL" },
  { id: "m-r", label: "M–R", letters: "MNOPQR" },
  { id: "s-z", label: "S–Z", letters: "STUVWXYZ" },
] as const;

export type PersonalLibraryDateOption =
  | "all"
  | "today"
  | "this-week"
  | "this-month"
  | "last-30-days"
  | "newest"
  | "oldest";

export type PersonalLibraryDateOptionDef = {
  id: PersonalLibraryDateOption;
  label: string;
};

export const PERSONAL_LIBRARY_DATE_OPTIONS: readonly PersonalLibraryDateOptionDef[] =
  [
    { id: "all", label: "All dates" },
    { id: "today", label: "Today" },
    { id: "this-week", label: "This week" },
    { id: "this-month", label: "This month" },
    { id: "last-30-days", label: "Last 30 days" },
    { id: "newest", label: "Newest first" },
    { id: "oldest", label: "Oldest first" },
  ] as const;

/**
 * First meaningful letter of a title: skip leading whitespace/punctuation to the
 * first A–Z letter. Leading articles ("The", "A") are intentionally NOT stripped
 * — the collection's existing search rules do not strip articles, so alphabet
 * bucketing stays consistent with them.
 */
export function firstMeaningfulLetter(title: string): string | null {
  for (const ch of title) {
    if (/[a-z]/i.test(ch)) return ch.toUpperCase();
  }
  return null;
}

export function alphabetRangeOf(title: string): AlphabetRangeId | null {
  const letter = firstMeaningfulLetter(title);
  if (!letter) return null;
  return (
    PERSONAL_LIBRARY_ALPHABET_RANGES.find((r) => r.letters.includes(letter))
      ?.id ?? null
  );
}

export function matchesAlphabetRange(
  title: string,
  range: AlphabetRangeId,
): boolean {
  return alphabetRangeOf(title) === range;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Date narrowing. Pure sort options ("newest"/"oldest") never narrow. */
export function matchesDateOption(
  iso: string | null,
  option: PersonalLibraryDateOption,
  now: Date = new Date(),
): boolean {
  if (option === "all" || option === "newest" || option === "oldest") {
    return true;
  }
  if (!iso) return false;
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return false;

  const today = startOfDay(now);
  switch (option) {
    case "today":
      return startOfDay(when).getTime() === today.getTime();
    case "this-week": {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Sunday 00:00
      return when.getTime() >= weekStart.getTime();
    }
    case "this-month":
      return (
        when.getFullYear() === now.getFullYear() &&
        when.getMonth() === now.getMonth()
      );
    case "last-30-days": {
      const cutoff = new Date(today);
      cutoff.setDate(today.getDate() - 30);
      return when.getTime() >= cutoff.getTime();
    }
    default:
      return true;
  }
}

export function isOldestFirst(option: PersonalLibraryDateOption): boolean {
  return option === "oldest";
}

/**
 * Records must stay hidden until BOTH an Item Type and an Alphabet Range are
 * chosen. Date is optional.
 */
export function shouldShowPersonalLibraryResults(
  itemType: PersonalLibraryItemType | "",
  alphabetRange: AlphabetRangeId | "",
): boolean {
  return Boolean(itemType) && Boolean(alphabetRange);
}

export type PersonalLibraryFilterRecord = {
  title: string;
  dateIso: string | null;
};

/**
 * Filter + sort records for one already-chosen Item Type. Returns [] when no
 * Alphabet Range is selected (the gate). Date narrows; "newest"/"oldest" sort.
 */
export function filterAndSortPersonalLibrary<T extends PersonalLibraryFilterRecord>(input: {
  records: readonly T[];
  alphabetRange: AlphabetRangeId | "";
  dateOption: PersonalLibraryDateOption;
  now?: Date;
}): T[] {
  const { records, alphabetRange, dateOption, now = new Date() } = input;
  if (!alphabetRange) return [];

  const matched = records.filter(
    (r) =>
      matchesAlphabetRange(r.title, alphabetRange) &&
      matchesDateOption(r.dateIso, dateOption, now),
  );

  const oldest = isOldestFirst(dateOption);
  return [...matched].sort((a, b) => {
    const at = a.dateIso ? Date.parse(a.dateIso) : 0;
    const bt = b.dateIso ? Date.parse(b.dateIso) : 0;
    return oldest ? at - bt : bt - at;
  });
}

/**
 * The saved Sparks that back a given Item Type. Only Spark Cards and Ideas &
 * Notes have real records today; the others return [] (honest empty state).
 */
export function sparkRecordsForItemType(
  itemType: PersonalLibraryItemType,
  savedSparks: readonly MySparkSavedItem[],
): MySparkSavedItem[] {
  switch (itemType) {
    case "spark-cards":
      return [...savedSparks];
    case "ideas-notes":
      return savedSparks.filter((s) => Boolean(s.note && s.note.trim()));
    case "actions-tried":
    case "learned":
    case "questions":
      return [];
    default:
      return [];
  }
}

/** True for the item types that have no persisted record source yet. */
export function itemTypeHasNoRecordSourceYet(
  itemType: PersonalLibraryItemType,
): boolean {
  return (
    itemType === "actions-tried" ||
    itemType === "learned" ||
    itemType === "questions"
  );
}

export type PersonalLibraryEmptyState = { heading: string; body: string };

/**
 * Encouraging empty-state copy per Item Type — invites the member to start using
 * the section. Never implies content exists that does not.
 */
export function personalLibraryEmptyState(
  itemType: PersonalLibraryItemType,
): PersonalLibraryEmptyState {
  switch (itemType) {
    case "spark-cards":
      return {
        heading: "No Spark Cards here yet",
        body: "When a Spark resonates, tap Save on Today’s Spark and it will be waiting for you here.",
      };
    case "ideas-notes":
      return {
        heading: "No ideas or notes here yet",
        body: "Add a note to any Spark — your thoughts and ideas will collect here.",
      };
    case "actions-tried":
      return {
        heading: "No actions here yet",
        body: "When you try something a Spark inspired, save it and it will show up here.",
      };
    case "learned":
      return {
        heading: "Nothing captured here yet",
        body: "As you note what you’re learning, those moments will gather here.",
      };
    case "questions":
      return {
        heading: "No questions here yet",
        body: "Save a question you want to sit with, and it will be here when you’re ready to revisit it.",
      };
    default:
      return {
        heading: "Nothing here yet",
        body: "This part of your library will fill in as you use it.",
      };
  }
}
