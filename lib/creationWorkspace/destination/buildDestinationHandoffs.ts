/**
 * Build versioned destination handoff payloads from a Creation Workspace.
 */

import {
  buildProjectProposalFromPackage,
  understandUniversalRequest,
  type CreationPackage,
} from "@/lib/universalRequestOutcome";
import { newCreationWorkspaceId, nowIso } from "../ids";
import type { CreationWorkspace, CreationWorkspaceItem } from "../types";
import {
  CREATION_WORKSPACE_CREATE_HANDOFF_VERSION,
  CREATION_WORKSPACE_ESTATE_HANDOFF_VERSION,
  CREATION_WORKSPACE_PROJECT_HANDOFF_VERSION,
  CREATION_WORKSPACE_STRATEGY_HANDOFF_VERSION,
  CREATION_WORKSPACE_VISUAL_HANDOFF_VERSION,
  type CreationWorkspaceCreateHandoff,
  type CreationWorkspaceEstateHandoff,
  type CreationWorkspaceHandoffSection,
  type CreationWorkspaceProjectHandoff,
  type CreationWorkspaceReturnContext,
  type CreationWorkspaceStrategyCandidate,
  type CreationWorkspaceStrategyHandoff,
  type CreationWorkspaceVisualHandoff,
} from "./contracts";
import { registerPreparedHandoff } from "./registry";

function draftItems(workspace: CreationWorkspace): CreationWorkspaceItem[] {
  return workspace.items
    .filter((i) => i.groupId !== "research" && i.status !== "removed")
    .sort((a, b) => a.order - b.order);
}

function toSection(item: CreationWorkspaceItem): CreationWorkspaceHandoffSection {
  const placeholder =
    item.type === "placeholder_for_user_input" ||
    item.status === "needs_input" ||
    /\[[^\]]{3,80}\]/.test(item.body);
  return {
    id: item.id,
    title: item.title,
    body: item.body,
    order: item.order,
    hierarchy: item.depth,
    itemType: item.type,
    userEdited: item.userEdited,
    protected: item.protected,
    sources: item.sourceReferences.slice(0, 8),
    notes: item.presentationHints.slice(0, 6),
    placeholder,
    parentId: item.parentId,
    groupId: item.groupId,
  };
}

function returnContext(workspace: CreationWorkspace): CreationWorkspaceReturnContext {
  return {
    workspaceId: workspace.id,
    activeSectionId: workspace.activeSectionId,
    selectedSectionIds: [...workspace.selectedSectionIds],
    view: workspace.activeView,
    label: "Return to Creation Workspace",
  };
}

function resolveArtifactType(workspace: CreationWorkspace): string {
  const title = `${workspace.title} ${workspace.purpose}`.toLowerCase();
  if (/email|thank.?you/.test(title)) return "Email";
  if (/social|content plan|campaign|caption/.test(title)) return "Social Post";
  if (/newsletter/.test(title)) return "Newsletter";
  if (/workshop/.test(title)) return "Workshop";
  if (/event/.test(title)) return "Event Plan";
  if (/course|program|curriculum/.test(title)) return "Course Outline";
  if (/sop|handbook|guide|step.?by.?step|process/.test(title)) return "SOP";
  if (/landing/.test(title)) return "Landing Page";
  if (/offer/.test(title)) return "Offer";
  if (/lead magnet/.test(title)) return "Lead Magnet";
  return "Social Post";
}

function inferCreationFamily(workspace: CreationWorkspace): string | null {
  const days = draftItems(workspace).filter((i) => i.type === "timeline_item");
  if (days.length >= 3) return "content_plan";
  const steps = draftItems(workspace).filter((i) => i.type === "process_step");
  if (steps.length >= 3) return "step_by_step_instructions";
  if (/program|mentoring|curriculum/i.test(workspace.title)) return "program";
  if (/handbook|guide/i.test(workspace.title)) return "handbook";
  return null;
}

