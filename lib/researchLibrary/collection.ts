import type {
  ResearchCollectionRecord,
  ResearchFindingRecord,
  ResearchSession,
} from "./types";

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createResearchCollection(
  session: ResearchSession,
): ResearchCollectionRecord {
  const now = new Date().toISOString();
  return {
    id: newId("rcol"),
    title: session.title,
    topic: session.primaryTopic,
    purpose: session.purpose,
    intendedOutcome: session.intendedOutcome,
    sourceExperience: session.sourceExperience,
    sourceEntityId: session.sourceEntityId,
    sourceSelectionIds: [...session.sourceSelectionIds],
    researchSessionIds: [session.id],
    summary: "",
    findings: [],
    facts: [],
    themes: [],
    examples: [],
    options: [],
    comparisons: [],
    recommendations: [],
    implications: [],
    risks: [],
    cautions: [],
    questions: [],
    conflicts: [],
    uncertainties: [],
    gaps: [],
    sourceReferences: [],
    sourceTypes: [],
    retrievalDates: [],
    freshness: session.liveResearchAvailable ? "unknown" : "stable",
    confidence: "medium",
    verificationStatus: "unverified",
    userNotes: [],
    userQuestions: [],
    userHighlights: [],
    approvedFindingIds: [],
    excludedFindingIds: [],
    savedFindingIds: [],
    status: "active",
    currentResearchStatus: session.currentResearchStatus,
    failureState: null,
    retryState: null,
    inferredPossibleUses: [],
    selectedUse: null,
    linkedCreationPackageIds: [],
    linkedProjectIds: [],
    linkedVisualWorkspaceIds: [],
    linkedStrategyIds: [],
    linkedEstateRecordIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function addFindingsToCollection(
  collection: ResearchCollectionRecord,
  findings: ResearchFindingRecord[],
): ResearchCollectionRecord {
  const now = new Date().toISOString();
  const merged = [...collection.findings];
  for (const f of findings) {
    if (!merged.some((x) => x.id === f.id)) merged.push(f);
  }
  const visible = merged.filter(
    (f) => !collection.excludedFindingIds.includes(f.id),
  );
  const byKind = (kind: ResearchFindingRecord["kind"]) =>
    visible.filter((f) => f.kind === kind).map((f) => f.content);

  const sourceRefs = Array.from(
    new Set(visible.map((f) => f.sourceTitle).filter(Boolean)),
  );
  const sourceTypes = Array.from(
    new Set(visible.map((f) => f.sourceType)),
  );
  const retrievalDates = Array.from(
    new Set(visible.map((f) => f.retrievalDate)),
  );

  let freshness: ResearchCollectionRecord["freshness"] = "stable";
  if (visible.some((f) => f.freshness === "current")) {
    freshness = visible.every((f) => f.freshness === "current")
      ? "current"
      : "mixed";
  }

  return {
    ...collection,
    findings: merged,
    facts: byKind("fact"),
    themes: byKind("theme"),
    examples: byKind("example"),
    options: byKind("option"),
    recommendations: byKind("recommendation"),
    risks: byKind("risk"),
    cautions: byKind("caution"),
    questions: byKind("question"),
    implications: byKind("implication"),
    summary:
      visible
        .slice(0, 4)
        .map((f) => f.title)
        .join(" · ") || collection.summary,
    sourceReferences: sourceRefs,
    sourceTypes,
    retrievalDates,
    freshness,
    confidence: visible.some((f) => f.confidence === "high")
      ? "high"
      : "medium",
    verificationStatus: visible.every((f) => f.verificationStatus === "verified")
      ? "verified"
      : "partially_verified",
    updatedAt: now,
  };
}

export function makeStableFinding(input: {
  title: string;
  content: string;
  kind?: ResearchFindingRecord["kind"];
}): ResearchFindingRecord {
  const now = new Date().toISOString();
  return {
    id: newId("rf"),
    title: input.title,
    content: input.content,
    kind: input.kind ?? "fact",
    sourceTitle: "Spark Estate stable knowledge",
    sourceType: "stable_knowledge",
    publisher: "Spark Estate",
    retrievalDate: now.slice(0, 10),
    publicationDate: null,
    confidence: "medium",
    freshness: "stable",
    verificationStatus: "partially_verified",
  };
}

export function organizedCollectionView(collection: ResearchCollectionRecord): {
  whatIAsked: string;
  whatWeFound: string;
  importantFindings: ResearchFindingRecord[];
  keyFacts: string[];
  examples: string[];
  optionsOrComparisons: string[];
  risksOrCautions: string[];
  unresolvedQuestions: string[];
  sources: string[];
  myNotes: string[];
  whatICouldDo: string[];
} {
  const important = collection.findings.filter(
    (f) =>
      f.important ||
      collection.savedFindingIds.includes(f.id) ||
      f.kind === "recommendation",
  );
  return {
    whatIAsked: collection.purpose || collection.topic,
    whatWeFound: collection.summary,
    importantFindings: important.length
      ? important
      : collection.findings.slice(0, 5),
    keyFacts: collection.facts,
    examples: collection.examples,
    optionsOrComparisons: [
      ...collection.options,
      ...collection.comparisons,
    ],
    risksOrCautions: [...collection.risks, ...collection.cautions],
    unresolvedQuestions: [
      ...collection.questions,
      ...collection.userQuestions,
      ...collection.gaps,
    ],
    sources: collection.sourceReferences,
    myNotes: collection.userNotes,
    whatICouldDo: collection.inferredPossibleUses,
  };
}
