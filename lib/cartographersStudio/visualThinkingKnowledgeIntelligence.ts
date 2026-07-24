/**
 * Visual Thinking Studio — Knowledge Intelligence Engine Foundation (Build 5).
 * Plans and assembles a structured Knowledge Package for the Generation Engine.
 * Does not re-interpret goals, change the experience plan, or perform live research.
 */

import {
  limitVisibleChoices,
  resolveAdaptivePresentation,
} from "@/lib/adaptiveCompanionIntelligence";
import type { VisualThinkingDeliverable as PlanDeliverableType } from "@/lib/cartographersStudio/visualThinkingExperienceOrchestrator";
import type {
  VisualThinkingExperiencePlan,
  VisualThinkingInteractionStyle,
} from "@/lib/cartographersStudio/visualThinkingExperienceOrchestrator";
import { deliverableLabel } from "@/lib/cartographersStudio/visualThinkingExperienceOrchestrator";
import type { VisualThinkingUnderstanding } from "@/lib/cartographersStudio/visualThinkingUnderstanding";
import type { VisualThinkingRequest } from "@/lib/cartographersStudio/visualThinkingRequest";
import type { VisualThinkingGenerationRun } from "@/lib/cartographersStudio/visualThinkingGenerationEngine";
import { enrichHandoffWithInstructionalMaterial } from "@/lib/cartographersStudio/visualThinkingGenerateFirst";

// ─── Source references ──────────────────────────────────────────────────────

export type VisualThinkingKnowledgeSourceKind =
  | "user_request"
  | "user_supplied_text"
  | "current_conversation"
  | "uploaded_document"
  | "prior_visual_thinking_work"
  | "business_estate"
  | "create"
  | "project"
  | "chamber"
  | "board"
  | "journal"
  | "saved_research"
  | "approved_platform_knowledge"
  | "external_research"
  | "understanding_outcome"
  | "experience_plan"
  | "generation_placeholder";

export type VisualThinkingKnowledgeFreshness =
  | "timeless"
  | "stable"
  | "recent"
  | "current"
  | "unknown";

export type VisualThinkingKnowledgeSourceReference = {
  id: string;
  sourceKind: VisualThinkingKnowledgeSourceKind;
  sourceId: string | null;
  title: string;
  location: string | null;
  capturedAt: string;
  authorOrOwner: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  freshness: VisualThinkingKnowledgeFreshness;
  reliability: "high" | "medium" | "low" | "unknown";
  authority: "user" | "platform" | "external" | "unknown";
  relevance: "high" | "medium" | "low";
  userProvided: boolean;
  external: boolean;
  verified: boolean;
  metadata: Record<string, unknown>;
};

// ─── Knowledge items ────────────────────────────────────────────────────────

export type VisualThinkingKnowledgeItemType =
  | "fact"
  | "instruction"
  | "step"
  | "definition"
  | "explanation"
  | "example"
  | "option"
  | "criterion"
  | "risk"
  | "benefit"
  | "limitation"
  | "warning"
  | "question"
  | "evidence"
  | "assumption"
  | "decision_point"
  | "relationship"
  | "timeline_event"
  | "process_input"
  | "process_output"
  | "unresolved_gap";

export type VisualThinkingKnowledgeItem = {
  id: string;
  type: VisualThinkingKnowledgeItemType;
  title: string;
  content: string;
  topic: string | null;
  category: string | null;
  tags: string[];
  sourceReferenceIds: string[];
  confidence: "high" | "medium" | "low" | "unknown";
  freshness: VisualThinkingKnowledgeFreshness;
  verificationStatus: "verified" | "unverified" | "assumption" | "inferred" | "gap";
  importance: "required" | "helpful" | "optional";
  sequence: number | null;
  parentId: string | null;
  userProvided: boolean;
  userEdited: boolean;
  inferred: boolean;
  metadata: Record<string, unknown>;
};

// ─── Gaps / conflicts / uncertainty ─────────────────────────────────────────

export type VisualThinkingKnowledgeGapResolutionType =
  | "user_input"
  | "existing_source"
  | "external_research"
  | "clarification"
  | "optional_omission";

export type VisualThinkingKnowledgeGap = {
  id: string;
  knowledgePlanId: string;
  area: string;
  description: string;
  requiredFor: PlanDeliverableType[];
  priority: "required" | "helpful" | "optional";
  resolutionType: VisualThinkingKnowledgeGapResolutionType;
  researchNeeded: boolean;
  userInputNeeded: boolean;
  platformSourceNeeded: boolean;
  status: "open" | "resolved" | "deferred";
  resolvedByItemIds: string[];
  focusedQuestion: string | null;
};

export type VisualThinkingKnowledgeConflict = {
  id: string;
  itemIds: string[];
  description: string;
  conflictType:
    | "factual_disagreement"
    | "version_difference"
    | "process_difference"
    | "preference_difference"
    | "scope_difference"
    | "unclear_context";
  sourceReferenceIds: string[];
  status: "open" | "acknowledged" | "resolved";
  resolutionNeeded: boolean;
  resolutionNotes: string | null;
};

export type VisualThinkingKnowledgeUncertainty = {
  id: string;
  itemId: string | null;
  description: string;
  reason: string;
  confidence: "high" | "medium" | "low" | "unknown";
  resolutionNeeded: boolean;
};

export type VisualThinkingKnowledgeRelationship = {
  id: string;
  fromItemId: string;
  toItemId: string;
  kind:
    | "follows"
    | "depends_on"
    | "causes"
    | "contributes_to"
    | "conflicts_with"
    | "supports"
    | "explains"
    | "example_of"
    | "part_of"
    | "leads_to"
    | "alternative_to"
    | "requires"
    | "related_to";
  label: string | null;
};

export type VisualThinkingKnowledgeGroup = {
  id: string;
  kind:
    | "phase"
    | "topic"
    | "category"
    | "role"
    | "priority"
    | "option"
    | "audience"
    | "department"
    | "time_period";
  title: string;
  itemIds: string[];
};

// ─── Plan & package ─────────────────────────────────────────────────────────

export type VisualThinkingKnowledgeOrganizationStrategy =
  | "sequence"
  | "hierarchy"
  | "topic_groups"
  | "relationships"
  | "comparison_criteria"
  | "chronology"
  | "cause_and_effect"
  | "problem_and_solution"
  | "input_process_output"
  | "learning_progression"
  | "decision_structure";

export type VisualThinkingEvidenceRequirement =
  | "none"
  | "helpful"
  | "expected"
  | "required";

export type VisualThinkingKnowledgePlanStatus =
  | "draft"
  | "ready"
  | "awaiting_sources"
  | "awaiting_research"
  | "assembling"
  | "package_ready"
  | "blocked"
  | "failed";

