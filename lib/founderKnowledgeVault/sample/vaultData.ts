import type { KnowledgeVaultItem, KnowledgeVaultSection } from "../types";

export const KNOWLEDGE_VAULT_HEADLINE = "Founder Knowledge Vault™";
export const KNOWLEDGE_VAULT_SUMMARY =
  "The permanent executive archive — constitutions, blueprints, prompts, Cursor rules, and recovery documents. Not a file dump. Source of truth for Visual Spark Studios.";

function item(
  partial: KnowledgeVaultItem,
): KnowledgeVaultItem {
  return partial;
}

const CONSTITUTIONS: KnowledgeVaultItem[] = [
  item({
    id: "kv-founder-constitution",
    title: "Founder Experience Constitution™",
    categoryId: "constitutions",
    purpose: "Supreme authority for how Founder feels — wins on experience conflicts.",
    lastUpdated: "2026-07-06",
    status: "active",
    documentPath: "docs/founder/FOUNDER_EXPERIENCE_CONSTITUTION.md",
    notes: "Read before any Founder UI or copy ships.",
  }),
  item({
    id: "kv-spec-100",
    title: "Entrepreneurial Transformation Constitution™",
    categoryId: "constitutions",
    purpose: "How members grow — hero principle, cognitive load, ownership.",
    lastUpdated: "2026-07-01",
    status: "active",
    documentPath: "docs/ENTREPRENEURIAL_TRANSFORMATION_CONSTITUTION.md",
  }),
  item({
    id: "kv-relationship",
    title: "Relationship Constitution",
    categoryId: "constitutions",
    purpose: "How people feel in UI and rooms — the Shari test.",
    lastUpdated: "2026-07-01",
    status: "active",
    documentPath: "docs/RELATIONSHIP_CONSTITUTION.md",
  }),
  item({
    id: "kv-friend",
    title: "The Friend We All Deserve™",
    categoryId: "constitutions",
    purpose: "How Spark speaks — companion DNA, not software voice.",
    lastUpdated: "2026-07-01",
    status: "active",
    documentPath: "docs/THE_FRIEND_WE_ALL_DESERVE.md",
  }),
];

const BLUEPRINTS: KnowledgeVaultItem[] = [
  item({
    id: "kv-master-blueprint",
    title: "Founder Master Blueprint™",
    categoryId: "blueprints",
    purpose: "SPARK Intelligence Blueprint — vision, promise, executive philosophy.",
    lastUpdated: "2026-07-06",
    status: "active",
    documentPath: "docs/founder/FOUNDER_MASTER_BLUEPRINT.md",
  }),
  item({
    id: "kv-founder-v1",
    title: "Founder V1",
    categoryId: "blueprints",
    purpose: "Executive summary — start here for architecture orientation.",
    lastUpdated: "2026-07-06",
    status: "active",
    documentPath: "docs/founder/FOUNDER_V1.md",
  }),
  item({
    id: "kv-arch-freeze",
    title: "Architecture Freeze",
    categoryId: "blueprints",
    purpose: "What is frozen vs. allowed evolution after V1.",
    lastUpdated: "2026-07-06",
    status: "active",
    documentPath: "docs/founder/ARCHITECTURE_FREEZE.md",
  }),
  item({
    id: "kv-arch-summary",
    title: "Founder Architecture Summary",
    categoryId: "blueprints",
    purpose: "Systems, flows, and ecosystem relationship map.",
    lastUpdated: "2026-07-06",
    status: "active",
    documentPath: "docs/founder/FOUNDER_ARCHITECTURE_SUMMARY.md",
  }),
];

const CURSOR_RULES: KnowledgeVaultItem[] = [
  item({
    id: "kv-rule-founder-vault",
    title: "Founder Knowledge Vault rule",
    categoryId: "cursor-rules",
    purpose: "Protect documents — check vault before duplicating architecture.",
    lastUpdated: "2026-07-06",
    status: "active",
    documentPath: ".cursor/rules/founder-knowledge-vault.mdc",
  }),
  item({
    id: "kv-rule-friend",
    title: "The Friend We All Deserve rule",
    categoryId: "cursor-rules",
    purpose: "Conversation and copy gate before member-facing work.",
    lastUpdated: "2026-07-01",
    status: "active",
    documentPath: ".cursor/rules/the-friend-we-all-deserve.mdc",
  }),
  item({
    id: "kv-rule-estate",
    title: "Estate Architectural Authority rule",
    categoryId: "cursor-rules",
    purpose: "Constitution, Bible, Living in Spark Estate — binding canon.",
    lastUpdated: "2026-07-01",
    status: "active",
    documentPath: ".cursor/rules/estate-architectural-authority.mdc",
  }),
  item({
    id: "kv-rule-no-creep",
    title: "No Feature Creep (via Founder docs)",
    categoryId: "cursor-rules",
    purpose: "Eight-question gate — reference FOUNDER docs before new features.",
    lastUpdated: "2026-07-06",
    status: "active",
    documentPath: "docs/founder/NO_FEATURE_CREEP.md",
  }),
];

