import { getEvidenceDashboardStats } from "@/lib/evidenceBankStore";

export type EvidenceInsight = {
  id: string;
  text: string;
};

export function buildEvidenceInsights(): EvidenceInsight[] {
  const stats = getEvidenceDashboardStats();
  if (stats.totalEntries === 0) return [];
  const insights: EvidenceInsight[] = [
    {
      id: "total",
      text: `Your Evidence Vault holds ${stats.totalEntries} preserved discover${stats.totalEntries === 1 ? "y" : "ies"}.`,
    },
  ];
  if (stats.problemsSolved > 0) {
    insights.push({
      id: "problems",
      text: `You've documented ${stats.problemsSolved} problem${stats.problemsSolved === 1 ? "" : "s"} solved.`,
    });
  }
  if (stats.peopleBenefited > 0) {
    insights.push({
      id: "people",
      text: `People helped appears in ${stats.peopleBenefited} discover${stats.peopleBenefited === 1 ? "y" : "ies"}.`,
    });
  }
  return insights;
}
