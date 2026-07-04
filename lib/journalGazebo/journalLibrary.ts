import {
  getJournalConfigs,
  hasCompletedJournalCeremony,
} from "./store";
import type { JournalGazeboConfig } from "./types";

/** Journals ready for the personal library shelf — created and opened at least once. */
export function getShelfJournals(): JournalGazeboConfig[] {
  return getJournalConfigs()
    .filter((journal) => hasCompletedJournalCeremony(journal.id))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

/** All saved journals, newest first — for choosing which to open today. */
export function getLibraryJournals(): JournalGazeboConfig[] {
  return getJournalConfigs().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function hasMultipleJournals(): boolean {
  return getLibraryJournals().length > 1;
}
