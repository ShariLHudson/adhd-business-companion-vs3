import { isConfirmationAcceptance } from "@/lib/conversationConfirmationGate";

/**
 * Active Task Lock — Phase 2A (observe + protect).
 *
 * Tracks deliverable promises (research, draft, summarize, …) so room routing
 * can be suppressed mid-task. Wired via estateTaskLockGate in handleSend.
 *
 * Lifecycle: begin → working → ready_to_deliver → delivering → complete
 *
 * @see docs/estate/ESTATE_TURN_ORCHESTRATION_PLAN.md
 */

export type TaskKind =
  | "research"
  | "draft"
  | "summarize"
  | "find"
  | "create"
  | "analyze"
  | "compare"
  | "write"
  | "email"
  | "schedule";

export type ActiveTaskStatus =
  | "begin"
  | "working"
  | "ready_to_deliver"
  | "delivering"
  | "complete"
  | "cancelled";

/** @deprecated Legacy persisted values — normalized on load */
export type LegacyActiveTaskStatus =
  | "promised"
  | "in_progress"
  | "delivered";

export type ActiveTask = {
  id: string;
  kind: TaskKind;
  /** Normalized subject — e.g. "AI tools for Wonderdog" */
  topic: string;
  status: ActiveTaskStatus;
  openedAtTurn: number;
  lastTouchedTurn: number;
  deliveryTurn?: number;
  sourceUserText: string;
};

export type ActiveTaskLockState = {
  activeTask: ActiveTask | null;
  /** Conversation turn through which estate room routing stays suppressed */
  routingSuppressedUntilTurn: number;
};

export const DEFAULT_ROUTING_SUPPRESSION_TURNS = 3;

export const ACTIVE_TASK_STORAGE_KEY = "spark:estate:active-task:v1";

const LEGACY_STATUS_MAP: Record<string, ActiveTaskStatus> = {
  promised: "begin",
  in_progress: "working",
  delivered: "complete",
};

const TASK_REQUEST_RULES: { kind: TaskKind; pattern: RegExp }[] = [
  { kind: "research", pattern: /\b(?:research|look into|find out about|investigate)\b/i },
  { kind: "draft", pattern: /\b(?:draft|rough out|sketch out)\b/i },
  { kind: "summarize", pattern: /\b(?:summarize|summary|tl;?dr)\b/i },
  { kind: "find", pattern: /\b(?:find|pull|gather)\s+(?:examples?|quotes?|options?|sources?)\b/i },
  { kind: "create", pattern: /\b(?:create|build)\s+(?:a\s+)?(?:plan|outline|framework)\b/i },
  { kind: "analyze", pattern: /\b(?:analyze|analyse)\b/i },
  { kind: "compare", pattern: /\bcompare\b/i },
  { kind: "write", pattern: /\b(?:write|compose)\s+(?:a\s+)?(?:letter|copy|post|article|email)\b/i },
  { kind: "email", pattern: /\bdraft\s+(?:an?\s+)?email\b/i },
  { kind: "schedule", pattern: /\b(?:schedule|plan)\s+(?:my\s+)?(?:week|day|post)\b/i },
];

const TOPIC_CAPTURE_RULES: { kind: TaskKind; pattern: RegExp }[] = [
  { kind: "research", pattern: /\bresearch\s+(.+)/i },
  { kind: "research", pattern: /\blook into\s+(.+)/i },
  { kind: "research", pattern: /\bfind out about\s+(.+)/i },
  { kind: "draft", pattern: /\bdraft\s+(?:an?\s+)?(.+)/i },
  { kind: "summarize", pattern: /\bsummarize\s+(.+)/i },
  { kind: "find", pattern: /\bfind\s+(.+)/i },
  { kind: "create", pattern: /\b(?:create|build)\s+(?:a\s+)?(.+)/i },
  { kind: "analyze", pattern: /\banalyz(?:e|ing)\s+(.+)/i },
  { kind: "compare", pattern: /\bcompare\s+(.+)/i },
  { kind: "write", pattern: /\bwrite\s+(?:a\s+)?(.+)/i },
  { kind: "email", pattern: /\bdraft\s+(?:an?\s+)?email\s+(?:to\s+)?(.+)/i },
  { kind: "schedule", pattern: /\b(?:schedule|plan)\s+(.+)/i },
];

