/**
 * Spark Estate™ — architecture implementation mapping and integration (Phase 13).
 * Connects Phases 1–17 and 24 to the existing codebase without duplicate systems.
 *
 * @see docs/protocols/SPARK_ESTATE_ARCHITECTURE_IMPLEMENTATION_MAPPING_AND_INTEGRATION_PLAN_PHASE13.md
 */

import { runChamberFinalDemoChecklist } from "./chamber/chamberFinalDemoChecklist";
import {
  CHAMBER_USES_UNIVERSAL_ESTATE_COMPLETION_SYSTEM,
  CHAMBER_USES_UNIVERSAL_ESTATE_CREATION_JOURNEY,
} from "./chamber/chamberMemberJourney";
import { verifySparkEstateCompletionSystem } from "@/lib/universalCreation/sparkEstateCompletionSystem";
import { verifySparkEstateCreationJourney } from "@/lib/universalCreation/sparkEstateCreationJourney";
import { verifySparkEstateIntelligenceRouting } from "./sparkEstateIntelligenceRoutingMap";
import { verifySparkEstateMemberProfile } from "./sparkEstateMemberProfileEngine";
import { verifySparkEstateCardEcosystem } from "./sparkEstateCardEcosystem";
import { verifySparkEstateConversationEngine } from "./sparkEstateConversationEngine";
import { verifySparkEstateDailyCompanionExperience } from "./sparkEstateDailyCompanionExperience";
import { verifySparkEstateFileAndDataArchitecture } from "./sparkEstateFileAndDataArchitectureMap";
import { verifySparkEstateKnowledgeAndAssetLibrary } from "./sparkEstateKnowledgeAndAssetLibraryArchitecture";
import { verifySparkEstateOnboardingAndFirst7Days } from "./sparkEstateOnboardingAndFirst7DaysExperience";
import { verifySparkEstateRoomBlueprintTemplate } from "./sparkEstateRoomBlueprintTemplate";
import { verifySparkEstateRoomIntelligenceArchitecture } from "./sparkEstateRoomIntelligenceArchitecture";
import { verifySparkEstateAiPromptAndIntelligenceLayerArchitecture } from "./sparkEstateAiPromptAndIntelligenceLayerArchitecture";
import { verifySparkEstateAnalyticsAndLearningSystem } from "./sparkEstateAnalyticsAndLearningSystem";
import { verifySparkEstateSystemGovernanceAndQualityStandards } from "./sparkEstateSystemGovernanceAndQualityStandards";
import { verifySparkEstateTopNavigationAndProfileMenu } from "./sparkEstateTopNavigationAndProfileMenu";
import { verifySparkEstateExpertTeamAndChamberMemberCollaboration } from "./sparkEstateExpertTeamAndChamberMemberCollaborationArchitecture";
import { verifySparkEstateUniversalProjectWorkspaceArchitecture } from "./sparkEstateUniversalProjectWorkspaceArchitecture";
import { verifySparkEstateFounderIntelligenceDashboard } from "./sparkEstateFounderIntelligenceDashboard";
import { verifySparkEstateIntelligentWorkspaceRecommendationSystem } from "./sparkEstateIntelligentWorkspaceRecommendationSystem";
import { verifySparkEstateIntelligentProjectLifecycleEngine } from "./sparkEstateIntelligentProjectLifecycleEngine";
import { verifySparkEstateMasterOperatingDocument } from "./sparkEstateMasterOperatingDocument";
import { verifySparkEstateUserJourneyAndMemberLifecycle } from "./sparkEstateUserJourneyAndMemberLifecycleArchitecture";

export type SparkEstateImplementationPriority = 1 | 2 | 3;

export type SparkEstateImplementationStatus =
  | "implemented"
  | "partial"
  | "missing"
  | "consolidate";

export type SparkEstateArchitectureDomain =
  | "companion-intelligence"
  | "room-architecture"
  | "universal-creation"
  | "member-context"
  | "intelligence-routing"
  | "card-system"
  | "completion-system"
  | "navigation"
  | "data-integration";

export type SparkEstatePhaseMapping = {
  phase: number;
  spec: string;
  title: string;
  implementations: readonly string[];
  status: SparkEstateImplementationStatus;
  priority: SparkEstateImplementationPriority;
  dependencies?: readonly number[];
};

export type SparkEstateArchitectureEntry = {
  id: string;
  domain: SparkEstateArchitectureDomain;
  label: string;
  existing: string;
  location: string;
  status: SparkEstateImplementationStatus;
  priority: SparkEstateImplementationPriority;
  requiredChanges?: string;
  dependencies?: readonly string[];
};

export type SparkEstateIntegrationAssessment = {
  existing: SparkEstateArchitectureEntry[];
  missing: SparkEstateArchitectureEntry[];
  conflicting: SparkEstateArchitectureEntry[];
  recommendedOrder: string[];
  phasesAligned: boolean;
  chamberDemoReady: boolean;
  creationJourneyAligned: boolean;
  completionSystemAligned: boolean;
  chamberUsesEstateJourneys: boolean;
  intelligenceRoutingAligned: boolean;
  memberProfileAligned: boolean;
  cardEcosystemAligned: boolean;
  conversationEngineAligned: boolean;
  dailyCompanionAligned: boolean;
  productionReadinessAligned: boolean;
  fileAndDataArchitectureAligned: boolean;
  knowledgeLibraryAligned: boolean;
  onboardingFirstWeekAligned: boolean;
  roomBlueprintAligned: boolean;
  roomIntelligenceAligned: boolean;
  systemGovernanceAligned: boolean;
  topNavigationAligned: boolean;
  memberLifecycleAligned: boolean;
  analyticsAndLearningAligned: boolean;
  aiPromptIntelligenceLayerAligned: boolean;
  masterOperatingDocumentAligned: boolean;
  founderIntelligenceDashboardAligned: boolean;
  intelligentWorkspaceRecommendationAligned: boolean;
  intelligentProjectLifecycleAligned: boolean;
  expertTeamCollaborationAligned: boolean;
  universalProjectWorkspaceAligned: boolean;
};