export function buildCreateHandoff(
  workspace: CreationWorkspace,
): CreationWorkspaceCreateHandoff {
  const items = draftItems(workspace);
  const sections = items.map(toSection);
  const supporting = workspace.items
    .filter((i) => i.groupId === "research" && i.status !== "removed")
    .map(toSection);
  const handoff: CreationWorkspaceCreateHandoff = {
    version: CREATION_WORKSPACE_CREATE_HANDOFF_VERSION,
    id: newCreationWorkspaceId("cwh_create"),
    workspaceId: workspace.id,
    creationPackageId: workspace.creationPackageId || "",
    requestUnderstandingId: workspace.requestUnderstandingId,
    blueprintId: workspace.blueprintId,
    title: workspace.title,
    purpose: workspace.purpose,
    intendedAudience: workspace.intendedAudience,
    intendedUse: workspace.intendedUse,
    tone: null,
    creationFamily: inferCreationFamily(workspace),
    creationSubtype: null,
    recommendedArtifactType: resolveArtifactType(workspace),
    sections,
    supportingItems: supporting,
    researchCollectionIds: [...workspace.researchCollectionIds],
    sourceReferences: items.flatMap((i) => i.sourceReferences).slice(0, 16),
    assumptions: workspace.missingPieces.filter((m) =>
      /assum/i.test(m),
    ),
    unresolvedAreas: workspace.missingPieces.slice(0, 10),
    userInputPlaceholders: sections
      .filter((s) => s.placeholder)
      .map((s) => s.title),
    userEditedItemIds: items.filter((i) => i.userEdited).map((i) => i.id),
    protectedItemIds: items.filter((i) => i.protected).map((i) => i.id),
    sourceExperience: "creation_workspace",
    returnContext: returnContext(workspace),
    createdAt: nowIso(),
    originalRequestEcho: null,
  };
  registerPreparedHandoff({
    handoffId: handoff.id,
    workspaceId: workspace.id,
    packageId: workspace.creationPackageId || "",
    destination: "create",
    payloadVersion: handoff.version,
  });
  return handoff;
}

export function buildVisualHandoff(
  workspace: CreationWorkspace,
): CreationWorkspaceVisualHandoff {
  const items = draftItems(workspace);
  const sections = items.map(toSection);
  const days = sections.filter(
    (s) => s.itemType === "timeline_item" || /day\s*\d+/i.test(s.title),
  );
  const steps = sections.filter(
    (s) =>
      s.itemType === "process_step" ||
      s.itemType === "checklist_item" ||
      /^step\s*\d+/i.test(s.title),
  );
  const decisionCandidates = sections.filter(
    (s) =>
      s.itemType === "decision_candidate" || s.itemType === "option",
  );
  const timelines =
    days.length >= 2
      ? [
          {
            id: newCreationWorkspaceId("tl"),
            label: "Campaign sequence",
            itemIds: days.map((d) => d.id),
          },
        ]
      : [];
  const sequences =
    steps.length >= 2
      ? [
          {
            id: newCreationWorkspaceId("seq"),
            label: "Process sequence",
            itemIds: steps.map((s) => s.id),
          },
        ]
      : timelines.length
        ? timelines.map((t) => ({
            id: t.id,
            label: t.label,
            itemIds: t.itemIds,
          }))
        : [
            {
              id: newCreationWorkspaceId("seq"),
              label: "Section order",
              itemIds: sections.map((s) => s.id),
            },
          ];
  const groups =
    days.length >= 2
      ? days.map((d) => ({
          id: `group_${d.id}`,
          label: d.title,
          itemIds: [d.id],
        }))
      : [];

  const handoff: CreationWorkspaceVisualHandoff = {
    version: CREATION_WORKSPACE_VISUAL_HANDOFF_VERSION,
    id: newCreationWorkspaceId("cwh_visual"),
    workspaceId: workspace.id,
    creationPackageId: workspace.creationPackageId || "",
    requestUnderstandingId: workspace.requestUnderstandingId,
    title: workspace.title,
    purpose: workspace.purpose,
    intendedAudience: workspace.intendedAudience,
    intendedCognitivePurpose:
      days.length >= 3
        ? "See the campaign sequence at a glance"
        : steps.length >= 3
          ? "See the process flow"
          : "See structure and relationships",
    selectedSectionIds: workspace.selectedSectionIds.length
      ? [...workspace.selectedSectionIds]
      : sections.map((s) => s.id),
    sections,
    items: sections,
    sequences,
    relationships: sections.slice(0, -1).map((s, i) => ({
      fromId: s.id,
      toId: sections[i + 1]!.id,
      label: "then",
    })),
    groups,
    comparisons: [],
    timelines,
    decisionCandidates,
    processSteps: steps,
    researchCollectionIds: [...workspace.researchCollectionIds],
    sourceReferences: items.flatMap((i) => i.sourceReferences).slice(0, 16),
    assumptions: workspace.missingPieces.slice(0, 6),
    unresolvedQuestions: workspace.missingPieces.slice(0, 6),
    userNotes: [],
    protectedItemIds: items.filter((i) => i.protected).map((i) => i.id),
    sourceExperience: "creation_workspace",
    returnContext: returnContext(workspace),
    createdAt: nowIso(),
  };
  registerPreparedHandoff({
    handoffId: handoff.id,
    workspaceId: workspace.id,
    packageId: workspace.creationPackageId || "",
    destination: "visual_thinking",
    payloadVersion: handoff.version,
  });
  return handoff;
}

