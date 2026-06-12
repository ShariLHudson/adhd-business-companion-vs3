// Founder Ecosystem — Phase 17 Privacy Guard.
// Strips PII before any data enters the multi-founder network model.

import type { FounderEvent } from "../events";
import type { ID } from "../models";

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const GOOGLE_DOC_RE = /https?:\/\/(?:docs|drive)\.google\.com\/\S+/gi;
const PHONE_RE = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

/** Known test/demo identifiers — never pass through to network output. */
const BLOCKED_IDENTIFIERS = [
  "shari hudson",
  "shari@",
  "founder-001",
  "founder-a",
  "founder-b",
];

const PROJECT_CATEGORY_RULES: { pattern: RegExp; category: string }[] = [
  { pattern: /sales|funnel|lead|outreach|campaign/i, category: "sales/marketing" },
  { pattern: /workshop|course|launch|webinar/i, category: "launch/content" },
  { pattern: /app|product|software|saas/i, category: "product/build" },
  { pattern: /ops|system|process|sop/i, category: "operations" },
  { pattern: /brand|social|content|blog/i, category: "content/marketing" },
];

export function generalizeProjectTitle(title: string): string {
  for (const rule of PROJECT_CATEGORY_RULES) {
    if (rule.pattern.test(title)) return rule.category;
  }
  return "general/project";
}

export function sanitizeText(text: string): string {
  let out = text
    .replace(EMAIL_RE, "[email-removed]")
    .replace(GOOGLE_DOC_RE, "[doc-link-removed]")
    .replace(PHONE_RE, "[phone-removed]");

  for (const blocked of BLOCKED_IDENTIFIERS) {
    out = out.replace(new RegExp(blocked, "gi"), "[identifier-removed]");
  }
  return out;
}

/** Reduce a chat/message to category tags only — no exact message retained. */
export function messageToCategoryTags(text: string): string[] {
  const tags: string[] = [];
  const lower = text.toLowerCase();
  if (/launch|campaign|go live|publish/i.test(lower)) tags.push("campaign-launch");
  if (/follow.?up|leads?|outreach|sales/i.test(lower)) tags.push("sales-follow-up");
  if (/too much|overwhelm|priorit/i.test(lower)) tags.push("priority-overload");
  if (/procrastinat|putting off|delay|stall/i.test(lower)) tags.push("task-delay");
  if (/content|post|social/i.test(lower)) tags.push("content-work");
  if (/monday|batch/i.test(lower)) tags.push("batching");
  return tags;
}

function scrubData(data: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!data) return undefined;
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (
      key === "content" ||
      key === "body" ||
      key === "draft" ||
      key === "draftScaffold" ||
      key === "summary" ||
      key === "location"
    ) {
      continue;
    }
    if (key === "title" && typeof value === "string") {
      next[key] = generalizeProjectTitle(value);
      continue;
    }
    if (key === "text" && typeof value === "string") {
      next[key] = messageToCategoryTags(value).join(",") || "[message-redacted]";
      continue;
    }
    if (typeof value === "string") {
      next[key] = sanitizeText(value);
      continue;
    }
    next[key] = value;
  }
  return next;
}

/** Sanitize one event for network aggregation — removes PII-bearing fields. */
export function sanitizeEventForNetwork(event: FounderEvent): FounderEvent {
  return {
    id: event.id,
    founderId: "[redacted]",
    type: event.type,
    ts: event.ts,
    refs: event.refs
      ? {
          projectId: event.refs.projectId ? "[project-ref]" : undefined,
          taskId: event.refs.taskId ? "[task-ref]" : undefined,
          documentId: event.refs.documentId ? "[document-ref]" : undefined,
          decisionId: event.refs.decisionId,
          opportunityId: event.refs.opportunityId,
          painPointId: event.refs.painPointId,
          timeBlockId: event.refs.timeBlockId,
          workspace: event.refs.workspace,
        }
      : undefined,
    userMessage: undefined,
    workspaceContext: event.workspaceContext,
    data: scrubData(event.data),
  };
}

export function sanitizeEventsForNetwork(events: FounderEvent[]): FounderEvent[] {
  return events.map(sanitizeEventForNetwork);
}

const PII_PROBE_RE =
  /@[a-z0-9.-]+\.[a-z]{2,}|docs\.google\.com|drive\.google\.com|shari hudson|campaign alpha|adhd app|sales funnel launch|founder-a\b|private document/i;

/** Returns true if text still appears to contain PII or identifying business details. */
export function containsPII(text: string): boolean {
  return PII_PROBE_RE.test(text);
}

/** Validate a serializable network payload is safe for cross-founder display. */
export function assertSafeForNetworkExport(payload: unknown): boolean {
  const json = JSON.stringify(payload);
  return !containsPII(json);
}

/** Example transformation for documentation/tests. */
export function redactNarrative(bad: string, stage = "building"): string {
  const sanitized = sanitizeText(bad);
  if (/stall/i.test(sanitized)) {
    return `A founder in the ${stage} stage had a sales/marketing project stall for 14 days.`;
  }
  return `A founder in the ${stage} stage reported a workflow pattern.`;
}