export const SPARK_ESTATE_IMPLEMENTATION_PRINCIPLE =
  "Do not rebuild what already works. Align — do not duplicate.";

export const SPARK_ESTATE_ECOSYSTEM_VISION =
  "One companion. Many rooms. One creation journey. Personalized support.";

export const SPARK_ESTATE_PHASE_MAPPINGS: readonly SparkEstatePhaseMapping[] = [
  {
    phase: 1,
    spec: "CHAMBER_OF_MOMENTUM_IDENTITY_CONSOLIDATION_FIX_PHASE1.md",
    title: "Chamber identity consolidation",
    implementations: [
      "lib/estate/chamberOfMomentumIdentity.ts",
      "lib/workspaceMode.ts",
      "lib/sparkNote/sparkNoteDestinations.ts",
    ],
    status: "implemented",
    priority: 1,
  },
  {
    phase: 2,
    spec: "CHAMBER_OF_MOMENTUM_ROUTING_AND_EXPERIENCE_ALIGNMENT_PHASE2.md",
    title: "Chamber routing and experience",
    implementations: [
      "lib/estate/chamberOfMomentumRouting.ts",
      "components/companion/chamber/ChamberOfMomentumEntryPanel.tsx",
      "app/companion/CompanionPageClient.tsx",
    ],
    status: "implemented",
    priority: 1,
    dependencies: [1],
  },
  {
    phase: 3,
    spec: "CHAMBER_OF_MOMENTUM_ENTRY_EXPERIENCE_SPECIFICATION_PHASE3.md",
    title: "Chamber entry experience",
    implementations: [
      "components/companion/chamber/ChamberOfMomentumRoomShell.tsx",
      "components/companion/chamber/ChamberOfMomentumEntryPanel.tsx",
    ],
    status: "implemented",
    priority: 1,
    dependencies: [2],
  },
  {
    phase: 4,
    spec: "CHAMBER_OF_MOMENTUM_PROJECT_ENGINE_SPECIFICATION_PHASE4.md",
    title: "Chamber project engine",
    implementations: [
      "lib/estate/chamberProjectEngine.ts",
      "components/companion/chamber/ChamberProjectEntryPanel.tsx",
    ],
    status: "implemented",
    priority: 2,
    dependencies: [2],
  },
  {
    phase: 5,
    spec: "CHAMBER_OF_MOMENTUM_INTELLIGENCE_DECISION_LOGIC_SPECIFICATION_PHASE5.md",
    title: "Chamber intelligence routing",
    implementations: [
      "lib/estate/chamberOfMomentumIntelligence.ts",
      "app/companion/CompanionPageClient.tsx",
    ],
    status: "implemented",
    priority: 2,
    dependencies: [2],
  },
  {
    phase: 6,
    spec: "CHAMBER_OF_MOMENTUM_DATA_AND_MEMORY_ARCHITECTURE_SPECIFICATION_PHASE6.md",
    title: "Chamber memory architecture",
    implementations: ["lib/estate/chamberOfMomentumMemory.ts"],
    status: "implemented",
    priority: 2,
    dependencies: [4],
  },
  {
    phase: 7,
    spec: "CHAMBER_OF_MOMENTUM_DEMO_EXPERIENCE_AND_VISUAL_ROOM_SPECIFICATION_PHASE7.md",
    title: "Chamber demo room experience",
    implementations: [
      "lib/estate/chamber/chamberOfMomentumRoomRegistry.ts",
      "lib/estate/chamberRoomExperience.ts",
      "components/companion/chamber/ChamberMomentumPathArea.tsx",
    ],
    status: "implemented",
    priority: 1,
    dependencies: [3],
  },
  {
    phase: 8,
    spec: "CHAMBER_OF_MOMENTUM_DEMO_DATA_AND_CONTENT_PREPARATION_SPECIFICATION_PHASE8.md",
    title: "Chamber demo data",
    implementations: [
      "lib/estate/chamber/seedChamberDemoData.ts",
      "lib/estate/chamber/chamberDemoMode.ts",
    ],
    status: "implemented",
    priority: 1,
    dependencies: [7],
  },
  {
    phase: 9,
    spec: "CHAMBER_OF_MOMENTUM_FINAL_DEMO_CHECKLIST_AND_PRIORITY_FIX_ORDER_PHASE9.md",
    title: "Chamber demo checklist",
    implementations: ["lib/estate/chamber/chamberFinalDemoChecklist.ts"],
    status: "implemented",
    priority: 1,
    dependencies: [1, 7, 8],
  },
  {
    phase: 10,
    spec: "CHAMBER_OF_MOMENTUM_END_TO_END_MEMBER_JOURNEY_AND_INTELLIGENCE_FLOW_PHASE10.md",
    title: "Chamber end-to-end journey",
    implementations: [
      "lib/estate/chamber/chamberMemberJourney.ts",
      "components/companion/chamber/ChamberMomentumCard.tsx",
    ],
    status: "implemented",
    priority: 2,
    dependencies: [5, 6],
  },
  {
    phase: 11,
    spec: "SPARK_ESTATE_UNIVERSAL_CREATION_JOURNEY_AND_SHARI_EXPERIENCE_PHASE11.md",
    title: "Universal creation journey + Shari voice",
    implementations: [
      "lib/universalCreation/sparkEstateCreationJourney.ts",
      "lib/universalCreation/shariCreationExperience.ts",
      "lib/universalCreation/orchestrator.ts",
    ],
    status: "implemented",
    priority: 2,
  },
  {
    phase: 12,
    spec: "SPARK_ESTATE_UNIVERSAL_COMPLETION_AND_OUTPUT_SYSTEM_SPECIFICATION_PHASE12.md",
    title: "Universal completion and output",
    implementations: [
      "lib/universalCreation/sparkEstateCompletionSystem.ts",
      "lib/universalCreation/guidedCreationFlow.ts",
      "lib/universalCreation/phases.ts",
    ],
    status: "implemented",
    priority: 2,
    dependencies: [11],
  },
  {
    phase: 13,
    spec: "SPARK_ESTATE_ARCHITECTURE_IMPLEMENTATION_MAPPING_AND_INTEGRATION_PLAN_PHASE13.md",
    title: "Architecture mapping and integration",
    implementations: ["lib/estate/sparkEstateArchitectureMap.ts"],
    status: "implemented",
    priority: 1,
    dependencies: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  {
    phase: 14,
    spec: "SPARK_ESTATE_INTELLIGENCE_ROUTING_MAP_SPECIFICATION_PHASE14.md",
    title: "Intelligence routing map",
    implementations: ["lib/estate/sparkEstateIntelligenceRoutingMap.ts"],
    status: "implemented",
    priority: 2,
    dependencies: [5, 10, 11, 13],
  },
  {
    phase: 15,
    spec: "SPARK_ESTATE_MEMBER_PROFILE_AND_PERSONALIZATION_ENGINE_SPECIFICATION_PHASE15.md",
    title: "Member profile and personalization",
    implementations: ["lib/estate/sparkEstateMemberProfileEngine.ts"],
    status: "implemented",
    priority: 2,
    dependencies: [6, 11, 14],
  },
  {
    phase: 16,
    spec: "SPARK_ESTATE_CARD_ECOSYSTEM_SPECIFICATION_PHASE16.md",
    title: "Card ecosystem",
    implementations: ["lib/estate/sparkEstateCardEcosystem.ts"],
    status: "implemented",
    priority: 2,
    dependencies: [7, 14, 15],
  },
  {
    phase: 17,
    spec: "SPARK_ESTATE_CONVERSATION_ENGINE_AND_SHARI_VOICE_SPECIFICATION_PHASE17.md",
    title: "Conversation engine and Shari voice",
    implementations: [
      "lib/estate/sparkEstateConversationEngine.ts",
      "lib/conversation/shariCompanionEngine.ts",
      "lib/universalCreation/shariCreationExperience.ts",
    ],
    status: "implemented",
    priority: 2,
    dependencies: [11, 15, 16],
  },
  {
    phase: 18,
    spec: "SPARK_ESTATE_ROOM_INTELLIGENCE_ARCHITECTURE_SPECIFICATION_PHASE18.md",
    title: "Room intelligence architecture",
    implementations: ["lib/estate/sparkEstateRoomIntelligenceArchitecture.ts"],
    status: "implemented",
    priority: 2,
    dependencies: [14, 15, 16, 17],
  },
  {
    phase: 19,
    spec: "SPARK_ESTATE_KNOWLEDGE_AND_ASSET_LIBRARY_ARCHITECTURE_SPECIFICATION_PHASE19.md",
    title: "Knowledge and asset library architecture",
    implementations: ["lib/estate/sparkEstateKnowledgeAndAssetLibraryArchitecture.ts"],
    status: "implemented",
    priority: 2,
    dependencies: [11, 12, 16],
  },
  {
    phase: 20,
    spec: "SPARK_ESTATE_USER_JOURNEY_AND_MEMBER_LIFECYCLE_ARCHITECTURE_PHASE20.md",
    title: "User journey and member lifecycle architecture",
    implementations: [
      "lib/estate/sparkEstateUserJourneyAndMemberLifecycleArchitecture.ts",
    ],
    status: "implemented",
    priority: 2,
    dependencies: [11, 15, 23, 24],
  },
  {
    phase: 21,
    spec: "SPARK_ESTATE_SYSTEM_GOVERNANCE_AND_QUALITY_STANDARDS_SPECIFICATION_PHASE21.md",
    title: "System governance and quality standards",
    implementations: ["lib/estate/sparkEstateSystemGovernanceAndQualityStandards.ts"],
    status: "implemented",
    priority: 2,
    dependencies: [11, 14, 16, 17, 18, 27],
  },
  {
    phase: 22,
    spec: "SPARK_ESTATE_ANALYTICS_AND_LEARNING_SYSTEM_SPECIFICATION_PHASE22.md",
    title: "Analytics and learning system",
    implementations: ["lib/estate/sparkEstateAnalyticsAndLearningSystem.ts"],
    status: "implemented",
    priority: 2,
    dependencies: [11, 15, 16, 20, 21, 27],
  },
  {
    phase: 23,
    spec: "SPARK_ESTATE_ONBOARDING_AND_FIRST_7_DAYS_EXPERIENCE_SPECIFICATION_PHASE23.md",
    title: "Onboarding and first 7 days experience",
    implementations: ["lib/estate/sparkEstateOnboardingAndFirst7DaysExperience.ts"],
    status: "implemented",
    priority: 2,
    dependencies: [15, 16, 17],
  },
  {
    phase: 24,
    spec: "SPARK_ESTATE_DAILY_COMPANION_EXPERIENCE_SPECIFICATION_PHASE24.md",
    title: "Daily companion experience",
    implementations: ["lib/estate/sparkEstateDailyCompanionExperience.ts"],
    status: "implemented",
    priority: 2,
    dependencies: [14, 15, 16, 17, 23],
  },
  {
    phase: 25,
    spec: "SPARK_ESTATE_ROOM_BLUEPRINT_TEMPLATE_SPECIFICATION_PHASE25.md",
    title: "Room blueprint template",
    implementations: ["lib/estate/sparkEstateRoomBlueprintTemplate.ts"],
    status: "implemented",
    priority: 2,
    dependencies: [11, 16, 17, 19, 27],
  },
  {
    phase: 26,
    spec: "SPARK_ESTATE_AI_PROMPT_AND_INTELLIGENCE_LAYER_ARCHITECTURE_PHASE26.md",
    title: "AI prompt and intelligence layer architecture",
    implementations: ["lib/estate/sparkEstateAiPromptAndIntelligenceLayerArchitecture.ts"],
    status: "implemented",
    priority: 2,
    dependencies: [11, 14, 15, 17, 18, 19],
  },
  {
    phase: 27,
    spec: "SPARK_ESTATE_FILE_AND_DATA_ARCHITECTURE_MAP_SPECIFICATION_PHASE27.md",
    title: "File and data architecture map",
    implementations: ["lib/estate/sparkEstateFileAndDataArchitectureMap.ts"],
    status: "implemented",
    priority: 2,
    dependencies: [6, 11, 12, 15, 16],
  },
  {
    phase: 28,
    spec: "SPARK_ESTATE_DEMO_TO_PRODUCTION_READINESS_CHECKLIST_PHASE28.md",
    title: "Demo-to-production readiness checklist",
    implementations: ["lib/estate/sparkEstateProductionReadinessChecklist.ts"],
    status: "implemented",
    priority: 1,
    dependencies: [9, 11, 12, 14, 15, 16, 17, 24],
  },
  {
    phase: 29,
    spec: "SPARK_ESTATE_MASTER_OPERATING_DOCUMENT_SPECIFICATION_PHASE29.md",
    title: "Master operating document",
    implementations: ["lib/estate/sparkEstateMasterOperatingDocument.ts"],
    status: "implemented",
    priority: 1,
    dependencies: [11, 17, 18, 20, 21, 26, 27, 28],
  },
  {
    phase: 30,
    spec: "SPARK_ESTATE_FOUNDER_INTELLIGENCE_DASHBOARD_SPECIFICATION_PHASE30.md",
    title: "Founder intelligence dashboard",
    implementations: [
      "lib/estate/sparkEstateFounderIntelligenceDashboard.ts",
      "components/founderStudio/FounderExecutiveIntelligence.tsx",
      "lib/founder/intelligence/services/intelligenceService.ts",
    ],
    status: "implemented",
    priority: 1,
    dependencies: [20, 22, 23, 24, 29],
  },
  {
    phase: 31,
    spec: "SPARK_ESTATE_INTELLIGENT_WORKSPACE_RECOMMENDATION_SYSTEM_SPECIFICATION_PHASE31.md",
    title: "Intelligent workspace recommendation system",
    implementations: [
      "lib/estate/sparkEstateIntelligentWorkspaceRecommendationSystem.ts",
      "lib/estate/sparkEstateIntelligenceRoutingMap.ts",
      "lib/estate/sparkEstateRoomIntelligenceArchitecture.ts",
      "lib/universalCreation/sparkEstateCreationJourney.ts",
    ],
    status: "implemented",
    priority: 1,
    dependencies: [11, 14, 18, 29],
  },
  {
    phase: 32,
    spec: "SPARK_ESTATE_INTELLIGENT_PROJECT_LIFECYCLE_ENGINE_SPECIFICATION_PHASE32.md",
    title: "Intelligent project lifecycle engine",
    implementations: [
      "lib/estate/sparkEstateIntelligentProjectLifecycleEngine.ts",
      "lib/estate/chamberProjectEngine.ts",
      "lib/estate/chamberProjectMeta.ts",
      "lib/estate/sparkEstateCardEcosystem.ts",
    ],
    status: "implemented",
    priority: 1,
    dependencies: [4, 6, 11, 16, 20, 31],
  },
  {
    phase: 33,
    spec: "SPARK_ESTATE_EXPERT_TEAM_AND_CHAMBER_MEMBER_COLLABORATION_ARCHITECTURE_PHASE33.md",
    title: "Expert team and chamber member collaboration",
    implementations: [
      "lib/estate/sparkEstateExpertTeamAndChamberMemberCollaborationArchitecture.ts",
      "lib/estate/sparkEstateIntelligenceRoutingMap.ts",
      "lib/estate/sparkEstateRoomIntelligenceArchitecture.ts",
      "lib/estate/chamber/chamberMemberJourney.ts",
    ],
    status: "implemented",
    priority: 1,
    dependencies: [10, 14, 17, 18, 22, 32],
  },
  {
    phase: 34,
    spec: "SPARK_ESTATE_UNIVERSAL_PROJECT_WORKSPACE_ARCHITECTURE_REFINEMENT_SPECIFICATION_PHASE34.md",
    title: "Universal project workspace architecture",
    implementations: [
      "lib/estate/sparkEstateUniversalProjectWorkspaceArchitecture.ts",
      "lib/estate/chamberProjectEngine.ts",
      "lib/companionStore.ts",
      "lib/estate/sparkEstateIntelligentProjectLifecycleEngine.ts",
      "lib/universalCreation/sparkEstateCreationJourney.ts",
    ],
    status: "implemented",
    priority: 1,
    dependencies: [4, 6, 11, 16, 20, 32, 33],
  },
] as const;

export const SPARK_ESTATE_ARCHITECTURE_ENTRIES: readonly SparkEstateArchitectureEntry[] = [
  {
    id: "companion-shari-voice",
    domain: "companion-intelligence",
    label: "Shari companion voice",
    existing: "Estate conversation engine + Shari Companion Engine + creation tone",
    location:
      "lib/estate/sparkEstateConversationEngine.ts, lib/conversation/shariCompanionEngine.ts, lib/universalCreation/shariCreationExperience.ts",
    status: "implemented",
    priority: 2,
  },
  {
    id: "companion-daily-experience",
    domain: "companion-intelligence",
    label: "Daily companion experience",
    existing: "Daily arrival, focus question, intelligence selection, completion rhythm",
    location: "lib/estate/sparkEstateDailyCompanionExperience.ts",
    status: "implemented",
    priority: 2,
    dependencies: [
      "member-profile-personalization",
      "card-ecosystem",
      "routing-estate-map",
    ],
  },
  {
    id: "governance-quality-standards",
    domain: "companion-intelligence",
    label: "System governance and quality standards",
    existing: "Source-of-truth owners, duplicate prevention, new feature checklist",
    location: "lib/estate/sparkEstateSystemGovernanceAndQualityStandards.ts",
    status: "implemented",
    priority: 2,
    dependencies: [
      "creation-universal-journey",
      "routing-estate-map",
      "card-ecosystem",
      "data-architecture-map",
    ],
  },
  {
    id: "analytics-learning-system",
    domain: "data-integration",
    label: "Analytics and learning system",
    existing: "Seven analytics categories, local-first signals, founder reporting, friction detection",
    location: "lib/estate/sparkEstateAnalyticsAndLearningSystem.ts",
    status: "implemented",
    priority: 2,
    dependencies: [
      "card-ecosystem",
      "member-lifecycle-architecture",
      "data-architecture-map",
      "governance-quality-standards",
    ],
  },
  {
    id: "ai-prompt-intelligence-layers",
    domain: "companion-intelligence",
    label: "AI prompt and intelligence layer architecture",
    existing: "Seven intelligence layers, prompt structure, conversation priority, quality test",
    location: "lib/estate/sparkEstateAiPromptAndIntelligenceLayerArchitecture.ts",
    status: "implemented",
    priority: 2,
    dependencies: [
      "companion-shari-voice",
      "member-profile-personalization",
      "routing-estate-map",
      "room-intelligence-architecture",
      "creation-universal-journey",
      "card-knowledge-library",
    ],
  },
  {
    id: "master-operating-document",
    domain: "companion-intelligence",
    label: "Master operating document",
    existing: "Single operating view — identity, promise, philosophies, quality standard",
    location: "lib/estate/sparkEstateMasterOperatingDocument.ts",
    status: "implemented",
    priority: 1,
    dependencies: [
      "companion-shari-voice",
      "creation-universal-journey",
      "member-lifecycle-architecture",
      "governance-quality-standards",
      "ai-prompt-intelligence-layers",
    ],
  },
  {
    id: "companion-frictionless-create",
    domain: "companion-intelligence",
    label: "Frictionless creation routing",
    existing: "Universal Creation orchestrator in frictionless layer",
    location: "lib/frictionlessActionLayer.ts, lib/universalCreation/orchestrator.ts",
    status: "implemented",
    priority: 2,
  },
  {
    id: "room-chamber-identity",
    domain: "room-architecture",
    label: "Chamber of Momentum™ room identity",
    existing: "Identity, routing, registry, manifest backgrounds",
    location:
      "lib/estate/chamberOfMomentumIdentity.ts, lib/estate/chamber/chamberOfMomentumRoomRegistry.ts",
    status: "implemented",
    priority: 1,
  },
  {
    id: "room-estate-manifest",
    domain: "room-architecture",
    label: "Estate room manifest and wander",
    existing: "Place master manifest + wander mode",
    location:
      "lib/estate/manifest/estatePlaceMasterManifest.ts, lib/estate/manifest/estateWanderMode.ts",
    status: "implemented",
    priority: 1,
  },
  {
    id: "room-intelligence-architecture",
    domain: "room-architecture",
    label: "Room intelligence architecture",
    existing: "Expertise groups, shared foundation, cross-room support, data flows",
    location: "lib/estate/sparkEstateRoomIntelligenceArchitecture.ts",
    status: "implemented",
    priority: 2,
    dependencies: [
      "routing-estate-map",
      "companion-shari-voice",
      "card-ecosystem",
    ],
  },
  {
    id: "room-blueprint-template",
    domain: "room-architecture",
    label: "Room blueprint template",
    existing: "Ten-section blueprint, quality checklist, demo room blueprints",
    location: "lib/estate/sparkEstateRoomBlueprintTemplate.ts",
    status: "implemented",
    priority: 2,
    dependencies: [
      "room-chamber-identity",
      "creation-universal-journey",
      "card-ecosystem",
    ],
  },
  {
    id: "room-navigation-transaction",
    domain: "navigation",
    label: "Navigation transaction gate",
    existing: "goToPlace without full transaction gate",
    location: "docs/protocols/NAVIGATION_TRANSACTION_PROTOCOL.md",
    status: "partial",
    priority: 1,
    requiredChanges: "Add confirm-before-visual-load transaction gate",
  },
  {
    id: "creation-universal-journey",
    domain: "universal-creation",
    label: "Universal creation journey",
    existing: "8-step estate journey mapped to Universal Creation phases",
    location: "lib/universalCreation/sparkEstateCreationJourney.ts",
    status: "implemented",
    priority: 2,
  },
  {
    id: "creation-workflow-engine",
    domain: "universal-creation",
    label: "Collaborative document workflow",
    existing: "Parallel workflow engine not fully wired to all intents",
    location: "lib/collaborativeDocumentWorkflow.ts",
    status: "consolidate",
    priority: 2,
    requiredChanges: "Route remaining creation intents through universal journey adapter",
    dependencies: ["creation-universal-journey"],
  },
  {
    id: "member-context-memory",
    domain: "member-context",
    label: "Chamber member context and memory",
    existing: "Projects, wins, patterns, preferences in localStorage",
    location: "lib/estate/chamberOfMomentumMemory.ts, lib/companionStore.ts",
    status: "implemented",
    priority: 2,
  },
  {
    id: "member-profile-personalization",
    domain: "member-context",
    label: "Member profile and personalization engine",
    existing: "Seven profile layers, gradual learning, member control",
    location: "lib/estate/sparkEstateMemberProfileEngine.ts",
    status: "implemented",
    priority: 2,
    dependencies: ["member-context-memory"],
  },
  {
    id: "member-context-supabase",
    domain: "data-integration",
    label: "Supabase persistence for member context",
    existing: "Local-first; Supabase not unified for Chamber memory",
    location: "lib/companionStore.ts",
    status: "partial",
    priority: 3,
    requiredChanges: "Migrate selective member context when database layer is ready",
  },
  {
    id: "routing-chamber-intelligence",
    domain: "intelligence-routing",
    label: "Chamber need → intelligence routing",
    existing: "NL assessment + journey selection + intent routing",
    location:
      "lib/estate/chamber/chamberMemberJourney.ts, lib/estate/chamberOfMomentumIntelligence.ts",
    status: "implemented",
    priority: 2,
  },
  {
    id: "member-lifecycle-architecture",
    domain: "member-context",
    label: "User journey and member lifecycle",
    existing: "Eight lifecycle stages, re-engagement rules, stage resolution",
    location: "lib/estate/sparkEstateUserJourneyAndMemberLifecycleArchitecture.ts",
    status: "implemented",
    priority: 2,
    dependencies: [
      "member-profile-personalization",
      "companion-daily-experience",
      "creation-universal-journey",
    ],
  },
  {
    id: "routing-estate-map",
    domain: "intelligence-routing",
    label: "Spark Estate intelligence routing map",
    existing: "Estate-wide need → intelligence, card selection, energy adaptation",
    location: "lib/estate/sparkEstateIntelligenceRoutingMap.ts",
    status: "implemented",
    priority: 2,
    dependencies: ["routing-chamber-intelligence"],
  },
  {
    id: "card-spark-note",
    domain: "card-system",
    label: "Spark Card™",
    existing: "Daily Spark Note anchor + expanded experience + one-per-day generation",
    location:
      "components/companion/SparkNoteAnchor.tsx, lib/sparkNote/sparkCardVisualDesignAndDailyGeneration.ts",
    status: "implemented",
    priority: 1,
  },
  {
    id: "card-momentum",
    domain: "card-system",
    label: "Momentum Card",
    existing: "Personalized journey card on Chamber entry",
    location:
      "components/companion/chamber/ChamberMomentumCard.tsx, lib/estate/sparkEstateCardEcosystem.ts",
    status: "implemented",
    priority: 2,
    dependencies: ["member-context-memory"],
  },
  {
    id: "card-ecosystem",
    domain: "card-system",
    label: "Spark Estate card ecosystem",
    existing: "Six card types, priority selection, placement, card memory",
    location: "lib/estate/sparkEstateCardEcosystem.ts",
    status: "implemented",
    priority: 2,
    dependencies: ["card-spark-note", "card-momentum", "member-profile-personalization"],
  },
  {
    id: "card-knowledge-library",
    domain: "card-system",
    label: "Knowledge Card library",
    existing: "Knowledge retrieval architecture + Knowledge Card generation",
    location: "lib/estate/sparkEstateKnowledgeAndAssetLibraryArchitecture.ts",
    status: "partial",
    priority: 2,
    requiredChanges: "Expand curated library content beyond templates and snippets",
    dependencies: ["card-ecosystem"],
  },
  {
    id: "completion-estate-system",
    domain: "completion-system",
    label: "Universal completion and output",
    existing: "Review, improve, finalize, output, remember",
    location: "lib/universalCreation/sparkEstateCompletionSystem.ts",
    status: "implemented",
    priority: 2,
  },
  {
    id: "navigation-room-menu",
    domain: "navigation",
    label: "Room button (estate, wander, back)",
    existing: "Estate room experience menu + wander mode",
    location:
      "components/companion/estate/EstateRoomExperienceMenu.tsx, lib/estate/sparkEstateTopNavigationAndProfileMenu.ts",
    status: "implemented",
    priority: 1,
  },
  {
    id: "navigation-profile-menu",
    domain: "navigation",
    label: "Profile button (settings, profile)",
    existing: "Initials profile menu — Profile, Settings, Conversations, Personalization, Account",
    location:
      "components/companion/GlobalEstateMenu.tsx, lib/estateMenu/menuConfig.ts, lib/estate/sparkEstateTopNavigationAndProfileMenu.ts",
    status: "implemented",
    priority: 1,
  },
  {
    id: "data-local-storage",
    domain: "data-integration",
    label: "Session and demo local storage",
    existing: "Chamber memory, demo seed, review history, creation sessions",
    location:
      "lib/estate/chamberOfMomentumMemory.ts, lib/universalCreation/orchestrator.ts",
    status: "implemented",
    priority: 2,
  },
  {
    id: "conversation-state-stability",
    domain: "companion-intelligence",
    label: "Conversation state stability",
    existing: "Large CompanionPageClient; stability protocol pending",
    location: "app/companion/CompanionPageClient.tsx",
    status: "partial",
    priority: 1,
    requiredChanges: "Audit input handlers, streaming, and state sync",
  },
] as const;

export const SPARK_ESTATE_RECOMMENDED_IMPLEMENTATION_ORDER = [
  "Priority 1 — Demo stability: navigation, room identity, broken routes, images",
  "Priority 1 — Run chamberFinalDemoChecklist before demo",
  "Priority 2 — Chamber entry + universal creation + member context cards",
  "Priority 2 — Wire remaining creation intents through universal journey adapter",
  "Priority 2 — Consolidate collaborativeDocumentWorkflow with universalCreation",
  "Priority 3 — Deeper memory, Supabase persistence, analytics, knowledge library",
] as const;

function entriesByStatus(
  status: SparkEstateImplementationStatus,
): SparkEstateArchitectureEntry[] {
  return SPARK_ESTATE_ARCHITECTURE_ENTRIES.filter(
    (entry) => entry.status === status,
  );
}

export function assessSparkEstateIntegration(): SparkEstateIntegrationAssessment {
  const chamberChecklist = runChamberFinalDemoChecklist();
  const creation = verifySparkEstateCreationJourney();
  const completion = verifySparkEstateCompletionSystem();

  const phasesAligned = SPARK_ESTATE_PHASE_MAPPINGS.every(
    (mapping) => mapping.status === "implemented",
  );
  const chamberDemoReady = chamberChecklist.mustFix.every((item) => item.passed);
  const creationJourneyAligned = creation.stepCount === 8 && creation.hasRememberStep;
  const completionSystemAligned =
    completion.hasRememberStep &&
    completion.chamberAligned &&
    completion.reviewQuestionsReady &&
    completion.connectionRulesReady;
  const chamberUsesEstateJourneys =
    CHAMBER_USES_UNIVERSAL_ESTATE_CREATION_JOURNEY &&
    CHAMBER_USES_UNIVERSAL_ESTATE_COMPLETION_SYSTEM;
  const intelligenceRoutingAligned =
    verifySparkEstateIntelligenceRouting().routesResolve;
  const memberProfileAligned =
    verifySparkEstateMemberProfile().personalizationReady;
  const cardEcosystemAligned = verifySparkEstateCardEcosystem().selectionWorks;
  const conversationEngineAligned =
    verifySparkEstateConversationEngine().voiceConsistent;
  const dailyCompanionAligned =
    verifySparkEstateDailyCompanionExperience().arrivalReady;
  const productionReadinessAligned = SPARK_ESTATE_PHASE_MAPPINGS.some(
    (mapping) => mapping.phase === 28 && mapping.status === "implemented",
  );
  const fileAndDataArchitectureAligned =
    verifySparkEstateFileAndDataArchitecture().oneSourceOfTruth;
  const knowledgeLibraryAligned =
    verifySparkEstateKnowledgeAndAssetLibrary().retrievalReady;
  const onboardingFirstWeekAligned =
    verifySparkEstateOnboardingAndFirst7Days().firstWeekReady;
  const roomBlueprintAligned =
    verifySparkEstateRoomBlueprintTemplate().allBlueprintsValid;
  const roomIntelligenceAligned =
    verifySparkEstateRoomIntelligenceArchitecture().sharedFoundationReady;
  const systemGovernanceAligned =
    verifySparkEstateSystemGovernanceAndQualityStandards().governanceReady;
  const topNavigationAligned =
    verifySparkEstateTopNavigationAndProfileMenu().profileMenuAligned;
  const memberLifecycleAligned =
    verifySparkEstateUserJourneyAndMemberLifecycle().lifecycleResolutionReady;
  const analyticsAndLearningAligned =
    verifySparkEstateAnalyticsAndLearningSystem().analyticsReady;
  const aiPromptIntelligenceLayerAligned =
    verifySparkEstateAiPromptAndIntelligenceLayerArchitecture().intelligenceLayerReady;
  const masterOperatingDocumentAligned =
    verifySparkEstateMasterOperatingDocument().operatingDocumentReady;
  const founderIntelligenceDashboardAligned =
    verifySparkEstateFounderIntelligenceDashboard().founderDashboardReady;
  const intelligentWorkspaceRecommendationAligned =
    verifySparkEstateIntelligentWorkspaceRecommendationSystem().recommendationReady;
  const intelligentProjectLifecycleAligned =
    verifySparkEstateIntelligentProjectLifecycleEngine().lifecycleReady;
  const expertTeamCollaborationAligned =
    verifySparkEstateExpertTeamAndChamberMemberCollaboration().collaborationReady;
  const universalProjectWorkspaceAligned =
    verifySparkEstateUniversalProjectWorkspaceArchitecture().universalProjectReady;

  return {
    existing: entriesByStatus("implemented"),
    missing: entriesByStatus("missing"),
    conflicting: entriesByStatus("consolidate"),
    recommendedOrder: [...SPARK_ESTATE_RECOMMENDED_IMPLEMENTATION_ORDER],
    phasesAligned,
    chamberDemoReady,
    creationJourneyAligned,
    completionSystemAligned,
    chamberUsesEstateJourneys,
    intelligenceRoutingAligned,
    memberProfileAligned,
    cardEcosystemAligned,
    conversationEngineAligned,
    dailyCompanionAligned,
    productionReadinessAligned,
    fileAndDataArchitectureAligned,
    knowledgeLibraryAligned,
    onboardingFirstWeekAligned,
    roomBlueprintAligned,
    roomIntelligenceAligned,
    systemGovernanceAligned,
    topNavigationAligned,
    memberLifecycleAligned,
    analyticsAndLearningAligned,
    aiPromptIntelligenceLayerAligned,
    masterOperatingDocumentAligned,
    founderIntelligenceDashboardAligned,
    intelligentWorkspaceRecommendationAligned,
    intelligentProjectLifecycleAligned,
    expertTeamCollaborationAligned,
    universalProjectWorkspaceAligned,
  };
}

export function verifySparkEstateArchitectureIntegration(): {
  aligned: boolean;
  assessment: SparkEstateIntegrationAssessment;
} {
  const assessment = assessSparkEstateIntegration();
  const blockingMissing = assessment.missing.filter((entry) => entry.priority <= 2);
  const aligned =
    assessment.phasesAligned &&
    assessment.chamberDemoReady &&
    assessment.creationJourneyAligned &&
    assessment.completionSystemAligned &&
    assessment.chamberUsesEstateJourneys &&
    assessment.intelligenceRoutingAligned &&
    assessment.memberProfileAligned &&
    assessment.cardEcosystemAligned &&
    assessment.conversationEngineAligned &&
    assessment.dailyCompanionAligned &&
    assessment.knowledgeLibraryAligned &&
    assessment.onboardingFirstWeekAligned &&
    assessment.roomBlueprintAligned &&
    assessment.roomIntelligenceAligned &&
    assessment.systemGovernanceAligned &&
    assessment.topNavigationAligned &&
    assessment.memberLifecycleAligned &&
    assessment.analyticsAndLearningAligned &&
    assessment.aiPromptIntelligenceLayerAligned &&
    assessment.masterOperatingDocumentAligned &&
    assessment.founderIntelligenceDashboardAligned &&
    assessment.intelligentWorkspaceRecommendationAligned &&
    assessment.intelligentProjectLifecycleAligned &&
    assessment.expertTeamCollaborationAligned &&
    assessment.universalProjectWorkspaceAligned &&
    blockingMissing.length === 0;

  return { aligned, assessment };
}

export function formatSparkEstateArchitectureReport(
  assessment: SparkEstateIntegrationAssessment = assessSparkEstateIntegration(),
): string {
  const lines: string[] = [
    `Spark Estate™ integration: ${assessment.phasesAligned ? "PHASES ALIGNED" : "PHASE GAPS"}`,
    SPARK_ESTATE_ECOSYSTEM_VISION,
    "",
    "Existing (working):",
    ...assessment.existing.map((entry) => `  ✓ ${entry.label} — ${entry.location}`),
    "",
    "Missing (deferred):",
    ...(assessment.missing.length
      ? assessment.missing.map((entry) => `  ○ ${entry.label} — ${entry.requiredChanges}`)
      : ["  (none blocking demo)"]),
    "",
    "Consolidate (do not duplicate):",
    ...assessment.conflicting.map(
      (entry) => `  ! ${entry.label} — ${entry.requiredChanges}`,
    ),
    "",
    "Integration checks:",
    `  Chamber demo Priority 1: ${assessment.chamberDemoReady ? "pass" : "fail"}`,
    `  Universal creation journey: ${assessment.creationJourneyAligned ? "pass" : "fail"}`,
    `  Universal completion system: ${assessment.completionSystemAligned ? "pass" : "fail"}`,
    `  Chamber uses estate journeys: ${assessment.chamberUsesEstateJourneys ? "yes" : "no"}`,
    `  Intelligence routing map: ${assessment.intelligenceRoutingAligned ? "pass" : "fail"}`,
    `  Member profile engine: ${assessment.memberProfileAligned ? "pass" : "fail"}`,
    `  Card ecosystem: ${assessment.cardEcosystemAligned ? "pass" : "fail"}`,
    `  Conversation engine: ${assessment.conversationEngineAligned ? "pass" : "fail"}`,
    `  Daily companion experience: ${assessment.dailyCompanionAligned ? "pass" : "fail"}`,
    `  Production readiness (must-fix): ${assessment.productionReadinessAligned ? "pass" : "fail"}`,
    `  File and data architecture: ${assessment.fileAndDataArchitectureAligned ? "pass" : "fail"}`,
    `  Knowledge and asset library: ${assessment.knowledgeLibraryAligned ? "pass" : "fail"}`,
    `  Onboarding first 7 days: ${assessment.onboardingFirstWeekAligned ? "pass" : "fail"}`,
    `  Room blueprint template: ${assessment.roomBlueprintAligned ? "pass" : "fail"}`,
    `  Room intelligence architecture: ${assessment.roomIntelligenceAligned ? "pass" : "fail"}`,
    `  System governance: ${assessment.systemGovernanceAligned ? "pass" : "fail"}`,
    `  Top navigation correction: ${assessment.topNavigationAligned ? "pass" : "fail"}`,
    `  Member lifecycle architecture: ${assessment.memberLifecycleAligned ? "pass" : "fail"}`,
    `  Analytics and learning: ${assessment.analyticsAndLearningAligned ? "pass" : "fail"}`,
    `  AI prompt intelligence layers: ${assessment.aiPromptIntelligenceLayerAligned ? "pass" : "fail"}`,
    `  Master operating document: ${assessment.masterOperatingDocumentAligned ? "pass" : "fail"}`,
    `  Founder intelligence dashboard: ${assessment.founderIntelligenceDashboardAligned ? "pass" : "fail"}`,
    `  Intelligent workspace recommendation: ${assessment.intelligentWorkspaceRecommendationAligned ? "pass" : "fail"}`,
    `  Intelligent project lifecycle: ${assessment.intelligentProjectLifecycleAligned ? "pass" : "fail"}`,
    `  Expert team collaboration: ${assessment.expertTeamCollaborationAligned ? "pass" : "fail"}`,
    `  Universal project workspace: ${assessment.universalProjectWorkspaceAligned ? "pass" : "fail"}`,
    "",
    "Recommended order:",
    ...assessment.recommendedOrder.map((step) => `  • ${step}`),
  ];

  return lines.join("\n");
}

export function getPhaseMapping(phase: number): SparkEstatePhaseMapping | null {
  return SPARK_ESTATE_PHASE_MAPPINGS.find((mapping) => mapping.phase === phase) ?? null;
}

export function entriesForDomain(
  domain: SparkEstateArchitectureDomain,
): SparkEstateArchitectureEntry[] {
  return SPARK_ESTATE_ARCHITECTURE_ENTRIES.filter(
    (entry) => entry.domain === domain,
  );
}
