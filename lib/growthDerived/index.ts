/**
 * Derived Growth collections — read-only views over primary databases.
 */

import { getEvidenceEntries } from "@/lib/evidenceBankStore";
import { getJournalEntries } from "@/lib/growthJournalStore";
import { getPortfolioEntries } from "@/lib/growthPortfolioStore";
import { getSavedGrowthWins } from "@/lib/growthWinsStore";
import { getJourneyEntries } from "@/lib/myJourneyStore";

export type GrowthDerivedSummary = {
  portfolioCount: number;
  evidenceCount: number;
  journalCount: number;
  winsCount: number;
  journeyCount: number;
  /** V1 placeholder — future Pattern Intelligence */
  patternsReady: boolean;
};

export function summarizeGrowthDerived(): GrowthDerivedSummary {
  const evidence = getEvidenceEntries();
  const portfolio = getPortfolioEntries();
  const journal = getJournalEntries();
  const wins = getSavedGrowthWins();
  const journey = getJourneyEntries();

  const totalPrimary = evidence.length + portfolio.length + journal.length;

  return {
    portfolioCount: portfolio.length,
    evidenceCount: evidence.length,
    journalCount: journal.length,
    winsCount: wins.length,
    journeyCount: journey.length,
    patternsReady: totalPrimary >= 5,
  };
}