export type VisualThinkingKnowledgeArea = {
  id: string;
  label: string;
  required: boolean;
  forDeliverables: PlanDeliverableType[];
};

export type VisualThinkingKnowledgePlan = {
  id: string;
  requestId: string;
  understandingId: string;
  experiencePlanId: string;
  generationRunId: string | null;
  purpose: string;
  intendedUse: string;
  requiredKnowledgeAreas: VisualThinkingKnowledgeArea[];
  optionalKnowledgeAreas: VisualThinkingKnowledgeArea[];
  approvedSourceKinds: VisualThinkingKnowledgeSourceKind[];
  excludedSourceKinds: VisualThinkingKnowledgeSourceKind[];
  availableSourceRefs: string[];
  missingKnowledgeGaps: string[];
  researchRequired: boolean;
  researchPriority: "none" | "optional" | "required";
  freshnessRequirement: VisualThinkingKnowledgeFreshness;
  evidenceRequirement: VisualThinkingEvidenceRequirement;
  organizationStrategy: VisualThinkingKnowledgeOrganizationStrategy;
  status: VisualThinkingKnowledgePlanStatus;
  createdAt: string;
  updatedAt: string;
  plannedBy: "deterministic_v1";
  planningVersion: "vts-knowledge-plan-1";
  userAdjusted: boolean;
};

export type VisualThinkingKnowledgeReadiness =
  | "not_ready"
  | "structure_ready"
  | "partial_ready"
  | "full_ready";

export type VisualThinkingKnowledgePackage = {
  id: string;
  knowledgePlanId: string;
  requestId: string;
  understandingId: string;
  experiencePlanId: string;
  generationRunId: string | null;
  title: string;
  purpose: string;
  items: VisualThinkingKnowledgeItem[];
  groups: VisualThinkingKnowledgeGroup[];
  relationships: VisualThinkingKnowledgeRelationship[];
  sourceReferences: VisualThinkingKnowledgeSourceReference[];
  knowledgeGaps: VisualThinkingKnowledgeGap[];
  conflicts: VisualThinkingKnowledgeConflict[];
  uncertainties: VisualThinkingKnowledgeUncertainty[];
  assumptions: string[];
  coverage: {
    requiredAreasCovered: number;
    requiredAreasTotal: number;
    optionalAreasCovered: number;
  };
  freshness: VisualThinkingKnowledgeFreshness;
  confidence: "high" | "medium" | "low" | "unknown";
  readiness: VisualThinkingKnowledgeReadiness;
  readyForGeneration: boolean;
  blockedReasons: string[];
  createdAt: string;
  updatedAt: string;
  assembledBy: "deterministic_v1";
  assemblyVersion: "vts-knowledge-package-1";
};

export type VisualThinkingGenerationHandoff = {
  knowledgePackageId: string;
  readiness: VisualThinkingKnowledgeReadiness;
  approvedItemIds: string[];
  unresolvedGaps: VisualThinkingKnowledgeGap[];
  sourceReferences: VisualThinkingKnowledgeSourceReference[];
  conflicts: VisualThinkingKnowledgeConflict[];
  uncertainties: VisualThinkingKnowledgeUncertainty[];
  assumptions: string[];
  safeGenerationScope: "structure_only" | "partial" | "full" | "none";
  blockedContentAreas: string[];
  organizationStrategy: VisualThinkingKnowledgeOrganizationStrategy;
  suppliedSteps: string[];
  userFacingStatus: string;
};

export type VisualThinkingKnowledgeBundle = {
  plan: VisualThinkingKnowledgePlan;
  package: VisualThinkingKnowledgePackage;
  handoff: VisualThinkingGenerationHandoff;
};

export type VisualThinkingKnowledgeInput = {
  request: VisualThinkingRequest;
  understanding: VisualThinkingUnderstanding;
  experiencePlan: VisualThinkingExperiencePlan;
  generationRun?: VisualThinkingGenerationRun | null;
  /** Explicit attached structured content already in the workflow */
  attachedStructuredContent?: string | null;
  /** Answers to focused knowledge questions */
  userGapAnswers?: Record<string, string>;
};

const KNOWLEDGE_DRAFT_KEY = "companion-visual-thinking-knowledge-package-v1";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseSuppliedLines(text: string | null | undefined): string[] {
  if (!text?.trim()) return [];
  const marker = text.match(
    /(?:steps?|workflow|process|ideas|areas?)\s*:\s*([\s\S]+)$/i,
  );
  const body = marker?.[1] ?? text;
  const rawLines = body.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const listLike = rawLines.filter((l) =>
    /^(?:[-*•]|\d+[\).])\s+/.test(l),
  );
  // Prefer explicit list items; never treat a single prose sentence as steps.
  const sourceLines =
    listLike.length >= 1
      ? listLike
      : marker
        ? rawLines
        : rawLines.length >= 2
          ? rawLines
          : [];
  return sourceLines
    .map((l) => l.replace(/^\s*[-*•]\s*/, "").replace(/^\d+[\).]\s*/, "").trim())
    .filter((l) => l.length > 0);
}

function looksLikeCurrentProductRequest(raw: string): boolean {
  return /\b(current|loom|chrome|desktop app|interface|pricing|today'?s|latest)\b/i.test(
    raw,
  );
}

function looksLikeExternalComparison(raw: string, primary: PlanDeliverableType): boolean {
  return (
    primary === "comparison" ||
    /\b(compar(e|ison)|crm|platforms?|vendors?)\b/i.test(raw)
  );
}

function looksLikeInternalProcess(raw: string, lines: string[]): boolean {
  return (
    lines.length >= 2 ||
    /\b(my (own )?business|our (process|onboarding|workflow)|these steps|i pasted)\b/i.test(
      raw,
    )
  );
}

/** Guard for tests — Knowledge Engine must not invent deliverables. */
export function knowledgeEngineConsumesUpstreamOnly(
  plan: VisualThinkingExperiencePlan,
  understanding: VisualThinkingUnderstanding,
): boolean {
  return Boolean(
    plan.primaryDeliverable &&
      plan.supportingDeliverables &&
      understanding.primaryGoal &&
      understanding.successDefinition,
  );
}

// ─── Requirement planning ───────────────────────────────────────────────────

