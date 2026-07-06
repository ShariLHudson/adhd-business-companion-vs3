import type {
  MasterLibraryCategory,
  MasterLibraryItem,
} from "../types";

function entry(
  partial: MasterLibraryItem,
): MasterLibraryItem {
  return partial;
}

const CONSTITUTIONS: MasterLibraryItem[] = [
  entry({
    id: "ml-founder-constitution",
    name: "Founder Experience Constitution™",
    purpose: "Supreme authority for how Founder feels.",
    categoryId: "constitutions",
    authority: "constitution",
    location: "docs/founder/FOUNDER_EXPERIENCE_CONSTITUTION.md",
    inNotebookLmLibrary: true,
    relatedSystems: ["Founder Studio", "Executive Resources Center"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
  entry({
    id: "ml-relationship",
    name: "Relationship Constitution",
    purpose: "How people feel in UI and rooms.",
    categoryId: "constitutions",
    authority: "constitution",
    location: "docs/RELATIONSHIP_CONSTITUTION.md",
    inNotebookLmLibrary: true,
    relatedSystems: ["Spark Companion", "Spark Estate"],
    owner: "Shari",
    lastUpdated: "2026-07-01",
  }),
  entry({
    id: "ml-friend",
    name: "The Friend We All Deserve™",
    purpose: "How Spark speaks — companion DNA.",
    categoryId: "constitutions",
    authority: "constitution",
    location: "docs/THE_FRIEND_WE_ALL_DESERVE.md",
    inNotebookLmLibrary: true,
    relatedSystems: ["Spark Companion"],
    owner: "Shari",
    lastUpdated: "2026-07-01",
  }),
];

const BLUEPRINTS: MasterLibraryItem[] = [
  entry({
    id: "ml-master-blueprint",
    name: "Founder Master Blueprint™",
    purpose: "SPARK Intelligence Blueprint — vision and executive philosophy.",
    categoryId: "blueprints",
    authority: "blueprint",
    location: "docs/founder/FOUNDER_MASTER_BLUEPRINT.md",
    inNotebookLmLibrary: true,
    relatedSystems: ["Founder Studio", "Spark Intelligence"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
  entry({
    id: "ml-founder-v1",
    name: "Founder V1",
    purpose: "Executive architecture orientation — start here.",
    categoryId: "blueprints",
    authority: "blueprint",
    location: "docs/founder/FOUNDER_V1.md",
    inNotebookLmLibrary: true,
    relatedSystems: ["Founder Studio"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
  entry({
    id: "ml-arch-freeze",
    name: "Architecture Freeze",
    purpose: "Frozen vs. allowed evolution after V1.",
    categoryId: "blueprints",
    authority: "blueprint",
    location: "docs/founder/ARCHITECTURE_FREEZE.md",
    inNotebookLmLibrary: false,
    relatedSystems: ["Founder Studio", "Development"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
];

const OPERATING_MANUALS: MasterLibraryItem[] = [
  entry({
    id: "ml-resources-center",
    name: "Executive Resources Center",
    purpose: "Single hub for external systems, AI tools, and calendars.",
    categoryId: "operating-manuals",
    authority: "operating-manual",
    location: "docs/founder/EXECUTIVE_RESOURCES_CENTER.md",
    inNotebookLmLibrary: false,
    relatedSystems: ["Executive Resources Center"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
  entry({
    id: "ml-integration-center",
    name: "Executive Integration Center",
    purpose: "Mission Control — PostCraft, GHL, and connected departments.",
    categoryId: "operating-manuals",
    authority: "operating-manual",
    location: "docs/founder/EXECUTIVE_INTEGRATION_CENTER.md",
    inNotebookLmLibrary: false,
    relatedSystems: ["Executive Integration Center", "PostCraft", "GoHighLevel"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
  entry({
    id: "ml-google-drive",
    name: "Google Drive Structure",
    purpose: "Permanent master storage folder architecture.",
    categoryId: "operating-manuals",
    authority: "operating-manual",
    location: "docs/founder/GOOGLE_DRIVE_STRUCTURE.md",
    inNotebookLmLibrary: false,
    relatedSystems: ["Google Drive", "Founder Knowledge Vault"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
  entry({
    id: "ml-notebooklm",
    name: "AI Knowledge / NotebookLM Strategy",
    purpose: "Vault → Drive → NotebookLM research architecture.",
    categoryId: "operating-manuals",
    authority: "operating-manual",
    location: "docs/founder/AI_KNOWLEDGE_NOTEBOOKLM.md",
    inNotebookLmLibrary: false,
    relatedSystems: ["NotebookLM", "Founder Knowledge Vault"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
];

const RECOVERY: MasterLibraryItem[] = [
  entry({
    id: "ml-recovery",
    name: "Founder Recovery Guide",
    purpose: "Plain English — where everything lives.",
    categoryId: "recovery-guides",
    authority: "operating-manual",
    location: "docs/founder/FOUNDER_RECOVERY_GUIDE.md",
    inNotebookLmLibrary: true,
    relatedSystems: ["Founder Studio"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
  entry({
    id: "ml-doc-index",
    name: "Founder Document Index",
    purpose: "Executive document catalog with authority levels.",
    categoryId: "recovery-guides",
    authority: "reference",
    location: "docs/founder/FOUNDER_DOCUMENT_INDEX.md",
    inNotebookLmLibrary: false,
    relatedSystems: ["Founder Knowledge Vault"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
  entry({
    id: "ml-master-index",
    name: "Master Library Index",
    purpose: "Master catalog of all important Spark knowledge.",
    categoryId: "recovery-guides",
    authority: "reference",
    location: "docs/founder/MASTER_LIBRARY_INDEX.md",
    inNotebookLmLibrary: false,
    relatedSystems: ["Spark Master Library", "Founder Knowledge Vault"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
];

const PROMPTS: MasterLibraryItem[] = [
  entry({
    id: "ml-prompt-library",
    name: "Master Prompt Library",
    purpose: "Organized prompts by ecosystem area.",
    categoryId: "master-prompt-library",
    authority: "prompt",
    location: "docs/founder/MASTER_PROMPT_LIBRARY.md",
    inNotebookLmLibrary: true,
    relatedSystems: ["Founder Studio", "PostCraft", "Spark Companion"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
  entry({
    id: "ml-marketing-orch",
    name: "Founder Marketing Orchestration",
    purpose: "Founder decides · PostCraft creates · GHL delivers.",
    categoryId: "master-prompt-library",
    authority: "prompt",
    location: "docs/founder/FOUNDER_MARKETING_ORCHESTRATION.md",
    inNotebookLmLibrary: false,
    relatedSystems: ["PostCraft", "GoHighLevel"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
];

const FOUNDER: MasterLibraryItem[] = [
  entry({
    id: "ml-arch-summary",
    name: "Founder Architecture Summary",
    purpose: "Systems, flows, and ecosystem map.",
    categoryId: "founder",
    authority: "reference",
    location: "docs/founder/FOUNDER_ARCHITECTURE_SUMMARY.md",
    inNotebookLmLibrary: true,
    relatedSystems: ["Founder Studio"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
  entry({
    id: "ml-no-creep",
    name: "No Feature Creep",
    purpose: "Eight-question gate before new features.",
    categoryId: "founder",
    authority: "blueprint",
    location: "docs/founder/NO_FEATURE_CREEP.md",
    inNotebookLmLibrary: false,
    relatedSystems: ["Founder Studio"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
];

const COMPANION: MasterLibraryItem[] = [
  entry({
    id: "ml-conversation-freeze",
    name: "Conversation Architecture Freeze",
    purpose: "Specs 105–131 complete — observation mode.",
    categoryId: "spark-companion",
    authority: "prompt",
    location: "docs/SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md",
    inNotebookLmLibrary: true,
    relatedSystems: ["Spark Companion"],
    owner: "Shari",
    lastUpdated: "2026-07-01",
  }),
  entry({
    id: "ml-human-voice",
    name: "Spark Human Voice Rules",
    purpose: "Final voice check — would Shari say this?",
    categoryId: "spark-companion",
    authority: "prompt",
    location: "docs/SPARK_HUMAN_VOICE_RULES.md",
    inNotebookLmLibrary: true,
    relatedSystems: ["Spark Companion"],
    owner: "Shari",
    lastUpdated: "2026-07-01",
  }),
];

const ESTATE: MasterLibraryItem[] = [
  entry({
    id: "ml-estate-bible",
    name: "Spark Estate Bible",
    purpose: "Official estate canon — places, objects, Ch 23 test.",
    categoryId: "estate",
    authority: "constitution",
    location: "docs/estate/Spark Estate Bible.md",
    inNotebookLmLibrary: true,
    relatedSystems: ["Spark Estate", "Discovery Key"],
    owner: "Shari",
    lastUpdated: "2026-07-01",
  }),
  entry({
    id: "ml-discovery-key",
    name: "Discovery Key Constitution",
    purpose: "Gentle estate discovery — not a reward system.",
    categoryId: "estate",
    authority: "constitution",
    location: "docs/estate-intelligence/discovery-key/DiscoveryKey-Constitution.md",
    inNotebookLmLibrary: false,
    relatedSystems: ["Spark Estate", "Discovery Key"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
];

const DEVELOPMENT: MasterLibraryItem[] = [
  entry({
    id: "ml-intelligence-registry",
    name: "Intelligence Registry",
    purpose: "Objects × engines × relationships engineering blueprint.",
    categoryId: "development",
    authority: "reference",
    location: "lib/intelligence/INTELLIGENCE_REGISTRY.md",
    inNotebookLmLibrary: false,
    relatedSystems: ["Development", "Cursor"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
  entry({
    id: "ml-github-roadmap",
    name: "GitHub Roadmap",
    purpose: "Milestones M0–M7 and success criteria.",
    categoryId: "development",
    authority: "reference",
    location: "docs/founder/GITHUB_ROADMAP.md",
    inNotebookLmLibrary: false,
    relatedSystems: ["GitHub", "Development"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
];

const MARKETING: MasterLibraryItem[] = [
  entry({
    id: "ml-postcraft",
    name: "PostCraft™",
    purpose: "Content and campaign creation department.",
    categoryId: "postcraft",
    authority: "reference",
    location: "/ecosystem/dashboard",
    inNotebookLmLibrary: false,
    relatedSystems: ["PostCraft", "Founder Studio"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
];

const GHL: MasterLibraryItem[] = [
  entry({
    id: "ml-ghl-prompts",
    name: "Founder GHL Prompts",
    purpose: "GoHighLevel workflows, funnels, and CRM prompts.",
    categoryId: "gohighlevel",
    authority: "prompt",
    location: "docs/founder-ghl-prompts.md",
    inNotebookLmLibrary: true,
    relatedSystems: ["GoHighLevel"],
    owner: "Shari",
    lastUpdated: "2026-06-20",
  }),
];

const AI: MasterLibraryItem[] = [
  entry({
    id: "ml-master-library-spec",
    name: "Spark Master Library",
    purpose: "Permanent index spec and growth architecture.",
    categoryId: "ai",
    authority: "operating-manual",
    location: "docs/founder/SPARK_MASTER_LIBRARY.md",
    inNotebookLmLibrary: false,
    relatedSystems: ["Spark Master Library", "NotebookLM"],
    owner: "Shari",
    lastUpdated: "2026-07-06",
  }),
];

export const MASTER_LIBRARY_HEADLINE = "Spark Master Library™";
export const MASTER_LIBRARY_SUMMARY =
  "The permanent index of all important Spark knowledge — unlimited growth, one calm catalog. Founder indexes; Drive stores; NotebookLM researches.";

export const MASTER_LIBRARY_CATEGORIES: readonly MasterLibraryCategory[] = [
  { id: "constitutions", label: "Constitutions", purpose: "Supreme law — experience, relationship, estate.", items: CONSTITUTIONS },
  { id: "blueprints", label: "Blueprints", purpose: "Vision, architecture, and freeze boundaries.", items: BLUEPRINTS },
  { id: "operating-manuals", label: "Operating Manuals", purpose: "How systems run — resources, integration, storage.", items: OPERATING_MANUALS },
  { id: "recovery-guides", label: "Recovery Guides", purpose: "Restore direction when things feel lost.", items: RECOVERY },
  { id: "master-prompt-library", label: "Master Prompt Library", purpose: "Organized prompts across the ecosystem.", items: PROMPTS },
  { id: "founder", label: "Founder", purpose: "Founder Studio architecture and gates.", items: FOUNDER },
  { id: "spark-companion", label: "Spark Companion", purpose: "Conversation architecture and voice.", items: COMPANION },
  { id: "estate", label: "Estate", purpose: "Places, objects, and discovery.", items: ESTATE },
  { id: "development", label: "Development", purpose: "Engineering, registry, and roadmap.", items: DEVELOPMENT },
  { id: "postcraft", label: "PostCraft", purpose: "Content and marketing creation.", items: MARKETING },
  { id: "gohighlevel", label: "GoHighLevel", purpose: "CRM, funnels, and automations.", items: GHL },
  { id: "ai", label: "AI", purpose: "AI strategy, NotebookLM, and extensions.", items: AI },
  { id: "research", label: "Research", purpose: "Research libraries — grow without limit.", items: [] },
  { id: "marketing", label: "Marketing", purpose: "Campaigns, channels, and orchestration.", items: [] },
  { id: "business", label: "Business", purpose: "Business systems and operations.", items: [] },
  { id: "design", label: "Design", purpose: "Estate UI, brand, and visual standards.", items: [] },
  { id: "audio", label: "Audio", purpose: "Voice, music, and estate ambience.", items: [] },
  { id: "images", label: "Images", purpose: "Estate scenes and brand imagery.", items: [] },
  { id: "workshops", label: "Workshops", purpose: "Workshop content and delivery.", items: [] },
  { id: "courses", label: "Courses", purpose: "Course curriculum and assets.", items: [] },
] as const;

export const ALL_MASTER_LIBRARY_ITEMS: MasterLibraryItem[] =
  MASTER_LIBRARY_CATEGORIES.flatMap((category) => [...category.items]);
