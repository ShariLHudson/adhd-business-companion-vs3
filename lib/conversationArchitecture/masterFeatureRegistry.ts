/**
 * Package 215 — Spark Estate Master Feature & Experience Registry.
 *
 * No feature, workflow, menu item, destination, or shared service reaches
 * production unless it appears here and meets Definition of Complete.
 *
 * Aligns with docs/estate/ESTATE_REGISTRY.md (Experience → Space → Tool)
 * and package 214 implementation tracks — without inventing a parallel taxonomy.
 */

import type { RoadmapTrackStatus } from "./platformRoadmap";

/** Status used on registry rows (includes N/A for non-UI services). */
export type RegistryStatus = RoadmapTrackStatus | "not_applicable";

export type MasterFeatureCategory =
  | "Welcome Home"
  | "Core Experiences"
  | "Chamber"
  | "Board"
  | "Business Estate"
  | "Projects"
  | "Journal"
  | "Evidence Vault"
  | "Discovery"
  | "Clear My Mind"
  | "Parking Lot"
  | "Search"
  | "How Do I…"
  | "Navigation"
  | "Settings"
  | "Shared Conversation Services"
  | "Intelligence Libraries";

export const MASTER_FEATURE_CATEGORIES: readonly MasterFeatureCategory[] = [
  "Welcome Home",
  "Core Experiences",
  "Chamber",
  "Board",
  "Business Estate",
  "Projects",
  "Journal",
  "Evidence Vault",
  "Discovery",
  "Clear My Mind",
  "Parking Lot",
  "Search",
  "How Do I…",
  "Navigation",
  "Settings",
  "Shared Conversation Services",
  "Intelligence Libraries",
] as const;

export type CieIntegrationStatus =
  | "not_applicable"
  | "not_started"
  | "partial"
  | "complete";

export type MasterFeatureRecord = {
  id: string;
  featureName: string;
  category: MasterFeatureCategory;
  userPurpose: string;
  /** Welcome Home / map destination placeId when known */
  welcomeHomeDestination: string | null;
  /** Estate Registry experience pillar when applicable */
  estateExperienceId: string | null;
  /** Canonical place / space id */
  estateSpaceId: string | null;
  conversationIntelligenceRequirements: string;
  cieIntegration: CieIntegrationStatus;
  hcvStatus: RegistryStatus;
  goldStandardCoverage: RegistryStatus;
  uiStatus: RegistryStatus;
  backendStatus: RegistryStatus;
  routingStatus: RegistryStatus;
  authenticatedTesting: RegistryStatus;
  productionReadiness: RegistryStatus;
  dependencies: readonly string[];
  notes: string;
};

function statusOk(s: RegistryStatus): boolean {
  return s === "complete" || s === "not_applicable";
}

/** Definition of Complete — package 215 production gate. */
export function meetsDefinitionOfComplete(row: MasterFeatureRecord): boolean {
  if (row.productionReadiness !== "complete") return false;
  if (!statusOk(row.uiStatus)) return false;
  if (!statusOk(row.backendStatus)) return false;
  if (!statusOk(row.routingStatus)) return false;
  if (!statusOk(row.authenticatedTesting)) return false;
  if (
    row.cieIntegration !== "not_applicable" &&
    row.cieIntegration !== "complete"
  ) {
    return false;
  }
  if (!statusOk(row.hcvStatus)) return false;
  return true;
}

function row(
  partial: MasterFeatureRecord,
): MasterFeatureRecord {
  return partial;
}

/**
 * Primary inventory — every production-bound surface must appear here.
 * Status reflects current platform reality (post CIE stabilize f0a36e7c).
 */