function areasForDeliverable(
  type: PlanDeliverableType,
  detail: VisualThinkingExperiencePlan["detailLevel"],
): { required: VisualThinkingKnowledgeArea[]; optional: VisualThinkingKnowledgeArea[] } {
  const req: VisualThinkingKnowledgeArea[] = [];
  const opt: VisualThinkingKnowledgeArea[] = [];
  const add = (
    list: VisualThinkingKnowledgeArea[],
    label: string,
    required: boolean,
  ) => {
    list.push({
      id: newId("area"),
      label,
      required,
      forDeliverables: [type],
    });
  };

  switch (type) {
    case "step_by_step_guide":
    case "learning_guide":
      add(req, "ordered actions", true);
      add(req, "expected result", true);
      add(opt, "prerequisites", detail !== "essentials");
      add(opt, "common errors", detail === "detailed");
      add(opt, "completion check", true);
      break;
    case "sop":
      add(req, "purpose", true);
      add(req, "procedure", true);
      add(req, "completion criteria", true);
      add(opt, "owner", true);
      add(opt, "trigger", detail !== "essentials");
      add(opt, "exception handling", detail === "detailed");
      add(opt, "quality checks", detail !== "essentials");
      break;
    case "training_guide":
      add(req, "learning objective", true);
      add(req, "procedure / demonstration", true);
      add(req, "completion standard", true);
      add(opt, "audience skill level", true);
      add(opt, "common mistakes", detail !== "essentials");
      add(opt, "review questions", detail === "detailed");
      add(opt, "examples", detail === "detailed");
      break;
    case "report":
    case "concise_explanation":
      add(req, "topic explanation", true);
      add(opt, "background", detail !== "essentials");
      add(opt, "key findings", true);
      add(opt, "sources", detail !== "essentials");
      break;
    case "comparison":
      add(req, "options", true);
      add(req, "comparison criteria", true);
      add(opt, "tradeoffs", true);
      add(opt, "current evidence", true);
      break;
    case "decision_tree":
      add(req, "decision question", true);
      add(req, "options", true);
      add(opt, "criteria", true);
      break;
    case "editable_relationship_map":
    case "relationship_visualization":
      add(req, "central topic", true);
      add(opt, "related concepts", true);
      add(opt, "relationship types", true);
      break;
    case "process_flow":
      add(req, "process steps", true);
      add(opt, "decision points", detail !== "essentials");
      break;
    case "checklist":
      add(req, "checklist items", true);
      break;
    case "action_plan":
      add(req, "next actions", true);
      add(opt, "outcome", true);
      break;
    default:
      add(req, "core topic knowledge", true);
      add(opt, "examples", detail === "detailed");
  }

  // Normalize optional list: only keep required:false entries
  return {
    required: req.filter((a) => a.required),
    optional: [...req.filter((a) => !a.required), ...opt.filter((a) => a.required === false || !a.required)].length
      ? opt.concat(req.filter((a) => !a.required))
      : opt,
  };
}

function selectOrganizationStrategy(
  plan: VisualThinkingExperiencePlan,
): VisualThinkingKnowledgeOrganizationStrategy {
  switch (plan.primaryDeliverable) {
    case "step_by_step_guide":
    case "sop":
    case "checklist":
    case "process_flow":
    case "action_plan":
      return "sequence";
    case "training_guide":
    case "learning_guide":
      return "learning_progression";
    case "comparison":
      return "comparison_criteria";
    case "decision_tree":
      return "decision_structure";
    case "timeline":
      return "chronology";
    case "editable_relationship_map":
    case "relationship_visualization":
      return "relationships";
    case "report":
    case "concise_explanation":
      return "topic_groups";
    default:
      return "topic_groups";
  }
}

function selectFreshnessRequirement(
  plan: VisualThinkingExperiencePlan,
  raw: string,
): VisualThinkingKnowledgeFreshness {
  if (looksLikeCurrentProductRequest(raw) || looksLikeExternalComparison(raw, plan.primaryDeliverable)) {
    return "current";
  }
  if (looksLikeInternalProcess(raw, parseSuppliedLines(raw))) {
    return "current";
  }
  if (
    plan.primaryDeliverable === "report" ||
    plan.primaryDeliverable === "concise_explanation"
  ) {
    return "stable";
  }
  return "unknown";
}

function selectEvidenceRequirement(
  plan: VisualThinkingExperiencePlan,
  raw: string,
): VisualThinkingEvidenceRequirement {
  if (
    /\b(medical|legal|medicare|regulation|compliance)\b/i.test(raw)
  ) {
    return "required";
  }
  if (
    plan.researchStage === "before_generation" ||
    looksLikeExternalComparison(raw, plan.primaryDeliverable) ||
    looksLikeCurrentProductRequest(raw)
  ) {
    return "required";
  }
  if (
    plan.primaryDeliverable === "editable_relationship_map" ||
    plan.interactionStyle === "let_me_build"
  ) {
    return "none";
  }
  if (looksLikeInternalProcess(raw, parseSuppliedLines(raw))) {
    return "expected";
  }
  return "helpful";
}

export function planVisualThinkingKnowledge(
  input: VisualThinkingKnowledgeInput,
): VisualThinkingKnowledgePlan {
  const { request, understanding, experiencePlan: plan } = input;
  const raw = request.rawRequest;
  const primaryAreas = areasForDeliverable(plan.primaryDeliverable, plan.detailLevel);
  const supportingAreas = plan.supportingDeliverables.flatMap((t) =>
    areasForDeliverable(t, plan.detailLevel).required,
  );

  const researchRequired =
    plan.researchStage === "before_generation" ||
    understanding.researchNeed === "required";
  const researchPriority: VisualThinkingKnowledgePlan["researchPriority"] =
    researchRequired
      ? "required"
      : understanding.researchNeed === "optional" ||
          plan.researchStage === "during_generation"
        ? "optional"
        : "none";

  const timestamp = nowIso();
  return {
    id: newId("vtkp"),
    requestId: request.id,
    understandingId: understanding.id,
    experiencePlanId: plan.id,
    generationRunId: input.generationRun?.id ?? null,
    purpose:
      understanding.userFacingGoal ||
      understanding.successDefinition ||
      "Support the confirmed Visual Thinking experience.",
    intendedUse: `Generate ${deliverableLabel(plan.primaryDeliverable)} and approved supporting deliverables.`,
    requiredKnowledgeAreas: [
      ...primaryAreas.required,
      ...supportingAreas.filter(
        (a) =>
          !primaryAreas.required.some(
            (p) => normalizeText(p.label) === normalizeText(a.label),
          ),
      ),
    ],
    optionalKnowledgeAreas: primaryAreas.optional,
    approvedSourceKinds: [
      "user_request",
      "user_supplied_text",
      "current_conversation",
      "understanding_outcome",
      "experience_plan",
      "generation_placeholder",
      "prior_visual_thinking_work",
    ],
    excludedSourceKinds: researchRequired ? [] : ["external_research"],
    availableSourceRefs: [],
    missingKnowledgeGaps: [],
    researchRequired,
    researchPriority,
    freshnessRequirement: selectFreshnessRequirement(plan, raw),
    evidenceRequirement: selectEvidenceRequirement(plan, raw),
    organizationStrategy: selectOrganizationStrategy(plan),
    status: "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
    plannedBy: "deterministic_v1",
    planningVersion: "vts-knowledge-plan-1",
    userAdjusted: false,
  };
}

