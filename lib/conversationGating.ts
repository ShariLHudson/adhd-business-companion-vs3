// Block premature tool/workspace opens — conversation first when prioritizing.

import { isMultiIntent } from "./intentStabilizer";

const PRIORITY_LANGUAGE_RE =
  /\b(priorit|which (?:one|should|to do) first|what to (?:work on|do|focus on) first|what should i (?:work on|do|focus on)|choose between|decide (?:which|what|between)|can'?t decide|not sure which|not sure what to|uncertain|what matters most|blocking the others|biggest momentum|where to start|what first)\b/i;

const ACTION_CLAUSE_RE =
  /\b(finish|complete|create|build|make|write|set up|launch|develop|design|automate|email|call|send|post|draft)\b/i;

const QUANTIFIED_TASK_RE =
  /\b(?:write|make|send|do|finish|complete|call|email|post|draft)\s+\d+\b/gi;

/** "write 3 emails, make 4 calls" style dumps — planning, not execution. */
export function isTaskDump(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  const quantified = t.match(QUANTIFIED_TASK_RE);
  if (quantified && quantified.length >= 2) return true;
  if (quantified && quantified.length === 1 && /\band\b/i.test(t)) return true;
  return false;
}

/** User is listing or weighing work — not ready for a workspace. */
export function isPriorityDiscussion(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (PRIORITY_LANGUAGE_RE.test(t)) return true;
  if (isMultiIntent(t)) return true;
  if (isTaskDump(t)) return true;

  const clauses = t.split(/\band\b|,|;|\//i).map((c) => c.trim()).filter((c) => c.length > 4);
  const actionClauses = clauses.filter((c) => ACTION_CLAUSE_RE.test(c));
  if (actionClauses.length >= 2) return true;
  if (clauses.length >= 3 && actionClauses.length >= 1) return true;

  if (
    /\bneed to\b/i.test(t) &&
    (t.match(/\band\b/gi)?.length ?? 0) >= 1 &&
    actionClauses.length >= 2
  ) {
    return true;
  }

  return false;
}

export function shouldStayInConversation(
  text: string,
  opts?: { multiIntent?: boolean },
): boolean {
  if (opts?.multiIntent) return true;
  return isPriorityDiscussion(text);
}

export function priorityDiscussionHint(text: string): string {
  return (
    `PRIORITY MODE (ACTIVE): The user is weighing multiple tasks or priorities — "${text.slice(0, 100)}". ` +
    `Stay in conversation. Help them think and choose ONE focus. ` +
    `Name the items if helpful, ask which blocks the others or would create the most momentum. ` +
    `Do NOT open Create, Projects, Strategy, Focus, Clear My Mind, or any workspace. ` +
    `Do NOT say "I'm opening Create" or hand off to a tool.`
  );
}

/** Multi-task list — capture, prioritize, then one workspace when chosen. */
export function taskCaptureHint(text: string): string {
  return (
    `TASK CAPTURE MODE (ACTIVE): User listed multiple tasks — "${text.slice(0, 120)}". ` +
    `1) Reflect the list briefly (do not open any workspace). ` +
    `2) Help prioritize — which blocks the others or creates momentum? ` +
    `3) Ask about energy and time available today. ` +
    `4) Recommend ONE next action. ` +
    `5) Open a workspace ONLY after they pick a single concrete task. ` +
    `Do NOT search projects, open Create, or claim a workspace is open.`
  );
}

export function conversationGatingHint(text: string): string {
  if (isTaskDump(text)) return taskCaptureHint(text);
  return priorityDiscussionHint(text);
}

/** Explicit open commands still allowed during planning (user chose the tool). */
export function isExplicitWorkspaceOpenRequest(text: string): boolean {
  const t = text.trim().toLowerCase();
  return (
    /\bopen (?:the )?(?:create|projects?|time ?block|clear my mind|brain dump|saved work|templates?)\b/.test(
      t,
    ) || /\bopen (?:my )?saved work\b/.test(t)
  );
}

export function shouldBlockAutoWorkspaceOpen(
  text: string,
  opts?: { stayInConversation?: boolean },
): boolean {
  if (!opts?.stayInConversation) return false;
  return !isExplicitWorkspaceOpenRequest(text);
}
