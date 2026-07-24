import type {
  CreationPackage,
  DynamicCreationBlueprint,
  ResearchCollection,
  UniversalRequestUnderstanding,
} from "@/lib/universalRequestOutcome";
import { newCreationWorkspaceId, nowIso } from "./ids";
import type {
  CreationWorkspace,
  CreationWorkspaceItem,
  CreationWorkspaceItemType,
} from "./types";

function sectionKindToItemType(
  kind: CreationPackage["sections"][number]["kind"],
): CreationWorkspaceItemType {
  switch (kind) {
    case "day":
      return "timeline_item";
    case "step":
      return "process_step";
    case "checklist":
      return "checklist_item";
    case "cta":
      return "recommendation";
    case "note":
      return "note";
    default:
      return "section";
  }
}

function extractPlaceholders(body: string): string[] {
  const matches = body.match(/\[[^\]]{3,80}\]/g) ?? [];
  return matches.map((m) => m.slice(1, -1));
}

/**
 * Pure adapter: CreationPackage (+ blueprint/research) → populated Creation Workspace.
 * Does not project pipeline status or research warnings as primary sections.
 */
export function projectCreationPackageToWorkspace(input: {
  creationPackage: CreationPackage;
  blueprint?: DynamicCreationBlueprint | null;
  understanding?: UniversalRequestUnderstanding | null;
  researchCollections?: ResearchCollection[] | null;
  sourceExperience?: string | null;
  sourceConversationId?: string | null;
  sourceSessionId?: string | null;
  returnContext?: string | null;
}): CreationWorkspace {
  const now = nowIso();
  const workspaceId = newCreationWorkspaceId("cw");
  const pkg = input.creationPackage;
  const researchIds = [
    ...new Set([
      ...pkg.researchCollectionIds,
      ...(input.researchCollections?.map((r) => r.id) ?? []),
    ]),
  ];

  const items: CreationWorkspaceItem[] = pkg.sections
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((section, index) => {
      const placeholders = extractPlaceholders(section.content);
      const needsInput = placeholders.length > 0;
      return {
        id: section.id || newCreationWorkspaceId("cwi"),
        workspaceId,
        parentId: null,
        type: sectionKindToItemType(section.kind),
        title: section.title,
        summary: section.content.slice(0, 140),
        body: section.content,
        order: section.order ?? index,
        depth: 0,
        groupId: section.kind,
        origin: "generated" as const,
        status: needsInput ? ("needs_input" as const) : ("ready" as const),
        confidence: "medium" as const,
        verificationStatus: "partially_verified" as const,
        sourceKnowledgeItemIds: [],
        sourceResearchFindingIds: [],
        sourceReferences: pkg.sourceReferences.slice(0, 6),
        userCreated: false,
        userEdited: false,
        protected: false,
        locked: false,
        destinationEligibility: ["create", "projects", "visual_thinking"],
        presentationHints: placeholders.map((p) => `placeholder:${p}`),
        createdAt: now,
        updatedAt: now,
      };
    });

  // Surface research findings as supporting notes — not primary draft sections
  for (const collection of input.researchCollections ?? []) {
    for (const finding of collection.findings.slice(0, 5)) {
      items.push({
        id: newCreationWorkspaceId("cwi"),
        workspaceId,
        parentId: null,
        type: "finding",
        title: finding.title,
        summary: finding.content.slice(0, 120),
        body: finding.content,
        order: 900 + items.length,
        depth: 0,
        groupId: "research",
        origin: "research",
        status: "ready",
        confidence: finding.confidence,
        verificationStatus: finding.verificationStatus,
        sourceKnowledgeItemIds: [],
        sourceResearchFindingIds: [finding.id],
        sourceReferences: [finding.source],
        userCreated: false,
        userEdited: false,
        protected: false,
        locked: false,
        destinationEligibility: ["research_library"],
        presentationHints: ["research_panel"],
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  const draftItems = items.filter((i) => i.groupId !== "research");
  const questionItems = items.filter((i) => i.type === "question");
  const noteItems = items.filter((i) => i.type === "note");
  const versionId = newCreationWorkspaceId("cwv");

  const needsInput = draftItems.some((i) => i.status === "needs_input");
  const status = needsInput ? "needs_user_input" : "first_draft";

  return {
    id: workspaceId,
    title: pkg.title,
    purpose: pkg.purpose || input.blueprint?.purpose || pkg.desiredOutcome,
    status,
    requestUnderstandingId: pkg.requestUnderstandingId,
    blueprintId: pkg.blueprintId || input.blueprint?.id || null,
    creationPackageId: pkg.id,
    researchCollectionIds: researchIds,
    sourceExperience: input.sourceExperience ?? pkg.sourceExperience,
    sourceConversationId: input.sourceConversationId ?? null,
    sourceSessionId: input.sourceSessionId ?? null,
    sourceEntityIds: [],
    primaryOutcome:
      input.blueprint?.primaryDeliverable ||
      pkg.desiredOutcome ||
      pkg.title,
    intendedAudience: pkg.audience ?? input.blueprint?.intendedAudience ?? null,
    intendedUse: pkg.desiredOutcome,
    sectionIds: draftItems.map((i) => i.id),
    itemIds: items.map((i) => i.id),
    noteIds: noteItems.map((i) => i.id),
    questionIds: questionItems.map((i) => i.id),
    alternativeIds: [],
    suggestionIds: [],
    selectedSectionIds: [],
    activeSectionId: draftItems[0]?.id ?? null,
    activeView: "draft",
    currentVersionId: versionId,
    versionHistoryIds: [versionId],
    protectedContentIds: [],
    lockedContentIds: [],
    availableHandoffs: pkg.availableHandoffs.length
      ? pkg.availableHandoffs
      : input.blueprint?.destinationOptions ?? [],
    completedHandoffIds: [],
    returnContext: input.returnContext ?? null,
    researchStatus: pkg.researchStatus,
    missingPieces: [],
    items,
    versions: [
      {
        id: versionId,
        workspaceId,
        label: "Original Generated Draft",
        snapshotItemIds: items.map((i) => i.id),
        items: structuredClone(items),
        origin: "generated",
        createdAt: now,
      },
    ],
    alternatives: [],
    handoffs: [],
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    workspaceVersion: 1,
  };
}
