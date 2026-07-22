/**
 * Client Relationships — structured runtime contracts from the founder-approved
 * library under docs/chamber-knowledge/client-relationships/.
 *
 * Source authority: 000–014 + LIBRARY_MANIFEST (APPROVED 2026-07-17).
 * Do not invent Spec 132+; this is retrieval wiring only.
 */

import type { ChamberKnowledgeDocRef, ChamberKnowledgeRuntimeContract } from "./types";

export const CLIENT_RELATIONSHIPS_DOCS_ROOT =
  "docs/chamber-knowledge/client-relationships" as const;

export const CLIENT_RELATIONSHIPS_LIBRARY_VERSION =
  "client-relationships-knowledge-v1.0" as const;

const CR = CLIENT_RELATIONSHIPS_DOCS_ROOT;

/** Canonical inventory from BUNDLE_MANIFEST.md */
export const CLIENT_RELATIONSHIPS_DOCS: readonly ChamberKnowledgeDocRef[] = [
  { path: `${CR}/000_CLIENT_RELATIONSHIPS_INTELLIGENCE_LIBRARY_OVERVIEW.md`, role: "overview" },
  { path: `${CR}/001_CLIENT_RELATIONSHIPS_SCOPE_AND_BOUNDARIES.md`, role: "scope" },
  { path: `${CR}/002_CLIENT_RELATIONSHIPS_CORE_KNOWLEDGE.md`, role: "core" },
  { path: `${CR}/003_CLIENT_RELATIONSHIPS_FRAMEWORKS.md`, role: "frameworks" },
  { path: `${CR}/004_CLIENT_RELATIONSHIPS_DECISION_TREES.md`, role: "decision-trees" },
  { path: `${CR}/005_CLIENT_RELATIONSHIPS_DOMAIN_QUESTIONS.md`, role: "domain-questions" },
  { path: `${CR}/006_CLIENT_RELATIONSHIPS_RECOMMENDATIONS.md`, role: "recommendations" },
  { path: `${CR}/007_CLIENT_RELATIONSHIPS_COMMON_PROBLEMS.md`, role: "common-problems" },
  { path: `${CR}/008_CLIENT_RELATIONSHIPS_ADHD_AWARE_APPLICATION.md`, role: "adhd" },
  { path: `${CR}/009_CLIENT_RELATIONSHIPS_EXAMPLES_AND_SCENARIOS.md`, role: "scenarios" },
  { path: `${CR}/010_CLIENT_RELATIONSHIPS_RESEARCH_TRIGGERS_AND_SOURCES.md`, role: "research" },
  { path: `${CR}/011_CLIENT_RELATIONSHIPS_SAFETY_AND_BOUNDARIES.md`, role: "safety" },
  { path: `${CR}/012_CLIENT_RELATIONSHIPS_RETRIEVAL_GUIDANCE.md`, role: "retrieval" },
  { path: `${CR}/013_CLIENT_RELATIONSHIPS_SOURCE_AND_MAINTENANCE_REGISTER.md`, role: "maintenance" },
  { path: `${CR}/014_CLIENT_RELATIONSHIPS_KNOWLEDGE_COVERAGE_CHECKLIST.md`, role: "coverage" },
  { path: `${CR}/CLIENT_RELATIONSHIPS_LIBRARY_MANIFEST.md`, role: "manifest" },
  { path: `${CR}/BUNDLE_MANIFEST.md`, role: "bundle" },
  {
    path: "docs/chamber-knowledge/CHAMBER_KNOWLEDGE_RELATIONSHIP_MAP.md",
    role: "relationship-map",
  },
] as const;

/**
 * Production-completion / routing contracts for CR conversations.
 * Architecture packs 419–430 describe product completion; this contract
 * enforces the knowledge thin-line during chat.
 */