export const MASTER_FEATURE_REGISTRY: readonly MasterFeatureRecord[] = [
  // —— Welcome Home ——
  row({
    id: "welcome-home",
    featureName: "Welcome Home",
    category: "Welcome Home",
    userPurpose: "Arrive calmly; see what matters today without estate mastery",
    welcomeHomeDestination: "welcome-home",
    estateExperienceId: "explore",
    estateSpaceId: "welcome-home",
    conversationIntelligenceRequirements: "Arrival greeting; max 3 explained choices; CIE-ready",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_started",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["shared-cie", "hcv"],
    notes: "Roadmap priority 2",
  }),
  row({
    id: "todays-welcome-card",
    featureName: "Today's Welcome Card",
    category: "Welcome Home",
    userPurpose: "Three explained choices for today with one recommended path",
    welcomeHomeDestination: "welcome-home",
    estateExperienceId: "explore",
    estateSpaceId: "welcome-home",
    conversationIntelligenceRequirements: "Grounded recommendations; no menu overwhelm",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_started",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["welcome-home"],
    notes: "Primary daily path",
  }),

  // —— Core Experiences ——
  row({
    id: "talk-it-out",
    featureName: "Talk It Out",
    category: "Core Experiences",
    userPurpose: "Think through a decision or swirl in calm conversation",
    welcomeHomeDestination: "talk-it-out",
    estateExperienceId: "think",
    estateSpaceId: "decision-compass",
    conversationIntelligenceRequirements: "Full CIE + Topic Anchor + HCV + Gold",
    cieIntegration: "complete",
    hcvStatus: "complete",
    goldStandardCoverage: "partial",
    uiStatus: "complete",
    backendStatus: "complete",
    routingStatus: "complete",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["shared-cie", "hcv", "gold-library", "topic-anchor"],
    notes: "Strongest CIE surface; auth preview open",
  }),
  row({
    id: "create",
    featureName: "Create",
    category: "Core Experiences",
    userPurpose: "Bring documents and creative work to life with Shari",
    welcomeHomeDestination: "creative-studio",
    estateExperienceId: "create",
    estateSpaceId: "creative-studio",
    conversationIntelligenceRequirements: "CIE primary; HCV on all replies",
    cieIntegration: "not_started",
    hcvStatus: "partial",
    goldStandardCoverage: "not_started",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["shared-cie", "hcv"],
    notes: "Roadmap priority 4",
  }),
  row({
    id: "plan-my-day",
    featureName: "Plan My Day",
    category: "Core Experiences",
    userPurpose: "Choose a calm plan for the day; Adapt My Day lives inside",
    welcomeHomeDestination: "plan-my-day",
    estateExperienceId: "momentum",
    estateSpaceId: "goals-projects",
    conversationIntelligenceRequirements: "CIE for planning conversation; HCV",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_started",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["parking-lot", "shared-cie"],
    notes: "Adapt My Day must stay inside Plan My Day",
  }),
  row({
    id: "momentum-builder",
    featureName: "Momentum Builder",
    category: "Core Experiences",
    userPurpose: "Move projects and next actions forward",
    welcomeHomeDestination: "momentum-builder",
    estateExperienceId: "momentum",
    estateSpaceId: "momentum-builder",
    conversationIntelligenceRequirements: "CIE for coaching; no dashboard tone",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_started",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["projects", "shared-cie"],
    notes: "",
  }),
  row({
    id: "focus",
    featureName: "Focus",
    category: "Core Experiences",
    userPurpose: "Concentrate with timer, body doubling, or focus audio",
    welcomeHomeDestination: "focus-studio",
    estateExperienceId: "focus",
    estateSpaceId: "focus-studio",
    conversationIntelligenceRequirements: "Light CIE; HCV on spoken guidance",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_applicable",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: [],
    notes: "",
  }),
  row({
    id: "decision-compass",
    featureName: "Decision Compass",
    category: "Core Experiences",
    userPurpose: "Work through a structured decision",
    welcomeHomeDestination: "decision-compass",
    estateExperienceId: "think",
    estateSpaceId: "decision-compass",
    conversationIntelligenceRequirements: "CIE + Topic Anchor + HCV",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "partial",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["shared-cie", "talk-it-out"],
    notes: "Related to Talk It Out reflective path",
  }),
  row({
    id: "peaceful-places",
    featureName: "Peaceful Places",
    category: "Core Experiences",
    userPurpose: "Restore with calming places and soundscapes",
    welcomeHomeDestination: "peaceful-places",
    estateExperienceId: "restore",
    estateSpaceId: "peaceful-places",
    conversationIntelligenceRequirements: "Supportive CIE; HCV; no interrogation",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_applicable",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: [],
    notes: "",
  }),
  row({
    id: "breathe",
    featureName: "Breathe",
    category: "Core Experiences",
    userPurpose: "Short guided breathing when overwhelmed",
    welcomeHomeDestination: "breathe",
    estateExperienceId: "restore",
    estateSpaceId: "peaceful-places",
    conversationIntelligenceRequirements: "Minimal; HCV on any spoken lines",
    cieIntegration: "not_applicable",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_applicable",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: [],
    notes: "",
  }),

  // —— Chamber / Board ——
  row({
    id: "chamber",
    featureName: "Chamber of Momentum",
    category: "Chamber",
    userPurpose: "Consult specialized members for perspective",
    welcomeHomeDestination: "chamber",
    estateExperienceId: null,
    estateSpaceId: "chamber",
    conversationIntelligenceRequirements: "CIE + HCV; persona within Shari voice bounds",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_started",
    uiStatus: "complete",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["shared-cie", "hcv"],
    notes: "Roadmap priority 6; dismiss isolation required",
  }),
  row({
    id: "board",
    featureName: "Round Table Board",
    category: "Board",
    userPurpose: "Deliberate with directors; get a grounded summary",
    welcomeHomeDestination: "round-table",
    estateExperienceId: "business",
    estateSpaceId: "round-table",
    conversationIntelligenceRequirements: "CIE + HCV; no templated deliberation shells",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_started",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["shared-cie", "hcv"],
    notes: "Roadmap priority 7",
  }),

  // —— Business Estate / Projects ——
  row({
    id: "business-estate",
    featureName: "My Business Estate",
    category: "Business Estate",
    userPurpose: "See and tend the living business without dashboard noise",
    welcomeHomeDestination: "my-estate",
    estateExperienceId: "business",
    estateSpaceId: "my-estate",
    conversationIntelligenceRequirements: "CIE for guidance; HCV",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_started",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["shared-cie"],
    notes: "",
  }),
  row({
    id: "people-i-help",
    featureName: "People I Help",
    category: "Business Estate",
    userPurpose: "Know who you serve and keep relationship memory",
    welcomeHomeDestination: "people-i-help",
    estateExperienceId: "business",
    estateSpaceId: "round-table",
    conversationIntelligenceRequirements: "CIE; HCV; Spec 112 memory permission",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_started",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["business-estate"],
    notes: "",
  }),
  row({
    id: "projects",
    featureName: "Projects",
    category: "Projects",
    userPurpose: "Keep active work findable and moving",
    welcomeHomeDestination: "goals-projects",
    estateExperienceId: "momentum",
    estateSpaceId: "goals-projects",
    conversationIntelligenceRequirements: "CIE for project talk; HCV",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_started",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["shared-cie"],
    notes: "",
  }),

  // —— Journal / Evidence / Discovery ——
  row({
    id: "journal",
    featureName: "Journal Gazebo",
    category: "Journal",
    userPurpose: "Capture reflection without pressure",
    welcomeHomeDestination: "journal",
    estateExperienceId: "journal",
    estateSpaceId: "journal",
    conversationIntelligenceRequirements: "CIE reflective mode; HCV; silence valid",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_started",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["shared-cie"],
    notes: "",
  }),
  row({
    id: "evidence-vault",
    featureName: "Evidence Vault",
    category: "Evidence Vault",
    userPurpose: "Find proof of progress and keep growth visible",
    welcomeHomeDestination: "evidence-vault",
    estateExperienceId: "grow",
    estateSpaceId: "evidence-vault",
    conversationIntelligenceRequirements: "CIE retrieval language; HCV",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_started",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: [],
    notes: "Clarity over mystery locks",
  }),
  row({
    id: "hall-of-accomplishments",
    featureName: "Hall of Accomplishments",
    category: "Evidence Vault",
    userPurpose: "Quietly celebrate real wins",
    welcomeHomeDestination: "portfolio",
    estateExperienceId: "grow",
    estateSpaceId: "evidence-vault",
    conversationIntelligenceRequirements: "Warm HCV; no gamification",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_applicable",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["evidence-vault"],
    notes: "",
  }),
  row({
    id: "discovery-engine",
    featureName: "Discovery Engine",
    category: "Discovery",
    userPurpose: "Understand goal/obstacle before routing",
    welcomeHomeDestination: "homestead",
    estateExperienceId: "explore",
    estateSpaceId: "homestead",
    conversationIntelligenceRequirements: "CIE discovery mode; HCV",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_started",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["shared-cie"],
    notes: "",
  }),
  row({
    id: "estate-guidebook",
    featureName: "Estate Guidebook",
    category: "Discovery",
    userPurpose: "Learn the Estate as a physical book, not a help center",
    welcomeHomeDestination: "homestead",
    estateExperienceId: "explore",
    estateSpaceId: "homestead",
    conversationIntelligenceRequirements: "Optional CIE; HCV on spoken guidance",
    cieIntegration: "not_applicable",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_applicable",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: [],
    notes: "Physical book UX — Bible Ch 10–17",
  }),
  row({
    id: "explore-estate",
    featureName: "Explore Estate / Map",
    category: "Discovery",
    userPurpose: "Optional browse; never required for daily help",
    welcomeHomeDestination: "homestead",
    estateExperienceId: "explore",
    estateSpaceId: "homestead",
    conversationIntelligenceRequirements: "Coaching before navigation",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_applicable",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["welcome-home"],
    notes: "Browse only — not primary daily path",
  }),

  // —— Clear My Mind / Parking Lot ——
  row({
    id: "clear-my-mind",
    featureName: "Clear My Mind",
    category: "Clear My Mind",
    userPurpose: "Capture swirling thoughts without organizing yet",
    welcomeHomeDestination: "clear-my-mind",
    estateExperienceId: "restore",
    estateSpaceId: "clear-my-mind",
    conversationIntelligenceRequirements: "Preserve originalText; HCV; relief voice",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_started",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["parking-lot"],
    notes: "Capture ≠ organize",
  }),
  row({
    id: "parking-lot",
    featureName: "Parking Lot",
    category: "Parking Lot",
    userPurpose: "Hold items safely until ready; never permanent loading",
    welcomeHomeDestination: "parking-lot",
    estateExperienceId: "momentum",
    estateSpaceId: "goals-projects",
    conversationIntelligenceRequirements: "Load states resolve; HCV on copy",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_applicable",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: [],
    notes: "Phase 1 reliability — loading never permanent",
  }),

  // —— Search / How Do I / Navigation / Settings ——
  row({
    id: "search",
    featureName: "Search",
    category: "Search",
    userPurpose: "Find what you already created without remembering folders",
    welcomeHomeDestination: null,
    estateExperienceId: "explore",
    estateSpaceId: null,
    conversationIntelligenceRequirements: "Conversational retrieval preferred",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_applicable",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: [],
    notes: "",
  }),
  row({
    id: "how-do-i",
    featureName: "How Do I…",
    category: "How Do I…",
    userPurpose: "Ask how to do something; Shari guides without menus",
    welcomeHomeDestination: null,
    estateExperienceId: "explore",
    estateSpaceId: null,
    conversationIntelligenceRequirements: "CIE + HCV; Guidebook as object when helpful",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_started",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["estate-guidebook", "shared-cie"],
    notes: "Legacy How Do I menu → conversation + Guidebook",
  }),
  row({
    id: "folded-map",
    featureName: "Folded Estate Map",
    category: "Navigation",
    userPurpose: "Pause conversation and move without destroying context",
    welcomeHomeDestination: null,
    estateExperienceId: "explore",
    estateSpaceId: "homestead",
    conversationIntelligenceRequirements: "Conversation travels; never restart",
    cieIntegration: "not_applicable",
    hcvStatus: "not_applicable",
    goldStandardCoverage: "not_applicable",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: [],
    notes: "Spec 108 / 109",
  }),
  row({
    id: "universal-return",
    featureName: "Universal Return / Context",
    category: "Navigation",
    userPurpose: "Leave a side path and return without losing place",
    welcomeHomeDestination: "welcome-home",
    estateExperienceId: null,
    estateSpaceId: null,
    conversationIntelligenceRequirements: "Preserve context; no software labels",
    cieIntegration: "not_applicable",
    hcvStatus: "not_applicable",
    goldStandardCoverage: "not_applicable",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["welcome-home"],
    notes: "",
  }),
  row({
    id: "settings",
    featureName: "Settings",
    category: "Settings",
    userPurpose: "Adjust preferences without leaving the relationship tone",
    welcomeHomeDestination: "settings",
    estateExperienceId: null,
    estateSpaceId: null,
    conversationIntelligenceRequirements: "HCV on any Shari copy",
    cieIntegration: "not_applicable",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_applicable",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["profile"],
    notes: "",
  }),
  row({
    id: "profile",
    featureName: "Profile",
    category: "Settings",
    userPurpose: "Own your business and personal context",
    welcomeHomeDestination: "profile",
    estateExperienceId: "business",
    estateSpaceId: null,
    conversationIntelligenceRequirements: "CIE for guided builders; HCV",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_started",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: [],
    notes: "",
  }),

  // —— Shared Conversation Services ——
  row({
    id: "shared-cie",
    featureName: "Conversation Intelligence Engine",
    category: "Shared Conversation Services",
    userPurpose: "One shared brain for conversational experiences",
    welcomeHomeDestination: null,
    estateExperienceId: null,
    estateSpaceId: null,
    conversationIntelligenceRequirements: "Canonical runtime order (210)",
    cieIntegration: "complete",
    hcvStatus: "complete",
    goldStandardCoverage: "partial",
    uiStatus: "not_applicable",
    backendStatus: "complete",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["topic-anchor", "hcv", "gold-library"],
    notes: "Stabilized f0a36e7c; not all experiences consume yet",
  }),
  row({
    id: "hcv",
    featureName: "Human Conversation Validator",
    category: "Shared Conversation Services",
    userPurpose: "Block artificial / off-topic responses before delivery",
    welcomeHomeDestination: null,
    estateExperienceId: null,
    estateSpaceId: null,
    conversationIntelligenceRequirements: "Required gate on conversational routes",
    cieIntegration: "complete",
    hcvStatus: "complete",
    goldStandardCoverage: "not_applicable",
    uiStatus: "not_applicable",
    backendStatus: "complete",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["shared-cie"],
    notes: "Wired on TIO (+ Create polish may be local uncommitted)",
  }),
  row({
    id: "topic-anchor",
    featureName: "Topic Continuity & Anchor",
    category: "Shared Conversation Services",
    userPurpose: "Keep the member's real topic; background ≠ topic",
    welcomeHomeDestination: null,
    estateExperienceId: null,
    estateSpaceId: null,
    conversationIntelligenceRequirements: "TCAI + package 208 discipline",
    cieIntegration: "complete",
    hcvStatus: "complete",
    goldStandardCoverage: "partial",
    uiStatus: "not_applicable",
    backendStatus: "complete",
    routingStatus: "complete",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["shared-cie"],
    notes: "",
  }),
  row({
    id: "shari-global",
    featureName: "Shari Global Conversation",
    category: "Shared Conversation Services",
    userPurpose: "Talk with Shari anywhere in the Estate",
    welcomeHomeDestination: "welcome-home",
    estateExperienceId: null,
    estateSpaceId: null,
    conversationIntelligenceRequirements: "Must route through CIE + HCV",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_started",
    uiStatus: "complete",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["shared-cie", "hcv"],
    notes: "Roadmap priority 5 — companion-chat bypass",
  }),
  row({
    id: "reminders-rhythms",
    featureName: "Reminders & Rhythms",
    category: "Shared Conversation Services",
    userPurpose: "Gentle timing without streak pressure",
    welcomeHomeDestination: "plan-my-day",
    estateExperienceId: "momentum",
    estateSpaceId: null,
    conversationIntelligenceRequirements: "HCV on copy; CIE when conversational",
    cieIntegration: "not_started",
    hcvStatus: "not_started",
    goldStandardCoverage: "not_applicable",
    uiStatus: "partial",
    backendStatus: "partial",
    routingStatus: "partial",
    authenticatedTesting: "not_started",
    productionReadiness: "not_started",
    dependencies: ["plan-my-day"],
    notes: "",
  }),

  // —— Intelligence Libraries ——
  row({
    id: "gold-library",
    featureName: "Gold Standard Conversation Library",
    category: "Intelligence Libraries",
    userPurpose: "Certified examples guide quality — never verbatim scripts",
    welcomeHomeDestination: null,
    estateExperienceId: null,
    estateSpaceId: null,
    conversationIntelligenceRequirements: "Certified before runtime use (213)",
    cieIntegration: "complete",
    hcvStatus: "not_applicable",
    goldStandardCoverage: "partial",
    uiStatus: "not_applicable",
    backendStatus: "partial",
    routingStatus: "complete",
    authenticatedTesting: "not_applicable",
    productionReadiness: "not_started",
    dependencies: ["shared-cie"],
    notes: "Target 300–500; batch 1–2 live",
  }),
  row({
    id: "conversation-design-patterns",
    featureName: "Conversation Design Patterns",
    category: "Intelligence Libraries",
    userPurpose: "Shared CDP patterns across experiences",
    welcomeHomeDestination: null,
    estateExperienceId: null,
    estateSpaceId: null,
    conversationIntelligenceRequirements: "Register new patterns before use",
    cieIntegration: "partial",
    hcvStatus: "not_applicable",
    goldStandardCoverage: "partial",
    uiStatus: "not_applicable",
    backendStatus: "partial",
    routingStatus: "not_applicable",
    authenticatedTesting: "not_applicable",
    productionReadiness: "not_started",
    dependencies: ["shared-cie"],
    notes: "Package 207",
  }),
  row({
    id: "adhd-intelligence-library",
    featureName: "ADHD Intelligence Library",
    category: "Intelligence Libraries",
    userPurpose: "Inform companion judgment without labeling the member",
    welcomeHomeDestination: null,
    estateExperienceId: null,
    estateSpaceId: null,
    conversationIntelligenceRequirements: "Observations only; never shame",
    cieIntegration: "not_applicable",
    hcvStatus: "not_applicable",
    goldStandardCoverage: "not_applicable",
    uiStatus: "not_applicable",
    backendStatus: "partial",
    routingStatus: "not_applicable",
    authenticatedTesting: "not_applicable",
    productionReadiness: "not_started",
    dependencies: [],
    notes: "Invisible to members",
  }),
];

