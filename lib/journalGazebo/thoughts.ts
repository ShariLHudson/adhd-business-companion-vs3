/** Rotating Estate thoughts for the journal page margin. */

export const JOURNAL_ESTATE_THOUGHTS = [
  "Sometimes the clearest thoughts arrive after we begin writing.",
  "Today's page doesn't need to be perfect.",
  "A quiet sentence can hold more truth than a polished paragraph.",
  "You may rest here as long as you need.",
  "What you write here matters — even the unfinished lines.",
  "There is no audience in this light — only you and the ink.",
  "Small honest words count as much as grand ones.",
  "This page will wait while you find the right phrase.",
  "Your story is worth preserving, one page at a time.",
  "Growth doesn't need to hurry. Neither do you.",
] as const;

export function journalThoughtForDay(date = new Date()): string {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  const day = Math.floor((date.getTime() - start) / 86_400_000);
  return JOURNAL_ESTATE_THOUGHTS[day % JOURNAL_ESTATE_THOUGHTS.length]!;
}
