import type { FounderTrackedIssue, FounderTrackingData } from "./types";
import { getRetestQueue } from "./store";

const FAILED_RETEST_MARK = "[Retest failed";

export function getPendingRetests(
  data: FounderTrackingData,
): FounderTrackedIssue[] {
  return getRetestQueue(data);
}

export function getFailedRetests(
  data: FounderTrackingData,
): FounderTrackedIssue[] {
  return data.issues.filter(
    (i) =>
      i.status === "active" && i.description.includes(FAILED_RETEST_MARK),
  );
}
