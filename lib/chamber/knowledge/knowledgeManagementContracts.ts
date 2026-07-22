/**
 * Knowledge Management Intelligence — runtime contracts for Chamber retrieval.
 *
 * Authority sources (no parallel RAG):
 * - Architecture packs 527–538 (ownership, retrieval, lifecycle, lineage, routing)
 * - Visual Spark Studios KMG library (domain operating knowledge)
 *
 * Does NOT own Learning (551–562), Strategy, Projects execution, Momentum,
 * Create mechanics, or general platform memory (Spec 112).
 */

import type {
  ChamberKnowledgeDocRef,
  ChamberKnowledgeRuntimeContract,
} from "./types";

export const KNOWLEDGE_MANAGEMENT_MEMBER_ID = "knowledge-management" as const;

export const KNOWLEDGE_MANAGEMENT_DOCS_ROOT =
  "docs/visual-spark-studios/Knowledge-Management-Intelligence" as const;

export const KNOWLEDGE_ARCH_PACKS_ROOT = "docs/architecture-v2" as const;

export const KNOWLEDGE_MANAGEMENT_LIBRARY_VERSION =
  "knowledge-management-retrieval-v1" as const;

const KMG = KNOWLEDGE_MANAGEMENT_DOCS_ROOT;
const ARCH = KNOWLEDGE_ARCH_PACKS_ROOT;

/**
 * Approved inventory for Knowledge Chamber retrieval.
 * Excluded from user-facing retrieval: Spec-112 memory patterns, Learning packs,
 * superseded/duplicate/implementation-only materials, and auto-visual runtime
 * claims that are not yet available.
 */