const MASTER_PROMPTS: KnowledgeVaultItem[] = [
  item({
    id: "kv-prompt-vss-command",
    title: "VSS Command Center GPT",
    categoryId: "master-prompts",
    purpose: "Executive Command Center research, images, and prompt development.",
    lastUpdated: "2026-06-15",
    status: "active",
    documentPath: "docs/founder/FOUNDER_DOCUMENT_INDEX.md",
    promptExcerpt: "You are the Visual Spark Studios Command Center…",
    notes: "Open ChatGPT Command Center GPT — full prompt in vault index.",
  }),
];

const FOUNDER_PROMPTS: KnowledgeVaultItem[] = [
  item({
    id: "kv-prompt-resources",
    title: "Executive Resources Center",
    categoryId: "founder-prompts",
    purpose: "Five-question gate — single hub for external systems, AI tools, and links.",
    lastUpdated: "2026-07-06",
    status: "active",
    documentPath: "docs/founder/EXECUTIVE_RESOURCES_CENTER.md",
  }),
  item({
    id: "kv-prompt-integration",
    title: "Executive Integration Center implementation",
    categoryId: "founder-prompts",
    purpose: "Mission Control sprint — One Office Principle orchestration.",
    lastUpdated: "2026-07-06",
    status: "active",
    documentPath: "docs/founder/EXECUTIVE_INTEGRATION_CENTER.md",
  }),
  item({
    id: "kv-prompt-research",
    title: "Executive Research Center",
    categoryId: "founder-prompts",
    purpose: "Research department flow — answer, evidence, Spark application.",
    lastUpdated: "2026-07-05",
    status: "active",
    documentPath: "docs/founder/EXECUTIVE_RESEARCH_CENTER.md",
  }),
];

const COMPANION_PROMPTS: KnowledgeVaultItem[] = [
  item({
    id: "kv-prompt-conversation-freeze",
    title: "Conversation Architecture Freeze",
    categoryId: "companion-prompts",
    purpose: "Specs 105–131 complete — observation mode, no redesign.",
    lastUpdated: "2026-07-01",
    status: "active",
    documentPath: "docs/SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md",
  }),
  item({
    id: "kv-prompt-human-voice",
    title: "Spark Human Voice Rules",
    categoryId: "companion-prompts",
    purpose: "Final voice check — would Shari say this?",
    lastUpdated: "2026-07-01",
    status: "active",
    documentPath: "docs/SPARK_HUMAN_VOICE_RULES.md",
  }),
];

const POSTCRAFT_PROMPTS: KnowledgeVaultItem[] = [
  item({
    id: "kv-prompt-marketing-orch",
    title: "Founder Marketing Orchestration",
    categoryId: "postcraft-prompts",
    purpose: "Founder decides · PostCraft creates · GHL delivers.",
    lastUpdated: "2026-07-06",
    status: "active",
    documentPath: "docs/founder/FOUNDER_MARKETING_ORCHESTRATION.md",
  }),
];

const GHL_PROMPTS: KnowledgeVaultItem[] = [
  item({
    id: "kv-prompt-ghl",
    title: "Founder GHL Prompts",
    categoryId: "gohighlevel-prompts",
    purpose: "GoHighLevel workflows, funnels, and CRM prompt library.",
    lastUpdated: "2026-06-20",
    status: "reference",
    documentPath: "docs/founder-ghl-prompts.md",
  }),
];

const IMAGE_PROMPTS: KnowledgeVaultItem[] = [
  item({
    id: "kv-prompt-estate-image",
    title: "Estate Image Bible rule",
    categoryId: "image-prompts",
    purpose: "Estate scene imagery standards and generation guidance.",
    lastUpdated: "2026-06-01",
    status: "reference",
    documentPath: ".cursor/rules/estate-image-bible.mdc",
  }),
];

const ESTATE_DESIGN: KnowledgeVaultItem[] = [
  item({
    id: "kv-estate-bible",
    title: "Spark Estate Bible",
    categoryId: "estate-design-prompts",
    purpose: "Official estate canon — places, objects, Ch 23 test.",
    lastUpdated: "2026-07-01",
    status: "active",
    documentPath: "docs/estate/Spark Estate Bible.md",
  }),
  item({
    id: "kv-estate-ui",
    title: "Spark Estate UI Philosophy",
    categoryId: "estate-design-prompts",
    purpose: "Scene hero, frosted chat, no dashboards.",
    lastUpdated: "2026-07-01",
    status: "active",
    documentPath: "docs/SPARK_ESTATE_UI_PHILOSOPHY.md",
  }),
];

const LAUNCH_PROMPTS: KnowledgeVaultItem[] = [
  item({
    id: "kv-launch-roadmap",
    title: "GitHub Roadmap",
    categoryId: "launch-prompts",
    purpose: "Milestones M0–M7 and success criteria.",
    lastUpdated: "2026-07-06",
    status: "active",
    documentPath: "docs/founder/GITHUB_ROADMAP.md",
  }),
];

