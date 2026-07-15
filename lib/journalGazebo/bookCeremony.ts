import type { JournalLeatherColor } from "./types";

/** Page index where today's writing begins (0-based). Human page 2. */
export const FIRST_WRITING_PAGE_INDEX = 1;

/** First-opening ceremony pages before writing (page 0). Human page 1. */
export const FIRST_OPEN_CEREMONY_PAGE_COUNT = 1;

/** Writing pages per journal (indices FIRST_WRITING_PAGE_INDEX … LAST_WRITING_PAGE_INDEX). */
export const MAX_JOURNAL_WRITING_PAGES = 200;

/** Last writable page index (0-based). After this, start a new journal. */
export const LAST_WRITING_PAGE_INDEX =
  FIRST_WRITING_PAGE_INDEX + MAX_JOURNAL_WRITING_PAGES - 1;

/** @deprecated Use FIRST_OPEN_CEREMONY_PAGE_COUNT */
export const BOOK_CEREMONY_PAGE_COUNT = FIRST_OPEN_CEREMONY_PAGE_COUNT;

/** Book-creation spread ceremony (leather, name, dedication). */
export const CREATION_CEREMONY_PAGE_COUNT = 3;

export const JOURNAL_BOOKBINDER_LEATHERS: {
  id: JournalLeatherColor;
  label: string;
}[] = [
  { id: "cognac", label: "English Saddle Brown" },
  { id: "forest", label: "Estate Forest Green" },
  { id: "burgundy", label: "Deep Burgundy" },
  { id: "midnight", label: "Navy Heritage" },
  { id: "espresso", label: "Black Calfskin" },
  { id: "camel", label: "Ivory Linen" },
];

export const JOURNAL_ORDER_NAME_SUGGESTIONS = [
  "My Journey",
  "Quiet Thoughts",
  "Reflections",
  "Becoming",
  "My Legacy",
  "The Next Chapter",
] as const;

export function volumePageLabel(pageIndex: number): string {
  const display = pageIndex + 1;
  return `Volume I · Page ${display}`;
}