export function getMasterFeature(id: string): MasterFeatureRecord | undefined {
  return MASTER_FEATURE_REGISTRY.find((r) => r.id === id);
}

export function listMasterFeaturesByCategory(
  category: MasterFeatureCategory,
): MasterFeatureRecord[] {
  return MASTER_FEATURE_REGISTRY.filter((r) => r.category === category);
}

export function listFeaturesNotProductionReady(): MasterFeatureRecord[] {
  return MASTER_FEATURE_REGISTRY.filter(
    (r) => !meetsDefinitionOfComplete(r) && r.productionReadiness !== "complete",
  );
}

export function assertRegisteredForProduction(featureId: string): {
  ok: boolean;
  reason: string;
} {
  const feature = getMasterFeature(featureId);
  if (!feature) {
    return {
      ok: false,
      reason: `Feature "${featureId}" is not in MASTER_FEATURE_REGISTRY — cannot ship`,
    };
  }
  if (!meetsDefinitionOfComplete(feature)) {
    return {
      ok: false,
      reason: `Feature "${featureId}" does not meet Definition of Complete`,
    };
  }
  return { ok: true, reason: "registered and complete" };
}

export type MasterFeatureRegistrySnapshot = {
  total: number;
  byCategory: Record<string, number>;
  cieComplete: number;
  hcvComplete: number;
  productionReady: number;
  notProductionReady: number;
};

export function getMasterFeatureRegistrySnapshot(): MasterFeatureRegistrySnapshot {
  const byCategory: Record<string, number> = {};
  for (const cat of MASTER_FEATURE_CATEGORIES) {
    byCategory[cat] = 0;
  }
  let cieComplete = 0;
  let hcvComplete = 0;
  let productionReady = 0;
  for (const r of MASTER_FEATURE_REGISTRY) {
    byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
    if (r.cieIntegration === "complete") cieComplete += 1;
    if (r.hcvStatus === "complete") hcvComplete += 1;
    if (r.productionReadiness === "complete") productionReady += 1;
  }
  return {
    total: MASTER_FEATURE_REGISTRY.length,
    byCategory,
    cieComplete,
    hcvComplete,
    productionReady,
    notProductionReady: MASTER_FEATURE_REGISTRY.length - productionReady,
  };
}
