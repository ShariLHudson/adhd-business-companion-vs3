/**
 * Founder-facing user health reporting — broad patterns, not surveillance.
 */

import { supportNeedLabel } from "./userHealthScoring";
import { getUserHealthStore } from "./userHealthStore";
import type {
  FounderUserHealthReport,
  SupportNeed,
  UserHealthStatus,
} from "./types";

const MS_DAY = 86_400_000;

const STATUS_LABELS: Record<UserHealthStatus, string> = {
  supported: "Supported",
  steady: "Steady",
  needs_support: "Needs support",
  overloaded: "Overloaded",
  disengaging: "Disengaging",
  recovering: "Recovering",
  unknown: "Unknown",
};

export function statusLabel(status: UserHealthStatus): string {
  return STATUS_LABELS[status];
}

export function buildFounderUserHealthReport(
  now = new Date(),
): FounderUserHealthReport {
  const store = getUserHealthStore();
  const since7d = now.getTime() - 7 * MS_DAY;
  const recent = store.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );

  const statusCounts = new Map<UserHealthStatus, number>();
  const needCounts = new Map<SupportNeed, number>();

  for (const s of recent) {
    statusCounts.set(s.status, (statusCounts.get(s.status) ?? 0) + 1);
    for (const n of s.supportNeeds) {
      needCounts.set(n, (needCounts.get(n) ?? 0) + 1);
    }
  }

  const distribution = [...statusCounts.entries()]
    .map(([status, count]) => ({
      status,
      label: statusLabel(status),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const commonSupportNeeds = [...needCounts.entries()]
    .map(([need, count]) => ({
      need,
      label: supportNeedLabel(need),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const needsSupportCount =
    (statusCounts.get("needs_support") ?? 0) +
    (statusCounts.get("overloaded") ?? 0);
  const overloadedCount = statusCounts.get("overloaded") ?? 0;
  const disengagingCount = statusCounts.get("disengaging") ?? 0;
  const recoveringCount = statusCounts.get("recovering") ?? 0;

  const top = distribution[0]?.status;

  return {
    generatedAt: now.toISOString(),
    sampleSize: recent.length,
    distribution,
    needsSupportCount,
    overloadedCount,
    disengagingCount,
    recoveringCount,
    commonSupportNeeds,
    recommendedFounderAction: founderActionFor(top),
    notes:
      "Local preview — use patterns to improve support, never to pressure or retain users.",
  };
}

function founderActionFor(status: UserHealthStatus | undefined): string {
  switch (status) {
    case "overloaded":
      return "Review sorting and recovery flows — reduce default guidance volume when load is high.";
    case "needs_support":
      return "Audit companion copy for validation-first tone; avoid productivity nudges in distress.";
    case "disengaging":
      return "Ensure return experience is guilt-free. No “we missed you” or cancellation-save tactics.";
    case "recovering":
      return "Keep encouragement light — small wins over big plans.";
    case "supported":
      return "Support experience is landing — maintain warmth without adding complexity.";
    case "steady":
      return "Most users steady — monitor edge cases (overload, disengagement) without over-instrumenting.";
    default:
      return "Collect more samples before tuning — prioritize well-being metrics over engagement.";
  }
}
