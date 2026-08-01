import type { SparkContentRecord } from "./types";

/**
 * Recommended library mix per SPARK_NOTE_CONTENT_LIBRARY_MASTER_STANDARD.md
 * (and aligned with SPARK_NOTE_CONTENT_LIBRARY_AND_ADMIN_PROTOCOL).
 */
/** One bucket per numbered Spark Edition (001–012). Target shares reflect the
    approved library mix; delta reports over/under-representation per edition. */
export const RECOMMENDED_SPARK_LIBRARY_BALANCE: {
  label: string;
  share: number;
  match: (record: SparkContentRecord) => boolean;
}[] = [
  { label: "001 Discovery", share: 0.04, match: (r) => r.runtime_category === "001" },
  { label: "002 People & Stories", share: 0.1, match: (r) => r.runtime_category === "002" },
  { label: "003 Creativity & Inspiration", share: 0.08, match: (r) => r.runtime_category === "003" },
  { label: "004 Nature & Places", share: 0.04, match: (r) => r.runtime_category === "004" },
  { label: "005 Curiosity", share: 0.06, match: (r) => r.runtime_category === "005" },
  { label: "006 Words & Origins", share: 0.12, match: (r) => r.runtime_category === "006" },
  { label: "007 Strategy", share: 0.11, match: (r) => r.runtime_category === "007" },
  { label: "008 Reflection", share: 0.14, match: (r) => r.runtime_category === "008" },
  { label: "009 Adventure", share: 0.03, match: (r) => r.runtime_category === "009" },
  { label: "010 Business", share: 0.11, match: (r) => r.runtime_category === "010" },
  { label: "011 Innovation", share: 0.13, match: (r) => r.runtime_category === "011" },
  { label: "012 Wonder", share: 0.04, match: (r) => r.runtime_category === "012" },
];

export type SparkLibraryBalanceRow = {
  label: string;
  count: number;
  actualShare: number;
  targetShare: number;
  delta: number;
};

export function analyzeSparkLibraryBalance(
  records: SparkContentRecord[],
): SparkLibraryBalanceRow[] {
  const active = records.filter((r) => r.status === "active");
  const total = active.length || 1;

  return RECOMMENDED_SPARK_LIBRARY_BALANCE.filter((b) => b.share > 0).map(
    (bucket) => {
      const count = active.filter(bucket.match).length;
      const actualShare = count / total;
      return {
        label: bucket.label,
        count,
        actualShare,
        targetShare: bucket.share,
        delta: actualShare - bucket.share,
      };
    },
  );
}
