import {
  buildProjectProposalFromPackage,
  understandUniversalRequest,
  type CreationPackage,
} from "@/lib/universalRequestOutcome";
import { newCreationWorkspaceId, nowIso } from "./ids";
import type {
  CreationWorkspace,
  CreationWorkspaceHandoff,
  CreationWorkspaceHandoffDestination,
  CreationWorkspaceUseOption,
} from "./types";

function draftItems(workspace: CreationWorkspace) {
  return workspace.items
    .filter((i) => i.groupId !== "research" && i.status !== "removed")
    .sort((a, b) => a.order - b.order);
}

function serializeWorkspaceContent(workspace: CreationWorkspace): string {
  return draftItems(workspace)
    .map((i) => `## ${i.title}\n${i.body}`)
    .join("\n\n");
}

export function prepareCreationWorkspaceHandoff(input: {
  workspace: CreationWorkspace;
  option: CreationWorkspaceUseOption;
  creationPackage?: CreationPackage | null;
}): { workspace: CreationWorkspace; handoff: CreationWorkspaceHandoff } {
  const now = nowIso();
  const items = draftItems(input.workspace);
  const protectedContent = items
    .filter((i) => i.protected || i.userEdited)
    .map((i) => i.title);

  let payload = serializeWorkspaceContent(input.workspace);
  let requiresReview = false;
  let unresolvedAreas = input.workspace.missingPieces.slice(0, 8);

  if (input.option.destination === "projects") {
    requiresReview = true;
    const u = understandUniversalRequest(
      `Turn into a project: ${input.workspace.title}`,
    );
    const pkg =
      input.creationPackage ??
      ({
        id: input.workspace.creationPackageId || "pkg_temp",
        title: input.workspace.title,
        purpose: input.workspace.purpose,
        audience: input.workspace.intendedAudience,
        desiredOutcome: input.workspace.primaryOutcome,
        requestUnderstandingId: input.workspace.requestUnderstandingId || "",
        blueprintId: input.workspace.blueprintId || "",
        researchCollectionIds: input.workspace.researchCollectionIds,
        primaryDeliverableId: "primary",
        supportingDeliverableIds: [],
        sections: items.map((i, order) => ({
          id: i.id,
          title: i.title,
          content: i.body,
          order,
          kind: i.type === "timeline_item" ? ("day" as const) : ("section" as const),
        })),
        knowledgeItemIds: [],
        sourceReferences: [],
        status: "substantive" as const,
        completionAssessment: "",
        validationResults: [],
        researchStatus: "stable_knowledge_used" as const,
        sourceExperience: "creation_workspace",
        currentDestination: null,
        availableHandoffs: [],
        linkedProjectId: null,
        linkedVisualWorkspaceId: null,
        linkedStrategyId: null,
        linkedEstateRecords: [],
        createdAt: now,
        updatedAt: now,
      } satisfies CreationPackage);
    const proposal = buildProjectProposalFromPackage(u, pkg);
    payload = [
      "Project Proposal Review — nothing is created until you approve.",
      "",
      proposal.title,
      "",
      ...proposal.phases.map(
        (p, i) =>
          `Phase ${i + 1}: ${p.name}\nMilestones: ${p.milestones.join("; ")}\nTasks: ${p.tasks.join("; ")}`,
      ),
      "",
      proposal.dependencies.length
        ? `Dependencies: ${proposal.dependencies.join("; ")}`
        : null,
      proposal.risks.length ? `Risks: ${proposal.risks.join("; ")}` : null,
      "Approve All · Approve Selected · Edit Before Adding · Keep as Proposal · Cancel",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (input.option.destination === "visual_thinking") {
    payload = JSON.stringify({
      workspaceId: input.workspace.id,
      creationPackageId: input.workspace.creationPackageId,
      title: input.workspace.title,
      purpose: input.workspace.purpose,
      summary: input.workspace.purpose,
      sections: items.map((i) => ({
        id: i.id,
        title: i.title,
        content: i.body,
        type: i.type,
      })),
      relationships: items.map((i) => i.title),
      researchCollectionIds: input.workspace.researchCollectionIds,
    });
  }

  if (input.option.destination === "strategic_planning") {
    requiresReview = true;
    payload = [
      "Strategic proposal — not approved strategy.",
      "",
      `Objective: ${input.workspace.primaryOutcome}`,
      "",
      "Evidence / draft content:",
      serializeWorkspaceContent(input.workspace).slice(0, 4000),
      "",
      "Options, tradeoffs, risks, and initiatives remain candidates until confirmed.",
    ].join("\n");
  }

  if (input.option.destination === "business_estate") {
    requiresReview = true;
    payload = [
      "Business Estate proposal — field-level review required.",
      "",
      "Possible proposals:",
      "- Audience update",
      "- Offer update",
      "- Framework or process draft",
      "- Business research finding",
      "",
      serializeWorkspaceContent(input.workspace).slice(0, 2500),
      "",
      "Nothing authoritative changes without approval.",
    ].join("\n");
  }

  const handoff: CreationWorkspaceHandoff = {
    id: newCreationWorkspaceId("cwh"),
    workspaceId: input.workspace.id,
    creationPackageId: input.workspace.creationPackageId || "",
    destination: input.option.destination,
    requestedOutcome: input.option.label,
    includedSectionIds: items.map((i) => i.id),
    includedItemIds: items.map((i) => i.id),
    includedResearchCollectionIds: [
      ...input.workspace.researchCollectionIds,
    ],
    sourceReferences: items.flatMap((i) => i.sourceReferences).slice(0, 12),
    userNotes: [],
    protectedContent,
    unresolvedAreas,
    proposedChanges: [],
    requiresReview,
    status: requiresReview ? "ready_for_review" : "preparing",
    payload,
    createdAt: now,
    completedAt: null,
  };

  const workspace: CreationWorkspace = {
    ...input.workspace,
    handoffs: [...input.workspace.handoffs, handoff],
    status: "ready_for_destination",
    updatedAt: now,
    lastOpenedAt: now,
  };

  return { workspace, handoff };
}

export function completeHandoff(
  workspace: CreationWorkspace,
  handoffId: string,
  status: CreationWorkspaceHandoff["status"] = "completed",
): CreationWorkspace {
  const now = nowIso();
  return {
    ...workspace,
    handoffs: workspace.handoffs.map((h) =>
      h.id === handoffId
        ? { ...h, status, completedAt: status === "completed" ? now : h.completedAt }
        : h,
    ),
    completedHandoffIds:
      status === "completed"
        ? Array.from(new Set([...workspace.completedHandoffIds, handoffId]))
        : workspace.completedHandoffIds,
    status: status === "completed" ? "handed_off" : workspace.status,
    updatedAt: now,
  };
}

export function detectPostHandoffSyncOffer(
  workspace: CreationWorkspace,
  editedItemId: string,
): string | null {
  const completed = workspace.handoffs.filter((h) => h.status === "completed");
  if (!completed.length) return null;
  const item = workspace.items.find((i) => i.id === editedItemId);
  if (!item) return null;
  const dests = completed.map((h) => h.destination).join(", ");
  return `You updated “${item.title}” after handing work off to ${dests}. Review an update preview before replacing destination-owned content.`;
}

export function handoffDestinationLabel(
  destination: CreationWorkspaceHandoffDestination,
): string {
  switch (destination) {
    case "create":
      return "Create";
    case "projects":
      return "Projects";
    case "visual_thinking":
      return "Visual Thinking Studio";
    case "strategic_planning":
      return "Strategic Planning";
    case "business_estate":
      return "My Business Estate";
    case "research_library":
      return "Research Library";
    case "learning":
      return "Learning";
    case "save":
      return "Saved Working Material";
  }
}