function packageFromWorkspace(workspace: CreationWorkspace): CreationPackage {
  const items = draftItems(workspace);
  const now = nowIso();
  return {
    id: workspace.creationPackageId || "pkg_temp",
    title: workspace.title,
    purpose: workspace.purpose,
    audience: workspace.intendedAudience,
    desiredOutcome: workspace.primaryOutcome,
    requestUnderstandingId: workspace.requestUnderstandingId || "",
    blueprintId: workspace.blueprintId || "",
    researchCollectionIds: workspace.researchCollectionIds,
    primaryDeliverableId: "primary",
    supportingDeliverableIds: [],
    sections: items.map((i, order) => ({
      id: i.id,
      title: i.title,
      content: i.body,
      order,
      kind:
        i.type === "timeline_item"
          ? ("day" as const)
          : i.type === "process_step"
            ? ("step" as const)
            : ("section" as const),
    })),
    knowledgeItemIds: [],
    sourceReferences: [],
    status: "substantive",
    completionAssessment: "",
    validationResults: [],
    researchStatus: "stable_knowledge_used",
    sourceExperience: "creation_workspace",
    currentDestination: null,
    availableHandoffs: [],
    linkedProjectId: null,
    linkedVisualWorkspaceId: null,
    linkedStrategyId: null,
    linkedEstateRecords: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function buildProjectHandoff(
  workspace: CreationWorkspace,
  creationPackage?: CreationPackage | null,
): CreationWorkspaceProjectHandoff {
  const items = draftItems(workspace);
  const u = understandUniversalRequest(
    `Turn into a project: ${workspace.title}`,
  );
  const pkg = creationPackage ?? packageFromWorkspace(workspace);
  const proposal = buildProjectProposalFromPackage(u, pkg);
  const phases = proposal.phases.map((phase, pi) => ({
    id: newCreationWorkspaceId(`phase_${pi}`),
    name: phase.name,
    description: "",
    selected: true,
    milestones: phase.milestones.map((m, mi) => ({
      id: newCreationWorkspaceId(`ms_${pi}_${mi}`),
      title: m,
      selected: true,
      sourceSectionIds: [] as string[],
    })),
    tasks: phase.tasks.map((t, ti) => ({
      id: newCreationWorkspaceId(`task_${pi}_${ti}`),
      title: t,
      description: "",
      selected: true,
      sourceSectionIds: items
        .filter((i) => t.toLowerCase().includes(i.title.toLowerCase().slice(0, 12)))
        .map((i) => i.id)
        .slice(0, 3),
    })),
  }));

  const handoff: CreationWorkspaceProjectHandoff = {
    version: CREATION_WORKSPACE_PROJECT_HANDOFF_VERSION,
    id: newCreationWorkspaceId("cwh_project"),
    workspaceId: workspace.id,
    creationPackageId: workspace.creationPackageId || "",
    requestUnderstandingId: workspace.requestUnderstandingId,
    proposedTitle: proposal.title,
    purpose: workspace.purpose,
    phases,
    dependencies: [...proposal.dependencies],
    risks: [...proposal.risks],
    decisions: [...proposal.decisions],
    resources: items
      .filter((i) => i.type === "resource")
      .map((i) => i.title)
      .slice(0, 8),
    completionCriteria: [
      "Approved phases and tasks created",
      "Source Creation Workspace linked",
    ],
    sourceSections: items.map(toSection),
    researchCollectionIds: [...workspace.researchCollectionIds],
    sourceReferences: items.flatMap((i) => i.sourceReferences).slice(0, 12),
    requiresReview: true,
    sourceExperience: "creation_workspace",
    returnContext: returnContext(workspace),
    createdAt: nowIso(),
  };
  registerPreparedHandoff({
    handoffId: handoff.id,
    workspaceId: workspace.id,
    packageId: workspace.creationPackageId || "",
    destination: "projects",
    payloadVersion: handoff.version,
    status: "ready_for_review",
  });
  return handoff;
}

function candidate(
  kind: CreationWorkspaceStrategyCandidate["kind"],
  title: string,
  body: string,
  sourceSectionIds: string[] = [],
): CreationWorkspaceStrategyCandidate {
  return {
    id: newCreationWorkspaceId("sc"),
    kind,
    title,
    body,
    selected: true,
    approved: false,
    sourceSectionIds,
  };
}

export function buildStrategyHandoff(
  workspace: CreationWorkspace,
): CreationWorkspaceStrategyHandoff {
  const items = draftItems(workspace);
  const options = items
    .filter((i) => i.type === "option" || i.type === "recommendation")
    .slice(0, 5);
  const risks = items.filter((i) => i.type === "risk").slice(0, 5);
  const handoff: CreationWorkspaceStrategyHandoff = {
    version: CREATION_WORKSPACE_STRATEGY_HANDOFF_VERSION,
    id: newCreationWorkspaceId("cwh_strategy"),
    workspaceId: workspace.id,
    creationPackageId: workspace.creationPackageId || "",
    requestUnderstandingId: workspace.requestUnderstandingId,
    strategicQuestion: `How should we advance “${workspace.title}”?`,
    objective: workspace.primaryOutcome || workspace.purpose,
    evidence: items.slice(0, 6).map((i) =>
      candidate("evidence", i.title, i.body, [i.id]),
    ),
    assumptions: workspace.missingPieces.slice(0, 4).map((m) =>
      candidate("assumption", m, m),
    ),
    options: (options.length
      ? options
      : items.slice(0, 3)
    ).map((i) => candidate("option", i.title, i.body, [i.id])),
    tradeoffs: [
      candidate(
        "tradeoff",
        "Breadth vs focus",
        "Covering more ground may dilute quality; focusing may miss channels.",
      ),
    ],
    risks: (risks.length
      ? risks
      : [{ id: "r1", title: "Inconsistent execution", body: "Plan stalls without owners." }]
    ).map((i) =>
      candidate("risk", i.title, "body" in i ? String(i.body) : "", [
        "id" in i && typeof i.id === "string" ? i.id : "",
      ].filter(Boolean)),
    ),
    decisionCriteria: [
      candidate("criterion", "Clarity", "Member can act without re-asking."),
      candidate("criterion", "Feasibility", "Fits current capacity."),
    ],
    proposedPriorities: items.slice(0, 3).map((i, idx) =>
      candidate("priority", `Priority ${idx + 1}: ${i.title}`, i.summary || i.body, [
        i.id,
      ]),
    ),
    possibleInitiatives: items
      .filter(
        (i) =>
          i.type === "task_candidate" ||
          i.type === "process_step" ||
          i.type === "timeline_item",
      )
      .slice(0, 6)
      .map((i) => candidate("initiative", i.title, i.body, [i.id])),
    possibleMeasures: [
      candidate("measure", "Completion of approved initiatives", ""),
      candidate("measure", "Clarity of next decision", ""),
    ],
    unresolvedQuestions: workspace.missingPieces.slice(0, 5).map((m) =>
      candidate("unresolved", m, m),
    ),
    researchCollectionIds: [...workspace.researchCollectionIds],
    sourceReferences: items.flatMap((i) => i.sourceReferences).slice(0, 12),
    requiresReview: true,
    autoApproved: false,
    sourceExperience: "creation_workspace",
    returnContext: returnContext(workspace),
    createdAt: nowIso(),
  };
  registerPreparedHandoff({
    handoffId: handoff.id,
    workspaceId: workspace.id,
    packageId: workspace.creationPackageId || "",
    destination: "strategic_planning",
    payloadVersion: handoff.version,
    status: "ready_for_review",
  });
  return handoff;
}

export function buildEstateHandoff(
  workspace: CreationWorkspace,
): CreationWorkspaceEstateHandoff {
  const items = draftItems(workspace);
  const proposals = [
    {
      id: newCreationWorkspaceId("est"),
      destinationField: "audience_notes",
      currentValue: null as string | null,
      proposedValue:
        workspace.intendedAudience ||
        items.find((i) => /audience|who/i.test(i.title))?.body ||
        workspace.purpose,
      sourceEvidence: items.slice(0, 2).map((i) => i.title),
      approved: false,
      proposalType: "audience_update" as const,
    },
    {
      id: newCreationWorkspaceId("est"),
      destinationField: "framework_draft",
      currentValue: null,
      proposedValue: items
        .slice(0, 4)
        .map((i) => `${i.title}: ${i.body.slice(0, 200)}`)
        .join("\n\n"),
      sourceEvidence: items.slice(0, 4).map((i) => i.id),
      approved: false,
      proposalType: "framework_draft" as const,
    },
    {
      id: newCreationWorkspaceId("est"),
      destinationField: "business_note",
      currentValue: null,
      proposedValue: workspace.purpose,
      sourceEvidence: [workspace.id],
      approved: false,
      proposalType: "business_note" as const,
    },
  ];

  const handoff: CreationWorkspaceEstateHandoff = {
    version: CREATION_WORKSPACE_ESTATE_HANDOFF_VERSION,
    id: newCreationWorkspaceId("cwh_estate"),
    workspaceId: workspace.id,
    creationPackageId: workspace.creationPackageId || "",
    proposals,
    researchCollectionIds: [...workspace.researchCollectionIds],
    sourceReferences: items.flatMap((i) => i.sourceReferences).slice(0, 12),
    requiresFieldApproval: true,
    silentWritebackAllowed: false,
    sourceExperience: "creation_workspace",
    returnContext: returnContext(workspace),
    createdAt: nowIso(),
  };
  registerPreparedHandoff({
    handoffId: handoff.id,
    workspaceId: workspace.id,
    packageId: workspace.creationPackageId || "",
    destination: "business_estate",
    payloadVersion: handoff.version,
    status: "ready_for_review",
  });
  return handoff;
}
