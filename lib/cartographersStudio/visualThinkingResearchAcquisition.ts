/**
 * Visual Thinking Studio — Research Acquisition Intelligence (Build 9).
 * Fills verified knowledge gaps identified by the Knowledge Package.
 * Does not reinterpret requests, change goals/plans/deliverables, rewrite
 * approved knowledge, alter Presentation Plans, or modify workspace organization.
 * Research is not the product — understanding is.
 */

import {
  limitVisibleChoices,
  resolveAdaptivePresentation,
} from "@/lib/adaptiveCompanionIntelligence";
import type {
  VisualThinkingKnowledgeBundle,
  VisualThinkingKnowledgeConflict,
  VisualThinkingKnowledgeFreshness,
  VisualThinkingKnowledgeGap,
  VisualThinkingKnowledgeItem,
  VisualThinkingKnowledgePackage,
  VisualThinkingKnowledgePlan,
  VisualThinkingKnowledgeSourceReference,
  VisualThinkingGenerationHandoff,
} from "@/lib/cartographersStudio/visualThinkingKnowledgeIntelligence";
import { buildGenerationHandoff } from "@/lib/cartographersStudio/visualThinkingKnowledgeIntelligence";

// ─── Research domain types ──────────────────────────────────────────────────

export type VisualThinkingResearchType =
  | "current_product"
  | "current_regulations"
  | "current_pricing"
  | "current_technology"
  | "current_competitors"
  | "definitions"
  | "historical_facts"
  | "best_practices"
  | "scientific_evidence"
  | "market_information"
  | "public_documentation"
  | "reference_material";

export type VisualThinkingResearchSourceCategory =
  | "official_documentation"
  | "government"
  | "academic"
  | "industry_publication"
  | "verified_company_information"
  | "trusted_reference"
  | "existing_estate_knowledge"
  | "previously_verified_user_information"
  | "internal_user_documents"
  | "community_discussion";

export type VisualThinkingSourceConfidence =
  | "verified"
  | "high"
  | "medium"
  | "low"
  | "unknown";

export type VisualThinkingResearchFreshness =
  | "real_time"
  | "recent"
  | "current"
  | "stable"
  | "historical"
  | "timeless"
  | "unknown";

export type VisualThinkingResearchVerification =
  | "verified"
  | "partially_verified"
  | "unverified"
  | "conflicting"
  | "obsolete"
  | "unknown";

export type VisualThinkingResearchStrategy =
  | "single_source"
  | "multi_source_confirmation"
  | "official_first"
  | "freshness_first"
  | "evidence_first"
  | "user_authority"
  | "internal_only";

export type VisualThinkingResearchItemStatus =
  | "planned"
  | "in_progress"
  | "resolved"
  | "partially_resolved"
  | "still_unresolved"
  | "contradictory"
  | "obsolete"
  | "blocked"
  | "failed";

export type VisualThinkingResearchPlanStatus =
  | "draft"
  | "ready"
  | "acquiring"
  | "partial"
  | "complete"
  | "failed"
  | "blocked";

export type VisualThinkingResearchPriority = "required" | "optional" | "blocked";

