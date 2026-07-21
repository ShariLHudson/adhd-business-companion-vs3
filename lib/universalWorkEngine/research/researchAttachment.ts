/**
 * Universal research attachment — never auto-overwrites master work.
 * Flow: Research → Review → Approve → Apply → version/history update (caller).
 */

import type {
  ResearchApprovalStatus,
  ResearchAttachmentTarget,
  ResearchRecord,
} from "../types";

const byId = new Map<string, ResearchRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function newResearchId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `research-${crypto.randomUUID().slice(0, 10)}`;
  }
  return `research-${Date.now().toString(36)}`;
}

export function resetResearchAttachmentsForTests(): void {
  byId.clear();
}

export function createResearchRecord(input: {
  target: ResearchAttachmentTarget;
  researchQuestion: string;
  researchMode: string;
  sources?: readonly string[];
  findings?: string;
  confidence?: ResearchRecord["confidence"];
  relevance?: string;
  affectedDecisions?: readonly string[];
  proposedActions?: readonly string[];
  originatingExperience: string;
}): ResearchRecord {
  const ts = nowIso();
  const record: ResearchRecord = {
    id: newResearchId(),
    target: input.target,
    researchQuestion: input.researchQuestion.trim(),
    researchMode: input.researchMode.trim() || "general",
    sources: input.sources ?? [],
    findings: input.findings?.trim() ?? "",
    date: ts.slice(0, 10),
    confidence: input.confidence ?? "medium",
    relevance: input.relevance?.trim() ?? "",
    affectedDecisions: input.affectedDecisions ?? [],
    proposedActions: input.proposedActions ?? [],
    approvalStatus: "draft",
    appliedChanges: [],
    originatingExperience: input.originatingExperience,
    createdAt: ts,
    updatedAt: ts,
  };
  byId.set(record.id, record);
  return record;
}

export function getResearchRecord(id: string): ResearchRecord | null {
  return byId.get(id) ?? null;
}

export function listResearchForWork(workId: string): ResearchRecord[] {
  return [...byId.values()].filter((r) => {
    const t = r.target;
    if ("workId" in t && t.workId === workId) return true;
    return false;
  });
}

function transition(
  id: string,
  to: ResearchApprovalStatus,
  allowedFrom: readonly ResearchApprovalStatus[],
): ResearchRecord {
  const current = byId.get(id);
  if (!current) throw new Error(`Research record not found: ${id}`);
  if (!allowedFrom.includes(current.approvalStatus)) {
    throw new Error(
      `Cannot move research ${id} from ${current.approvalStatus} to ${to}`,
    );
  }
  const next: ResearchRecord = {
    ...current,
    approvalStatus: to,
    updatedAt: nowIso(),
  };
  byId.set(id, next);
  return next;
}

export function submitResearchForReview(id: string): ResearchRecord {
  return transition(id, "in_review", ["draft", "rejected"]);
}

export function approveResearch(id: string): ResearchRecord {
  return transition(id, "approved", ["in_review"]);
}

export function rejectResearch(id: string): ResearchRecord {
  return transition(id, "rejected", ["in_review"]);
}

/**
 * Apply approved research — records applied change summaries only.
 * Does NOT mutate Create workflow / Event Record content automatically.
 */
export function applyApprovedResearch(
  id: string,
  appliedChanges: readonly string[],
): ResearchRecord {
  const current = byId.get(id);
  if (!current) throw new Error(`Research record not found: ${id}`);
  if (current.approvalStatus !== "approved") {
    throw new Error(
      `Research ${id} must be approved before apply (status=${current.approvalStatus})`,
    );
  }
  const next: ResearchRecord = {
    ...current,
    approvalStatus: "applied",
    appliedChanges: [...appliedChanges],
    updatedAt: nowIso(),
  };
  byId.set(id, next);
  return next;
}
