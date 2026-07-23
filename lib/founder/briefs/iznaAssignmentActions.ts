/**
 * Local-only Izna assignment actions supported without a send integration.
 */

export const IZNA_REVIEW_MARKS_KEY =
  "spark-estate:founder-izna-review-marks" as const;

function canUseStorage(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    );
  } catch {
    return false;
  }
}

export function formatIznaAssignmentForClipboard(assignment: {
  title: string;
  businessContext: string;
  whyItMatters: string;
  steps: readonly string[];
  expectedDeliverables: readonly string[];
  definitionOfDone: string;
  priority: string;
  timing: string;
  returnToFounder: string;
  questionsOrDependencies?: string;
}): string {
  const lines = [
    assignment.title,
    "",
    `Business context: ${assignment.businessContext}`,
    `Why it matters: ${assignment.whyItMatters}`,
    "",
    "Steps:",
    ...assignment.steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "Expected deliverables:",
    ...assignment.expectedDeliverables.map((d) => `- ${d}`),
    "",
    `Definition of done: ${assignment.definitionOfDone}`,
    `Priority: ${assignment.priority}`,
    `Timing: ${assignment.timing}`,
    `Return to founder: ${assignment.returnToFounder}`,
  ];
  if (assignment.questionsOrDependencies) {
    lines.push(`Questions / dependencies: ${assignment.questionsOrDependencies}`);
  }
  return lines.join("\n");
}

export async function copyIznaAssignmentText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  return false;
}

export function isIznaMarkedForReview(assignmentId: string): boolean {
  if (!canUseStorage()) return false;
  try {
    const raw = window.localStorage.getItem(IZNA_REVIEW_MARKS_KEY);
    if (!raw) return false;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.includes(assignmentId);
  } catch {
    return false;
  }
}

export function markIznaForReview(assignmentId: string): void {
  if (!canUseStorage()) return;
  try {
    const raw = window.localStorage.getItem(IZNA_REVIEW_MARKS_KEY);
    const current: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    const next = Array.isArray(current) ? current : [];
    if (!next.includes(assignmentId)) next.push(assignmentId);
    window.localStorage.setItem(IZNA_REVIEW_MARKS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
