import { sampleMemoryRepository } from "../repositories/sample";
import type { FounderJournalEntry, FounderMemoryVaultOverview } from "../types";

export function listJournalEntries(): FounderJournalEntry[] {
  return [...sampleMemoryRepository.getVaultOverview().journal].sort(
    (a, b) => new Date(b.writtenAt).getTime() - new Date(a.writtenAt).getTime(),
  );
}

export function getMemoryVaultOverview(): FounderMemoryVaultOverview {
  return sampleMemoryRepository.getVaultOverview();
}
