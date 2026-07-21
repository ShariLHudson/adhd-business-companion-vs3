/**
 * Shared canonical work record — Create shapes the work; Projects carries it forward.
 * One record; two Estate rooms. Never duplicate Create drafts into disconnected Projects.
 * Identity minting is owned by the Universal Work Engine.
 */

import { allocateCanonicalWorkId } from "@/lib/universalWorkEngine";

export type CanonicalWorkKind =
  | "creation"
  | "project"
  | "creation_with_project";

export type CanonicalWorkStatus =
  | "drafting"
  | "planning"
  | "in_motion"
  | "paused"
  | "complete"
  | "archived";

export type CanonicalWorkSection = {
  id: string;
  title: string;
  content: string;
  skipped?: boolean;
};

export type CanonicalWorkRecord = {
  id: string;
  title: string;
  workType: string;
  purpose: string;
  audience: string;
  kind: CanonicalWorkKind;
  status: CanonicalWorkStatus;
  sections: CanonicalWorkSection[];
  decisions: string[];
  tasks: Array<{ id: string; title: string; done: boolean }>;
  milestones: string[];
  notes: string[];
  resources: string[];
  /** Linked Create workflow / draft id when shaped in Create. */
  createWorkflowId?: string | null;
  /** Linked Project Home id when work continues in Projects. */
  projectHomeId?: string | null;
  companionProjectId?: string | null;
  conversationContext?: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "companion-canonical-work-v1";

function newId(): string {
  return allocateCanonicalWorkId({ origin: "projects" });
}

function readAll(): CanonicalWorkRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CanonicalWorkRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(records: CanonicalWorkRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    /* quota — keep in-memory only for this session via caller state */
  }
}

export function listCanonicalWorkRecords(): CanonicalWorkRecord[] {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getCanonicalWorkRecord(id: string): CanonicalWorkRecord | null {
  return readAll().find((r) => r.id === id) ?? null;
}

export function findCanonicalWorkByCreateWorkflow(
  createWorkflowId: string,
): CanonicalWorkRecord | null {
  return (
    readAll().find((r) => r.createWorkflowId === createWorkflowId) ?? null
  );
}

export function findCanonicalWorkByProjectHome(
  projectHomeId: string,
): CanonicalWorkRecord | null {
  return readAll().find((r) => r.projectHomeId === projectHomeId) ?? null;
}

export function upsertCanonicalWorkRecord(
  partial: Partial<CanonicalWorkRecord> &
    Pick<CanonicalWorkRecord, "title" | "workType">,
): CanonicalWorkRecord {
  const now = new Date().toISOString();
  const all = readAll();
  const existing = partial.id
    ? all.find((r) => r.id === partial.id)
    : partial.createWorkflowId
      ? all.find((r) => r.createWorkflowId === partial.createWorkflowId)
      : undefined;

  const next: CanonicalWorkRecord = {
    id: existing?.id ?? partial.id ?? newId(),
    title: partial.title || existing?.title || "Untitled work",
    workType: partial.workType || existing?.workType || "Creation",
    purpose: partial.purpose ?? existing?.purpose ?? "",
    audience: partial.audience ?? existing?.audience ?? "",
    kind: partial.kind ?? existing?.kind ?? "creation",
    status: partial.status ?? existing?.status ?? "drafting",
    sections: partial.sections ?? existing?.sections ?? [],
    decisions: partial.decisions ?? existing?.decisions ?? [],
    tasks: partial.tasks ?? existing?.tasks ?? [],
    milestones: partial.milestones ?? existing?.milestones ?? [],
    notes: partial.notes ?? existing?.notes ?? [],
    resources: partial.resources ?? existing?.resources ?? [],
    createWorkflowId:
      partial.createWorkflowId !== undefined
        ? partial.createWorkflowId
        : existing?.createWorkflowId ?? null,
    projectHomeId:
      partial.projectHomeId !== undefined
        ? partial.projectHomeId
        : existing?.projectHomeId ?? null,
    companionProjectId:
      partial.companionProjectId !== undefined
        ? partial.companionProjectId
        : existing?.companionProjectId ?? null,
    conversationContext:
      partial.conversationContext ?? existing?.conversationContext,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const others = all.filter((r) => r.id !== next.id);
  writeAll([next, ...others]);
  return next;
}

/** Types that often need ongoing execution — Create may offer a Project Home. */
export const PROJECT_WORTHY_CREATE_TYPES = [
  "event",
  "retreat",
  "workshop",
  "course",
  "course outline",
  "launch",
  "campaign",
  "email campaign",
  "marketing",
  "book",
  "offer",
  "proposal",
  "presentation",
] as const;

export function isProjectWorthyCreateType(typeLabel: string): boolean {
  const n = typeLabel.trim().toLowerCase();
  return PROJECT_WORTHY_CREATE_TYPES.some(
    (t) => n === t || n.includes(t) || t.includes(n),
  );
}

export function detectCreateTypeFromPrompt(text: string): string | null {
  const t = text.toLowerCase();
  // Concrete document types win over event/workshop nouns when both appear.
  if (/\bchecklist\b/.test(t)) return "Checklist";
  if (/\bsop\b/.test(t)) return "SOP";
  if (/\bnewsletter\b/.test(t)) return "Newsletter";
  if (/\bproposal\b/.test(t)) return "Proposal";
  if (/\b(retreat|event|summit|conference|gathering|meetup)\b/.test(t)) {
    return "Event Plan";
  }
  if (/\b(workshop|masterclass)\b/.test(t)) return "Workshop";
  if (/\b(course|curriculum)\b/.test(t)) return "Course Outline";
  if (/\b(launch|campaign)\b/.test(t)) return "Email Campaign";
  if (/\b(book|manuscript|chapter)\b/.test(t)) return "Book Outline";
  if (/\b(offer|pricing)\b/.test(t)) return "Offer";
  return null;
}

const EVENT_SECTION_TITLES = [
  "Overview",
  "Audience",
  "Outcomes",
  "Dates",
  "Venue",
  "Budget",
  "Speakers",
  "Vendors",
  "Volunteers",
  "Marketing",
  "Attendee Experience",
  "Run of Show",
  "Follow-up",
] as const;

export function eventPlanSectionSeeds(): CanonicalWorkSection[] {
  return EVENT_SECTION_TITLES.map((title, i) => ({
    id: `event-sec-${i + 1}`,
    title,
    content: "",
  }));
}

