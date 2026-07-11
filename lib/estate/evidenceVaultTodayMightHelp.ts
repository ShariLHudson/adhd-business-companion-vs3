import {
  getEvidenceEntries,
  pickRandomEvidenceEntries,
  type EvidenceEntry,
} from "@/lib/evidenceBankStore";

export const EVIDENCE_VAULT_TODAY_MIGHT_HELP_TITLE =
  "Today, this might help" as const;

export type TodayMightHelpDiscovery = {
  entry: EvidenceEntry;
  dateLabel: string;
  quote: string;
};

function formatDiscoveryDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });
}

function discoveryQuote(entry: EvidenceEntry): string {
  const lesson = entry.whatThisProves.trim();
  if (lesson) return lesson;
  const body = entry.whatHappened.trim();
  if (body.length <= 160) return body;
  return `${body.slice(0, 157)}…`;
}

/** Surface one gentle past discovery on vault entry — never when vault is empty. */
export function pickTodayMightHelpDiscovery(): TodayMightHelpDiscovery | null {
  const entries = getEvidenceEntries();
  if (entries.length === 0) return null;
  const [picked] = pickRandomEvidenceEntries(1, entries.slice(1));
  const entry = picked ?? entries[0]!;
  return {
    entry,
    dateLabel: formatDiscoveryDate(entry.createdAt),
    quote: discoveryQuote(entry),
  };
}