export const CLIENT_RELATIONSHIPS_RUNTIME_CONTRACT: ChamberKnowledgeRuntimeContract =
  {
    memberId: "client-relationships",
    libraryVersion: CLIENT_RELATIONSHIPS_LIBRARY_VERSION,
    primaryOwns: [
      "Professional client relationship health (post-engagement care)",
      "Trust, reliability, and micro-promise stewardship",
      "Client communication norms and difficult messages",
      "Expectation alignment and relationship-layer scope friction",
      "Boundaries, renegotiation, concessions vs repair",
      "Conflict recognition, repair sequencing, service recovery (relational)",
      "Retention stewardship and relational referral readiness",
      "Re-engagement after silence; professional offboarding / endings",
      "ADHD-aware application of the above to client care",
    ],
    doesNotOwn: [
      "CRM / contact database",
      "Sales pipeline, closing, objections",
      "Marketing campaigns and lead funnels",
      "Pricing architecture, invoicing mechanics, bookkeeping",
      "Contract drafting or legal conclusions",
      "Project plans, milestones, delivery systems",
      "Ticket queues / SLA macros (Customer Support ops)",
      "Personal friendship or family conflict as primary topic",
      "Clinical therapy or diagnosis",
    ],
    retrievalSignals: [
      "client relationship",
      "difficult client",
      "client communication",
      "client trust",
      "scope creep",
      "client conflict",
      "missed deadline",
      "apology to client",
      "client boundaries",
      "client retention",
      "client referral",
      "offboarding",
      "end client relationship",
      "client silence",
      "service recovery",
      "re-engage client",
      "payment boundary conversation",
      "people-pleasing with clients",
    ],
    negativeSignals: [
      "sales pipeline / closing new clients → Sales",
      "funnels / content for strangers → Marketing / Content",
      "pricing math / refunds systems → Finance",
      "contract drafting / liability → Legal counsel",
      "Gantt / capacity tooling → Project Management",
      "CRM fields / automations → Systems",
      "best CRM tool comparison without relationship question → Research + Systems",
    ],
    safetyRules: [
      "Safety wins over softer recommendations elsewhere in the library.",
      "Never state legal conclusions or draft binding contract language as final.",
      "Never diagnose clients or the member clinically.",
      "Never promise outcomes (they will renew / this apology will fix it).",
      "Never endorse manipulative retention, deception, or tolerating abuse for revenue.",
      "Flag professional review for harassment, threats, liability, or crisis — do not optimize for retention.",
      "Current facts, laws, prices, and URLs require live research (010) — never invent links.",
    ],
    productionCompletionRules: [
      "Thin-line: this library supplies structured expertise; Conversation Engine + Shari own the visible reply.",
      "Prefer one primary library + one bridge for multi-domain situations.",
      "Do not become a CRM; relationship quality ≠ contact database.",
      "Architecture packs 419–430 remain product-completion specs; this contract wires approved knowledge into chat.",
      "Member-facing voice stays Shari — never surface file names, pack IDs, or retrieval mechanics.",
    ],
    collaborationBridges: [
      "CR + Project Management — late delivery: trust repair + revised plan",
      "CR + Finance — payment delay / pause stance / money conversation tone",
      "CR + Legal — hostility, liability-sensitive communications, formal end",
      "CR + Sales — post-yes expectation handoff (not closing)",
      "CR + ADHD — friction map + CR practice (CR owns relationship application)",
    ],
    defaultRetrievalRoles: [
      "retrieval",
      "scope",
      "safety",
      "core",
      "frameworks",
      "decision-trees",
      "recommendations",
      "common-problems",
      "adhd",
      "manifest",
    ],
  };

/** Map domain hints → preferred doc roles (012 file-level guidance). */
export function clientRelationshipsRolesForHint(
  domainHint?: string | null,
): readonly string[] {
  const hint = (domainHint ?? "").toLowerCase().trim();
  if (!hint) return CLIENT_RELATIONSHIPS_RUNTIME_CONTRACT.defaultRetrievalRoles;
  if (/safet|legal|harass|abuse|threat/.test(hint)) {
    return ["safety", "scope", "retrieval", "manifest"];
  }
  if (/adhd|avoid|shame|people.?pleas|overwhelm/.test(hint)) {
    return ["adhd", "common-problems", "recommendations", "safety", "retrieval"];
  }
  if (/decision|if.?then|branch|tree/.test(hint)) {
    return ["decision-trees", "frameworks", "domain-questions", "retrieval"];
  }
  if (/example|scenario|script|what to say/.test(hint)) {
    return ["scenarios", "recommendations", "common-problems", "safety"];
  }
  if (/research|crm|tool|benchmark|url|law/.test(hint)) {
    return ["research", "safety", "retrieval", "scope"];
  }
  if (/conflict|repair|apolog|missed|deadline|trust/.test(hint)) {
    return [
      "common-problems",
      "decision-trees",
      "recommendations",
      "frameworks",
      "safety",
      "retrieval",
    ];
  }
  return CLIENT_RELATIONSHIPS_RUNTIME_CONTRACT.defaultRetrievalRoles;
}
