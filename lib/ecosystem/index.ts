// Founder Ecosystem — Phase 1 public surface.
// import { eventStore, ev, computeDashboard } from "@/lib/ecosystem";

export * from "./models";
export * from "./events";
export * from "./eventStore";
export * from "./ecosystemUserId";
export * from "./eventTrackingEngine";
export * from "./userIntelligenceEngine";
export * from "./contentIntelligenceEngine";
export * from "./businessEcosystemDashboard";
export * from "./serverSignalStore";
export * from "./ecosystemDashboardSignals";
export * from "./clientSignalSync";
export * from "./liveContentOpportunityGenerator";
export * from "./postcraftDraftGenerator";
export * from "./postcraftDraftStore";
export * from "./founderDashboardLocalState";
export * from "./postcraftSyncQueue";
export * from "./postcraftLivePublishing";
export * from "./founderAiAdvisor";
export * from "./founderAiAdvisorPrompt";
export * from "./crossSystemIntelligenceHub";
export * from "./userHealthEngine";
export * from "./clientUserHealthSync";
export * from "./revenueIntelligenceEngine";
export * from "./costIntelligenceEngine";
export * from "./executiveMorningBriefing";
export * from "./googleWorkspaceAutomation";
export * from "./metrics";
export * from "./dashboardTypes";
export * from "./dashboardSelectors";
export * as intelligence from "./intelligence";
export * from "./board";
export * from "./ops";
// Memory & Relationship Graph is namespaced to avoid name clashes with the
// Phase 4 intelligence layer (both define `buildFounderMemory` / `Memory`).
export * as memory from "./memory";
// Phase 7 dashboard is namespaced to avoid clashing with the Phase 2 data layer
// (both define `dashboardSelectors`, `FounderDashboard*`, etc.).
export * as dashboard from "./founderDashboard";
// Phase 8 Founder Operating System — namespaced (it re-uses many shared names).
export * as fos from "./fos";
// Phase 9 Founder Journey Engine — namespaced.
export * as journey from "./journey";
// Phase 10 Stage-Aware Recommendations & Actions — namespaced.
export * as recommendations from "./recommendations";
// Phase 11 Action & Workspace Integration — namespaced.
export * as actions from "./actions";
// Phase 12 Founder Command Center — namespaced.
export * as commandCenter from "./commandCenter";
// Phase 13 Adaptive Founder Companion — namespaced.
export * as companion from "./companion";
// Phase 15 Learning Engine & Optimization — namespaced.
export * as learning from "./learning";
// Phase 14 Business OS Automation Layer — namespaced.
export * as automation from "./automation";
// Phase 16 Founder Digital Twin — namespaced.
export * as digitalTwin from "./digitalTwin";
// Phase 17 Multi-Founder Intelligence Network — namespaced.
export * as network from "./network";
// Phase 19 Founder Experience Map — namespaced.
export * as experience from "./experience";
