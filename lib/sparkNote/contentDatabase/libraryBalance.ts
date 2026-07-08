import type { SparkContentRecord } from "./types";

/**
 * Recommended library mix per SPARK_NOTE_CONTENT_LIBRARY_MASTER_STANDARD.md
 * (and aligned with SPARK_NOTE_CONTENT_LIBRARY_AND_ADMIN_PROTOCOL).
 */
export const RECOMMENDED_SPARK_LIBRARY_BALANCE: {
  label: string;
  share: number;
  match: (record: SparkContentRecord) => boolean;
}[] = [
  {
    label: "Inventions",
    share: 0.25,
    match: (r) =>
      r.runtime_category === "invention" || r.runtime_category === "inventor",
  },
  {
    label: "Inspiring People",
    share: 0.2,
    match: (r) => r.runtime_category === "entrepreneur",
  },
  {
    label: "Entrepreneurs",
    share: 0.15,
    match: (r) =>
      r.runtime_category === "business" &&
      (r.subcategory?.toLowerCase().includes("founder") ||
        r.tags.includes("entrepreneurship")),
  },
  {
    label: "Business Lessons",
    share: 0.15,
    match: (r) =>
      r.runtime_category === "business" &&
      !(
        r.subcategory?.toLowerCase().includes("founder") ||
        r.tags.includes("entrepreneurship")
      ),
  },
  {
    label: "History",
    share: 0.1,
    match: (r) => r.runtime_category === "history",
  },
  {
    label: "Holidays",
    share: 0.05,
    match: (r) => r.runtime_category === "holiday",
  },
  {
    label: "Fun Facts",
    share: 0.05,
    match: (r) => r.runtime_category === "fun_fact",
  },
  {
    label: "Personal Growth",
    share: 0.05,
    match: (r) =>
      r.runtime_category === "personal_growth" ||
      r.runtime_category === "adhd_friendly" ||
      r.runtime_category === "quote" ||
      r.runtime_category === "creativity",
  },
  {
    label: "Creativity & Seasonal",
    share: 0,
    match: (r) =>
      r.runtime_category === "creativity" ||
      Boolean(r.date_rules.type === "season"),
  },
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
