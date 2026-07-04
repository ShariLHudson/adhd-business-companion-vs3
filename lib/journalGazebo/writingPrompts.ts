/** Rotating journal prompts — stable for the day, varied across visits. */

const JOURNAL_WRITING_PROMPTS = [
  "What is on your heart today?",
  "What surprised you today?",
  "What are you grateful for?",
  "What made you smile?",
  "What do you want to remember?",
  "What gave you a little hope?",
  "What would you tell tomorrow-you?",
  "What felt quietly good today?",
  "What are you glad happened?",
] as const;

/** Same prompt all day; rotates naturally day to day. */
export function pickJournalWritingPrompt(date = new Date()): string {
  const seed =
    date.getFullYear() * 372 +
    date.getMonth() * 31 +
    date.getDate();
  const index = seed % JOURNAL_WRITING_PROMPTS.length;
  return JOURNAL_WRITING_PROMPTS[index] ?? JOURNAL_WRITING_PROMPTS[0]!;
}

/** Short quote or tip on blank pages after the first writing spread — not on page one. */
export function pickJournalPageTip(pageIndex: number, date = new Date()): string {
  const seed =
    date.getFullYear() * 372 +
    date.getMonth() * 31 +
    date.getDate() +
    pageIndex * 17;
  const index = seed % JOURNAL_WRITING_PROMPTS.length;
  return JOURNAL_WRITING_PROMPTS[index] ?? JOURNAL_WRITING_PROMPTS[0]!;
}