// ─── Assembly ───────────────────────────────────────────────────────────────

function makeSource(
  kind: VisualThinkingKnowledgeSourceKind,
  title: string,
  extras: Partial<VisualThinkingKnowledgeSourceReference> = {},
): VisualThinkingKnowledgeSourceReference {
  return {
    id: newId("vtsrc"),
    sourceKind: kind,
    sourceId: extras.sourceId ?? null,
    title,
    location: extras.location ?? null,
    capturedAt: nowIso(),
    authorOrOwner: extras.authorOrOwner ?? null,
    publishedAt: extras.publishedAt ?? null,
    updatedAt: extras.updatedAt ?? null,
    freshness: extras.freshness ?? "unknown",
    reliability: extras.reliability ?? "unknown",
    authority: extras.authority ?? "unknown",
    relevance: extras.relevance ?? "high",
    userProvided: extras.userProvided ?? false,
    external: extras.external ?? false,
    verified: extras.verified ?? false,
    metadata: extras.metadata ?? {},
  };
}

function makeItem(
  partial: Omit<VisualThinkingKnowledgeItem, "id" | "tags" | "metadata"> & {
    tags?: string[];
    metadata?: Record<string, unknown>;
  },
): VisualThinkingKnowledgeItem {
  return {
    id: newId("vtki"),
    tags: partial.tags ?? [],
    metadata: partial.metadata ?? {},
    ...partial,
  };
}

