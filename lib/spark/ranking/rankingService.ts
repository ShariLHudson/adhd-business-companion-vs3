export class RankingService {
  rankByComposite<T extends { compositeScore?: number; confidence?: { score: number } }>(
    items: T[],
  ): T[] {
    return [...items].sort((a, b) => {
      const aScore = a.compositeScore ?? a.confidence?.score ?? 0;
      const bScore = b.compositeScore ?? b.confidence?.score ?? 0;
      return bScore - aScore;
    });
  }
}

export const rankingService = new RankingService();