export type VisualThinkingResearchItem = {
  id: string;
  researchPlanId: string;
  knowledgeGapId: string | null;
  question: string;
  reason: string;
  researchType: VisualThinkingResearchType;
  priority: VisualThinkingResearchPriority;
  status: VisualThinkingResearchItemStatus;
  sourceRequirements: VisualThinkingResearchSourceCategory[];
  freshness: VisualThinkingResearchFreshness;
  confidence: VisualThinkingSourceConfidence;
  verification: VisualThinkingResearchVerification;
  notes: string | null;
  findingContent: string | null;
  citationIds: string[];
  knowledgeItemIds: string[];
  userAuthority: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VisualThinkingCitation = {
  id: string;
  source: string;
  title: string;
  publisher: string | null;
  date: string | null;
  retrieved: string;
  confidence: VisualThinkingSourceConfidence;
  freshness: VisualThinkingResearchFreshness;
  verification: VisualThinkingResearchVerification;
  sourceCategory: VisualThinkingResearchSourceCategory;
  supportsItems: string[];
  metadata: Record<string, unknown>;
};

export type VisualThinkingResearchConflict = {
  id: string;
  researchPlanId: string;
  researchItemId: string | null;
  sourceA: string;
  sourceB: string;
  difference: string;
  confidence: VisualThinkingSourceConfidence;
  recommendedAction:
    | "acknowledge_uncertainty"
    | "prefer_official"
    | "ask_user"
    | "keep_both";
  knowledgeConflictId: string | null;
  createdAt: string;
};

export type VisualThinkingResearchPlan = {
  id: string;
  knowledgePackageId: string;
  knowledgePlanId: string;
  requestedResearch: string[];
  researchPriority: "none" | "optional" | "required";
  requiredResearch: string[];
  optionalResearch: string[];
  blockedResearch: string[];
  researchQuestions: string[];
  acceptedSources: VisualThinkingResearchSourceCategory[];
  excludedSources: VisualThinkingResearchSourceCategory[];
  freshnessRequirement: VisualThinkingResearchFreshness;
  evidenceRequirement: "none" | "helpful" | "expected" | "required";
  strategy: VisualThinkingResearchStrategy;
  status: VisualThinkingResearchPlanStatus;
  createdAt: string;
  updatedAt: string;
  plannedBy: "deterministic_v1";
  planningVersion: "vts-research-plan-1";
};

/** Provider-agnostic finding — no hardcoded providers. */
export type VisualThinkingResearchFindingInput = {
  researchItemId?: string;
  knowledgeGapId?: string | null;
  question?: string;
  content: string;
  researchType?: VisualThinkingResearchType;
  source: string;
  title: string;
  publisher?: string | null;
  date?: string | null;
  sourceCategory: VisualThinkingResearchSourceCategory;
  confidence?: VisualThinkingSourceConfidence;
  freshness?: VisualThinkingResearchFreshness;
  verification?: VisualThinkingResearchVerification;
  userAuthority?: boolean;
  obsolete?: boolean;
  /** Second source claiming a conflicting fact (creates ResearchConflict). */
  conflictingSource?: {
    source: string;
    title: string;
    content: string;
    sourceCategory: VisualThinkingResearchSourceCategory;
    confidence?: VisualThinkingSourceConfidence;
  } | null;
};

export type VisualThinkingResearchBundle = {
  plan: VisualThinkingResearchPlan;
  items: VisualThinkingResearchItem[];
  citations: VisualThinkingCitation[];
  conflicts: VisualThinkingResearchConflict[];
  /** Extended knowledge package after research (never replaces approved items). */
  updatedKnowledgePackage: VisualThinkingKnowledgePackage;
  updatedHandoff: VisualThinkingGenerationHandoff;
  workspaceNotification: VisualThinkingWorkspaceResearchNotification | null;
  acquiredAt: string | null;
};

export type VisualThinkingWorkspaceResearchNotification = {
  id: string;
  message: string;
  /** Never auto-applies — workspace must offer, member decides. */
  autoApply: false;
  researchPlanId: string;
  newItemCount: number;
  conflictCount: number;
  remainingGapCount: number;
  createdAt: string;
  dismissed: boolean;
};

export type VisualThinkingResearchInput = {
  knowledgeBundle: VisualThinkingKnowledgeBundle;
  /** Optional override for strategy / sources. */
  strategyOverride?: VisualThinkingResearchStrategy | null;
  acceptedSourcesOverride?: VisualThinkingResearchSourceCategory[] | null;
  /** When true, workspace already open — notification is prepared. */
  workspaceActive?: boolean;
};

const RESEARCH_SESSION_KEY = "companion-visual-thinking-research-v1";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function mapKnowledgeFreshnessToResearch(
  freshness: VisualThinkingKnowledgeFreshness,
): VisualThinkingResearchFreshness {
  switch (freshness) {
    case "timeless":
      return "timeless";
    case "stable":
      return "stable";
    case "recent":
      return "recent";
    case "current":
      return "current";
    default:
      return "unknown";
  }
}

export function mapResearchFreshnessToKnowledge(
  freshness: VisualThinkingResearchFreshness,
): VisualThinkingKnowledgeFreshness {
  switch (freshness) {
    case "timeless":
      return "timeless";
    case "stable":
    case "historical":
      return "stable";
    case "recent":
    case "real_time":
      return "recent";
    case "current":
      return "current";
    default:
      return "unknown";
  }
}

export function inferResearchTypeFromGap(
  gap: VisualThinkingKnowledgeGap,
): VisualThinkingResearchType {
  const area = `${gap.area} ${gap.description}`.toLowerCase();
  if (/pric|cost|fee/.test(area)) return "current_pricing";
  if (/regulat|compliance|legal|law/.test(area)) return "current_regulations";
  if (/competitor|rival|alternative product/.test(area))
    return "current_competitors";
  if (/technolog|api|software|platform/.test(area)) return "current_technology";
  if (/market|industry|segment/.test(area)) return "market_information";
  if (/defin|glossary|term/.test(area)) return "definitions";
  if (/histor|origin|past/.test(area)) return "historical_facts";
  if (/scien|stud|evidence|research/.test(area)) return "scientific_evidence";
  if (/best practice|recommend/.test(area)) return "best_practices";
  if (/doc|manual|reference/.test(area)) return "public_documentation";
  if (/compar/.test(area)) return "current_competitors";
  return "current_product";
}

export function selectResearchStrategy(
  knowledgePlan: VisualThinkingKnowledgePlan,
  gaps: VisualThinkingKnowledgeGap[],
  override?: VisualThinkingResearchStrategy | null,
): VisualThinkingResearchStrategy {
  if (override) return override;
  if (knowledgePlan.excludedSourceKinds.includes("external_research")) {
    return "internal_only";
  }
  if (knowledgePlan.evidenceRequirement === "required") {
    return "evidence_first";
  }
  if (
    knowledgePlan.freshnessRequirement === "current" ||
    knowledgePlan.freshnessRequirement === "recent"
  ) {
    return "freshness_first";
  }
  if (
    gaps.every(
      (g) =>
        g.resolutionType === "user_input" ||
        g.area.includes("process") ||
        g.area.includes("workflow") ||
        g.area.includes("preference"),
    ) &&
    gaps.length > 0
  ) {
    return "user_authority";
  }
  if (knowledgePlan.researchPriority === "required") {
    return "official_first";
  }
  if (knowledgePlan.researchPriority === "optional") {
    return "single_source";
  }
  return "multi_source_confirmation";
}

function defaultAcceptedSources(
  strategy: VisualThinkingResearchStrategy,
): VisualThinkingResearchSourceCategory[] {
  if (strategy === "internal_only" || strategy === "user_authority") {
    return [
      "existing_estate_knowledge",
      "previously_verified_user_information",
      "internal_user_documents",
    ];
  }
  if (strategy === "official_first") {
    return [
      "official_documentation",
      "government",
      "verified_company_information",
      "trusted_reference",
      "academic",
      "industry_publication",
    ];
  }
  return [
    "official_documentation",
    "government",
    "academic",
    "industry_publication",
    "verified_company_information",
    "trusted_reference",
    "existing_estate_knowledge",
    "previously_verified_user_information",
    "internal_user_documents",
    "community_discussion",
  ];
}

function defaultExcludedSources(
  strategy: VisualThinkingResearchStrategy,
): VisualThinkingResearchSourceCategory[] {
  if (strategy === "internal_only" || strategy === "user_authority") {
    return [
      "community_discussion",
      "industry_publication",
      "academic",
      "government",
      "official_documentation",
      "verified_company_information",
      "trusted_reference",
    ];
  }
  return [];
}

export function isUserAuthorityGap(gap: VisualThinkingKnowledgeGap): boolean {
  const area = `${gap.area} ${gap.description}`.toLowerCase();
  return (
    gap.resolutionType === "user_input" ||
    gap.userInputNeeded ||
    /sop|workflow|preference|internal|estate|my (team|process|business)/.test(
      area,
    )
  );
}

/**
 * Create a Research Plan from an assembled Knowledge Package.
 * Only plans research for gaps that genuinely need external/internal acquisition.
 */
export function planVisualThinkingResearch(
  input: VisualThinkingResearchInput,
): {
  plan: VisualThinkingResearchPlan;
  items: VisualThinkingResearchItem[];
} {
  const { knowledgeBundle } = input;
  const pkg = knowledgeBundle.package;
  const kPlan = knowledgeBundle.plan;
  const timestamp = nowIso();
  const planId = newId("vtrp");

  const researchGaps = pkg.knowledgeGaps.filter(
    (g) =>
      g.status === "open" &&
      (g.researchNeeded || g.resolutionType === "external_research"),
  );

  const strategy = selectResearchStrategy(
    kPlan,
    researchGaps,
    input.strategyOverride,
  );

  const acceptedSources =
    input.acceptedSourcesOverride ?? defaultAcceptedSources(strategy);
  const excludedSources = defaultExcludedSources(strategy);

  const items: VisualThinkingResearchItem[] = [];
  const requiredResearch: string[] = [];
  const optionalResearch: string[] = [];
  const blockedResearch: string[] = [];

  for (const gap of researchGaps) {
    const userAuthority = isUserAuthorityGap(gap);
    const blocked =
      strategy === "internal_only" &&
      gap.resolutionType === "external_research" &&
      !userAuthority;

    const priority: VisualThinkingResearchPriority = blocked
      ? "blocked"
      : gap.priority === "required"
        ? "required"
        : "optional";

    const item: VisualThinkingResearchItem = {
      id: newId("vtri"),
      researchPlanId: planId,
      knowledgeGapId: gap.id,
      question:
        gap.focusedQuestion ||
        gap.description ||
        `What verified information fills: ${gap.area}?`,
      reason: gap.description,
      researchType: inferResearchTypeFromGap(gap),
      priority,
      status: blocked ? "blocked" : "planned",
      sourceRequirements: userAuthority
        ? [
            "internal_user_documents",
            "previously_verified_user_information",
            "existing_estate_knowledge",
          ]
        : acceptedSources.slice(0, 4),
      freshness: mapKnowledgeFreshnessToResearch(kPlan.freshnessRequirement),
      confidence: "unknown",
      verification: "unknown",
      notes: userAuthority
        ? "User is the authoritative source — do not replace with outside research."
        : blocked
          ? "Blocked by internal-only research strategy."
          : null,
      findingContent: null,
      citationIds: [],
      knowledgeItemIds: [],
      userAuthority,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    items.push(item);
    if (priority === "required") requiredResearch.push(item.id);
    else if (priority === "optional") optionalResearch.push(item.id);
    else blockedResearch.push(item.id);
  }

  // Adaptive Companion: whether optional research should be suggested
  const adaptive = resolveAdaptivePresentation({
    destinationHint: "visual_thinking_studio",
  });
  let visibleOptional = optionalResearch;
  if (adaptive.summaryFirst || adaptive.maxVisibleChoices <= 1) {
    visibleOptional = limitVisibleChoices(
      optionalResearch.map((id) => ({ id, label: id })),
      adaptive,
    ).visible.map((v) => v.id);
  }

  const plan: VisualThinkingResearchPlan = {
    id: planId,
    knowledgePackageId: pkg.id,
    knowledgePlanId: kPlan.id,
    requestedResearch: items.map((i) => i.id),
    researchPriority: kPlan.researchPriority,
    requiredResearch,
    optionalResearch: visibleOptional,
    blockedResearch,
    researchQuestions: items.map((i) => i.question),
    acceptedSources,
    excludedSources,
    freshnessRequirement: mapKnowledgeFreshnessToResearch(
      kPlan.freshnessRequirement,
    ),
    evidenceRequirement: kPlan.evidenceRequirement,
    strategy,
    status:
      items.length === 0
        ? "complete"
        : blockedResearch.length === items.length
          ? "blocked"
          : "ready",
    createdAt: timestamp,
    updatedAt: timestamp,
    plannedBy: "deterministic_v1",
    planningVersion: "vts-research-plan-1",
  };

  return { plan, items };
}

function normalizeFindingKey(content: string): string {
  return content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function scoreConfidence(
  category: VisualThinkingResearchSourceCategory,
  declared: VisualThinkingSourceConfidence | undefined,
  strategy: VisualThinkingResearchStrategy,
): VisualThinkingSourceConfidence {
  if (declared && declared !== "unknown") return declared;
  if (
    category === "official_documentation" ||
    category === "government" ||
    category === "previously_verified_user_information"
  ) {
    return strategy === "evidence_first" ? "verified" : "high";
  }
  if (
    category === "academic" ||
    category === "verified_company_information" ||
    category === "internal_user_documents"
  ) {
    return "high";
  }
  if (
    category === "industry_publication" ||
    category === "trusted_reference" ||
    category === "existing_estate_knowledge"
  ) {
    return "medium";
  }
  if (category === "community_discussion") return "low";
  return "unknown";
}

function scoreVerification(
  finding: VisualThinkingResearchFindingInput,
  confidence: VisualThinkingSourceConfidence,
  hasConflict: boolean,
): VisualThinkingResearchVerification {
  if (finding.obsolete) return "obsolete";
  if (hasConflict) return "conflicting";
  if (finding.verification) return finding.verification;
  if (confidence === "verified") return "verified";
  if (confidence === "high") return "verified";
  if (confidence === "medium") return "partially_verified";
  if (confidence === "low") return "unverified";
  return "unknown";
}

function sourceCategoryAllowed(
  category: VisualThinkingResearchSourceCategory,
  plan: VisualThinkingResearchPlan,
  item: VisualThinkingResearchItem,
): boolean {
  if (item.userAuthority) {
    return (
      category === "internal_user_documents" ||
      category === "previously_verified_user_information" ||
      category === "existing_estate_knowledge"
    );
  }
  if (plan.excludedSources.includes(category)) return false;
  if (plan.strategy === "internal_only") {
    return (
      category === "internal_user_documents" ||
      category === "previously_verified_user_information" ||
      category === "existing_estate_knowledge"
    );
  }
  return (
    plan.acceptedSources.length === 0 ||
    plan.acceptedSources.includes(category) ||
    item.sourceRequirements.includes(category)
  );
}

/**
 * Acquire findings into the research bundle and extend the Knowledge Package.
 * Findings are provider-agnostic inputs — this layer never hardcodes providers.
 */
export function acquireVisualThinkingResearch(
  input: VisualThinkingResearchInput,
  findings: VisualThinkingResearchFindingInput[],
): VisualThinkingResearchBundle {
  const planned = planVisualThinkingResearch(input);
  let { plan, items } = planned;
  const timestamp = nowIso();
  plan = { ...plan, status: "acquiring", updatedAt: timestamp };

  const citations: VisualThinkingCitation[] = [];
  const conflicts: VisualThinkingResearchConflict[] = [];
  const pkg = JSON.parse(
    JSON.stringify(input.knowledgeBundle.package),
  ) as VisualThinkingKnowledgePackage;
  const existingKeys = new Set(
    pkg.items.map((i) => normalizeFindingKey(i.content)),
  );

  const newKnowledgeItems: VisualThinkingKnowledgeItem[] = [];
  const newSources: VisualThinkingKnowledgeSourceReference[] = [];
  const newKnowledgeConflicts: VisualThinkingKnowledgeConflict[] = [];

  for (const finding of findings) {
    let item =
      items.find((i) => i.id === finding.researchItemId) ??
      items.find(
        (i) =>
          finding.knowledgeGapId && i.knowledgeGapId === finding.knowledgeGapId,
      ) ??
      items.find(
        (i) =>
          finding.question &&
          i.question.toLowerCase() === finding.question.toLowerCase(),
      ) ??
      items.find((i) => i.status === "planned" && i.priority !== "blocked");

    if (!item) {
      // Finding without a planned item — attach as optional reference research
      item = {
        id: newId("vtri"),
        researchPlanId: plan.id,
        knowledgeGapId: finding.knowledgeGapId ?? null,
        question: finding.question ?? "Additional verified information",
        reason: "Supplementary research finding",
        researchType: finding.researchType ?? "reference_material",
        priority: "optional",
        status: "planned",
        sourceRequirements: [finding.sourceCategory],
        freshness: finding.freshness ?? plan.freshnessRequirement,
        confidence: "unknown",
        verification: "unknown",
        notes: null,
        findingContent: null,
        citationIds: [],
        knowledgeItemIds: [],
        userAuthority: Boolean(finding.userAuthority),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      items = [...items, item];
      plan = {
        ...plan,
        optionalResearch: [...plan.optionalResearch, item.id],
        requestedResearch: [...plan.requestedResearch, item.id],
        researchQuestions: [...plan.researchQuestions, item.question],
      };
    }

    if (item.status === "blocked") {
      continue;
    }

    if (!sourceCategoryAllowed(finding.sourceCategory, plan, item)) {
      items = items.map((i) =>
        i.id === item!.id
          ? {
              ...i,
              status: "failed",
              notes: "Source category not allowed for this research strategy.",
              updatedAt: timestamp,
            }
          : i,
      );
      continue;
    }

    // User authority: reject outside categories that would replace user knowledge
    if (
      item.userAuthority &&
      !sourceCategoryAllowed(finding.sourceCategory, plan, item)
    ) {
      continue;
    }

    const hasConflict = Boolean(finding.conflictingSource);
    const confidence = scoreConfidence(
      finding.sourceCategory,
      finding.confidence,
      plan.strategy,
    );
    const verification = scoreVerification(finding, confidence, hasConflict);
    const freshness = finding.freshness ?? plan.freshnessRequirement;

    const citation: VisualThinkingCitation = {
      id: newId("vtcite"),
      source: finding.source,
      title: finding.title,
      publisher: finding.publisher ?? null,
      date: finding.date ?? null,
      retrieved: timestamp,
      confidence,
      freshness,
      verification,
      sourceCategory: finding.sourceCategory,
      supportsItems: [],
      metadata: {},
    };
    citations.push(citation);

    const sourceRef: VisualThinkingKnowledgeSourceReference = {
      id: newId("vtks"),
      sourceKind:
        finding.sourceCategory === "existing_estate_knowledge" ||
        finding.sourceCategory === "previously_verified_user_information" ||
        finding.sourceCategory === "internal_user_documents"
          ? "saved_research"
          : "external_research",
      sourceId: citation.id,
      title: finding.title,
      location: finding.source,
      capturedAt: timestamp,
      authorOrOwner: finding.publisher ?? null,
      publishedAt: finding.date ?? null,
      updatedAt: timestamp,
      freshness: mapResearchFreshnessToKnowledge(freshness),
      reliability:
        confidence === "verified" || confidence === "high"
          ? "high"
          : confidence === "medium"
            ? "medium"
            : confidence === "low"
              ? "low"
              : "unknown",
      authority: item.userAuthority ? "user" : "external",
      relevance: "high",
      userProvided: item.userAuthority,
      external: !item.userAuthority,
      verified:
        verification === "verified" || verification === "partially_verified",
      metadata: {
        citationId: citation.id,
        sourceCategory: finding.sourceCategory,
        researchItemId: item.id,
      },
    };
    newSources.push(sourceRef);

    const key = normalizeFindingKey(finding.content);
    let knowledgeItemId: string | null = null;
    const existing =
      pkg.items.find((i) => normalizeFindingKey(i.content) === key) ??
      newKnowledgeItems.find((i) => normalizeFindingKey(i.content) === key);

    if (existing) {
      // Merge duplicate — preserve all source refs, raise confidence carefully
      knowledgeItemId = existing.id;
      const mergeInto = (i: VisualThinkingKnowledgeItem) => {
        if (i.id !== existing.id) return i;
        const refs = [...new Set([...i.sourceReferenceIds, sourceRef.id])];
        const confRank = { high: 3, medium: 2, low: 1, unknown: 0 };
        const mappedConf: VisualThinkingKnowledgeItem["confidence"] =
          confidence === "verified" || confidence === "high"
            ? "high"
            : confidence === "medium"
              ? "medium"
              : confidence === "low"
                ? "low"
                : "unknown";
        const nextConf =
          (confRank[mappedConf] ?? 0) > (confRank[i.confidence] ?? 0)
            ? mappedConf
            : i.confidence;
        return {
          ...i,
          sourceReferenceIds: refs,
          confidence: nextConf,
          freshness: mapResearchFreshnessToKnowledge(freshness),
          verificationStatus:
            verification === "verified"
              ? "verified"
              : verification === "partially_verified"
                ? "unverified"
                : i.verificationStatus === "gap"
                  ? "unverified"
                  : i.verificationStatus,
          metadata: {
            ...i.metadata,
            researchMerged: true,
            citationIds: [
              ...((i.metadata.citationIds as string[]) ?? []),
              citation.id,
            ],
          },
        };
      };
      pkg.items = pkg.items.map(mergeInto);
      for (let idx = 0; idx < newKnowledgeItems.length; idx++) {
        newKnowledgeItems[idx] = mergeInto(newKnowledgeItems[idx]!);
      }
      citation.supportsItems = [existing.id];
    } else if (!existingKeys.has(key)) {
      const knowledgeItem: VisualThinkingKnowledgeItem = {
        id: newId("vtki"),
        type:
          item.researchType === "definitions"
            ? "definition"
            : item.researchType === "best_practices"
              ? "explanation"
              : "fact",
        title: finding.title.slice(0, 80),
        content: finding.content,
        topic: item.researchType,
        category: "research_acquired",
        tags: ["research", item.researchType],
        sourceReferenceIds: [sourceRef.id],
        confidence:
          confidence === "verified"
            ? "high"
            : confidence === "unknown"
              ? "unknown"
              : confidence,
        freshness: mapResearchFreshnessToKnowledge(freshness),
        verificationStatus:
          verification === "verified"
            ? "verified"
            : verification === "obsolete"
              ? "unverified"
              : verification === "conflicting"
                ? "unverified"
                : verification === "partially_verified"
                  ? "unverified"
                  : "unverified",
        importance: item.priority === "required" ? "required" : "helpful",
        sequence: null,
        parentId: null,
        userProvided: item.userAuthority,
        userEdited: false,
        inferred: false,
        metadata: {
          researchItemId: item.id,
          citationIds: [citation.id],
          researchVerification: verification,
          sourceCategory: finding.sourceCategory,
        },
      };
      newKnowledgeItems.push(knowledgeItem);
      existingKeys.add(key);
      knowledgeItemId = knowledgeItem.id;
      citation.supportsItems = [knowledgeItem.id];
    }

    if (finding.conflictingSource && knowledgeItemId) {
      const altCitation: VisualThinkingCitation = {
        id: newId("vtcite"),
        source: finding.conflictingSource.source,
        title: finding.conflictingSource.title,
        publisher: null,
        date: null,
        retrieved: timestamp,
        confidence: finding.conflictingSource.confidence ?? "medium",
        freshness,
        verification: "conflicting",
        sourceCategory: finding.conflictingSource.sourceCategory,
        supportsItems: [knowledgeItemId],
        metadata: { conflict: true },
      };
      citations.push(altCitation);

      const researchConflict: VisualThinkingResearchConflict = {
        id: newId("vtrc"),
        researchPlanId: plan.id,
        researchItemId: item.id,
        sourceA: finding.source,
        sourceB: finding.conflictingSource.source,
        difference: `Source A: ${finding.content.slice(0, 120)} · Source B: ${finding.conflictingSource.content.slice(0, 120)}`,
        confidence: "medium",
        recommendedAction: "acknowledge_uncertainty",
        knowledgeConflictId: null,
        createdAt: timestamp,
      };

      const kConflict: VisualThinkingKnowledgeConflict = {
        id: newId("vtkc"),
        itemIds: [knowledgeItemId],
        description: researchConflict.difference,
        conflictType: "factual_disagreement",
        sourceReferenceIds: [sourceRef.id],
        status: "open",
        resolutionNeeded: true,
        resolutionNotes:
          "Research sources disagree — Generation should acknowledge uncertainty.",
      };
      researchConflict.knowledgeConflictId = kConflict.id;
      conflicts.push(researchConflict);
      newKnowledgeConflicts.push(kConflict);
    }

    const status: VisualThinkingResearchItemStatus =
      verification === "obsolete"
        ? "obsolete"
        : verification === "conflicting"
          ? "contradictory"
          : verification === "verified"
            ? "resolved"
            : verification === "partially_verified"
              ? "partially_resolved"
              : verification === "unverified"
                ? "partially_resolved"
                : "still_unresolved";

    items = items.map((i) =>
      i.id === item!.id
        ? {
            ...i,
            status,
            confidence,
            verification,
            freshness,
            findingContent: finding.content,
            citationIds: [...i.citationIds, citation.id],
            knowledgeItemIds: knowledgeItemId
              ? [...i.knowledgeItemIds, knowledgeItemId]
              : i.knowledgeItemIds,
            updatedAt: timestamp,
          }
        : i,
    );
  }

  // Mark planned required items with no findings as still unresolved / failed
  items = items.map((i) => {
    if (i.status !== "planned") return i;
    if (i.priority === "blocked") return i;
    if (findings.length === 0 && i.priority === "required") {
      return {
        ...i,
        status: "still_unresolved" as const,
        notes: i.notes ?? "No research findings supplied for this question.",
        updatedAt: timestamp,
      };
    }
    if (i.priority === "optional" && findings.length === 0) {
      return { ...i, status: "still_unresolved" as const, updatedAt: timestamp };
    }
    return i;
  });

  // Extend package — never replace approved knowledge
  pkg.items = [...pkg.items, ...newKnowledgeItems];
  pkg.sourceReferences = [...pkg.sourceReferences, ...newSources];
  pkg.conflicts = [...pkg.conflicts, ...newKnowledgeConflicts];

  // Resolve gaps that research covered
  pkg.knowledgeGaps = pkg.knowledgeGaps.map((gap) => {
    const covering = items.filter(
      (i) =>
        i.knowledgeGapId === gap.id &&
        (i.status === "resolved" || i.status === "partially_resolved"),
    );
    if (!covering.length) return gap;
    const fully = covering.some((i) => i.status === "resolved");
    return {
      ...gap,
      status: fully ? ("resolved" as const) : gap.status,
      resolvedByItemIds: [
        ...new Set([
          ...gap.resolvedByItemIds,
          ...covering.flatMap((c) => c.knowledgeItemIds),
        ]),
      ],
    };
  });

  // Reassess readiness honestly
  const openRequired = pkg.knowledgeGaps.filter(
    (g) => g.status === "open" && g.priority === "required",
  );
  const openResearch = openRequired.filter((g) => g.researchNeeded);
  const hasConflicts = pkg.conflicts.some((c) => c.status === "open");

  let readiness = pkg.readiness;
  if (openRequired.length === 0 && !hasConflicts) {
    readiness = "full_ready";
  } else if (openResearch.length === 0 && openRequired.length > 0) {
    readiness = "partial_ready";
  } else if (newKnowledgeItems.length > 0) {
    readiness =
      pkg.readiness === "not_ready" ? "structure_ready" : "partial_ready";
  }

  const blockedReasons = [
    ...openRequired.map((g) => g.description),
    ...conflicts.map(
      (c) => `Research conflict: ${c.difference.slice(0, 80)}`,
    ),
  ];

  pkg.readiness = readiness;
  pkg.readyForGeneration =
    readiness === "full_ready" ||
    readiness === "partial_ready" ||
    readiness === "structure_ready";
  pkg.blockedReasons = blockedReasons;
  pkg.updatedAt = timestamp;
  pkg.confidence =
    readiness === "full_ready"
      ? "high"
      : hasConflicts
        ? "low"
        : readiness === "partial_ready"
          ? "medium"
          : pkg.confidence;

  // Uncertainties for conflicting / unknown research
  for (const c of conflicts) {
    pkg.uncertainties = [
      ...pkg.uncertainties,
      {
        id: newId("vtku"),
        itemId: null,
        description: c.difference,
        reason: "Research sources disagree",
        confidence: "unknown",
        resolutionNeeded: true,
      },
    ];
  }

  const requiredDone = plan.requiredResearch.every((id) => {
    const item = items.find((i) => i.id === id);
    return (
      item &&
      (item.status === "resolved" ||
        item.status === "partially_resolved" ||
        item.status === "contradictory")
    );
  });
  const anyFailed = items.some((i) => i.status === "failed");
  const anyPartial = items.some(
    (i) =>
      i.status === "partially_resolved" ||
      i.status === "still_unresolved" ||
      i.status === "contradictory",
  );

  plan = {
    ...plan,
    status: anyFailed && !requiredDone
      ? "failed"
      : requiredDone && !anyPartial
        ? "complete"
        : requiredDone || newKnowledgeItems.length > 0
          ? "partial"
          : plan.requiredResearch.length === 0 && plan.optionalResearch.length === 0
            ? "complete"
            : "partial",
    updatedAt: timestamp,
  };

  const handoff = buildGenerationHandoff(
    { ...input.knowledgeBundle.plan, status: "package_ready", updatedAt: timestamp },
    pkg,
  );

  const remainingGapCount = pkg.knowledgeGaps.filter(
    (g) => g.status === "open",
  ).length;

  let workspaceNotification: VisualThinkingWorkspaceResearchNotification | null =
    null;
  if (
    input.workspaceActive &&
    (newKnowledgeItems.length > 0 || conflicts.length > 0)
  ) {
    workspaceNotification = {
      id: newId("vtrwn"),
      message: "New verified information is available.",
      autoApply: false,
      researchPlanId: plan.id,
      newItemCount: newKnowledgeItems.length,
      conflictCount: conflicts.length,
      remainingGapCount,
      createdAt: timestamp,
      dismissed: false,
    };
  }

  return {
    plan,
    items,
    citations,
    conflicts,
    updatedKnowledgePackage: pkg,
    updatedHandoff: handoff,
    workspaceNotification,
    acquiredAt: timestamp,
  };
}

/** Apply research bundle onto a knowledge bundle (extends package + handoff). */
export function applyResearchToKnowledgeBundle(
  knowledgeBundle: VisualThinkingKnowledgeBundle,
  researchBundle: VisualThinkingResearchBundle,
): VisualThinkingKnowledgeBundle {
  const plan = {
    ...knowledgeBundle.plan,
    missingKnowledgeGaps: researchBundle.updatedKnowledgePackage.knowledgeGaps
      .filter((g) => g.status === "open")
      .map((g) => g.id),
    availableSourceRefs:
      researchBundle.updatedKnowledgePackage.sourceReferences.map((s) => s.id),
    status:
      researchBundle.updatedKnowledgePackage.readiness === "full_ready"
        ? ("package_ready" as const)
        : researchBundle.updatedKnowledgePackage.knowledgeGaps.some(
              (g) => g.researchNeeded && g.status === "open",
            )
          ? ("awaiting_research" as const)
          : knowledgeBundle.plan.status,
    updatedAt: nowIso(),
  };
  return {
    plan,
    package: researchBundle.updatedKnowledgePackage,
    handoff: researchBundle.updatedHandoff,
  };
}

export function projectResearchStatus(bundle: VisualThinkingResearchBundle): {
  headline: string;
  detail: string | null;
  statusLabel: string;
  requiredRemaining: number;
  optionalSuggested: number;
  conflictCount: number;
  citationCount: number;
  canProceedToGeneration: boolean;
  knowledgeResearchSatisfied: boolean;
  showFreshnessWarning: boolean;
  showOptionalSuggestion: boolean;
} {
  const requiredRemaining = bundle.items.filter(
    (i) =>
      i.priority === "required" &&
      (i.status === "planned" ||
        i.status === "still_unresolved" ||
        i.status === "in_progress" ||
        i.status === "failed"),
  ).length;
  const adaptive = resolveAdaptivePresentation({
    destinationHint: "visual_thinking_studio",
  });
  const optionalOpen = bundle.items.filter(
    (i) => i.priority === "optional" && i.status === "planned",
  );
  const showOptionalSuggestion =
    optionalOpen.length > 0 &&
    !adaptive.summaryFirst &&
    adaptive.maxVisibleChoices > 1;

  const obsolete = bundle.items.some((i) => i.status === "obsolete");
  const showFreshnessWarning =
    obsolete ||
    bundle.plan.freshnessRequirement === "real_time" ||
    bundle.plan.freshnessRequirement === "current";

  const knowledgeResearchSatisfied =
    requiredRemaining === 0 &&
    (bundle.plan.status === "complete" || bundle.plan.status === "partial");

  let headline = "Research is ready when you are.";
  if (bundle.plan.status === "complete") {
    headline = "Verified information is ready to strengthen this work.";
  } else if (bundle.plan.status === "partial") {
    headline =
      "Some verified information is ready — a few questions are still open.";
  } else if (bundle.plan.status === "blocked") {
    headline =
      "Outside research is paused — your own knowledge is the authority here.";
  } else if (bundle.plan.status === "failed") {
    headline =
      "I could not verify everything yet — nothing important was invented.";
  } else if (requiredRemaining > 0) {
    headline = "A few current details still need verified sources.";
  }

  return {
    headline,
    detail:
      bundle.conflicts[0]?.difference ??
      bundle.updatedKnowledgePackage.blockedReasons[0] ??
      null,
    statusLabel: bundle.plan.status.replace(/_/g, " "),
    requiredRemaining,
    optionalSuggested: showOptionalSuggestion ? optionalOpen.length : 0,
    conflictCount: bundle.conflicts.length,
    citationCount: bundle.citations.length,
    canProceedToGeneration:
      bundle.updatedHandoff.safeGenerationScope !== "none",
    knowledgeResearchSatisfied,
    showFreshnessWarning: showFreshnessWarning && adaptive.showProgress !== false,
    showOptionalSuggestion,
  };
}

export function dismissWorkspaceResearchNotification(
  bundle: VisualThinkingResearchBundle,
): VisualThinkingResearchBundle {
  if (!bundle.workspaceNotification) return bundle;
  return {
    ...bundle,
    workspaceNotification: {
      ...bundle.workspaceNotification,
      dismissed: true,
    },
  };
}

export function researchEngineConsumesKnowledgeOnly(
  researchPlan: VisualThinkingResearchPlan,
  knowledgePackageId: string,
): boolean {
  return researchPlan.knowledgePackageId === knowledgePackageId;
}

/** True when Generation may treat research-stage blocking as satisfied. */
export function knowledgeResearchSatisfiesGenerationGate(
  researchBundle: VisualThinkingResearchBundle | null,
): boolean {
  if (!researchBundle) return false;
  return projectResearchStatus(researchBundle).knowledgeResearchSatisfied;
}

// ─── Persistence ────────────────────────────────────────────────────────────

export function saveResearchBundle(bundle: VisualThinkingResearchBundle): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(RESEARCH_SESSION_KEY, JSON.stringify(bundle));
  } catch {
    /* ignore */
  }
}

export function loadResearchBundle(): VisualThinkingResearchBundle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(RESEARCH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VisualThinkingResearchBundle;
  } catch {
    return null;
  }
}

export function clearResearchBundle(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(RESEARCH_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export { RESEARCH_SESSION_KEY };
