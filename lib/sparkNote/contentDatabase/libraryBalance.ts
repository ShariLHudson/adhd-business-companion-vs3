import type { SparkContentRecord } from "./types";

/** Recommended library mix per SPARK_NOTE_CONTENT_LIBRARY_AND_ADMIN_PROTOCOL. */
export const RECOMMENDED_SPARK_LIBRARY_BALANCE: {
  label: string;
  share: number;
  match: (record: SparkContentRecord) => boolean;
}[] = [
  {
    label: "Inventions",
    share: 0.25,
    match: (r) =>
      r.runtime_category === "invention" ||
      r.runtime_category === "inventor" ||
      r.category.toLowerCase().includes("invention"),
  },
  {
    label: "Inspiring People",
    share: 0.2,
    match: (r) =>
      r.runtime_category === "entrepreneur" ||
      r.category.toLowerCase().includes("people"),
  },
  {
    label: "Business Sparks",
    share: 0.15,
    match: (r) => r.runtime_category === "business",
  },
  {
    label: "History",
    share: 0.15,
    match: (r) => r.runtime_category === "history",
  },
  {
    label: "Holidays",
    share: 0.1,
    match: (r) => r.runtime_category === "holiday",
  },
  {
    label: "Fun Facts",
    share: 0.1,
    match: (r) => r.runtime_category === "fun_fact",
  },
  {
    label: "Reflection / Growth",
    share: 0.05,
    match: (r) =>
      r.runtime_category === "personal_growth" ||
      r.runtime_category === "adhd_friendly" ||
      r.runtime_category === "quote" ||
      r.runtime_category === "creativity",
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

  return RECOMMENDED_SPARK_LIBRARY_BALANCE.map((bucket) => {
    const count = active.filter(bucket.match).length;
    const actualShare = count / total;
    return {
      label: bucket.label,
      count,
      actualShare,
      targetShare: bucket.share,
      delta: actualShare - bucket.share,
    };
  });
}