const SPARK_TASK_PROMISE_RULES: { kind: TaskKind; pattern: RegExp }[] = [
  {
    kind: "research",
    pattern: /\b(?:i'll|i will|let me)\s+(?:look into|research)\b/i,
  },
  {
    kind: "draft",
    pattern: /\b(?:i'll|i will|let me)\s+draft\b/i,
  },
  {
    kind: "summarize",
    pattern: /\b(?:i'll|i will|let me)\s+summarize\b/i,
  },
  {
    kind: "find",
    pattern: /\b(?:i'll|i will|let me)\s+find\b/i,
  },
  {
    kind: "analyze",
    pattern: /\b(?:i'll|i will|let me)\s+analyz/i,
  },
  {
    kind: "compare",
    pattern: /\b(?:i'll|i will|let me)\s+compare\b/i,
  },
  {
    kind: "write",
    pattern: /\b(?:i'll|i will|let me)\s+write\b/i,
  },
];

/** Short acknowledgments after member requests work — promote begin → working */
const SPARK_TASK_ACK_RULES: { kind: TaskKind | null; pattern: RegExp }[] = [
  {
    kind: null,
    pattern:
      /^(?:on it\.?|got it\.?|i'?m on it\.?|okay — on it\.?|okay, on it\.?|sure — on it\.?)$/i,
  },
  {
    kind: null,
    pattern: /\b(?:on it|got it)\s*[—–-]\s*(?:i'?ll|let me)\b/i,
  },
  {
    kind: "research",
    pattern: /\b(?:looking into (?:that|it)|digging into|i'?ll look into)\b/i,
  },
  {
    kind: "draft",
    pattern: /\b(?:i'?ll draft|drafting (?:that|it))\b/i,
  },
  {
    kind: "summarize",
    pattern: /\b(?:i'?ll summarize|summarizing (?:that|it))\b/i,
  },
];

const TASK_STATUS_INQUIRY_RE =
  /\b(?:do you have (?:any|anything|the)?|what did you find|what have you got|any updates?|got anything(?: yet)?|show me(?: the| what| anything| it)?|where is (?:it|what you found)|let me see (?:it|what you found)|what(?:'s| is) the (?:status|update)|keep going|what else|and\?|have you found|still working on)\b/i;

const TASK_CONTINUATION_RE =
  /\b(?:what did you find|show me (?:the )?research|where is (?:it|what you found)|let me see (?:it|what you found)|any updates?|what(?:'s| is) the (?:status|update)|keep going|what else|and\?)\b/i;

const TASK_ARTIFACT_RE =
  /\b(?:show me (?:what you|the)|where is what you found|let me see it)\b/i;

const TASK_CANCEL_RE =
  /\b(?:stop researching|forget that|never mind|cancel that|don't bother)\b/i;

const TASK_COMPLETE_RE =
  /\b(?:that(?:'s| is) enough|we(?:'re| are) good(?: on that)?|thanks(?:,)? that(?:'s| is) what i needed)\b/i;

const TASK_DELIVERY_RE: { kind: TaskKind; pattern: RegExp }[] = [
  {
    kind: "research",
    pattern:
      /\b(?:here(?:'s| is) what i found|what i found|key findings|research summary|i looked into)\b/i,
  },
  {
    kind: "draft",
    pattern: /\b(?:here(?:'s| is) (?:the |a )?draft|draft for you)\b/i,
  },
  {
    kind: "summarize",
    pattern: /\b(?:here(?:'s| is) (?:the |a )?summary|quick summary)\b/i,
  },
];

const ESTATE_INVITATION_RE =
  /\b(?:go there with me|take you to|would you like to (?:go|visit|open)|peaceful place|observatory|momentum institute|creative studio|greenhouse|celebration room|journal gazebo)\b/i;

const BARE_AFFIRMATION_RE =
  /^(?:yes|yep|yeah|yup|ok(?:ay)?|sure|sounds good|go ahead|please|do it|that works|perfect)\.?$/i;

const TASK_PERMISSION_QUESTION_RE =
  /\bwould you like (?:me to|to)\s+(?:gather|research|look into|find out|investigate|draft|write|summarize|create|analyze|compare|help (?:me )?(?:with|draft|write|research|gather))\b/i;

const REJECT_ROUTING_CORRECTION_RULES: RegExp[] = [
  /\bi don'?t want a room\b/i,
  /\bstop suggesting places\b/i,
  /\bnot a tour\b/i,
  /\bstay here\b/i,
  /\bthat(?:'s| is) not what i asked\b/i,
  /\bno,?\s+i meant\b/i,
  /\byou(?:'re| are) not listening\b/i,
  /\bthat(?:'s| is) not what i wanted\b/i,
  /\bi don'?t want to open\b/i,
  /\bnot the observatory\b/i,
  /\bstop sending me to\b/i,
  /\bjust answer\b/i,
  /\bfocus on what i asked\b/i,
  /\bplease stop\b/i,
];

const TASK_ARTIFACT_DEMAND_RULES: RegExp[] = [
  /\bshow me the research\b/i,
  /\bwhat did you find\b/i,
  /\bwhere is what you found\b/i,
  /\blet me see it\b/i,
  /\bdo you have any research\b/i,
  /\bwhat have you got\b/i,
];

let taskIdCounter = 0;

export function normalizeActiveTaskStatus(
  status: string | ActiveTaskStatus,
): ActiveTaskStatus {
  return LEGACY_STATUS_MAP[status] ?? (status as ActiveTaskStatus);
}

export function normalizeActiveTask(task: ActiveTask): ActiveTask {
  return {
    ...task,
    status: normalizeActiveTaskStatus(task.status),
  };
}

export function isActiveTaskBlockingRouting(task: ActiveTask | null): boolean {
  if (!task) return false;
  const status = normalizeActiveTaskStatus(task.status);
  return (
    status === "begin" ||
    status === "working" ||
    status === "ready_to_deliver" ||
    status === "delivering"
  );
}

export function createActiveTaskLockState(): ActiveTaskLockState {
  return {
    activeTask: null,
    routingSuppressedUntilTurn: 0,
  };
}

export function createTaskId(): string {
  taskIdCounter += 1;
  return `task-${taskIdCounter}`;
}

export function isTaskStatusInquiryPhrase(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  return TASK_STATUS_INQUIRY_RE.test(t);
}

export function detectTaskRequest(
  userText: string,
  opts?: { activeTask?: ActiveTask | null },
): { kind: TaskKind; topic: string } | null {
  const text = userText.trim();
  if (!text) return null;

  if (
    opts?.activeTask &&
    isActiveTaskBlockingRouting(opts.activeTask) &&
    isTaskStatusInquiryPhrase(text)
  ) {
    return null;
  }

  for (const rule of TASK_REQUEST_RULES) {
    if (!rule.pattern.test(text)) continue;
    return {
      kind: rule.kind,
      topic: extractTaskTopic(text, rule.kind),
    };
  }
  return null;
}

export function detectSparkTaskPromise(
  assistantText: string | null | undefined,
): { kind: TaskKind } | null {
  const ack = detectSparkTaskAcknowledgment(assistantText);
  if (!ack) return null;
  return ack.kind ? { kind: ack.kind } : null;
}

export function detectSparkTaskAcknowledgment(
  assistantText: string | null | undefined,
): { kind: TaskKind | null } | null {
  const text = assistantText?.trim() ?? "";
  if (!text) return null;

  for (const rule of SPARK_TASK_ACK_RULES) {
    if (rule.pattern.test(text)) return { kind: rule.kind };
  }
  for (const rule of SPARK_TASK_PROMISE_RULES) {
    if (rule.pattern.test(text)) return { kind: rule.kind };
  }
  return null;
}

export function detectTaskDeliveryInAssistant(
  assistantText: string | null | undefined,
  kind: TaskKind,
): boolean {
  const text = assistantText?.trim() ?? "";
  if (!text || text.length < 80) return false;

  for (const rule of TASK_DELIVERY_RE) {
    if (rule.kind !== kind) continue;
    if (rule.pattern.test(text)) return true;
  }
  return false;
}

export function isEstateInvitationMessage(text: string | null | undefined): boolean {
  const t = text?.trim() ?? "";
  if (!t) return false;
  return ESTATE_INVITATION_RE.test(t);
}

export function isBareAffirmation(text: string): boolean {
  return BARE_AFFIRMATION_RE.test(text.trim());
}

export function isTaskPermissionAffirmation(text: string): boolean {
  return isBareAffirmation(text) || isConfirmationAcceptance(text);
}

export function detectSparkTaskPermissionQuestion(
  assistantText: string | null | undefined,
): { kind: TaskKind | null } | null {
  const text = assistantText?.trim() ?? "";
  if (!text) return null;
  if (!TASK_PERMISSION_QUESTION_RE.test(text)) return null;

  for (const rule of TASK_REQUEST_RULES) {
    if (rule.pattern.test(text)) return { kind: rule.kind };
  }
  if (/\b(?:gather|findings|research|look into|investigate)\b/i.test(text)) {
    return { kind: "research" };
  }
  if (/\b(?:draft|write)\b/i.test(text)) return { kind: "draft" };
  if (/\bsummarize\b/i.test(text)) return { kind: "summarize" };
  if (/\b(?:analyze|analyse)\b/i.test(text)) return { kind: "analyze" };
  if (/\bcompare\b/i.test(text)) return { kind: "compare" };
  if (/\b(?:create|build)\b/i.test(text)) return { kind: "create" };
  return { kind: null };
}

export function isUserCorrectionOverride(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return REJECT_ROUTING_CORRECTION_RULES.some((rule) => rule.test(t));
}

export function isTaskArtifactDemand(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return TASK_ARTIFACT_DEMAND_RULES.some((rule) => rule.test(t));
}

export function isTaskContinuationPhrase(
  userText: string,
  activeTask: ActiveTask | null,
): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (
    activeTask &&
    (activeTask.status === "cancelled" || activeTask.status === "complete")
  ) {
    return false;
  }
  if (isTaskStatusInquiryPhrase(t)) return true;
  if (TASK_CONTINUATION_RE.test(t)) return true;
  if (TASK_ARTIFACT_RE.test(t)) return true;
  if (/\bresearch\b/i.test(t) && /\b(?:show|found|results?|what|any|have)\b/i.test(t)) {
    return true;
  }
  return false;
}

export function isTaskCancellationPhrase(text: string): boolean {
  return TASK_CANCEL_RE.test(text.trim());
}

export function isTaskCompletionPhrase(text: string): boolean {
  return TASK_COMPLETE_RE.test(text.trim());
}

export function shouldSuppressRoomRouting(
  state: ActiveTaskLockState,
  conversationTurn: number,
): boolean {
  if (conversationTurn <= state.routingSuppressedUntilTurn) return true;
  return isActiveTaskBlockingRouting(state.activeTask);
}

export function openActiveTask(input: {
  kind: TaskKind;
  topic: string;
  sourceUserText: string;
  conversationTurn: number;
  status?: ActiveTaskStatus;
}): ActiveTask {
  return {
    id: createTaskId(),
    kind: input.kind,
    topic: input.topic.trim(),
    status: input.status ?? "begin",
    openedAtTurn: input.conversationTurn,
    lastTouchedTurn: input.conversationTurn,
    sourceUserText: input.sourceUserText.trim(),
  };
}

export function touchActiveTask(
  task: ActiveTask,
  conversationTurn: number,
): ActiveTask {
  const status = normalizeActiveTaskStatus(task.status);
  return {
    ...task,
    lastTouchedTurn: conversationTurn,
    status: status === "begin" ? "working" : status,
  };
}

export function promoteTaskToWorking(
  task: ActiveTask,
  conversationTurn: number,
): ActiveTask {
  const status = normalizeActiveTaskStatus(task.status);
  if (status === "complete" || status === "cancelled") return task;
  return {
    ...task,
    status: "working",
    lastTouchedTurn: conversationTurn,
  };
}

export function markTaskReadyToDeliver(
  task: ActiveTask,
  conversationTurn: number,
): ActiveTask {
  const status = normalizeActiveTaskStatus(task.status);
  if (status === "complete" || status === "cancelled") return task;
  return {
    ...task,
    status: "ready_to_deliver",
    lastTouchedTurn: conversationTurn,
  };
}

export function markTaskDelivering(
  task: ActiveTask,
  conversationTurn: number,
): ActiveTask {
  const status = normalizeActiveTaskStatus(task.status);
  if (status === "complete" || status === "cancelled") return task;
  return {
    ...task,
    status: "delivering",
    lastTouchedTurn: conversationTurn,
  };
}

export function cancelActiveTask(task: ActiveTask): ActiveTask {
  return { ...task, status: "cancelled" };
}

export function completeActiveTask(
  task: ActiveTask,
  conversationTurn: number,
): ActiveTask {
  return {
    ...task,
    status: "complete",
    deliveryTurn: conversationTurn,
    lastTouchedTurn: conversationTurn,
  };
}

export function applyRoutingSuppression(
  state: ActiveTaskLockState,
  conversationTurn: number,
  turns = DEFAULT_ROUTING_SUPPRESSION_TURNS,
): ActiveTaskLockState {
  return {
    ...state,
    routingSuppressedUntilTurn: conversationTurn + turns,
  };
}

export function resolveAffirmationDuringTask(input: {
  userText: string;
  lastAssistantText: string | null;
  activeTask: ActiveTask | null;
  priorUserText?: string | null;
}): "task_continuation" | "estate_offer" | "none" {
  if (!isTaskPermissionAffirmation(input.userText)) return "none";

  const taskPermission = detectSparkTaskPermissionQuestion(input.lastAssistantText);
  if (
    taskPermission &&
    input.priorUserText &&
    detectTaskRequest(input.priorUserText)
  ) {
    return "task_continuation";
  }

  const sparkAck = detectSparkTaskAcknowledgment(input.lastAssistantText);
  const estateInvite = isEstateInvitationMessage(input.lastAssistantText);

  if (sparkAck && !estateInvite) return "task_continuation";
  if (estateInvite && !sparkAck) return "estate_offer";
  if (sparkAck && estateInvite) {
    return sparkAck ? "task_continuation" : "estate_offer";
  }
  if (input.activeTask && isActiveTaskBlockingRouting(input.activeTask)) {
    return "task_continuation";
  }
  return "none";
}

export function applyAssistantTaskLifecycle(input: {
  assistantText: string;
  priorUserText?: string | null;
  conversationTurn: number;
  state?: ActiveTaskLockState;
}): ActiveTaskLockState {
  let state = input.state ?? loadActiveTaskLockState();
  const ack = detectSparkTaskAcknowledgment(input.assistantText);
  let task = state.activeTask ? normalizeActiveTask(state.activeTask) : null;

  if (task && ack && (task.status === "begin" || task.status === "working")) {
    task = promoteTaskToWorking(task, input.conversationTurn);
    state = { ...state, activeTask: task };
  } else if (!task && ack && input.priorUserText) {
    const priorRequest = detectTaskRequest(input.priorUserText);
    if (priorRequest) {
      task = openActiveTask({
        kind: priorRequest.kind,
        topic: priorRequest.topic,
        sourceUserText: input.priorUserText,
        conversationTurn: input.conversationTurn,
        status: "working",
      });
      state = { ...state, activeTask: task };
    }
  }

  if (task && detectTaskDeliveryInAssistant(input.assistantText, task.kind)) {
    task = markTaskReadyToDeliver(task, input.conversationTurn);
    state = { ...state, activeTask: task };
  }

  return state;
}

function extractTaskTopic(userText: string, kind: TaskKind): string {
  const cleaned = userText.trim().replace(/\?+$/, "");
  for (const rule of TOPIC_CAPTURE_RULES) {
    if (rule.kind !== kind) continue;
    const match = cleaned.match(rule.pattern);
    if (match?.[1]) {
      return match[1].trim().replace(/\?+$/, "");
    }
  }
  return cleaned;
}

/** Session persistence — wired in handleSend (Phase 2C). */
let sessionTaskState: ActiveTaskLockState = createActiveTaskLockState();

export function loadActiveTaskLockState(): ActiveTaskLockState {
  if (typeof window === "undefined") return sessionTaskState;
  try {
    const raw = window.sessionStorage.getItem(ACTIVE_TASK_STORAGE_KEY);
    if (!raw) return sessionTaskState;
    const parsed = JSON.parse(raw) as ActiveTaskLockState;
    if (!parsed || typeof parsed !== "object") return sessionTaskState;
    const activeTask = parsed.activeTask
      ? normalizeActiveTask(parsed.activeTask)
      : null;
    return {
      activeTask,
      routingSuppressedUntilTurn: parsed.routingSuppressedUntilTurn ?? 0,
    };
  } catch {
    return sessionTaskState;
  }
}

export function saveActiveTaskLockState(state: ActiveTaskLockState): void {
  sessionTaskState = state;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(ACTIVE_TASK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function clearActiveTaskLockState(): void {
  sessionTaskState = createActiveTaskLockState();
  taskIdCounter = 0;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(ACTIVE_TASK_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