function dedupeItems(
  items: VisualThinkingKnowledgeItem[],
): {
  items: VisualThinkingKnowledgeItem[];
  mergeNotes: string[];
} {
  const mergeNotes: string[] = [];
  const byKey = new Map<string, VisualThinkingKnowledgeItem>();
  for (const item of items) {
    if (
      item.verificationStatus === "assumption" ||
      item.type === "assumption" ||
      item.type === "unresolved_gap"
    ) {
      byKey.set(item.id, item);
      continue;
    }
    const key = `${item.type}::${normalizeText(item.content)}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, item);
      continue;
    }
    // Do not merge if verification differs meaningfully or both user-provided with different titles
    if (existing.verificationStatus !== item.verificationStatus) {
      byKey.set(item.id, item);
      continue;
    }
    const merged: VisualThinkingKnowledgeItem = {
      ...existing,
      sourceReferenceIds: [
        ...new Set([...existing.sourceReferenceIds, ...item.sourceReferenceIds]),
      ],
      confidence:
        existing.confidence === "high" || item.confidence === "high"
          ? "high"
          : existing.confidence === "medium" || item.confidence === "medium"
            ? "medium"
            : existing.confidence,
      userProvided: existing.userProvided || item.userProvided,
      content: existing.userProvided ? existing.content : item.content,
      metadata: {
        ...existing.metadata,
        mergedFrom: [
          ...((existing.metadata.mergedFrom as string[]) ?? []),
          item.id,
        ],
      },
    };
    byKey.set(key, merged);
    mergeNotes.push(`Merged duplicate knowledge: ${item.title}`);
  }
  return { items: [...byKey.values()], mergeNotes };
}

export function detectKnowledgeConflicts(
  items: VisualThinkingKnowledgeItem[],
  sources: VisualThinkingKnowledgeSourceReference[] = [],
): VisualThinkingKnowledgeConflict[] {
  const conflicts: VisualThinkingKnowledgeConflict[] = [];
  const steps = items.filter((i) => i.type === "step");
  // Same sequence number, different content → process_difference
  const bySeq = new Map<number, VisualThinkingKnowledgeItem[]>();
  for (const s of steps) {
    if (s.sequence == null) continue;
    const list = bySeq.get(s.sequence) ?? [];
    list.push(s);
    bySeq.set(s.sequence, list);
  }
  for (const [, group] of bySeq) {
    if (group.length < 2) continue;
    const contents = new Set(group.map((g) => normalizeText(g.content)));
    if (contents.size > 1) {
      conflicts.push({
        id: newId("vtkc"),
        itemIds: group.map((g) => g.id),
        description: `Different process wording for step ${group[0]!.sequence}.`,
        conflictType: "process_difference",
        sourceReferenceIds: [
          ...new Set(group.flatMap((g) => g.sourceReferenceIds)),
        ],
        status: "open",
        resolutionNeeded: true,
        resolutionNotes: null,
      });
    }
  }

  // Explicit contradict markers in metadata (for tests / future AI)
  const marked = items.filter((i) => i.metadata.conflictsWithItemId);
  for (const item of marked) {
    const otherId = String(item.metadata.conflictsWithItemId);
    if (!items.some((i) => i.id === otherId)) continue;
    conflicts.push({
      id: newId("vtkc"),
      itemIds: [item.id, otherId],
      description: item.metadata.conflictDescription
        ? String(item.metadata.conflictDescription)
        : "Conflicting claims retained separately.",
      conflictType: "factual_disagreement",
      sourceReferenceIds: [
        ...item.sourceReferenceIds,
        ...(items.find((i) => i.id === otherId)?.sourceReferenceIds ?? []),
      ].filter((id, idx, arr) => arr.indexOf(id) === idx),
      status: "open",
      resolutionNeeded: true,
      resolutionNotes: null,
    });
  }

  void sources;
  return conflicts;
}

export function assembleVisualThinkingKnowledgePackage(
  knowledgePlan: VisualThinkingKnowledgePlan,
  input: VisualThinkingKnowledgeInput,
): VisualThinkingKnowledgePackage {
  const { request, understanding, experiencePlan: plan } = input;
  const raw = request.rawRequest;
  const suppliedText =
    input.attachedStructuredContent?.trim() ||
    input.userGapAnswers
      ? [
          input.attachedStructuredContent ?? "",
          ...Object.values(input.userGapAnswers ?? {}),
        ]
          .filter(Boolean)
          .join("\n")
      : raw;
  const lines = parseSuppliedLines(
    input.attachedStructuredContent ||
      Object.values(input.userGapAnswers ?? {}).join("\n") ||
      raw,
  );

  const sources: VisualThinkingKnowledgeSourceReference[] = [];
  const requestSrc = makeSource("user_request", "Member request", {
    userProvided: true,
    authority: "user",
    reliability: "high",
    freshness: "current",
    verified: true,
    sourceId: request.id,
  });
  sources.push(requestSrc);

  const understandingSrc = makeSource(
    "understanding_outcome",
    "Understanding outcome",
    {
      authority: "platform",
      reliability: "medium",
      freshness: "unknown",
      verified: false,
      sourceId: understanding.id,
    },
  );
  sources.push(understandingSrc);

  const planSrc = makeSource("experience_plan", "Confirmed experience plan", {
    authority: "platform",
    reliability: "high",
    freshness: "unknown",
    verified: true,
    sourceId: plan.id,
  });
  sources.push(planSrc);

  let items: VisualThinkingKnowledgeItem[] = [];

  // Understanding outcome → purpose / success (not external facts)
  items.push(
    makeItem({
      type: "explanation",
      title: "Intended outcome",
      content: understanding.successDefinition || understanding.intendedOutcome,
      topic: null,
      category: "outcome",
      sourceReferenceIds: [understandingSrc.id],
      confidence: "high",
      freshness: "unknown",
      verificationStatus: "unverified",
      importance: "required",
      sequence: null,
      parentId: null,
      userProvided: false,
      userEdited: false,
      inferred: false,
    }),
  );

  // Assumptions from understanding — never verified facts
  for (const assumption of understanding.assumptions) {
    items.push(
      makeItem({
        type: "assumption",
        title: "Assumption",
        content: assumption,
        topic: null,
        category: "assumption",
        sourceReferenceIds: [understandingSrc.id],
        confidence: "low",
        freshness: "unknown",
        verificationStatus: "assumption",
        importance: "helpful",
        sequence: null,
        parentId: null,
        userProvided: false,
        userEdited: false,
        inferred: true,
      }),
    );
  }

  // User-supplied steps / areas
  const userTextSrc =
    lines.length > 0
      ? makeSource("user_supplied_text", "User-supplied content", {
          userProvided: true,
          authority: "user",
          reliability: "high",
          freshness: "current",
          verified: true,
        })
      : null;
  if (userTextSrc) sources.push(userTextSrc);

  lines.forEach((line, index) => {
    const isRelationshipHint = /\b(connects? to|depends on|leads to|→|->)\b/i.test(
      line,
    );
    items.push(
      makeItem({
        type: isRelationshipHint ? "relationship" : "step",
        title: isRelationshipHint ? `Relationship ${index + 1}` : `Step ${index + 1}`,
        content: line,
        topic: null,
        category: isRelationshipHint ? "relationship" : "procedure",
        sourceReferenceIds: userTextSrc ? [userTextSrc.id] : [requestSrc.id],
        confidence: "high",
        freshness: "current",
        verificationStatus: "verified",
        importance: "required",
        sequence: isRelationshipHint ? null : index + 1,
        parentId: null,
        userProvided: true,
        userEdited: false,
        inferred: false,
      }),
    );
  });

  // Gap answers
  for (const [gapId, answer] of Object.entries(input.userGapAnswers ?? {})) {
    if (!answer.trim()) continue;
    const ansSrc = makeSource("user_supplied_text", "User clarification", {
      userProvided: true,
      authority: "user",
      reliability: "high",
      freshness: "current",
      verified: true,
      metadata: { gapId },
    });
    sources.push(ansSrc);
    items.push(
      makeItem({
        type: "fact",
        title: "Clarification",
        content: answer.trim(),
        topic: null,
        category: "clarification",
        sourceReferenceIds: [ansSrc.id],
        confidence: "high",
        freshness: "current",
        verificationStatus: "verified",
        importance: "required",
        sequence: null,
        parentId: null,
        userProvided: true,
        userEdited: false,
        inferred: false,
        metadata: { resolvesGapId: gapId },
      }),
    );
  }

  // let_me_build: lightweight shell
  if (plan.interactionStyle === "let_me_build") {
    items.push(
      makeItem({
        type: "question",
        title: "Central topic",
        content: "What is the central idea you want to map?",
        topic: null,
        category: "shell",
        sourceReferenceIds: [planSrc.id],
        confidence: "unknown",
        freshness: "unknown",
        verificationStatus: "gap",
        importance: "helpful",
        sequence: null,
        parentId: null,
        userProvided: false,
        userEdited: false,
        inferred: false,
      }),
    );
  }

  const { items: deduped, mergeNotes } = dedupeItems(items);
  items = deduped;

  const conflicts = detectKnowledgeConflicts(items, sources);
  const uncertainties: VisualThinkingKnowledgeUncertainty[] = [];
  for (const item of items) {
    if (item.freshness === "unknown" && item.type !== "assumption") {
      uncertainties.push({
        id: newId("vtku"),
        itemId: item.id,
        description: `Freshness unknown for “${item.title}”.`,
        reason: "source_date_unknown",
        confidence: item.confidence,
        resolutionNeeded: false,
      });
    }
    if (item.inferred) {
      uncertainties.push({
        id: newId("vtku"),
        itemId: item.id,
        description: `Inferred item: ${item.title}`,
        reason: "inferred",
        confidence: "low",
        resolutionNeeded: false,
      });
    }
  }

  // Gaps
  const gaps: VisualThinkingKnowledgeGap[] = [];
  const hasSteps = items.some((i) => i.type === "step" && i.userProvided);
  const needsCurrentExternal =
    knowledgePlan.researchRequired ||
    looksLikeCurrentProductRequest(raw) ||
    looksLikeExternalComparison(raw, plan.primaryDeliverable);

  // Current external facts remain a research gap even when the member
  // supplied an internal outline — product-specific details are still unverified.
  if (needsCurrentExternal) {
    const userOwnsAllFacts =
      hasSteps &&
      looksLikeInternalProcess(raw, lines) &&
      !looksLikeCurrentProductRequest(raw) &&
      !looksLikeExternalComparison(raw, plan.primaryDeliverable);
    if (!userOwnsAllFacts) {
      gaps.push({
        id: newId("vtkg"),
        knowledgePlanId: knowledgePlan.id,
        area: "current_external_facts",
        description:
          "Current product, platform, or market details are required and have not been verified.",
        requiredFor: [plan.primaryDeliverable],
        priority: "required",
        resolutionType: "external_research",
        researchNeeded: true,
        userInputNeeded: false,
        platformSourceNeeded: false,
        status: "open",
        resolvedByItemIds: [],
        focusedQuestion: null,
      });
    }
  }

  if (
    (plan.primaryDeliverable === "sop" ||
      plan.primaryDeliverable === "training_guide") &&
    hasSteps &&
    !items.some((i) => /owner|responsible|approv/i.test(i.content)) &&
    !Object.values(input.userGapAnswers ?? {}).some((a) =>
      /owner|responsible|approv/i.test(a),
    )
  ) {
    // Ownership gap — user input; material for SOP/training but not always blocking essentials
    const priority =
      plan.detailLevel === "essentials" ? "helpful" : "required";
    gaps.push({
      id: newId("vtkg"),
      knowledgePlanId: knowledgePlan.id,
      area: "process_ownership",
      description: "Who owns or approves the final step is not specified.",
      requiredFor: [plan.primaryDeliverable],
      priority,
      resolutionType: "user_input",
      researchNeeded: false,
      userInputNeeded: true,
      platformSourceNeeded: false,
      status: "open",
      resolvedByItemIds: [],
      focusedQuestion:
        "Who is responsible for approving the final step?",
    });
  }

  if (
    plan.primaryDeliverable === "training_guide" &&
    hasSteps &&
    !/\b(beginner|experienced|new hire|audience|staff level)\b/i.test(raw) &&
    !Object.values(input.userGapAnswers ?? {}).some((a) =>
      /beginner|experienced|audience|skill/i.test(a),
    )
  ) {
    gaps.push({
      id: newId("vtkg"),
      knowledgePlanId: knowledgePlan.id,
      area: "audience_skill_level",
      description: "Audience skill level is not specified.",
      requiredFor: ["training_guide"],
      priority: "helpful",
      resolutionType: "clarification",
      researchNeeded: false,
      userInputNeeded: true,
      platformSourceNeeded: false,
      status: "open",
      resolvedByItemIds: [],
      focusedQuestion:
        "Is this training for beginners, or do they already know the basics?",
    });
  }

  if (
    plan.primaryDeliverable === "comparison" &&
    items.filter((i) => i.type === "option").length < 2 &&
    lines.length < 2
  ) {
    gaps.push({
      id: newId("vtkg"),
      knowledgePlanId: knowledgePlan.id,
      area: "comparison_options",
      description: "At least two options with current evidence are needed.",
      requiredFor: ["comparison"],
      priority: "required",
      resolutionType: "external_research",
      researchNeeded: true,
      userInputNeeded: false,
      platformSourceNeeded: false,
      status: "open",
      resolvedByItemIds: [],
      focusedQuestion: null,
    });
  }

  // Optional examples never block essentials
  if (
    plan.detailLevel === "essentials" &&
    knowledgePlan.optionalKnowledgeAreas.some((a) =>
      /example/i.test(a.label),
    )
  ) {
    gaps.push({
      id: newId("vtkg"),
      knowledgePlanId: knowledgePlan.id,
      area: "examples",
      description: "Examples are optional at essentials depth.",
      requiredFor: [plan.primaryDeliverable],
      priority: "optional",
      resolutionType: "optional_omission",
      researchNeeded: false,
      userInputNeeded: false,
      platformSourceNeeded: false,
      status: "deferred",
      resolvedByItemIds: [],
      focusedQuestion: null,
    });
  }

  // Resolve gaps answered
  for (const gap of gaps) {
    const resolvers = items.filter(
      (i) => i.metadata.resolvesGapId === gap.id,
    );
    // Also match by area heuristics from answers
    if (
      gap.area === "process_ownership" &&
      items.some((i) => /owner|responsible|approv/i.test(i.content))
    ) {
      gap.status = "resolved";
      gap.resolvedByItemIds = items
        .filter((i) => /owner|responsible|approv/i.test(i.content))
        .map((i) => i.id);
    }
    if (
      gap.area === "audience_skill_level" &&
      items.some((i) => /beginner|experienced|audience|skill/i.test(i.content))
    ) {
      gap.status = "resolved";
      gap.resolvedByItemIds = items
        .filter((i) => /beginner|experienced|audience|skill/i.test(i.content))
        .map((i) => i.id);
    }
    if (resolvers.length) {
      gap.status = "resolved";
      gap.resolvedByItemIds = resolvers.map((r) => r.id);
    }
  }

  // Relationships for sequenced steps
  const relationships: VisualThinkingKnowledgeRelationship[] = [];
  const orderedSteps = items
    .filter((i) => i.type === "step" && i.sequence != null)
    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
  for (let i = 0; i < orderedSteps.length - 1; i++) {
    relationships.push({
      id: newId("vtkr"),
      fromItemId: orderedSteps[i]!.id,
      toItemId: orderedSteps[i + 1]!.id,
      kind: "follows",
      label: "next",
    });
  }

  // Groups — only when meaningful
  const groups: VisualThinkingKnowledgeGroup[] = [];
  if (orderedSteps.length >= 3) {
    groups.push({
      id: newId("vtkgp"),
      kind: "phase",
      title: "Procedure",
      itemIds: orderedSteps.map((s) => s.id),
    });
  }
  if (
    knowledgePlan.organizationStrategy === "relationships" &&
    items.filter((i) => i.type === "step" || i.type === "relationship").length >=
      2
  ) {
    groups.push({
      id: newId("vtkgp"),
      kind: "topic",
      title: "Business areas",
      itemIds: items
        .filter((i) => i.type === "step" || i.type === "relationship")
        .map((i) => i.id),
    });
  }

  // Coverage
  const requiredAreas = knowledgePlan.requiredKnowledgeAreas;
  let covered = 0;
  for (const area of requiredAreas) {
    const label = normalizeText(area.label);
    if (label.includes("procedure") || label.includes("ordered") || label.includes("checklist") || label.includes("process step") || label.includes("demonstration") || label.includes("next action")) {
      if (hasSteps || plan.interactionStyle === "let_me_build") covered++;
      else if (items.some((i) => i.type === "explanation")) covered += 0;
      continue;
    }
    if (label.includes("purpose") || label.includes("learning objective") || label.includes("outcome") || label.includes("topic explanation") || label.includes("central topic") || label.includes("decision question")) {
      if (understanding.successDefinition || understanding.userFacingGoal) covered++;
      continue;
    }
    if (label.includes("completion")) {
      if (understanding.successDefinition) covered++;
      continue;
    }
    if (label.includes("option")) {
      if (lines.length >= 2) covered++;
      continue;
    }
    if (label.includes("criteria")) {
      // criteria often need research for comparisons
      continue;
    }
  }
  // Recompute more simply
  covered = 0;
  for (const area of requiredAreas) {
    const l = normalizeText(area.label);
    const ok =
      ((l.includes("procedure") ||
        l.includes("ordered") ||
        l.includes("checklist") ||
        l.includes("process") ||
        l.includes("demonstration") ||
        l.includes("next action") ||
        l.includes("step")) &&
        (hasSteps || plan.interactionStyle === "let_me_build")) ||
      ((l.includes("purpose") ||
        l.includes("learning") ||
        l.includes("outcome") ||
        l.includes("explanation") ||
        l.includes("central") ||
        l.includes("decision")) &&
        Boolean(understanding.successDefinition || understanding.userFacingGoal)) ||
      (l.includes("completion") && Boolean(understanding.successDefinition)) ||
      (l.includes("option") && lines.length >= 2);
    if (ok) covered++;
  }

  const openRequiredGaps = gaps.filter(
    (g) => g.status === "open" && g.priority === "required",
  );
  const openResearchGaps = openRequiredGaps.filter((g) => g.researchNeeded);
  const openUserGaps = openRequiredGaps.filter((g) => g.userInputNeeded);

  let readiness: VisualThinkingKnowledgeReadiness = "not_ready";
  const blockedReasons: string[] = [];

  if (plan.interactionStyle === "let_me_build") {
    readiness = "structure_ready";
  } else if (
    hasSteps &&
    openResearchGaps.length === 0 &&
    openUserGaps.length === 0 &&
    knowledgePlan.evidenceRequirement !== "required"
  ) {
    readiness = "full_ready";
  } else if (
    hasSteps &&
    openResearchGaps.length === 0 &&
    openUserGaps.length === 0 &&
    knowledgePlan.evidenceRequirement === "expected"
  ) {
    readiness = "full_ready";
  } else if (hasSteps && openResearchGaps.length === 0 && openUserGaps.length > 0) {
    readiness = "partial_ready";
    blockedReasons.push(
      ...openUserGaps.map((g) => g.description),
    );
  } else if (openResearchGaps.length > 0 || knowledgePlan.researchRequired) {
    readiness =
      understanding.successDefinition || hasSteps
        ? "structure_ready"
        : "not_ready";
    blockedReasons.push(
      ...openResearchGaps.map((g) => g.description),
    );
    if (knowledgePlan.researchRequired && !openResearchGaps.length) {
      blockedReasons.push(
        "Research is required before current facts can be filled in.",
      );
      readiness = "structure_ready";
    }
  } else if (understanding.successDefinition) {
    readiness = "structure_ready";
  }

  // Evidence required + research → never full_ready
  if (
    knowledgePlan.evidenceRequirement === "required" &&
    (knowledgePlan.researchRequired || openResearchGaps.length > 0)
  ) {
    if (readiness === "full_ready") readiness = "structure_ready";
    if (!blockedReasons.length) {
      blockedReasons.push(
        "Required evidence is not yet available from approved sources.",
      );
    }
  }

  // Internal process with steps and expected evidence → full_ready
  if (
    plan.interactionStyle !== "let_me_build" &&
    hasSteps &&
    looksLikeInternalProcess(raw, lines) &&
    !needsCurrentExternal &&
    openResearchGaps.length === 0 &&
    openUserGaps.filter((g) => g.priority === "required").length === 0
  ) {
    readiness = "full_ready";
  }

  if (plan.interactionStyle === "let_me_build") {
    readiness = "structure_ready";
  }

  const readyForGeneration =
    readiness === "full_ready" ||
    readiness === "structure_ready" ||
    readiness === "partial_ready";

  const timestamp = nowIso();
  void mergeNotes;
  void suppliedText;

  return {
    id: newId("vtkpkg"),
    knowledgePlanId: knowledgePlan.id,
    requestId: request.id,
    understandingId: understanding.id,
    experiencePlanId: plan.id,
    generationRunId: input.generationRun?.id ?? null,
    title: understanding.userFacingGoal || "Knowledge package",
    purpose: knowledgePlan.purpose,
    items,
    groups,
    relationships,
    sourceReferences: sources,
    knowledgeGaps: gaps,
    conflicts,
    uncertainties,
    assumptions: [
      ...understanding.assumptions,
      ...items
        .filter((i) => i.type === "assumption")
        .map((i) => i.content),
    ].filter((v, i, a) => a.indexOf(v) === i),
    coverage: {
      requiredAreasCovered: covered,
      requiredAreasTotal: requiredAreas.length,
      optionalAreasCovered: 0,
    },
    freshness: knowledgePlan.freshnessRequirement,
    confidence:
      readiness === "full_ready"
        ? "high"
        : readiness === "structure_ready" || readiness === "partial_ready"
          ? "medium"
          : "low",
    readiness,
    readyForGeneration,
    blockedReasons,
    createdAt: timestamp,
    updatedAt: timestamp,
    assembledBy: "deterministic_v1",
    assemblyVersion: "vts-knowledge-package-1",
  };
}

export function buildGenerationHandoff(
  knowledgePlan: VisualThinkingKnowledgePlan,
  pkg: VisualThinkingKnowledgePackage,
): VisualThinkingGenerationHandoff {
  const unresolvedGaps = pkg.knowledgeGaps.filter((g) => g.status === "open");
  const approvedItems = pkg.items.filter(
    (i) =>
      i.verificationStatus !== "gap" &&
      i.type !== "unresolved_gap" &&
      // assumptions may be passed through but not as approved facts
      true,
  );
  const approvedFactLike = approvedItems.filter(
    (i) => i.verificationStatus !== "assumption" || i.type === "assumption",
  );

  const safeGenerationScope: VisualThinkingGenerationHandoff["safeGenerationScope"] =
    pkg.readiness === "full_ready"
      ? "full"
      : pkg.readiness === "partial_ready"
        ? "partial"
        : pkg.readiness === "structure_ready"
          ? "structure_only"
          : "none";

  const blockedContentAreas = unresolvedGaps
    .filter((g) => g.priority === "required")
    .map((g) => g.area);

  const suppliedSteps = pkg.items
    .filter((i) => i.type === "step" && i.userProvided)
    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
    .map((i) => i.content);

  let userFacingStatus = "Gathering what we already know.";
  if (pkg.readiness === "full_ready") {
    userFacingStatus = "I'm building that for you.";
  } else if (unresolvedGaps.some((g) => g.researchNeeded && g.status === "open")) {
    userFacingStatus =
      "I'm checking current product details so the guide stays accurate — practical steps are ready now.";
  } else if (unresolvedGaps.some((g) => g.userInputNeeded && g.status === "open")) {
    userFacingStatus =
      "I can get started with what you've given me — one detail still needs your words.";
  } else if (pkg.readiness === "structure_ready" || pkg.readiness === "partial_ready") {
    userFacingStatus = "I'm building that for you.";
  }

  void knowledgePlan;
  void approvedFactLike;

  return {
    knowledgePackageId: pkg.id,
    readiness: pkg.readiness,
    approvedItemIds: approvedItems
      .filter((i) => i.type !== "assumption")
      .map((i) => i.id),
    unresolvedGaps,
    sourceReferences: pkg.sourceReferences,
    conflicts: pkg.conflicts,
    uncertainties: pkg.uncertainties,
    assumptions: pkg.assumptions,
    safeGenerationScope,
    blockedContentAreas,
    organizationStrategy: knowledgePlan.organizationStrategy,
    suppliedSteps,
    userFacingStatus,
  };
}

export function prepareVisualThinkingKnowledge(
  input: VisualThinkingKnowledgeInput,
): VisualThinkingKnowledgeBundle {
  let plan = planVisualThinkingKnowledge(input);
  plan = { ...plan, status: "assembling", updatedAt: nowIso() };
  const pkg = assembleVisualThinkingKnowledgePackage(plan, input);
  plan = {
    ...plan,
    availableSourceRefs: pkg.sourceReferences.map((s) => s.id),
    missingKnowledgeGaps: pkg.knowledgeGaps
      .filter((g) => g.status === "open")
      .map((g) => g.id),
    status:
      pkg.readiness === "full_ready"
        ? "package_ready"
        : pkg.knowledgeGaps.some((g) => g.researchNeeded && g.status === "open")
          ? "awaiting_research"
          : pkg.knowledgeGaps.some((g) => g.userInputNeeded && g.status === "open")
            ? "awaiting_sources"
            : pkg.readyForGeneration
              ? "package_ready"
              : "blocked",
    updatedAt: nowIso(),
  };
  const handoff = buildGenerationHandoff(plan, pkg);
  return { plan, package: pkg, handoff };
}

export function applyKnowledgeGapAnswer(
  bundle: VisualThinkingKnowledgeBundle,
  input: VisualThinkingKnowledgeInput,
  gapId: string,
  answer: string,
): VisualThinkingKnowledgeBundle {
  return prepareVisualThinkingKnowledge({
    ...input,
    userGapAnswers: {
      ...(input.userGapAnswers ?? {}),
      [gapId]: answer,
    },
    generationRun: input.generationRun,
  });
}

export function nextFocusedKnowledgeQuestion(
  pkg: VisualThinkingKnowledgePackage,
): VisualThinkingKnowledgeGap | null {
  const open = pkg.knowledgeGaps.filter(
    (g) =>
      g.status === "open" &&
      g.userInputNeeded &&
      g.focusedQuestion &&
      g.priority !== "optional",
  );
  if (!open.length) return null;
  const presentation = resolveAdaptivePresentation();
  const { visible } = limitVisibleChoices(open, presentation);
  return visible[0] ?? open[0] ?? null;
}

export function projectKnowledgePreparationStatus(
  bundle: VisualThinkingKnowledgeBundle,
): {
  headline: string;
  detail: string | null;
  showResearchNeeded: boolean;
  showMissingQuestion: boolean;
  canContinueSafeOutline: boolean;
  canCreateFully: boolean;
  /** Generate-first: structure/partial/full may proceed without a confirm gate. */
  canProceedGenerateFirst: boolean;
  focusedQuestion: string | null;
  focusedGapId: string | null;
} {
  const question = nextFocusedKnowledgeQuestion(bundle.package);
  const researchOpen = bundle.package.knowledgeGaps.some(
    (g) => g.researchNeeded && g.status === "open",
  );
  const userQuestionRequired =
    Boolean(question) &&
    Boolean(
      question &&
        (question.userInputNeeded ||
          question.resolutionType === "clarification" ||
          question.resolutionType === "user_input") &&
        !question.researchNeeded,
    );
  const mayProceed =
    bundle.handoff.safeGenerationScope === "structure_only" ||
    bundle.handoff.safeGenerationScope === "partial" ||
    bundle.handoff.safeGenerationScope === "full";
  return {
    headline: bundle.handoff.userFacingStatus,
    detail: bundle.package.blockedReasons[0] ?? null,
    showResearchNeeded: researchOpen,
    showMissingQuestion: userQuestionRequired,
    canContinueSafeOutline: mayProceed,
    // Generate-first: do not reserve "Create this" for full_ready only.
    canCreateFully: mayProceed && !userQuestionRequired,
    canProceedGenerateFirst: mayProceed && !userQuestionRequired,
    focusedQuestion: userQuestionRequired ? question?.focusedQuestion ?? null : null,
    focusedGapId: userQuestionRequired ? question?.id ?? null : null,
  };
}

/** Map handoff into Generation context suppliedContent — no unsupported claims. */
export function knowledgeHandoffToGenerationContext(
  handoff: VisualThinkingGenerationHandoff,
  base: {
    requestId: string;
    understandingId: string;
    rawRequest: string;
    userFacingGoal?: string | null;
    successDefinition?: string | null;
  },
  pkg?: VisualThinkingKnowledgePackage | null,
): {
  requestId: string;
  understandingId: string;
  rawRequest: string;
  userFacingGoal?: string | null;
  successDefinition?: string | null;
  suppliedContent: string | null;
  knowledgePackageId: string;
  safeGenerationScope: VisualThinkingGenerationHandoff["safeGenerationScope"];
  blockedContentAreas: string[];
  topicHint?: string | null;
  freshnessNotice?: string | null;
} {
  const enriched = enrichHandoffWithInstructionalMaterial(
    handoff,
    base.rawRequest,
    pkg ?? null,
  );
  const lines =
    enriched.instructionalLines.length > 0
      ? enriched.instructionalLines
      : enriched.suppliedSteps;
  return {
    ...base,
    suppliedContent:
      lines.length > 0
        ? lines.map((s, i) => `${i + 1}. ${s}`).join("\n")
        : null,
    knowledgePackageId: handoff.knowledgePackageId,
    safeGenerationScope:
      handoff.safeGenerationScope === "none" ? "structure_only" : handoff.safeGenerationScope,
    blockedContentAreas: handoff.blockedContentAreas,
    topicHint: enriched.instructionalTitle,
    freshnessNotice: enriched.freshnessNotice,
  };
}

export function saveKnowledgeBundle(bundle: VisualThinkingKnowledgeBundle): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KNOWLEDGE_DRAFT_KEY, JSON.stringify(bundle));
  } catch {
    /* ignore */
  }
}

export function loadKnowledgeBundle(): VisualThinkingKnowledgeBundle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KNOWLEDGE_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VisualThinkingKnowledgeBundle;
  } catch {
    return null;
  }
}

export function clearKnowledgeBundle(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KNOWLEDGE_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export type KnowledgeInteractionStyleBehavior = {
  assembleAllAvailable: boolean;
  focusedQuestions: boolean;
  lightweightShell: boolean;
};

export function knowledgeBehaviorForCreationMode(
  style: VisualThinkingInteractionStyle,
): KnowledgeInteractionStyleBehavior {
  switch (style) {
    case "build_for_me":
      return {
        assembleAllAvailable: true,
        focusedQuestions: true,
        lightweightShell: false,
      };
    case "guide_me":
      return {
        assembleAllAvailable: true,
        focusedQuestions: true,
        lightweightShell: false,
      };
    case "collaborate":
      return {
        assembleAllAvailable: true,
        focusedQuestions: true,
        lightweightShell: false,
      };
    case "let_me_build":
      return {
        assembleAllAvailable: false,
        focusedQuestions: false,
        lightweightShell: true,
      };
  }
}