export const KNOWLEDGE_MANAGEMENT_DOCS: readonly ChamberKnowledgeDocRef[] = [
  // —— Architecture completion packs 527–538 (canonical contracts) ——
  {
    path: `${ARCH}/527_KNOWLEDGE_COMPLETION_AUDIT_AND_CANONICAL_STATUS.md`,
    role: "overview",
    title: "Knowledge Completion Audit & Canonical Status",
    category: "architecture-pack",
    ownershipTags: ["knowledge", "canonical-status"],
    version: "527",
    status: "canonical",
    retrievalPriority: 10,
  },
  {
    path: `${ARCH}/528_KNOWLEDGE_CANONICAL_OWNERSHIP_AND_NON_DUPLICATION_CONTRACT.md`,
    role: "ownership",
    title: "Knowledge Canonical Ownership & Non-Duplication",
    category: "architecture-pack",
    ownershipTags: ["knowledge", "ownership", "non-duplication"],
    version: "528",
    status: "canonical",
    retrievalPriority: 1,
  },
  {
    path: `${ARCH}/529_EXPERT_KNOWLEDGE_REASONING_AND_ARCHITECTURE_MODELS.md`,
    role: "reasoning",
    title: "Expert Knowledge Reasoning & Architecture Models",
    category: "architecture-pack",
    ownershipTags: ["knowledge", "reasoning", "types", "states"],
    version: "529",
    status: "canonical",
    retrievalPriority: 5,
  },
  {
    path: `${ARCH}/530_KNOWLEDGE_CAPTURE_VALIDATION_AND_CURATION_STANDARD.md`,
    role: "capture",
    title: "Knowledge Capture, Validation & Curation",
    category: "architecture-pack",
    ownershipTags: ["knowledge", "capture", "curation"],
    version: "530",
    status: "canonical",
    retrievalPriority: 4,
  },
  {
    path: `${ARCH}/531_KNOWLEDGE_RETRIEVAL_CONTEXT_AND_APPLICATION_INTELLIGENCE.md`,
    role: "retrieval",
    title: "Knowledge Retrieval, Context & Application",
    category: "architecture-pack",
    ownershipTags: ["knowledge", "retrieval", "application"],
    version: "531",
    status: "canonical",
    retrievalPriority: 2,
  },
  {
    path: `${ARCH}/532_KNOWLEDGE_LIFECYCLE_VERSIONING_AND_CANONICAL_TRUTH_STANDARD.md`,
    role: "lifecycle",
    title: "Knowledge Lifecycle, Versioning & Canonical Truth",
    category: "architecture-pack",
    ownershipTags: ["knowledge", "lifecycle", "versioning"],
    version: "532",
    status: "canonical",
    retrievalPriority: 6,
  },
  {
    path: `${ARCH}/533_KNOWLEDGE_EVIDENCE_MEMORY_AND_LINEAGE_REGISTRY.md`,
    role: "lineage",
    title: "Knowledge Evidence, Memory & Lineage",
    category: "architecture-pack",
    ownershipTags: ["knowledge", "evidence", "lineage"],
    version: "533",
    status: "canonical",
    retrievalPriority: 7,
  },
  {
    path: `${ARCH}/534_KNOWLEDGE_CONTRADICTION_STALENESS_AND_CONFLICT_RESOLUTION_STANDARD.md`,
    role: "contradiction",
    title: "Contradiction, Staleness & Conflict Resolution",
    category: "architecture-pack",
    ownershipTags: ["knowledge", "contradiction", "staleness"],
    version: "534",
    status: "canonical",
    retrievalPriority: 3,
  },
  {
    path: `${ARCH}/535_KNOWLEDGE_CREATE_CAPABILITY_AND_OUTPUT_CATALOG.md`,
    role: "create-catalog",
    title: "Knowledge Create Capability & Output Catalog",
    category: "architecture-pack",
    ownershipTags: ["knowledge", "create-handoff"],
    version: "535",
    status: "canonical",
    retrievalPriority: 20,
  },
  {
    path: `${ARCH}/536_KNOWLEDGE_AUTOMATIC_VISUAL_INTELLIGENCE_STANDARD.md`,
    role: "visuals-unavailable",
    title: "Knowledge Automatic Visual Intelligence (not runtime-available)",
    category: "architecture-pack",
    ownershipTags: ["knowledge", "visuals"],
    version: "536",
    status: "unavailable",
    retrievalPriority: 99,
  },
  {
    path: `${ARCH}/537_KNOWLEDGE_ROUTING_COLLABORATION_AND_PRODUCTION_TEST_SUITE.md`,
    role: "routing",
    title: "Knowledge Routing, Collaboration & Production Tests",
    category: "architecture-pack",
    ownershipTags: ["knowledge", "routing", "collaboration"],
    version: "537",
    status: "canonical",
    retrievalPriority: 8,
  },
  {
    path: `${ARCH}/538_KNOWLEDGE_FINAL_CURSOR_UPLOAD_MANIFEST_AND_COMPLETION_STATUS.md`,
    role: "manifest",
    title: "Knowledge Final Manifest & Completion Status",
    category: "architecture-pack",
    ownershipTags: ["knowledge", "manifest"],
    version: "538",
    status: "canonical",
    retrievalPriority: 12,
  },

  // —— KMG domain library (approved operating knowledge) ——
  {
    path: `${KMG}/KMG-001_Knowledge_Management_Intelligence_Identity.md`,
    role: "identity",
    title: "Knowledge Management Identity",
    category: "kmg-library",
    ownershipTags: ["knowledge"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 15,
  },
  {
    path: `${KMG}/KMG-002_Knowledge_Management_Intelligence_DNA.md`,
    role: "core",
    title: "Knowledge Management DNA",
    category: "kmg-library",
    ownershipTags: ["knowledge"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 14,
  },
  {
    path: `${KMG}/KMG-003_Knowledge_Management_Intelligence_Knowledge_Ownership.md`,
    role: "ownership",
    title: "Knowledge Ownership (KMG)",
    category: "kmg-library",
    ownershipTags: ["knowledge", "ownership"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 2,
  },
  {
    path: `${KMG}/KMG-004_Knowledge_Management_Intelligence_Expert_Knowledge_Ecosystem.md`,
    role: "ecosystem",
    title: "Expert Knowledge Ecosystem",
    category: "kmg-library",
    ownershipTags: ["knowledge"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 18,
  },
  {
    path: `${KMG}/KMG-005_Knowledge_Management_Intelligence_Framework_Library.md`,
    role: "frameworks",
    title: "Framework Library",
    category: "kmg-library",
    ownershipTags: ["knowledge", "frameworks"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 9,
  },
  {
    path: `${KMG}/KMG-006_Knowledge_Management_Intelligence_Reasoning_Framework.md`,
    role: "reasoning",
    title: "Reasoning Framework",
    category: "kmg-library",
    ownershipTags: ["knowledge", "reasoning"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 6,
  },
  {
    path: `${KMG}/KMG-007_Knowledge_Management_Intelligence_Application_Rules.md`,
    role: "application",
    title: "Application Rules",
    category: "kmg-library",
    ownershipTags: ["knowledge", "application"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 8,
  },
  {
    path: `${KMG}/KMG-008_Knowledge_Management_Intelligence_Collaboration_Rules.md`,
    role: "routing",
    title: "Collaboration Rules",
    category: "kmg-library",
    ownershipTags: ["knowledge", "collaboration"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 11,
  },
  {
    path: `${KMG}/KMG-009_Knowledge_Management_Intelligence_Knowledge_Boundary_Map.md`,
    role: "scope",
    title: "Knowledge Boundary Map",
    category: "kmg-library",
    ownershipTags: ["knowledge", "boundaries"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 3,
  },
  {
    path: `${KMG}/KMG-010_Knowledge_Management_Intelligence_Core_Concepts_Library.md`,
    role: "core",
    title: "Core Concepts Library",
    category: "kmg-library",
    ownershipTags: ["knowledge"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 10,
  },
  {
    path: `${KMG}/KMG-012_Knowledge_Management_Intelligence_Models_And_Theories_Library.md`,
    role: "frameworks",
    title: "Models and Theories Library",
    category: "kmg-library",
    ownershipTags: ["knowledge"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 16,
  },
  {
    path: `${KMG}/KMG-013_Knowledge_Management_Intelligence_Methods_And_Processes_Library.md`,
    role: "methods",
    title: "Methods and Processes Library",
    category: "kmg-library",
    ownershipTags: ["knowledge", "methods"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 13,
  },
  {
    path: `${KMG}/KMG-014_Knowledge_Management_Intelligence_Tools_Templates_Workbooks.md`,
    role: "tools",
    title: "Tools, Templates, Workbooks",
    category: "kmg-library",
    ownershipTags: ["knowledge", "templates"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 22,
  },
  {
    path: `${KMG}/KMG-015_Knowledge_Management_Intelligence_Diagnostic_Intelligence.md`,
    role: "diagnostic",
    title: "Diagnostic Intelligence",
    category: "kmg-library",
    ownershipTags: ["knowledge", "gaps"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 12,
  },
  {
    path: `${KMG}/KMG-016_Knowledge_Management_Intelligence_Decision_Trees_Routing_Logic.md`,
    role: "routing",
    title: "Decision Trees & Routing Logic",
    category: "kmg-library",
    ownershipTags: ["knowledge", "routing"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 9,
  },
  {
    path: `${KMG}/KMG-017_Knowledge_Management_Intelligence_Case_Studies_Examples.md`,
    role: "scenarios",
    title: "Case Studies & Examples",
    category: "kmg-library",
    ownershipTags: ["knowledge", "examples"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 17,
  },
  {
    path: `${KMG}/KMG-018_Knowledge_Management_Intelligence_User_Journey_Maps.md`,
    role: "journeys",
    title: "User Journey Maps",
    category: "kmg-library",
    ownershipTags: ["knowledge"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 24,
  },
  {
    path: `${KMG}/KMG-019_Knowledge_Management_Intelligence_Coaching_Question_Library.md`,
    role: "questions",
    title: "Coaching Question Library",
    category: "kmg-library",
    ownershipTags: ["knowledge"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 19,
  },
  {
    path: `${KMG}/KMG-020_Knowledge_Management_Intelligence_Reference_Library.md`,
    role: "reference",
    title: "Reference Library",
    category: "kmg-library",
    ownershipTags: ["knowledge"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 21,
  },
  {
    path: `${KMG}/KMG-021_Knowledge_Management_Intelligence_Activation_Collaboration_Rules.md`,
    role: "routing",
    title: "Activation & Collaboration Rules",
    category: "kmg-library",
    ownershipTags: ["knowledge", "collaboration"],
    version: "1.0",
    status: "approved",
    retrievalPriority: 10,
  },

  // —— Explicitly registered but excluded from retrieval selection ——
  {
    path: `${KMG}/KMG-011_Knowledge_Management_Intelligence_Expert_Wisdom_Council.md`,
    role: "exclude-expert-attribution",
    title: "Expert Wisdom Council (exclude default — branding risk)",
    category: "kmg-library",
    ownershipTags: ["knowledge", "exclude-default"],
    version: "1.0",
    status: "exclude-from-retrieval",
    retrievalPriority: 100,
  },
  {
    path: `${KMG}/KMG-022_Knowledge_Management_Intelligence_Memory_Pattern_Library.md`,
    role: "exclude-platform-memory",
    title: "Memory Pattern Library (platform Spec 112 — not Knowledge-owned)",
    category: "kmg-library",
    ownershipTags: ["exclude", "platform-memory"],
    version: "1.0",
    status: "exclude-from-retrieval",
    retrievalPriority: 100,
  },
] as const;

/** Roles that must never enter a chat retrieval slice. */
export const KNOWLEDGE_MANAGEMENT_EXCLUDED_ROLES = [
  "exclude-expert-attribution",
  "exclude-platform-memory",
  "visuals-unavailable",
] as const;

/**
 * Production-completion / routing contracts for Knowledge conversations.
 * Thin-line: structured expertise → Shari composes; no second retrieval OS.
 */
export const KNOWLEDGE_MANAGEMENT_RUNTIME_CONTRACT: ChamberKnowledgeRuntimeContract =
  {
    memberId: "knowledge-management",
    libraryVersion: KNOWLEDGE_MANAGEMENT_LIBRARY_VERSION,
    primaryOwns: [
      "Capture — turning useful information into preservable knowledge",
      "Organization — structure, taxonomy, and findable libraries",
      "Synthesis — usable understanding from related information",
      "Retrieval support — the right knowledge for this moment (not a dump)",
      "Source lineage — provenance, evidence strength, related items",
      "Gaps — what is missing, incomplete, or unknown",
      "Connecting related information without inventing facts",
      "Preservation and maintenance of organizational knowledge",
      "Honest knowledge states: known / unknown / outdated / conflicting / incomplete",
      "Contradiction and staleness surfacing (never silent overwrite)",
    ],
    doesNotOwn: [
      "Learning — skill acquire/practice paths (Learning Intelligence / packs 551–562)",
      "Strategy — business strategy decisions (Strategy Intelligence)",
      "Projects execution — plans, milestones, delivery tracking",
      "Momentum — start/continue/return energy (Momentum Intelligence)",
      "Create mechanics — drafting runtime, Work lifecycle, export (Create Estate)",
      "General platform memory — Spec 112 Companion Memory / Memory Center",
      "Factual invention — never invent sources, URLs, or unverified claims",
      "Research investigation — external evidence gathering (Research Intelligence)",
      "Content expression — writing/editing for audience (Content Intelligence)",
      "File storage / folders as the product — Knowledge is not a drive UI",
    ],
    retrievalSignals: [
      "capture knowledge",
      "organize what I know",
      "knowledge library",
      "find what we know",
      "canonical truth",
      "source lineage",
      "knowledge gap",
      "outdated information",
      "conflicting versions",
      "preserve this decision",
      "lesson learned",
      "knowledge map",
      "taxonomy",
      "glossary",
      "what do we already know",
      "duplicate knowledge",
      "which version is trusted",
      "evidence vs assumption",
    ],
    negativeSignals: [
      "skill practice / course path → Learning (offer handoff; do not absorb)",
      "project milestones / execution board → Projects / Project Management",
      "stuck starting / return after absence → Momentum (offer; do not auto-launch)",
      "draft a flyer / document / workshop workspace → Create only if explicitly asked",
      "remember my mood / conversation style → Spec 112 platform memory (not this member)",
      "investigate a new external fact → Research",
      "write the blog post → Content",
      "business strategy choice → Strategy",
    ],
    safetyRules: [
      "Never invent sources, citations, URLs, or expert attributions.",
      "Never auto-canonize AI-generated content as approved knowledge.",
      "Never hide contradictions or present outdated knowledge as current.",
      "Never preserve a false user statement as organizational fact without labeling assumption.",
      "Never dump the full knowledge library into a turn — retrieve selectively.",
      "Never attribute guidance to named experts unless the member asks who originated it (expert branding rule).",
      "High-stakes conflicts → surface conflict + route to proper owner/professional; do not paper over.",
      "Automatic knowledge maps / visual intelligence are NOT available yet — do not claim or launch them.",
      "Do not duplicate platform Shari voice, Spec 112 memory, safety OS, or Estate routing inside this member.",
    ],
    productionCompletionRules: [
      "Thin-line: this library supplies structured Knowledge expertise; Conversation Engine + Shari own the visible reply.",
      "Match quality: strong match → apply; weak match → say so; no match → honest gap; conflicting → show both with authority/recency; stale → label outdated.",
      "Response modes supported: summarize known; name missing info; separate evidence vs interpretation vs assumption; compare; organize; lineage; contradictions; outdated; next knowledge step.",
      "Routing is offer/handoff language only — never auto-launch Learning, Projects, Momentum, Create, or another Chamber member merely because they were mentioned.",
      "Create handoff only for explicit artifact requests (briefs, maps, glossaries, knowledge articles) — Create owns drafting runtime.",
      "Architecture packs 527–538 + KMG library are authority references; production certification requires tests + browser validation (not claimed here).",
      "Member-facing voice stays Shari — never surface file names, pack IDs, or retrieval mechanics.",
      "Unsupported capabilities (auto knowledge visuals, Memory Center, Learning paths) stay hidden or marked unavailable.",
    ],
    collaborationBridges: [
      "Knowledge + Research — Research finds evidence; Knowledge decides what becomes reusable organizational knowledge",
      "Knowledge + Learning — Knowledge provides material; Learning designs practice/skill paths (offer Learning; do not teach as Learning)",
      "Knowledge + Content — Knowledge owns truth/structure; Content owns expression",
      "Knowledge + Projects — preserve lessons/decisions; Projects owns execution structure (offer; do not auto-open)",
      "Knowledge + Momentum — when stuck starting preservation work, offer Momentum; do not absorb",
      "Knowledge + Create — explicit briefs/maps/glossaries only; Create owns workspace mechanics",
      "Knowledge + other Chamber member — when domain ownership belongs elsewhere, offer that member; stay Knowledge-lane until they choose",
    ],
    defaultRetrievalRoles: [
      "ownership",
      "scope",
      "retrieval",
      "contradiction",
      "capture",
      "reasoning",
      "lineage",
      "lifecycle",
      "routing",
      "application",
      "core",
      "manifest",
    ],
  };

const EXCLUDED = new Set<string>(KNOWLEDGE_MANAGEMENT_EXCLUDED_ROLES);

/**
 * Map domain hints → preferred doc roles (531 retrieval; selective, not full dump).
 */
export function knowledgeManagementRolesForHint(
  domainHint?: string | null,
): readonly string[] {
  const hint = (domainHint ?? "").toLowerCase().trim();
  if (!hint) return KNOWLEDGE_MANAGEMENT_RUNTIME_CONTRACT.defaultRetrievalRoles;

  if (/contradict|conflict|stale|outdated|version|supersed/.test(hint)) {
    return ["contradiction", "lifecycle", "lineage", "ownership", "retrieval"];
  }
  if (/lineage|provenance|evidence|source|assum/.test(hint)) {
    return ["lineage", "reasoning", "contradiction", "ownership", "retrieval"];
  }
  if (/captur|preserv|curat|lesson|decision record|save this/.test(hint)) {
    return ["capture", "lifecycle", "ownership", "scope", "application"];
  }
  if (/retriev|find|search|what do we know|look up/.test(hint)) {
    return ["retrieval", "application", "core", "ownership", "scope"];
  }
  if (/gap|missing|incomplete|unknown|diagnos/.test(hint)) {
    return ["diagnostic", "retrieval", "capture", "ownership", "contradiction"];
  }
  if (/taxonom|organiz|structur|categoriz|map|glossar/.test(hint)) {
    return ["frameworks", "methods", "ownership", "core", "application"];
  }
  if (/creat|brief|artifact|export|draft|glossary|knowledge map/.test(hint)) {
    return ["create-catalog", "application", "ownership", "scope", "routing"];
  }
  if (
    /learn|skill|practice|course|momentum|project|strateg|research|content/.test(
      hint,
    )
  ) {
    return ["routing", "ownership", "scope", "application", "manifest"];
  }
  if (/example|scenario|case study|what to do/.test(hint)) {
    return ["scenarios", "application", "methods", "questions", "retrieval"];
  }

  return KNOWLEDGE_MANAGEMENT_RUNTIME_CONTRACT.defaultRetrievalRoles;
}

/**
 * Select Knowledge doc paths for a turn — excludes unavailable / cross-owner files,
 * prefers higher retrievalPriority, caps path count to avoid prompt flooding.
 */
export function knowledgeManagementSelectPaths(
  docs: readonly ChamberKnowledgeDocRef[],
  domainHint?: string | null,
  maxPaths = 10,
): string[] {
  const roles = new Set(knowledgeManagementRolesForHint(domainHint));
  const selected = docs
    .filter((d) => !EXCLUDED.has(d.role))
    .filter((d) => d.status !== "exclude-from-retrieval")
    .filter((d) => d.status !== "unavailable")
    .filter((d) => roles.has(d.role))
    .slice()
    .sort(
      (a, b) => (a.retrievalPriority ?? 50) - (b.retrievalPriority ?? 50),
    );

  const paths: string[] = [];
  const seen = new Set<string>();
  for (const doc of selected) {
    if (seen.has(doc.path)) continue;
    seen.add(doc.path);
    paths.push(doc.path);
    if (paths.length >= maxPaths) break;
  }
  return paths;
}
