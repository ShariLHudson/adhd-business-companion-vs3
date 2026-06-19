export type ResumeWorkKind =
  | "create"
  | "decision-compass"
  | "project"
  | "strategy-apply"
  | "brain-dump"
  | "workspace-sop";

export type ResumeWorkSignal = {
  kind: ResumeWorkKind;
  id: string;
  title: string;
  lastTouchedAt: string | null;
  openedAt?: string | null;
  // Strong work signals
  contentCharCount?: number;
  completedStepCount?: number;
  answeredQuestionCount?: number;
  savedProgress?: boolean;
  modifiedDocument?: boolean;
  createdTaskCount?: number;
  routedItemCount?: number;
  // Weak / navigation-only signals
  viewedOnly?: boolean;
  source?: string;
};

export type ResumeEligibilityResult = {
  eligible: boolean;
  reason: string;
  score: number;
};

const MIN_MEANINGFUL_CONTENT_CHARS = 40;
const MIN_WORK_SECONDS = 90;

function secondsBetween(start?: string | null, end?: string | null): number {
  if (!start || !end) return 0;
  const started = new Date(start).getTime();
  const ended = new Date(end).getTime();
  if (!Number.isFinite(started) || !Number.isFinite(ended)) return 0;
  return Math.max(0, Math.floor((ended - started) / 1000));
}

export function evaluateResumeWorkEligibility(
  signal: ResumeWorkSignal,
): ResumeEligibilityResult {
  let score = 0;
  const reasons: string[] = [];

  if (!signal.lastTouchedAt) {
    return {
      eligible: false,
      score: 0,
      reason: "No saved work timestamp.",
    };
  }

  if (signal.viewedOnly) {
    return {
      eligible: false,
      score: 0,
      reason: "Only viewed or opened, no work completed.",
    };
  }

  const workSeconds = secondsBetween(signal.openedAt, signal.lastTouchedAt);
  if (workSeconds >= MIN_WORK_SECONDS) {
    score += 1;
    reasons.push("spent meaningful time");
  }

  if ((signal.contentCharCount ?? 0) >= MIN_MEANINGFUL_CONTENT_CHARS) {
    score += 2;
    reasons.push("entered meaningful content");
  }

  if ((signal.completedStepCount ?? 0) > 0) {
    score += 2;
    reasons.push("completed a step");
  }

  if ((signal.answeredQuestionCount ?? 0) > 0) {
    score += 2;
    reasons.push("answered questions");
  }

  if (signal.savedProgress) {
    score += 2;
    reasons.push("saved progress");
  }

  if (signal.modifiedDocument) {
    score += 2;
    reasons.push("modified a document");
  }

  if ((signal.createdTaskCount ?? 0) > 0) {
    score += 2;
    reasons.push("created tasks");
  }

  if ((signal.routedItemCount ?? 0) > 0) {
    score += 2;
    reasons.push("routed captured items");
  }

  const eligible = score >= 2;
  return {
    eligible,
    score,
    reason: eligible
      ? `Eligible: ${reasons.join(", ")}.`
      : "Navigation only or not enough meaningful work.",
  };
}

export function pickMostRecentEligibleResume<T extends ResumeWorkSignal>(
  items: T[],
): T | null {
  return (
    items
      .map((item) => ({
        item,
        result: evaluateResumeWorkEligibility(item),
      }))
      .filter(({ result }) => result.eligible)
      .sort((a, b) => {
        const aTime = new Date(a.item.lastTouchedAt ?? 0).getTime();
        const bTime = new Date(b.item.lastTouchedAt ?? 0).getTime();
        return bTime - aTime;
      })[0]?.item ?? null
  );
}