const RESEARCH_PROMPTS: KnowledgeVaultItem[] = [
  item({
    id: "kv-research-center",
    title: "Executive Research Center spec",
    categoryId: "research-prompts",
    purpose: "Research department experience and report flow.",
    lastUpdated: "2026-07-05",
    status: "active",
    documentPath: "docs/founder/EXECUTIVE_RESEARCH_CENTER.md",
  }),
];

const RECOVERY: KnowledgeVaultItem[] = [
  item({
    id: "kv-recovery-guide",
    title: "Founder Recovery Guide",
    categoryId: "recovery-handoff",
    purpose: "Plain English — where everything lives when direction gets confusing.",
    lastUpdated: "2026-07-06",
    status: "active",
    documentPath: "docs/founder/FOUNDER_RECOVERY_GUIDE.md",
  }),
  item({
    id: "kv-doc-index",
    title: "Founder Document Index",
    categoryId: "recovery-handoff",
    purpose: "Master index — name, path, purpose, authority level.",
    lastUpdated: "2026-07-06",
    status: "active",
    documentPath: "docs/founder/FOUNDER_DOCUMENT_INDEX.md",
  }),
];

const REBUILD: KnowledgeVaultItem[] = [
  item({
    id: "kv-impl-roadmap",
    title: "Implementation Roadmap",
    categoryId: "how-to-rebuild",
    purpose: "Post-freeze phases — sample data to real connections.",
    lastUpdated: "2026-07-06",
    status: "active",
    documentPath: "docs/founder/IMPLEMENTATION_ROADMAP.md",
  }),
  item({
    id: "kv-intelligence-registry",
    title: "Intelligence Registry",
    categoryId: "how-to-rebuild",
    purpose: "Engineering blueprint — objects, engines, relationships.",
    lastUpdated: "2026-07-06",
    status: "active",
    documentPath: "lib/intelligence/INTELLIGENCE_REGISTRY.md",
  }),
];

const ARCHIVE: KnowledgeVaultItem[] = [
  item({
    id: "kv-v1-completion",
    title: "Founder V1 Completion Report",
    categoryId: "archive",
    purpose: "V1 freeze completion record.",
    lastUpdated: "2026-07-06",
    status: "archive",
    documentPath: "docs/founder/FOUNDER_V1_COMPLETION_REPORT.md",
  }),
];

export const KNOWLEDGE_VAULT_SECTIONS: KnowledgeVaultSection[] = [
  { id: "constitutions", label: "Constitutions", purpose: "Supreme law — experience, relationship, transformation.", items: CONSTITUTIONS },
  { id: "blueprints", label: "Blueprints", purpose: "Vision, architecture, and freeze boundaries.", items: BLUEPRINTS },
  { id: "cursor-rules", label: "Cursor Rules", purpose: "Agent guardrails in .cursor/rules/", items: CURSOR_RULES },
  { id: "master-prompts", label: "Master Prompts", purpose: "Cross-ecosystem executive prompts.", items: MASTER_PROMPTS },
  { id: "founder-prompts", label: "Founder Prompts", purpose: "Founder Studio implementation and room specs.", items: FOUNDER_PROMPTS },
  { id: "companion-prompts", label: "Companion Prompts", purpose: "Conversation architecture and voice.", items: COMPANION_PROMPTS },
  { id: "postcraft-prompts", label: "PostCraft Prompts", purpose: "Content and marketing orchestration.", items: POSTCRAFT_PROMPTS },
  { id: "gohighlevel-prompts", label: "GoHighLevel Prompts", purpose: "CRM, funnels, automations.", items: GHL_PROMPTS },
  { id: "image-prompts", label: "Image Prompts", purpose: "Estate and brand imagery.", items: IMAGE_PROMPTS },
  { id: "estate-design-prompts", label: "Estate Design Prompts", purpose: "Estate canon and UI philosophy.", items: ESTATE_DESIGN },
  { id: "launch-prompts", label: "Launch Prompts", purpose: "Roadmaps and go-live planning.", items: LAUNCH_PROMPTS },
  { id: "research-prompts", label: "Research Prompts", purpose: "Executive research department.", items: RESEARCH_PROMPTS },
  { id: "recovery-handoff", label: "Recovery / Handoff Docs", purpose: "Restore direction when things feel lost.", items: RECOVERY },
  { id: "how-to-rebuild", label: "How to Rebuild", purpose: "Implementation and engineering authority.", items: REBUILD },
  { id: "archive", label: "Archive", purpose: "Completed milestones and historical records.", items: ARCHIVE },
];

export const ALL_KNOWLEDGE_VAULT_ITEMS: KnowledgeVaultItem[] =
  KNOWLEDGE_VAULT_SECTIONS.flatMap((section) => section.items);
